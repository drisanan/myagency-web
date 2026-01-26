import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler } from './common';
import { queryGSI3, scanByGSI3PK } from '../lib/dynamo';
import { response } from './cors';
import { ClientRecord } from '../lib/models';
import { withSentry } from '../lib/sentry';

/**
 * Public Profile Handler - No authentication required
 * GET /profile/:username - Fetch athlete profile by vanity URL
 * GET /profile/check-username?username=xxx - Check username availability
 */
const profilePublicHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || '';

  // Handle OPTIONS for CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // GET /profile/check-username?username=xxx
  if (method === 'GET' && path.includes('/check-username')) {
    const username = event.queryStringParameters?.username?.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    if (!username || username.length < 3) {
      return response(400, { ok: false, error: 'Username must be at least 3 characters', available: false }, origin);
    }

    // Reserved usernames
    const reserved = ['admin', 'athlete', 'agency', 'api', 'auth', 'client', 'dashboard', 'help', 'login', 'profile', 'settings', 'support', 'www'];
    if (reserved.includes(username)) {
      return response(200, { ok: true, available: false, reason: 'reserved' }, origin);
    }

    try {
      // Try GSI3 query first, fallback to scan if index doesn't exist
      let existing: any[] = [];
      try {
        existing = await queryGSI3(`USERNAME#${username}`);
      } catch (e: any) {
        // GSI3 might not exist yet, fallback to scan
        if (e.name === 'ValidationException' || e.message?.includes('GSI3')) {
          existing = await scanByGSI3PK(`USERNAME#${username}`);
        } else {
          throw e;
        }
      }
      
      return response(200, { ok: true, available: existing.length === 0 }, origin);
    } catch (e: any) {
      console.error('[profile-public] check-username error:', e);
      return response(500, { ok: false, error: 'Failed to check username' }, origin);
    }
  }

  // GET /profile/:username - Fetch public profile
  if (method === 'GET') {
    const username = event.pathParameters?.username?.toLowerCase();
    
    if (!username) {
      return response(400, { ok: false, error: 'Username is required' }, origin);
    }

    try {
      // Try GSI3 query first, fallback to scan if index doesn't exist
      let items: any[] = [];
      try {
        items = await queryGSI3(`USERNAME#${username}`);
      } catch (e: any) {
        // GSI3 might not exist yet, fallback to scan
        if (e.name === 'ValidationException' || e.message?.includes('GSI3')) {
          items = await scanByGSI3PK(`USERNAME#${username}`);
        } else {
          throw e;
        }
      }

      if (items.length === 0) {
        return response(404, { ok: false, error: 'Profile not found' }, origin);
      }

      const client = items[0] as ClientRecord;

    // Hide paused/suspended accounts from public view
    if (client.accountStatus && client.accountStatus !== 'active') {
      return response(404, { ok: false, error: 'Profile not found' }, origin);
    }

      // Return sanitized public profile (exclude sensitive fields)
      const publicProfile = {
        id: client.id,
        username: client.username,
        firstName: client.firstName,
        lastName: client.lastName,
        sport: client.sport,
        phone: client.phone,
        email: client.email,
        galleryImages: client.galleryImages || [],
        radar: client.radar || {},
        // Don't expose: accessCodeHash, authEnabled, agencyId, agencyEmail, PK, SK, GSI keys
      };

      return response(200, { ok: true, profile: publicProfile }, origin);
    } catch (e: any) {
      console.error('[profile-public] fetch error:', e);
      return response(500, { ok: false, error: 'Failed to fetch profile' }, origin);
    }
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(profilePublicHandler);

