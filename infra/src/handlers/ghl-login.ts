import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import fetch from 'node-fetch';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { randomUUID } from 'crypto';
import { withSentry } from '../lib/sentry';
import { ALLOWED_ORIGINS } from './cors';

// --- Configuration ---
// Use the existing table name and schema (PK/SK) consistent with the rest of the stack.
const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';
const bearerToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZCSXRESEVyQTRTVllyUDgxVk1DIiwiY29tcGFueV9pZCI6IjFVbGN6NWpEUjY1N0hwUEFIU0VyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAyNTAwMjk3Njg4LCJzdWIiOiJ1c2VyX2lkIn0.fqrY7YeSxhmjWhgXySUrWTYvlZwfjjXCP9o8mTZ8exU';

// --- Field IDs ---
const accessCodeFieldId = 'D3ogBTF9YTkxJybeMVvF';
const agencyIdFieldId = '2nUnTxRCuWPiGQ4j23we';
const agencyNameFieldId = 'mSth0jJ8VQk1k9caFxCC';
const agencyColorFieldId = '0STRDPbWyZ6ChSApAtjz';
const agencyLogoFieldId = 'Bvng0E2Yf5TkmEI8KyD6';
const subscriptionLevelFieldId = 'PLACEHOLDER_SUB_LEVEL'; // TODO: Replace with actual GHL field ID

// --- Clients ---
const IS_OFFLINE = process.env.IS_OFFLINE === 'true';
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: IS_OFFLINE ? fromIni({ profile: process.env.AWS_PROFILE || 'myagency' }) : undefined
});
const docClient = DynamoDBDocumentClient.from(client);

function getHeaders(origin?: string) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
}

const ghlLoginHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const headers = getHeaders(origin);
  const method = (event.requestContext.http?.method || '').toUpperCase();

  // 1. Handle CORS Preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (method !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: `Method not allowed` }) };
  }

  try {
    // 2. Validate Inputs
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Missing body' }) };
    }

    const { email, phone, accessCode } = JSON.parse(event.body);
    if (!email || !phone || !accessCode) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Missing credentials' }) };
    }

    const emailTrim = String(email).trim();
    const phoneTrim = String(phone).trim();
    const accessCodeInput = String(accessCode).trim();

    if (!/^\+?\d+$/.test(phoneTrim)) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Invalid phone' }) };
    }
    if (!/^\d+$/.test(accessCodeInput)) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Invalid access code format' }) };
    }

    // 3. Lookup Contact in GHL
    const encodedEmail = encodeURIComponent(emailTrim);
    const encodedPhone = encodeURIComponent(phoneTrim);
    const apiUrl = `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodedEmail}&phone=${encodedPhone}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg =
        data && typeof data === 'object' && 'message' in data ? (data as any).message : 'Lookup failed';
      return { statusCode: res.status, headers, body: JSON.stringify({ ok: false, error: errMsg }) };
    }

    const contact =
      data && typeof data === 'object' && Array.isArray((data as any).contacts)
        ? (data as any).contacts[0]
        : undefined;
    if (!contact) {
      return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'Contact not found' }) };
    }
    
    // 4. Validate Access Code
    const customFields = contact.customField || [];
    const accessField = customFields.find((f: any) => f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value;
    const storedAccessCodeStr = storedAccessCode == null ? '' : String(storedAccessCode).trim();

    if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'Invalid access code' }) };
    }

    // 5. Parse Agency Details
    let agencyId = (customFields.find((f: any) => f.id === agencyIdFieldId)?.value || '').toString().trim();
    const agencyName = (customFields.find((f: any) => f.id === agencyNameFieldId)?.value || '').toString().trim();
    const agencyColor = (customFields.find((f: any) => f.id === agencyColorFieldId)?.value || '').toString().trim();
    const agencyLogo = (customFields.find((f: any) => f.id === agencyLogoFieldId)?.value || '').toString().trim();
    
    // Parse subscription level - 'unlimited' or default to 'starter' (25 users)
    const rawSubscriptionLevel = (customFields.find((f: any) => f.id === subscriptionLevelFieldId)?.value || '').toString().trim().toLowerCase();
    const subscriptionLevel = rawSubscriptionLevel === 'unlimited' ? 'unlimited' : 'starter';
    
    const isNew = agencyId === 'READY';
    let resolvedAgencyId = agencyId;

    // --- NEW LOGIC: Create Agency if READY ---
    if (isNew) {
      console.log('Agency ID is READY. Initializing new agency record...');
      
      // A. Generate new ID
      const newAgencyId = `agency-${randomUUID()}`;
      
      // B. Save to DynamoDB (PK/SK schema with GSI1 for email lookup)
      try {
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `AGENCY#${newAgencyId}`,
            SK: 'PROFILE',
            GSI1PK: `EMAIL#${contact.email}`,
            GSI1SK: `AGENCY#${newAgencyId}`,
            id: newAgencyId,
            name: agencyName || 'New Agency',
            email: contact.email,
            contactId: contact.id,
            color: agencyColor,
            logoUrl: agencyLogo,
            subscriptionLevel, // 'starter' or 'unlimited'
            settings: {
              primaryColor: agencyColor || undefined,
              logoDataUrl: agencyLogo || undefined,
            },
            createdAt: Date.now(),
          }
        }));
        console.log(`Created agency ${newAgencyId} with subscriptionLevel=${subscriptionLevel}`);
        
        resolvedAgencyId = newAgencyId;
      } catch (dbError: any) {
        console.error('Failed to create agency in DynamoDB', dbError);
        // Fail hard here? Or continue? Usually safer to fail so we don't end up in inconsistent state.
        return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'Failed to initialize agency database record' }) };
      }

      // C. Update GHL with the new ID
      if (contact.id) {
        try {
          const updateBody = {
            customField: customFields.map((f: any) =>
              f.id === agencyIdFieldId ? { ...f, value: resolvedAgencyId } : f
            ),
          };
          const updateRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${contact.id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateBody),
          });

          if (!updateRes.ok) {
            const updateJson = await updateRes.json().catch(() => ({}));
            console.error('Failed to update GHL contact with new agency id', {
              status: updateRes.status,
              body: updateJson,
            });
            // We logged it, but we can still proceed since the local DB is correct. 
            // Next login might trigger "isNew" logic again or manual fix needed if GHL fails.
          } else {
            console.log(`Updated GHL contact ${contact.id} with new Agency ID ${resolvedAgencyId}`);
          }
        } catch (err: any) {
          console.error('Error updating GHL contact with new agency id', { error: err?.message });
        }
      }
    } else if (resolvedAgencyId && resolvedAgencyId !== 'READY') {
      // Existing agency - update subscription level if changed in GHL
      try {
        const { GetCommand, UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
        const existing = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `AGENCY#${resolvedAgencyId}`, SK: 'PROFILE' }
        }));
        
        if (existing.Item && existing.Item.subscriptionLevel !== subscriptionLevel) {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `AGENCY#${resolvedAgencyId}`, SK: 'PROFILE' },
            UpdateExpression: 'SET subscriptionLevel = :sl',
            ExpressionAttributeValues: { ':sl': subscriptionLevel }
          }));
          console.log(`Updated agency ${resolvedAgencyId} subscriptionLevel to ${subscriptionLevel}`);
        }
      } catch (updateErr: any) {
        // Non-fatal - log and continue
        console.error('Failed to update existing agency subscription', { error: updateErr?.message });
      }
    }

    // 6. Return Success with Resolved ID
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        contact: {
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          accessCode: storedAccessCode,
        },
        agency: {
          id: resolvedAgencyId, // This is now the Real UUID, never "READY"
          name: agencyName || undefined,
          color: agencyColor || undefined,
          logoUrl: agencyLogo || undefined,
          isNew: false, // Always false now because we just handled the "new" case
        },
      }),
    };
  } catch (e: any) {
    console.error('ghl-login lambda error', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: e?.message || 'Server error' }),
    };
  }
};

// Export unwrapped handler for reuse by login.ts
export { ghlLoginHandler };

export const handler = withSentry(ghlLoginHandler);