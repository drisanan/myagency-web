import { APIGatewayProxyEventV2 } from 'aws-lambda';
import fetch from 'node-fetch';
import { Handler, requireSession } from './common';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZCSXRESEVyQTRTVllyUDgxVk1DIiwiY29tcGFueV9pZCI6IjFVbGN6NWpEUjY1N0hwUEFIU0VyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAyNTAwMjk3Njg4LCJzdWIiOiJ1c2VyX2lkIn0.fqrY7YeSxhmjWhgXySUrWTYvlZwfjjXCP9o8mTZ8exU';
const accessCodeFieldId = 'D3ogBTF9YTkxJybeMVvF';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

const profileHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') {
    return response(200, { ok: true }, origin);
  }

  const session = requireSession(event);
  if (!session) {
    return response(401, { ok: false, error: 'Unauthorized' }, origin);
  }

  if (method !== 'PUT' && method !== 'PATCH') {
    return response(405, { ok: false, error: 'Method not allowed' }, origin);
  }

  if (!event.body) {
    return badRequest(origin, 'Missing body');
  }

  const { firstName, lastName, accessCode } = JSON.parse(event.body);
  const contactId = (session as any).contactId || (session as any).userId;

  if (!contactId) {
    return badRequest(origin, 'No contact ID in session');
  }

  try {
    // Build update payload for GHL
    const updatePayload: any = {};
    
    if (firstName !== undefined) updatePayload.firstName = firstName;
    if (lastName !== undefined) updatePayload.lastName = lastName;
    
    // Update access code custom field if provided
    if (accessCode !== undefined) {
      if (!/^\d{6}$/.test(accessCode)) {
        return badRequest(origin, 'Access code must be 6 digits');
      }
      updatePayload.customField = [
        { id: accessCodeFieldId, value: accessCode }
      ];
    }

    // Call GHL API
    const ghlRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!ghlRes.ok) {
      const errData = await ghlRes.json().catch(() => ({}));
      console.error('GHL update failed', { status: ghlRes.status, body: errData });
      return response(500, { ok: false, error: 'Failed to update profile in GHL' }, origin);
    }

    const updated = await ghlRes.json() as any;
    
    return response(200, {
      ok: true,
      profile: {
        firstName: updated.contact?.firstName || firstName,
        lastName: updated.contact?.lastName || lastName,
      }
    }, origin);
  } catch (err: any) {
    console.error('Profile update error', err);
    return response(500, { ok: false, error: err?.message || 'Server error' }, origin);
  }
};

export const handler = withSentry(profileHandler);
