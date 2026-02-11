import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { requireSession } from './common';
import { response } from './cors';
import { getItem, putItem, deleteItem } from '../lib/dynamo';
import { google, calendar_v3 } from 'googleapis';
import { withSentry } from '../lib/sentry';

type CalendarEvent = {
  id: string;
  title: string;
  start: string | null | undefined;
  end: string | null | undefined;
  location?: string | null;
  description?: string | null;
  meetLink?: string | null;
  allDay?: boolean;
  source: 'google' | 'platform';
};

// Required calendar scopes for this handler
const REQUIRED_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Check if token has required calendar scopes
 */
function hasCalendarScopes(tokenScope: string | undefined): boolean {
  if (!tokenScope) return false;
  const scopes = tokenScope.split(' ');
  // Need at least one calendar scope
  return REQUIRED_CALENDAR_SCOPES.some(required => scopes.includes(required));
}

/**
 * Refresh tokens if expired and return valid oauth2 client
 * Token storage uses GMAIL_TOKEN# prefix for backwards compatibility
 * (tokens are shared across Gmail and Calendar as they're from same OAuth grant)
 */
async function getAuthenticatedClient(
  agencyId: string,
  clientId: string,
  oauth2Client: InstanceType<typeof google.auth.OAuth2>
): Promise<{ client: InstanceType<typeof google.auth.OAuth2>; error?: string; needsReconnect?: boolean }> {
  // Token storage key: GMAIL_TOKEN# is used for all Google OAuth tokens (Gmail + Calendar)
  const item = await getItem({
    PK: `AGENCY#${agencyId}`,
    SK: `GMAIL_TOKEN#${clientId}`,
  });

  if (!item?.tokens?.access_token) {
    return { 
      client: oauth2Client, 
      error: 'Google account not connected. Please connect your Google account to use Calendar features.',
      needsReconnect: true,
    };
  }

  // Check if token has calendar scopes - if not, user needs to re-authorize
  if (!hasCalendarScopes(item.tokens.scope)) {
    return {
      client: oauth2Client,
      error: 'Calendar permissions not granted. Please reconnect your Google account to enable Calendar sync.',
      needsReconnect: true,
    };
  }

  oauth2Client.setCredentials(item.tokens);

  // Check if token needs refresh
  const now = Date.now();
  const expiryDate = item.tokens.expiry_date;
  
  if (expiryDate && now > expiryDate - 60000) { // Refresh 1 min before expiry
    if (!item.tokens.refresh_token) {
      return { 
        client: oauth2Client, 
        error: 'Token expired and no refresh token available. Please reconnect your Google account.',
        needsReconnect: true,
      };
    }
    
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await putItem({
        ...item,
        tokens: credentials,
        updatedAt: Date.now(),
      });
      oauth2Client.setCredentials(credentials);
    } catch (e) {
      console.error('Token refresh failed', e);
      return { 
        client: oauth2Client, 
        error: 'Failed to refresh token. Please reconnect your Google account.',
        needsReconnect: true,
      };
    }
  }

  return { client: oauth2Client };
}

/**
 * Check if a Google API error indicates revoked/invalid credentials.
 * When a user revokes access from Google Account settings, API calls fail
 * with 401 (invalid_token) or 403 (insufficientPermissions).
 */
function isRevokedTokenError(err: any): boolean {
  const status = err?.response?.status || err?.code;
  if (status === 401 || status === 403) return true;
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('invalid_grant') ||
    msg.includes('token has been expired or revoked') ||
    msg.includes('invalid credentials') ||
    msg.includes('token has been revoked') ||
    msg.includes('insufficientpermissions')
  );
}

/**
 * When we detect revoked credentials, delete the stale token so
 * subsequent requests immediately prompt a reconnect instead of
 * repeatedly hitting Google with bad tokens.
 */
async function cleanupRevokedToken(agencyId: string, clientId: string) {
  try {
    await deleteItem({
      PK: `AGENCY#${agencyId}`,
      SK: `GMAIL_TOKEN#${clientId}`,
    });
    console.log('Cleaned up revoked token for', clientId);
  } catch (e) {
    console.warn('Failed to clean up revoked token', e);
  }
}

const googleCalendarHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Unauthorized' }, origin);

  // Validate agencyId is present in session
  if (!session.agencyId) {
    console.error('Calendar API called without agencyId in session', { 
      role: session.role, 
      agencyEmail: session.agencyEmail 
    });
    return response(400, { 
      ok: false, 
      error: 'Agency context required. Please ensure you are logged in to an agency account.' 
    }, origin);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return response(500, { ok: false, error: 'Google credentials not configured' }, origin);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  // Determine clientId from query or session
  const clientId = event.queryStringParameters?.clientId || session.clientId || session.agencyEmail;

  // =========================================================================
  // GET /google/calendar/events - List upcoming events
  // =========================================================================
  if (method === 'GET' && path.includes('/calendar/events')) {
    if (!clientId) {
      return response(400, { ok: false, error: 'clientId is required' }, origin);
    }

    const authResult = await getAuthenticatedClient(session.agencyId, clientId, oauth2Client);
    if (authResult.error) {
      return response(401, { ok: false, error: authResult.error, needsReconnect: authResult.needsReconnect }, origin);
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: authResult.client });
      
      const now = new Date();
      const daysAhead = parseInt(event.queryStringParameters?.days || '14', 10);
      const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      });

      const events: CalendarEvent[] = (res.data.items || []).map((e: calendar_v3.Schema$Event) => ({
        id: e.id || '',
        title: e.summary || 'Untitled',
        start: e.start?.dateTime || e.start?.date || null,
        end: e.end?.dateTime || e.end?.date || null,
        location: e.location,
        description: e.description,
        meetLink: e.conferenceData?.entryPoints?.[0]?.uri || e.hangoutLink,
        allDay: Boolean(e.start?.date && !e.start?.dateTime),
        source: 'google' as const,
      }));

      return response(200, { ok: true, events }, origin);
    } catch (e: any) {
      console.error('Calendar list error', e);
      if (isRevokedTokenError(e)) {
        await cleanupRevokedToken(session.agencyId, clientId);
        return response(401, {
          ok: false,
          error: 'Google access has been revoked. Please reconnect your Google account.',
          needsReconnect: true,
        }, origin);
      }
      return response(500, { ok: false, error: e.message || 'Failed to fetch calendar events' }, origin);
    }
  }

  // =========================================================================
  // POST /google/calendar/events - Create new calendar event
  // =========================================================================
  if (method === 'POST' && path.includes('/calendar/events')) {
    const body = JSON.parse(event.body || '{}');
    const { title, start, end, description, attendees, createMeet, location } = body;
    const targetClientId = body.clientId || clientId;

    if (!title || !start) {
      return response(400, { ok: false, error: 'title and start are required' }, origin);
    }

    if (!targetClientId) {
      return response(400, { ok: false, error: 'clientId is required' }, origin);
    }

    const authResult = await getAuthenticatedClient(session.agencyId, targetClientId, oauth2Client);
    if (authResult.error) {
      return response(401, { ok: false, error: authResult.error, needsReconnect: authResult.needsReconnect }, origin);
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: authResult.client });
      
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1hr

      // Use UTC (toISOString returns UTC) - Google Calendar will display in user's local timezone
      const eventPayload: calendar_v3.Schema$Event = {
        summary: title,
        description,
        location,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
      };

      if (attendees?.length) {
        eventPayload.attendees = attendees.map((email: string) => ({ email }));
      }

      if (createMeet) {
        eventPayload.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const created = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventPayload,
        conferenceDataVersion: createMeet ? 1 : 0,
        sendUpdates: attendees?.length ? 'all' : 'none',
      });

      const createdEvent: CalendarEvent = {
        id: created.data.id || '',
        title: created.data.summary || title,
        start: created.data.start?.dateTime || created.data.start?.date || start,
        end: created.data.end?.dateTime || created.data.end?.date || null,
        meetLink: created.data.conferenceData?.entryPoints?.[0]?.uri || created.data.hangoutLink,
        source: 'google',
      };

      return response(200, { ok: true, event: createdEvent }, origin);
    } catch (e: any) {
      console.error('Calendar create error', e);
      if (isRevokedTokenError(e)) {
        await cleanupRevokedToken(session.agencyId, targetClientId);
        return response(401, {
          ok: false,
          error: 'Google access has been revoked. Please reconnect your Google account.',
          needsReconnect: true,
        }, origin);
      }
      return response(500, { ok: false, error: e.message || 'Failed to create calendar event' }, origin);
    }
  }

  // =========================================================================
  // PATCH /google/calendar/events/{eventId} - Update calendar event
  // =========================================================================
  if (method === 'PATCH' && path.includes('/calendar/events/')) {
    const eventId = path.split('/calendar/events/')[1];
    if (!eventId) {
      return response(400, { ok: false, error: 'eventId is required' }, origin);
    }

    const body = JSON.parse(event.body || '{}');
    const targetClientId = body.clientId || clientId;

    if (!targetClientId) {
      return response(400, { ok: false, error: 'clientId is required' }, origin);
    }

    const authResult = await getAuthenticatedClient(session.agencyId, targetClientId, oauth2Client);
    if (authResult.error) {
      return response(401, { ok: false, error: authResult.error, needsReconnect: authResult.needsReconnect }, origin);
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: authResult.client });
      
      const updatePayload: calendar_v3.Schema$Event = {};
      if (body.title) updatePayload.summary = body.title;
      if (body.description !== undefined) updatePayload.description = body.description;
      if (body.location !== undefined) updatePayload.location = body.location;
      if (body.start) updatePayload.start = { dateTime: new Date(body.start).toISOString() };
      if (body.end) updatePayload.end = { dateTime: new Date(body.end).toISOString() };

      const updated = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updatePayload,
      });

      return response(200, { ok: true, event: { id: updated.data.id } }, origin);
    } catch (e: any) {
      console.error('Calendar update error', e);
      if (isRevokedTokenError(e)) {
        await cleanupRevokedToken(session.agencyId, targetClientId);
        return response(401, {
          ok: false,
          error: 'Google access has been revoked. Please reconnect your Google account.',
          needsReconnect: true,
        }, origin);
      }
      return response(500, { ok: false, error: e.message || 'Failed to update calendar event' }, origin);
    }
  }

  // =========================================================================
  // DELETE /google/calendar/events/{eventId} - Delete calendar event
  // =========================================================================
  if (method === 'DELETE' && path.includes('/calendar/events/')) {
    const eventId = path.split('/calendar/events/')[1];
    if (!eventId) {
      return response(400, { ok: false, error: 'eventId is required' }, origin);
    }

    const targetClientId = event.queryStringParameters?.clientId || clientId;

    if (!targetClientId) {
      return response(400, { ok: false, error: 'clientId is required' }, origin);
    }

    const authResult = await getAuthenticatedClient(session.agencyId, targetClientId, oauth2Client);
    if (authResult.error) {
      return response(401, { ok: false, error: authResult.error, needsReconnect: authResult.needsReconnect }, origin);
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: authResult.client });
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return response(200, { ok: true }, origin);
    } catch (e: any) {
      console.error('Calendar delete error', e);
      if (isRevokedTokenError(e)) {
        await cleanupRevokedToken(session.agencyId, targetClientId);
        return response(401, {
          ok: false,
          error: 'Google access has been revoked. Please reconnect your Google account.',
          needsReconnect: true,
        }, origin);
      }
      return response(500, { ok: false, error: e.message || 'Failed to delete calendar event' }, origin);
    }
  }

  return response(404, { ok: false, error: 'Calendar endpoint not found' }, origin);
};

export const handler = withSentry(googleCalendarHandler);
