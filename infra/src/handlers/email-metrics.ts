import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { parseSessionFromRequest } from '../lib/session';
import { queryByPK, getItem } from '../lib/dynamo';
import { EmailStatsRecord } from '../lib/models';
import { withSentry } from '../lib/sentry';
import { logActivity } from '../lib/activity';
import { recordEmailSendsInternal, recordEmailOpenInternal } from '../lib/emailMetrics';

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
      campaignId,
    } = payload;

    if (!clientId || !recipients?.length) {
      return response(400, { ok: false, error: 'clientId and recipients required' }, origin);
    }

    const { saved, month } = await recordEmailSendsInternal({
      agencyId,
      clientId,
      clientEmail: clientEmail || '',
      recipients,
      subject,
      draftId,
      campaignId,
    });

    console.log('[email-metrics] Sends recorded', {
      agencyId,
      clientId,
      count: recipients.length,
    });

    try {
      const actorEmail = session.agentEmail || session.agencyEmail || session.email || 'agent';
      await logActivity({
        agencyId,
        clientId,
        actorEmail,
        actorType: 'agent',
        activityType: 'email_sent',
        description: `Sent ${recipients.length} email${recipients.length === 1 ? '' : 's'} to coaches`,
        metadata: { recipientCount: recipients.length, subject, draftId },
      });
    } catch (e) {
      console.warn('[email-metrics] Failed to log activity', e);
    }

    return response(200, {
      ok: true,
      recorded: saved.length,
      month,
    }, origin);
  }

  // --- GET /email-metrics/open - Track email open (pixel) ---
  if (method === 'GET' && event.rawPath?.includes('/open')) {
    const params = event.queryStringParameters || {};
    const clientId = params.clientId;
    const recipientEmail = params.recipientEmail;
    const clientEmail = params.clientEmail || '';
    const university = params.university || '';
    const campaignId = params.campaignId || '';

    if (clientId && recipientEmail) {
      try {
        await recordEmailOpenInternal({
          agencyId,
          clientId,
          clientEmail,
          recipientEmail,
          university,
          campaignId: campaignId || undefined,
          userAgent: headers['user-agent'] || headers['User-Agent'] || '',
          ipAddress: headers['x-forwarded-for'] as string | undefined,
        });
      } catch (e) {
        console.warn('[email-metrics] Failed to record open', e);
      }
    }

    // 1x1 transparent gif
    const gif = Buffer.from('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
      body: gif.toString('base64'),
      isBase64Encoded: true,
    };
  }

  // --- GET /email-metrics/stats - Get metrics for agency/client ---
  if (method === 'GET' && event.rawPath?.includes('/stats')) {
    const params = event.queryStringParameters || {};
    const clientId = params.clientId;
    const period = params.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const days = parseInt(params.days || '30', 10);

    // If clientId specified, get stats for that client
    if (clientId) {
      const statsKey = period ? {
        PK: `AGENCY#${agencyId}`,
        SK: `EMAIL_STATS#${clientId}#${period}`,
      } : null;
      const stats = statsKey ? await getItem(statsKey) as EmailStatsRecord | undefined : undefined;
      
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
