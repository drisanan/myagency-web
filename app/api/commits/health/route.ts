import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});
const COMMITS_BUCKET = process.env.COMMITS_CACHE_BUCKET || process.env.MEDIA_BUCKET || '';
const COMMITS_PREFIX = process.env.COMMITS_CACHE_PREFIX || 'commits-cache';

export async function GET() {
  if (!COMMITS_BUCKET) {
    return NextResponse.json({ ok: false, error: 'Missing COMMITS_CACHE_BUCKET or MEDIA_BUCKET' }, { status: 500 });
  }
  try {
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: COMMITS_BUCKET,
        Key: `${COMMITS_PREFIX}/latest.json`,
      }),
    );
    const body = await res.Body?.transformToString();
    const parsed = body ? JSON.parse(body) : null;
    const updatedAt = parsed?.updatedAt || null;
    const count = Array.isArray(parsed?.data) ? parsed.data.length : 0;
    return NextResponse.json({ ok: true, updatedAt, count });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unable to read commits cache' }, { status: 500 });
  }
}
