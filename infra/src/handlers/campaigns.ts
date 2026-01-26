import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { CampaignRecord, CampaignFollowupRecord } from '../lib/models';
import { getItem, putItem, queryByPK, queryGSI3 } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

const campaignsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const qs = event.queryStringParameters || {};

  if (method === 'GET') {
    const clientId = qs.clientId;
    let campaigns: CampaignRecord[] = [];
    if (clientId) {
      try {
        campaigns = await queryGSI3(`CLIENT#${clientId}`, 'CAMPAIGN#') as CampaignRecord[];
      } catch {
        const all = await queryByPK(`AGENCY#${session.agencyId}`, 'CAMPAIGN#') as CampaignRecord[];
        campaigns = all.filter((c) => c.clientId === clientId);
      }
    } else {
      campaigns = await queryByPK(`AGENCY#${session.agencyId}`, 'CAMPAIGN#') as CampaignRecord[];
    }
    campaigns.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return response(200, { ok: true, campaigns }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const {
      clientId,
      subject,
      html,
      recipients,
      senderClientId,
      campaignName,
      scheduledAt,
      personalizedMessage,
      status: requestedStatus,
    } = payload || {};

    if (!clientId || !subject || !html || !Array.isArray(recipients) || !recipients.length || !senderClientId) {
      return response(400, { ok: false, error: 'clientId, subject, html, recipients, senderClientId required' }, origin);
    }

    const now = Date.now();
    const id = newId('campaign');
    const isScheduled = Number(scheduledAt) > now;
    const status: CampaignRecord['status'] = requestedStatus || (isScheduled ? 'scheduled' : 'sent');
    const sentAt = status === 'sent' ? now : undefined;

    const rec: CampaignRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `CAMPAIGN#${id}`,
      GSI3PK: `CLIENT#${clientId}`,
      GSI3SK: `CAMPAIGN#${isScheduled ? scheduledAt : sentAt || now}`,
      id,
      agencyId: session.agencyId,
      clientId,
      agentId: session.agentId,
      agentEmail: session.agentEmail || session.agencyEmail || 'agent',
      agentName: [session.firstName, session.lastName].filter(Boolean).join(' ').trim() || undefined,
      campaignName,
      subject,
      html,
      recipients,
      senderClientId,
      personalizedMessage,
      scheduledAt: isScheduled ? Number(scheduledAt) : undefined,
      sentAt,
      status,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);

    if (status === 'sent' && sentAt) {
      const followup: CampaignFollowupRecord = {
        PK: `AGENCY#${session.agencyId}`,
        SK: `CAMPAIGN_FOLLOWUP#${id}`,
        id: newId('campaign-followup'),
        agencyId: session.agencyId,
        clientId,
        campaignName,
        emailsSent: recipients.length,
        openRate: undefined,
        clickRate: undefined,
        profileViews: undefined,
        scheduledFor: sentAt + 48 * 60 * 60 * 1000,
        status: 'pending',
        createdAt: now,
      };
      await putItem(followup);
    }

    return response(200, { ok: true, campaign: rec }, origin);
  }

  if (method === 'PATCH') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const id = payload?.id || qs.id;
    if (!id) return response(400, { ok: false, error: 'Missing campaign id' }, origin);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CAMPAIGN#${id}` }) as CampaignRecord | undefined;
    if (!existing) return response(404, { ok: false, error: 'Campaign not found' }, origin);
    const now = Date.now();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    if (existing.status !== 'sent' && merged.status === 'sent' && !merged.sentAt) {
      merged.sentAt = now;
      await putItem({ ...merged, updatedAt: now });
      await putItem({
        PK: `AGENCY#${session.agencyId}`,
        SK: `CAMPAIGN_FOLLOWUP#${merged.id}`,
        id: newId('campaign-followup'),
        agencyId: session.agencyId,
        clientId: merged.clientId,
        campaignName: merged.campaignName,
        emailsSent: merged.recipients?.length || 0,
        scheduledFor: now + 48 * 60 * 60 * 1000,
        status: 'pending',
        createdAt: now,
      } as CampaignFollowupRecord);
    }
    return response(200, { ok: true, campaign: merged }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(campaignsHandler);
