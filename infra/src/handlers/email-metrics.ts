import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { response } from './cors';
import { parseSessionFromRequest } from '../lib/session';
import { putItem, queryByPK, updateItem, getItem } from '../lib/dynamo';
import { EmailSendRecord, EmailStatsRecord } from '../lib/models';
import { withSentry } from '../lib/sentry';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const emailMetricsHandler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') {
    return response(200, { ok: true }, origin);
  }

  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: 'Unauthorized' }, origin);
  }

  const agencyId = session.agencyId;

  // --- POST /email-metrics/send - Record email(s) sent ---
  if (method === 'POST' && event.rawPath?.includes('/send')) {
    if (!event.body) {
      return response(400, { ok: false, error: 'Missing body' }, origin);
    }

    const payload = JSON.parse(event.body);
    const {
      clientId,
      clientEmail,
      recipients,  // Array of { email, name, university }
      subject,
      draftId,
    } = payload;

    if (!clientId || !recipients?.length) {
      return response(400, { ok: false, error: 'clientId and recipients required' }, origin);
    }

    const now = Date.now();
    const month = getCurrentMonth();
    const savedRecords: EmailSendRecord[] = [];

    // Create a send record for each recipient
    for (const recipient of recipients) {
      const sendId = randomUUID();
      const record: EmailSendRecord = {
        PK: `AGENCY#${agencyId}`,
        SK: `EMAIL_SEND#${now}#${sendId}`,
        GSI3PK: `CLIENT#${clientId}`,
        GSI3SK: `EMAIL_SEND#${now}`,
        clientId,
        clientEmail: clientEmail || '',
        recipientEmail: recipient.email,
        recipientName: recipient.name || '',
        university: recipient.university || '',
        subject: subject || '',
        draftId: draftId || '',
        sentAt: now,
        createdAt: now,
      };
      
      await putItem(record);
      savedRecords.push(record);
    }

    // Update monthly stats
    const statsKey = {
      PK: `AGENCY#${agencyId}`,
      SK: `EMAIL_STATS#${clientId}#${month}`,
    };

    try {
      await updateItem({
        key: statsKey,
        updateExpression: `
          SET sentCount = if_not_exists(sentCount, :zero) + :count,
              clientId = :clientId,
              period = :period,
              updatedAt = :now
        `,
        expressionAttributeValues: {
          ':zero': 0,
          ':count': recipients.length,
          ':clientId': clientId,
          ':period': month,
          ':now': now,
        },
      });
    } catch (err) {
      console.error('[email-metrics] Stats update failed', err);
    }

    console.log('[email-metrics] Sends recorded', {
      agencyId,
      clientId,
      count: recipients.length,
    });

    return response(200, {
      ok: true,
      recorded: savedRecords.length,
      month,
    }, origin);
  }

  // --- GET /email-metrics/stats - Get metrics for agency/client ---
  if (method === 'GET' && event.rawPath?.includes('/stats')) {
    const params = event.queryStringParameters || {};
    const clientId = params.clientId;
    const period = params.period || getCurrentMonth();
    const days = parseInt(params.days || '30', 10);

    // If clientId specified, get stats for that client
    if (clientId) {
      const statsKey = {
        PK: `AGENCY#${agencyId}`,
        SK: `EMAIL_STATS#${clientId}#${period}`,
      };
      const stats = await getItem(statsKey) as EmailStatsRecord | undefined;
      
      // Get recent sends
      const sends = await queryByPK(`AGENCY#${agencyId}`, `EMAIL_SEND#`);
      const clientSends = sends.filter((s: Record<string, unknown>) => s.clientId === clientId);
      
      // Get recent clicks
      const clicks = await queryByPK(`AGENCY#${agencyId}`, `EMAIL_CLICK#`);
      const clientClicks = clicks.filter((c: Record<string, unknown>) => c.clientId === clientId);

      return response(200, {
        ok: true,
        clientId,
        period,
        stats: {
          sentCount: stats?.sentCount || clientSends.length,
          clickCount: stats?.clickCount || clientClicks.length,
          uniqueRecipients: new Set(clientSends.map((s: Record<string, unknown>) => s.recipientEmail)).size,
          uniqueClickers: new Set(clientClicks.map((c: Record<string, unknown>) => c.recipientEmail)).size,
        },
        recentSends: clientSends.slice(0, 20),
        recentClicks: clientClicks.slice(0, 20),
      }, origin);
    }

    // Agency-wide stats
    const allSends = await queryByPK(`AGENCY#${agencyId}`, `EMAIL_SEND#`);
    const allClicks = await queryByPK(`AGENCY#${agencyId}`, `EMAIL_CLICK#`);

    // Filter by time period
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentSends = allSends.filter((s: Record<string, unknown>) => (s.sentAt as number) > cutoff);
    const recentClicks = allClicks.filter((c: Record<string, unknown>) => (c.clickedAt as number) > cutoff);

    // Group by client
    const byClient: Record<string, { sent: number; clicks: number }> = {};
    for (const send of recentSends) {
      const cid = (send as Record<string, unknown>).clientId as string;
      if (!byClient[cid]) byClient[cid] = { sent: 0, clicks: 0 };
      byClient[cid].sent++;
    }
    for (const click of recentClicks) {
      const cid = (click as Record<string, unknown>).clientId as string;
      if (!byClient[cid]) byClient[cid] = { sent: 0, clicks: 0 };
      byClient[cid].clicks++;
    }

    return response(200, {
      ok: true,
      period: `last ${days} days`,
      totals: {
        sentCount: recentSends.length,
        clickCount: recentClicks.length,
        uniqueRecipients: new Set(recentSends.map((s: Record<string, unknown>) => s.recipientEmail)).size,
        uniqueClickers: new Set(recentClicks.map((c: Record<string, unknown>) => c.recipientEmail)).size,
      },
      byClient,
    }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(emailMetricsHandler);
