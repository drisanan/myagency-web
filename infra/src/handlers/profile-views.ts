/**
 * Profile Views API Handler
 * 
 * Tracks when coaches view athlete profiles.
 * Supports weekly digest notifications.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { ProfileViewRecord, ClientRecord } from '../lib/models';
import { getItem, putItem, queryByPK, queryGSI3, updateItem } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

const profileViewsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const agencyId = session.agencyId.trim();
  const qs = event.queryStringParameters || {};

  // --- GET ---
  if (method === 'GET') {
    const clientId = qs.clientId || qs.athleteId;
    
    if (!clientId) {
      return badRequest(origin, 'clientId is required');
    }
    
    // Verify access - athletes can only see their own views
    if (session.role === 'client' && session.clientId !== clientId) {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    
    let views: ProfileViewRecord[] = [];
    
    try {
      views = await queryGSI3(`CLIENT#${clientId}`, 'PROFILE_VIEW#') as ProfileViewRecord[];
    } catch {
      // Fallback: query by PK and filter
      const all = await queryByPK(`AGENCY#${agencyId}`, 'PROFILE_VIEW#') as ProfileViewRecord[];
      views = all.filter(v => v.clientId === clientId);
    }
    
    // Sort by most recent
    views.sort((a, b) => b.viewedAt - a.viewedAt);
    
    // Apply date range filter
    if (qs.since) {
      const since = parseInt(qs.since, 10);
      views = views.filter(v => v.viewedAt >= since);
    }
    if (qs.until) {
      const until = parseInt(qs.until, 10);
      views = views.filter(v => v.viewedAt <= until);
    }
    
    // Limit results
    const limit = parseInt(qs.limit || '100', 10);
    views = views.slice(0, limit);
    
    // Get summary stats
    const uniqueViewers = new Set(views.filter(v => v.viewerEmail).map(v => v.viewerEmail)).size;
    const uniqueUniversities = new Set(views.filter(v => v.university).map(v => v.university)).size;
    
    // Group by university for top schools
    const byUniversity = views.reduce((acc, v) => {
      if (v.university) {
        acc[v.university] = (acc[v.university] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topUniversities = Object.entries(byUniversity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([university, count]) => ({ university, count }));
    
    return response(200, { 
      ok: true, 
      views,
      stats: {
        totalViews: views.length,
        uniqueViewers,
        uniqueUniversities,
        topUniversities,
      },
    }, origin);
  }

  // --- POST (record a view) ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.clientId) {
      return badRequest(origin, 'clientId is required');
    }
    
    const id = newId('pview');
    const now = Date.now();
    
    const rec: ProfileViewRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `PROFILE_VIEW#${now}#${id}`,
      GSI3PK: `CLIENT#${payload.clientId}`,
      GSI3SK: `PROFILE_VIEW#${now}`,
      id,
      agencyId,
      clientId: payload.clientId,
      viewerEmail: payload.viewerEmail,
      viewerName: payload.viewerName,
      university: payload.university,
      position: payload.position,
      viewedAt: now,
      source: payload.source || 'direct',
      referrer: payload.referrer,
    };
    
    await putItem(rec);
    
    // Update cached view count on client record
    try {
      await updateItem({
        key: { PK: `AGENCY#${agencyId}`, SK: `CLIENT#${payload.clientId}` },
        updateExpression: 'SET profileViewCount = if_not_exists(profileViewCount, :zero) + :one, lastActivityAt = :now',
        expressionAttributeValues: {
          ':zero': 0,
          ':one': 1,
          ':now': now,
        },
      });
    } catch (e) {
      console.warn('[profile-views] Failed to update client view count:', e);
    }
    
    return response(200, { ok: true, view: rec }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(profileViewsHandler);

// ============================================
// Weekly Digest Endpoint
// ============================================

const weeklyDigestHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const agencyId = session.agencyId.trim();
  const qs = event.queryStringParameters || {};
  const clientId = qs.clientId;
  
  // Calculate last 7 days
  const now = Date.now();
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  // Get all views for the week
  let views = await queryByPK(`AGENCY#${agencyId}`, 'PROFILE_VIEW#') as ProfileViewRecord[];
  views = views.filter(v => v.viewedAt >= weekAgo);
  
  // Filter by client if specified
  if (clientId) {
    views = views.filter(v => v.clientId === clientId);
  }
  
  // Group by client
  const byClient = views.reduce((acc, v) => {
    if (!acc[v.clientId]) {
      acc[v.clientId] = [];
    }
    acc[v.clientId].push(v);
    return acc;
  }, {} as Record<string, ProfileViewRecord[]>);
  
  // Build digest for each client
  const digests = await Promise.all(
    Object.entries(byClient).map(async ([cid, clientViews]) => {
      // Get client info
      const client = await getItem({ PK: `AGENCY#${agencyId}`, SK: `CLIENT#${cid}` }) as ClientRecord | undefined;
      
      const uniqueViewers = new Set(clientViews.filter(v => v.viewerEmail).map(v => v.viewerEmail)).size;
      const universities = [...new Set(clientViews.filter(v => v.university).map(v => v.university))];
      
      return {
        clientId: cid,
        clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
        clientEmail: client?.email,
        totalViews: clientViews.length,
        uniqueViewers,
        universities,
        recentViews: clientViews
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, 5)
          .map(v => ({
            viewerName: v.viewerName,
            viewerEmail: v.viewerEmail,
            university: v.university,
            position: v.position,
            viewedAt: v.viewedAt,
          })),
      };
    })
  );
  
  // Sort by most views
  digests.sort((a, b) => b.totalViews - a.totalViews);
  
  return response(200, { 
    ok: true, 
    period: { start: weekAgo, end: now },
    digests,
    summary: {
      totalViews: views.length,
      clientsWithViews: digests.length,
      uniqueUniversities: [...new Set(views.filter(v => v.university).map(v => v.university))].length,
    },
  }, origin);
};

export const digestHandler = withSentry(weeklyDigestHandler);
