import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { ClientRecord, ProfileViewRecord } from '../lib/models';
import { getItem, queryByPK, scanBySKPrefix } from '../lib/dynamo';
import { response } from './cors';
import { sendGmailMessage } from '../lib/gmailSend';
import { logActivity } from '../lib/activity';
import { withSentry } from '../lib/sentry';

type DigestSummary = {
  clientId: string;
  clientEmail?: string;
  clientName: string;
  totalViews: number;
  uniqueUniversities: number;
  recentViews: Array<{
    viewerName?: string;
    university?: string;
    viewedAt: number;
  }>;
};

function isHttpEvent(event: any): event is APIGatewayProxyEventV2 {
  return Boolean(event?.requestContext?.http?.method);
}

function buildEmailHtml(summary: DigestSummary) {
  const recent = summary.recentViews
    .map((v) => `<li>${v.viewerName || 'Coach'}${v.university ? ` (${v.university})` : ''} • ${new Date(v.viewedAt).toLocaleDateString()}</li>`)
    .join('');
  return `
    <div>
      <h2>Weekly Profile Views</h2>
      <p>Hi ${summary.clientName}, here is your weekly update:</p>
      <ul>
        <li>Total views: <strong>${summary.totalViews}</strong></li>
        <li>Unique schools: <strong>${summary.uniqueUniversities}</strong></li>
      </ul>
      ${summary.recentViews.length ? `<p>Recent views:</p><ul>${recent}</ul>` : '<p>No new views this week.</p>'}
    </div>
  `;
}

async function listViewsForAgency(agencyId?: string) {
  if (agencyId) {
    return queryByPK(`AGENCY#${agencyId}`, 'PROFILE_VIEW#') as Promise<ProfileViewRecord[]>;
  }
  return scanBySKPrefix('PROFILE_VIEW#') as Promise<ProfileViewRecord[]>;
}

const digestEmailHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  let agencyId: string | undefined;
  if (isHttpEvent(event)) {
    const session = requireSession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    if (session.role === 'client') return response(403, { ok: false, error: 'Forbidden' }, origin);
    agencyId = session.agencyId.trim();
  }

  const views = (await listViewsForAgency(agencyId)).filter((v) => v.viewedAt >= weekAgo);
  const byAgency: Record<string, ProfileViewRecord[]> = {};
  for (const v of views) {
    byAgency[v.agencyId] = byAgency[v.agencyId] || [];
    byAgency[v.agencyId].push(v);
  }

  const result = { agencies: 0, sent: 0, skipped: 0, errors: 0 };

  for (const [aid, agencyViews] of Object.entries(byAgency)) {
    result.agencies += 1;
    const byClient: Record<string, ProfileViewRecord[]> = {};
    for (const v of agencyViews) {
      byClient[v.clientId] = byClient[v.clientId] || [];
      byClient[v.clientId].push(v);
    }

    for (const [clientId, clientViews] of Object.entries(byClient)) {
      try {
        const client = await getItem({ PK: `AGENCY#${aid}`, SK: `CLIENT#${clientId}` }) as ClientRecord | undefined;
        if (!client?.email) {
          result.skipped += 1;
          continue;
        }
        const uniqueUniversities = new Set(clientViews.filter(v => v.university).map(v => v.university)).size;
        const recentViews = clientViews
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, 5)
          .map(v => ({
            viewerName: v.viewerName,
            university: v.university,
            viewedAt: v.viewedAt,
          }));

        const summary: DigestSummary = {
          clientId,
          clientEmail: client.email,
          clientName: `${client.firstName} ${client.lastName}`.trim() || 'Athlete',
          totalViews: clientViews.length,
          uniqueUniversities,
          recentViews,
        };

        await sendGmailMessage({
          agencyId: aid,
          senderClientId: '__agency__',
          to: client.email,
          subject: 'Your Weekly Profile Views Update',
          html: buildEmailHtml(summary),
        });

        await logActivity({
          agencyId: aid,
          clientId,
          actorEmail: 'system',
          actorType: 'system',
          activityType: 'email_sent',
          description: 'Weekly profile views digest sent',
          metadata: { totalViews: summary.totalViews, uniqueUniversities },
        });

        result.sent += 1;
      } catch (e) {
        console.error('[profile-views-digest-email] send failed', { clientId, error: (e as Error).message });
        result.errors += 1;
      }
    }
  }

  if (isHttpEvent(event)) {
    return response(200, { ok: true, ...result }, origin);
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true, ...result }) };
};

export const handler = withSentry(digestEmailHandler as any);
