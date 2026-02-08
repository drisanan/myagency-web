/**
 * Activity Log API Handler
 * 
 * Tracks all user activities for reporting.
 * Supports filtering by client, agent, and activity type.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { ActivityLogRecord, ActivityType } from '../lib/models';
import { putItem, queryByPK, queryByPKPaginated, queryGSI3 } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

const activityHandler: Handler = async (event: APIGatewayProxyEventV2) => {
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
    let activities: ActivityLogRecord[] = [];
    
    // Filter by client
    if (qs.clientId) {
      // Verify access - clients can only see their own activities
      if (session.role === 'client' && session.clientId !== qs.clientId) {
        return response(403, { ok: false, error: 'Forbidden' }, origin);
      }
      
      try {
        activities = await queryGSI3(`CLIENT#${qs.clientId}`, 'ACTIVITY#') as ActivityLogRecord[];
      } catch {
        const all = await queryByPK(`AGENCY#${agencyId}`, 'ACTIVITY#') as ActivityLogRecord[];
        activities = all.filter(a => a.clientId === qs.clientId);
      }
    } else {
      // Only agents can see all activities
      if (session.role === 'client') {
        return response(403, { ok: false, error: 'Forbidden' }, origin);
      }
      activities = await queryByPK(`AGENCY#${agencyId}`, 'ACTIVITY#') as ActivityLogRecord[];
    }
    
    // Filter by type
    if (qs.type) {
      activities = activities.filter(a => a.activityType === qs.type);
    }
    
    // Filter by actor type
    if (qs.actorType) {
      activities = activities.filter(a => a.actorType === qs.actorType);
    }
    
    // Filter by date range
    if (qs.since) {
      const since = parseInt(qs.since, 10);
      activities = activities.filter(a => a.createdAt >= since);
    }
    if (qs.until) {
      const until = parseInt(qs.until, 10);
      activities = activities.filter(a => a.createdAt <= until);
    }
    
    // Sort by most recent
    activities.sort((a, b) => b.createdAt - a.createdAt);
    
    // Limit results
    const limit = parseInt(qs.limit || '100', 10);
    activities = activities.slice(0, limit);
    
    return response(200, { ok: true, activities }, origin);
  }

  // --- POST (log activity) ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.activityType || !payload.description) {
      return badRequest(origin, 'activityType and description are required');
    }
    
    const validTypes: ActivityType[] = [
      'login', 'profile_update', 'task_completed', 'email_sent',
      'email_opened', 'profile_viewed_by_coach', 'list_created',
      'meeting_requested', 'form_submitted',
      'impersonation_start', 'impersonation_end'
    ];
    
    if (!validTypes.includes(payload.activityType)) {
      return badRequest(origin, `Invalid activity type. Allowed: ${validTypes.join(', ')}`);
    }
    
    const id = newId('act');
    const now = Date.now();
    
    // Determine actor based on session
    const actorEmail = session.agentEmail || session.agencyEmail || (session as any).email || 'system';
    const actorType = session.role === 'client' ? 'athlete' : 
                      session.role === 'agent' ? 'agent' : 
                      session.role === 'agency' ? 'agent' : 'system';
    
    const rec: ActivityLogRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `ACTIVITY#${now}#${id}`,
      GSI3PK: payload.clientId ? `CLIENT#${payload.clientId}` : undefined,
      GSI3SK: payload.clientId ? `ACTIVITY#${now}` : undefined,
      id,
      agencyId,
      clientId: payload.clientId,
      agentId: payload.agentId || (session.role === 'agent' ? session.agentId : undefined),
      actorEmail,
      actorType: payload.actorType || actorType,
      activityType: payload.activityType,
      description: payload.description,
      metadata: payload.metadata,
      createdAt: now,
    };
    
    await putItem(rec);
    
    return response(200, { ok: true, activity: rec }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(activityHandler);

// ============================================
// Activity Report Endpoint
// ============================================

const activityReportHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // Only agents can view reports
  if (session.role !== 'agency' && session.role !== 'agent') {
    return response(403, { ok: false, error: 'Forbidden' }, origin);
  }

  const agencyId = session.agencyId.trim();
  const qs = event.queryStringParameters || {};
  const clientId = qs.clientId;
  
  // Calculate time periods
  const now = Date.now();
  const dayAgo = now - (24 * 60 * 60 * 1000);
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // Get activities
  let activities: ActivityLogRecord[] = [];
  
  if (clientId) {
    try {
      activities = await queryGSI3(`CLIENT#${clientId}`, 'ACTIVITY#') as ActivityLogRecord[];
    } catch {
      const all = await queryByPK(`AGENCY#${agencyId}`, 'ACTIVITY#') as ActivityLogRecord[];
      activities = all.filter(a => a.clientId === clientId);
    }
  } else {
    activities = await queryByPK(`AGENCY#${agencyId}`, 'ACTIVITY#') as ActivityLogRecord[];
  }
  
  // Build report
  const byType = activities.reduce((acc, a) => {
    acc[a.activityType] = (acc[a.activityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const lastDay = activities.filter(a => a.createdAt >= dayAgo);
  const lastWeek = activities.filter(a => a.createdAt >= weekAgo);
  const lastMonth = activities.filter(a => a.createdAt >= monthAgo);
  
  // Recent activities (last 20)
  const recent = activities
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20);
  
  // Coach activity (profile views, email engagement)
  const coachActivity = activities.filter(a => 
    a.activityType === 'profile_viewed_by_coach' || 
    a.activityType === 'email_opened'
  );
  
  // Athlete activity (logins, tasks, form submissions)
  const athleteActivity = activities.filter(a => 
    a.actorType === 'athlete' ||
    a.activityType === 'login' ||
    a.activityType === 'task_completed' ||
    a.activityType === 'form_submitted'
  );
  
  return response(200, { 
    ok: true,
    report: {
      period: { 
        day: { start: dayAgo, count: lastDay.length },
        week: { start: weekAgo, count: lastWeek.length },
        month: { start: monthAgo, count: lastMonth.length },
      },
      byType,
      coachActivity: {
        count: coachActivity.length,
        recent: coachActivity.slice(0, 10),
      },
      athleteActivity: {
        count: athleteActivity.length,
        recent: athleteActivity.slice(0, 10),
      },
      recentActivities: recent,
    },
  }, origin);
};

export const reportHandler = withSentry(activityReportHandler);
