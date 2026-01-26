import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { CampaignFollowupRecord, CampaignRecord, ClientRecord, ProfileViewRecord } from '../lib/models';
import { getItem, putItem, queryGSI3, scanBySKPrefix } from '../lib/dynamo';
import { sendGmailMessage } from '../lib/gmailSend';
import { listCampaignEmailStats } from '../lib/emailMetrics';
import { withSentry } from '../lib/sentry';
import { logActivity } from '../lib/activity';

function formatRate(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function buildFollowupHtml(input: {
  athleteName: string;
  agentName?: string;
  personalizedMessage?: string;
  emailsSent: number;
  openRate: number;
  profileViews: number;
}) {
  return `
    <p>Hi ${input.athleteName || 'there'},</p>
    ${input.personalizedMessage ? `<p>${input.personalizedMessage}</p>` : ''}
    <p>Here’s a quick update on your recent outreach campaign:</p>
    <ul>
      <li><strong>Emails sent:</strong> ${input.emailsSent}</li>
      <li><strong>Open rate:</strong> ${input.openRate}%</li>
      <li><strong>Profile views since the campaign:</strong> ${input.profileViews}</li>
    </ul>
    <p>If you have questions or want to tweak your next outreach, just reply and let me know.</p>
    <p>${input.agentName ? `— ${input.agentName}` : ''}</p>
  `.trim();
}

const runner = async () => {
  const followups = await scanBySKPrefix('CAMPAIGN_FOLLOWUP#') as CampaignFollowupRecord[];
  const now = Date.now();
  const due = followups.filter((f) => f.status === 'pending' && f.scheduledFor <= now);

  const results: Array<{ id: string; status: string; error?: string }> = [];
  for (const followup of due) {
    try {
      const campaign = await getItem({
        PK: `AGENCY#${followup.agencyId}`,
        SK: `CAMPAIGN#${followup.SK.replace('CAMPAIGN_FOLLOWUP#', '')}`,
      }) as CampaignRecord | undefined;

      if (!campaign?.sentAt) {
        await putItem({ ...followup, status: 'failed', sentAt: now });
        results.push({ id: followup.id, status: 'failed', error: 'Campaign not found or not sent' });
        continue;
      }

      const client = await getItem({
        PK: `AGENCY#${followup.agencyId}`,
        SK: `CLIENT#${followup.clientId}`,
      }) as ClientRecord | undefined;

      const stats = await listCampaignEmailStats({
        agencyId: followup.agencyId,
        clientId: followup.clientId,
        campaignId: campaign.id,
      });

      let views: ProfileViewRecord[] = [];
      try {
        views = await queryGSI3(`CLIENT#${followup.clientId}`, 'PROFILE_VIEW#') as ProfileViewRecord[];
      } catch {
        views = [];
      }
      const viewsSince = (views || []).filter((v) => v.viewedAt >= campaign.sentAt!);

      const openRate = formatRate(stats.openCount, stats.sentCount);
      const html = buildFollowupHtml({
        athleteName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'there',
        agentName: campaign.agentName,
        personalizedMessage: campaign.personalizedMessage,
        emailsSent: stats.sentCount,
        openRate,
        profileViews: viewsSince.length,
      });

      if (!client?.email) {
        throw new Error('Client email missing for followup');
      }
      await sendGmailMessage({
        agencyId: followup.agencyId,
        senderClientId: campaign.senderClientId,
        to: client.email,
        subject: `${campaign.campaignName || 'Outreach'}: 48-hour update`,
        html,
      });

      await putItem({
        ...followup,
        emailsSent: stats.sentCount,
        openRate,
        clickRate: formatRate(stats.clickCount, stats.sentCount),
        profileViews: viewsSince.length,
        sentAt: now,
        status: 'sent',
      });

      await logActivity({
        agencyId: followup.agencyId,
        clientId: followup.clientId,
        actorEmail: campaign.agentEmail || 'system',
        actorType: 'agent',
        activityType: 'email_sent',
        description: `Sent 48-hour campaign update to ${client?.email || 'athlete'}`,
        metadata: { campaignId: campaign.id },
      });

      results.push({ id: followup.id, status: 'sent' });
    } catch (e: any) {
      await putItem({ ...followup, status: 'failed', sentAt: now });
      results.push({ id: followup.id, status: 'failed', error: e?.message || 'failed' });
    }
  }

  return results;
};

const handlerImpl = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'POST' && method !== 'GET') return response(405, { ok: false, error: 'Method not allowed' }, origin);

  const results = await runner();
  return response(200, { ok: true, results }, origin);
};

export const handler = withSentry(handlerImpl);
