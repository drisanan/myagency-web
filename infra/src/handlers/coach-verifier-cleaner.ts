import { withSentry } from '../lib/sentry';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

const INPUT_BUCKET = process.env.COACH_VERIFIER_S3_BUCKET || process.env.MEDIA_BUCKET || '';
const INPUT_PREFIX = process.env.COACH_VERIFIER_S3_PREFIX || 'coach-verifier';
const OUTPUT_PREFIX = process.env.COACH_VERIFIER_CLEAN_PREFIX || 'coach-verifier-clean';

const STRICT_EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const TITLE_KEYWORD_RE = /coach|assistant|coordinator|director|head|recruiting|operations|scouting/i;
const SCRIPT_BLOB_RE = /var\s+|document\.getElementById|function\s*\(|=>|<script/i;
const PLACEHOLDER_NAME_RE = /email address|staff directory|name/i;
const INVALID_NAME_CHARS_RE = /[^a-zA-Z\s'-]/;

type CoachPayload = { name?: string; title?: string; email?: string };
type LogRecord = { type?: string; timestamp?: string; payload?: Record<string, any> };

function normalizePrefix(value: string) {
  return value.replace(/\/+$/, '');
}

function extractRunId(prefix: string, key?: string | null) {
  if (!key) return null;
  const normalized = normalizePrefix(prefix);
  if (!key.startsWith(`${normalized}/`)) return null;
  const remainder = key.slice(normalized.length + 1);
  const parts = remainder.split('/').filter(Boolean);
  return parts[0] || null;
}

async function streamToString(body: any): Promise<string> {
  if (!body) return '';
  if (typeof body === 'string') return body;
  const chunks: Buffer[] = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function listRunIds(bucket: string, prefix: string): Promise<string[]> {
  const normalized = normalizePrefix(prefix);
  const runIds = new Set<string>();
  let token: string | undefined;

  do {
    const res = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${normalized}/`,
        Delimiter: '/',
        ContinuationToken: token,
      }),
    );
    for (const entry of res.CommonPrefixes || []) {
      const runId = extractRunId(normalized, entry.Prefix);
      if (runId) runIds.add(runId);
    }
    token = res.NextContinuationToken;
  } while (token);

  return Array.from(runIds).sort();
}

async function listRunObjects(bucket: string, prefix: string, runId: string): Promise<string[]> {
  const normalized = normalizePrefix(prefix);
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const res = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${normalized}/${runId}/`,
        ContinuationToken: token,
      }),
    );
    for (const obj of res.Contents || []) {
      if (!obj.Key) continue;
      if (obj.Key.endsWith('.jsonl') && obj.Key.includes('part-')) {
        keys.push(obj.Key);
      }
    }
    token = res.NextContinuationToken;
  } while (token);

  return keys.sort();
}

function validateName(nameRaw: string): string[] {
  const reasons: string[] = [];
  const name = (nameRaw || '').trim();
  if (!name) reasons.push('name_missing');
  if (name && name.split(/\s+/).length < 2) reasons.push('name_single_word');
  if (PLACEHOLDER_NAME_RE.test(name)) reasons.push('name_placeholder');
  if (name.includes('@')) reasons.push('name_contains_email');
  if (name.startsWith('@')) reasons.push('name_is_handle');
  if (INVALID_NAME_CHARS_RE.test(name)) reasons.push('name_invalid_chars');
  return reasons;
}

function validateTitle(titleRaw: string): string[] {
  const reasons: string[] = [];
  const title = (titleRaw || '').trim();
  if (!title) reasons.push('title_missing');
  if (title && title.length < 4) reasons.push('title_too_short');
  if (title && !TITLE_KEYWORD_RE.test(title)) reasons.push('title_no_keyword');
  if (title && title.includes('@')) reasons.push('title_is_email');
  if (title && SCRIPT_BLOB_RE.test(title)) reasons.push('title_script_blob');
  return reasons;
}

function validateEmail(emailRaw: string): string[] {
  const reasons: string[] = [];
  const email = (emailRaw || '').trim();
  if (!email) reasons.push('email_missing');
  if (email && email.startsWith('@')) reasons.push('email_is_handle');
  if (email && email.includes('?')) reasons.push('email_has_query');
  if (email && SCRIPT_BLOB_RE.test(email)) reasons.push('email_script_blob');
  if (email && !STRICT_EMAIL_RE.test(email)) reasons.push('email_invalid_format');
  return reasons;
}

function buildSummary(totalEntries: number, validEntries: number, invalidEntries: number, reasonCounts: Record<string, number>) {
  return {
    totalEntries,
    validEntries,
    invalidEntries,
    validRatio: totalEntries ? validEntries / totalEntries : 0,
    invalidRatio: totalEntries ? invalidEntries / totalEntries : 0,
    rejectReasonCounts: reasonCounts,
  };
}

function normalizeKeyPart(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildDedupKey(row: {
  school: string;
  sport: string;
  division: string;
  name: string;
  title: string;
  email: string;
}) {
  return [
    normalizeKeyPart(row.school),
    normalizeKeyPart(row.sport),
    normalizeKeyPart(row.division),
    normalizeKeyPart(row.name),
    normalizeKeyPart(row.title),
    normalizeKeyPart(row.email),
  ].join('|');
}

async function objectExists(bucket: string, key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === 'NotFound') return false;
    throw err;
  }
}

async function cleanRun(runId: string, force: boolean) {
  if (!INPUT_BUCKET) {
    throw new Error('Missing COACH_VERIFIER_S3_BUCKET or MEDIA_BUCKET');
  }
  const inputPrefix = normalizePrefix(INPUT_PREFIX);
  const outputPrefix = normalizePrefix(OUTPUT_PREFIX);
  const summaryKey = `${outputPrefix}/${runId}/summary.json`;

  if (!force && (await objectExists(INPUT_BUCKET, summaryKey))) {
    // Already processed this run.
    return { runId, skipped: true };
  }

  const keys = await listRunObjects(INPUT_BUCKET, inputPrefix, runId);
  if (!keys.length) {
    return { runId, skipped: true };
  }

  const validRows: Record<string, unknown>[] = [];
  const invalidRows: Record<string, unknown>[] = [];
  const reasonCounts: Record<string, number> = {};
  const seenValid = new Set<string>();
  const seenInvalid = new Set<string>();
  let dedupedValid = 0;
  let dedupedInvalid = 0;
  let totalEntries = 0;

  for (const key of keys) {
    const res = await s3Client.send(new GetObjectCommand({ Bucket: INPUT_BUCKET, Key: key }));
    const body = await streamToString(res.Body);
    const lines = body.split('\n').filter(Boolean);

    for (const line of lines) {
      let record: LogRecord | null = null;
      try {
        record = JSON.parse(line);
      } catch {
        continue;
      }
      if (record?.type !== 'coach_new') continue;
      totalEntries += 1;
      const payload = record.payload || {};
      const coach = (payload.coach || {}) as CoachPayload;
      const name = (coach.name || '').trim();
      const title = (coach.title || '').trim();
      const email = (coach.email || '').trim();
      const reasons = [
        ...validateName(name),
        ...validateTitle(title),
        ...validateEmail(email),
      ];

      if (reasons.length === 0) {
        const row = {
          school: payload.school || '',
          state: payload.state || '',
          sport: payload.sport || '',
          division: payload.division || '',
          name,
          title,
          email,
          timestamp: record.timestamp || '',
          confidence: 1,
          runId,
        };
        const dedupKey = buildDedupKey(row);
        if (seenValid.has(dedupKey)) {
          dedupedValid += 1;
        } else {
          seenValid.add(dedupKey);
          validRows.push(row);
        }
      } else {
        const row = {
          school: payload.school || '',
          state: payload.state || '',
          sport: payload.sport || '',
          division: payload.division || '',
          name,
          title,
          email,
          timestamp: record.timestamp || '',
          reasons,
          confidence: 0,
          runId,
        };
        const dedupKey = buildDedupKey(row);
        if (seenInvalid.has(dedupKey)) {
          dedupedInvalid += 1;
        } else {
          seenInvalid.add(dedupKey);
          for (const reason of reasons) {
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
          }
          invalidRows.push(row);
        }
      }
    }
  }

  const summary = buildSummary(totalEntries, validRows.length, invalidRows.length, reasonCounts);
  const summaryBody = JSON.stringify(
    {
      runId,
      inputPrefix: `${inputPrefix}/${runId}/`,
      outputPrefix: `${outputPrefix}/${runId}/`,
      generatedAt: new Date().toISOString(),
      dedupedValid,
      dedupedInvalid,
      ...summary,
    },
    null,
    2,
  );

  const validBody = validRows.map((row) => JSON.stringify(row)).join('\n') + '\n';
  const invalidBody = invalidRows.map((row) => JSON.stringify(row)).join('\n') + '\n';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: INPUT_BUCKET,
      Key: `${outputPrefix}/${runId}/clean.jsonl`,
      Body: validBody,
      ContentType: 'application/json',
    }),
  );
  await s3Client.send(
    new PutObjectCommand({
      Bucket: INPUT_BUCKET,
      Key: `${outputPrefix}/${runId}/reject.jsonl`,
      Body: invalidBody,
      ContentType: 'application/json',
    }),
  );
  await s3Client.send(
    new PutObjectCommand({
      Bucket: INPUT_BUCKET,
      Key: summaryKey,
      Body: summaryBody,
      ContentType: 'application/json',
    }),
  );

  return { runId, ...summary };
}

export const handler = withSentry(async (event: any = {}) => {
  if (!INPUT_BUCKET) {
    return { ok: false, error: 'Missing COACH_VERIFIER_S3_BUCKET or MEDIA_BUCKET' };
  }
  const runIdFromEvent = event?.runId || event?.detail?.runId || process.env.COACH_VERIFIER_CLEAN_RUN_ID || '';
  const force = Boolean(event?.force || event?.detail?.force || process.env.COACH_VERIFIER_CLEAN_FORCE);
  const runId = runIdFromEvent || (await listRunIds(INPUT_BUCKET, INPUT_PREFIX)).pop();
  if (!runId) {
    return { ok: false, error: 'No coach verifier runs found.' };
  }
  const result = await cleanRun(runId, force);
  return { ok: true, result };
});
