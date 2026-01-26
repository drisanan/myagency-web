import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { DripEnrollmentRecord, EmailDripRecord, ClientRecord } from '../lib/models';
import { getItem, putItem, queryByPK, scanBySKPrefix } from '../lib/dynamo';
import { response } from './cors';
import { sendGmailMessage } from '../lib/gmailSend';
import { logActivity } from '../lib/activity';
import { withSentry } from '../lib/sentry';

type RunnerResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

function isHttpEvent(event: any): event is APIGatewayProxyEventV2 {
  return Boolean(event?.requestContext?.http?.method);
}

async function listEnrollments(agencyId?: string) {
  if (agencyId) {
    return queryByPK(`AGENCY#${agencyId}`, 'DRIP_ENROLL#') as Promise<DripEnrollmentRecord[]>;
  }
  return scanBySKPrefix('DRIP_ENROLL#') as Promise<DripEnrollmentRecord[]>;
}

async function processEnrollment(enrollment: DripEnrollmentRecord, now: number) {
  if (enrollment.completedAt) return { status: 'skipped' as const, reason: 'completed' };
  if (enrollment.pausedAt) return { status: 'skipped' as const, reason: 'paused' };
  if (enrollment.nextSendAt && enrollment.nextSendAt > now) return { status: 'skipped' as const, reason: 'not_due' };

  const drip = await getItem({
    PK: `AGENCY#${enrollment.agencyId}`,
    SK: `EMAIL_DRIP#${enrollment.dripId}`,
  }) as EmailDripRecord | undefined;
  if (!drip || !drip.isActive) return { status: 'skipped' as const, reason: 'inactive' };

  const step = drip.steps?.[enrollment.currentStepIndex];
  if (!step) {
    const completed = {
      ...enrollment,
      completedAt: now,
      nextSendAt: undefined,
    };
    await putItem(completed);
    return { status: 'skipped' as const, reason: 'no_step' };
  }

  const client = await getItem({
    PK: `AGENCY#${enrollment.agencyId}`,
    SK: `CLIENT#${enrollment.clientId}`,
  }) as ClientRecord | undefined;
  if (!client?.email) return { status: 'skipped' as const, reason: 'missing_client_email' };

  const senderClientId = drip.senderClientId || '__agency__';
  await sendGmailMessage({
    agencyId: enrollment.agencyId,
    senderClientId,
    to: client.email,
    subject: step.subject,
    html: step.body,
  });

  const nextIndex = enrollment.currentStepIndex + 1;
  const nextStep = drip.steps?.[nextIndex];
  const nextSendAt = nextStep
    ? now + Math.max(0, Number(nextStep.dayOffset || 0)) * 24 * 60 * 60 * 1000
    : undefined;

  const updated: DripEnrollmentRecord = {
    ...enrollment,
    currentStepIndex: nextIndex,
    lastSentAt: now,
    nextSendAt,
    completedAt: nextStep ? undefined : now,
  };
  await putItem(updated);

  await logActivity({
    agencyId: enrollment.agencyId,
    clientId: enrollment.clientId,
    actorEmail: 'system',
    actorType: 'system',
    activityType: 'email_sent',
    description: `Drip email sent: ${drip.name}`,
    metadata: { dripId: drip.id, stepId: step.id, subject: step.subject },
  });

  return { status: 'sent' as const };
}

const runner: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const now = Date.now();

  let agencyId: string | undefined;
  if (isHttpEvent(event)) {
    const session = requireSession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    if (session.role === 'client') return response(403, { ok: false, error: 'Forbidden' }, origin);
    agencyId = session.agencyId.trim();
  }

  const enrollments = await listEnrollments(agencyId);
  const result: RunnerResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };

  for (const enrollment of enrollments) {
    result.processed += 1;
    try {
      const res = await processEnrollment(enrollment, now);
      if (res.status === 'sent') result.sent += 1;
      else result.skipped += 1;
    } catch (e) {
      console.error('[email-drip-runner] Failed to process enrollment', {
        enrollment: enrollment.SK,
        error: (e as Error)?.message,
      });
      result.errors += 1;
    }
  }

  if (isHttpEvent(event)) {
    return response(200, { ok: true, ...result }, origin);
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true, ...result }) };
};

export const handler = withSentry(runner as any);
