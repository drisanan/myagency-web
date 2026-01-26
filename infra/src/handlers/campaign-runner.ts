import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { CampaignRecord, CampaignFollowupRecord, ClientRecord } from '../lib/models';
import { getItem, putItem, scanBySKPrefix } from '../lib/dynamo';
import { sendGmailMessage } from '../lib/gmailSend';
import { recordEmailSendsInternal } from '../lib/emailMetrics';
import { withSentry } from '../lib/sentry';
import { newId } from '../lib/ids';

function personalizeHtml(html: string, name?: string) {
  if (!name) return html;
  const last = name.split(' ').slice(-1)[0] || name;
  return html.replace(/Hello Coach [^,<]*,/i, `Hello Coach ${last},`);
}

function resolveApiBase() {
  const base = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
  return base.startsWith('http') ? base : `https://${base}`;
}

function createTrackingUrl(destination: string, params: { agencyId: string; clientId: string; athleteEmail: string; recipientEmail: string; university?: string; campaignId?: string }) {
  const trackingUrl = new URL(`${resolveApiBase()}/r`);
  trackingUrl.searchParams.set('d', destination);
  trackingUrl.searchParams.set('g', params.agencyId);
  trackingUrl.searchParams.set('c', params.clientId);
  trackingUrl.searchParams.set('a', params.athleteEmail);
  trackingUrl.searchParams.set('r', params.recipientEmail);
  if (params.university) trackingUrl.searchParams.set('u', params.university);
  if (params.campaignId) trackingUrl.searchParams.set('p', params.campaignId);
  return trackingUrl.toString();
}

function wrapLinksWithTracking(html: string, params: { agencyId: string; clientId: string; athleteEmail: string; recipientEmail: string; university?: string; campaignId?: string }) {
  return html.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
    if (url.startsWith('mailto:') || url.startsWith('tel:')) return match;
    if (url.includes('/r?') || url.includes('/track/click')) return match;
    if (url.includes('unsubscribe') || url.includes('preferences')) return match;
    const trackingUrl = createTrackingUrl(url, params);
    return `href="${trackingUrl}"`;
  });
}

function createOpenPixelUrl(params: { clientId: string; clientEmail: string; recipientEmail: string; university?: string; campaignId?: string }) {
  const url = new URL(`${resolveApiBase()}/email-metrics/open`);
  url.searchParams.set('clientId', params.clientId);
  url.searchParams.set('clientEmail', params.clientEmail);
  url.searchParams.set('recipientEmail', params.recipientEmail);
  if (params.university) url.searchParams.set('university', params.university);
  if (params.campaignId) url.searchParams.set('campaignId', params.campaignId);
  return url.toString();
}

const runner = async () => {
  const campaigns = await scanBySKPrefix('CAMPAIGN#') as CampaignRecord[];
  const now = Date.now();
  const due = campaigns.filter((c) => c.status === 'scheduled' && c.scheduledAt && c.scheduledAt <= now);

  const results: Array<{ id: string; status: string; sent?: number; error?: string }> = [];
  for (const campaign of due) {
    try {
      const sentRecipients: Array<{ email: string; name?: string; university?: string }> = [];
      const client = await getItem({
        PK: `AGENCY#${campaign.agencyId}`,
        SK: `CLIENT#${campaign.clientId}`,
      }) as ClientRecord | undefined;
      for (const recipient of campaign.recipients || []) {
        let html = personalizeHtml(campaign.html, recipient.name);
        html = wrapLinksWithTracking(html, {
          agencyId: campaign.agencyId,
          clientId: campaign.clientId,
          athleteEmail: client?.email || '',
          recipientEmail: recipient.email,
          university: recipient.university,
          campaignId: campaign.id,
        });
        const pixel = createOpenPixelUrl({
          clientId: campaign.clientId,
          clientEmail: client?.email || '',
          recipientEmail: recipient.email,
          university: recipient.university,
          campaignId: campaign.id,
        });
        html = `${html}<img src="${pixel}" alt="" width="1" height="1" style="display:none;" />`;
        await sendGmailMessage({
          agencyId: campaign.agencyId,
          senderClientId: campaign.senderClientId,
          to: recipient.email,
          subject: campaign.subject,
          html,
        });
        sentRecipients.push(recipient);
      }

      await recordEmailSendsInternal({
        agencyId: campaign.agencyId,
        clientId: campaign.clientId,
        clientEmail: client?.email || '',
        recipients: sentRecipients,
        subject: campaign.subject,
        campaignId: campaign.id,
        sentAt: now,
      });

      const updated: CampaignRecord = {
        ...campaign,
        status: 'sent',
        sentAt: now,
        updatedAt: now,
      };
      await putItem(updated);

      const followup = await getItem({
        PK: `AGENCY#${campaign.agencyId}`,
        SK: `CAMPAIGN_FOLLOWUP#${campaign.id}`,
      }) as CampaignFollowupRecord | undefined;
      if (!followup) {
        await putItem({
          PK: `AGENCY#${campaign.agencyId}`,
          SK: `CAMPAIGN_FOLLOWUP#${campaign.id}`,
          id: newId('campaign-followup'),
          agencyId: campaign.agencyId,
          clientId: campaign.clientId,
          campaignName: campaign.campaignName,
          emailsSent: sentRecipients.length,
          scheduledFor: now + 48 * 60 * 60 * 1000,
          status: 'pending',
          createdAt: now,
        } as CampaignFollowupRecord);
      }

      results.push({ id: campaign.id, status: 'sent', sent: sentRecipients.length });
    } catch (e: any) {
      const updated: CampaignRecord = { ...campaign, status: 'failed', updatedAt: now };
      await putItem(updated);
      results.push({ id: campaign.id, status: 'failed', error: e?.message || 'send failed' });
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
