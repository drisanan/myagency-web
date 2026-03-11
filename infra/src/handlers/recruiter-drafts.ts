import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { RecruiterDraftRecord } from '../lib/models';
import { deleteItem, getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

const draftsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const qs = event.queryStringParameters || {};
  const draftId = event.pathParameters?.id || qs.id;

  if (method === 'GET') {
    if (draftId) {
      const draft = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `RECRUITER_DRAFT#${draftId}` });
      if (!draft) return response(404, { ok: false, error: 'Draft not found' }, origin);
      return response(200, { ok: true, draft }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'RECRUITER_DRAFT#') as RecruiterDraftRecord[];
    const drafts = items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return response(200, { ok: true, drafts }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const { name, senderType, clientId, agentId, subject, html, division, state: st, schoolName, listId, selectedCoachIds, autoSaved } = payload || {};
    if (!name && !autoSaved) return response(400, { ok: false, error: 'Draft name is required' }, origin);

    const now = Date.now();
    const id = newId('draft');
    const rec: RecruiterDraftRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `RECRUITER_DRAFT#${id}`,
      id,
      agencyId: session.agencyId,
      name: name || `Auto-save ${new Date(now).toLocaleString()}`,
      senderType: senderType || 'client',
      clientId,
      agentId,
      subject: subject || '',
      html: html || '',
      division,
      state: st,
      schoolName,
      listId,
      selectedCoachIds,
      autoSaved: Boolean(autoSaved),
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);
    return response(200, { ok: true, draft: rec }, origin);
  }

  if (method === 'PATCH') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const id = payload?.id || draftId;
    if (!id) return response(400, { ok: false, error: 'Missing draft id' }, origin);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `RECRUITER_DRAFT#${id}` }) as RecruiterDraftRecord | undefined;
    if (!existing) return response(404, { ok: false, error: 'Draft not found' }, origin);
    const now = Date.now();
    const merged = { ...existing, ...payload, id: existing.id, PK: existing.PK, SK: existing.SK, updatedAt: now };
    await putItem(merged);
    return response(200, { ok: true, draft: merged }, origin);
  }

  if (method === 'DELETE') {
    const id = draftId;
    if (!id) return response(400, { ok: false, error: 'Missing draft id' }, origin);
    await deleteItem({ PK: `AGENCY#${session.agencyId}`, SK: `RECRUITER_DRAFT#${id}` });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(draftsHandler);
