import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

const bearerToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZCSXRESEVyQTRTVllyUDgxVk1DIiwiY29tcGFueV9pZCI6IjFVbGN6NWpEUjY1N0hwUEFIU0VyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAyNTAwMjk3Njg4LCJzdWIiOiJ1c2VyX2lkIn0.fqrY7YeSxhmjWhgXySUrWTYvlZwfjjXCP9o8mTZ8exU';
const accessCodeFieldId = 'D3ogBTF9YTkxJybeMVvF';
const agencyIdFieldId = '2nUnTxRCuWPiGQ4j23we';
const agencyNameFieldId = 'mSth0jJ8VQk1k9caFxCC';
const agencyColorFieldId = '0STRDPbWyZ6ChSApAtjz';
const agencyLogoFieldId = 'Bvng0E2Yf5TkmEI8KyD6';
const ALLOWED_ORIGINS = [
  'https://myrecruiteragency.com',
  'https://www.myrecruiteragency.com',
  'https://master.d2yp6hyv6u0efd.amplifyapp.com',
  'http://localhost:3001',
  'http://localhost:3000',
];

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

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const headers = getHeaders(origin);
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (method !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: `Method not allowed` }) };
  }

  try {
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

    const encodedEmail = encodeURIComponent(emailTrim);
    const encodedPhone = encodeURIComponent(phoneTrim);
    const apiUrl = `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodedEmail}&phone=${encodedPhone}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.message || 'Lookup failed';
      return { statusCode: res.status, headers, body: JSON.stringify({ ok: false, error: errMsg }) };
    }

    const contact = data?.contacts?.[0];
    if (!contact) {
      return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'Contact not found' }) };
    }
    
    const customFields = contact.customField || [];
    const accessField = customFields.find((f: any) => f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value;
    const storedAccessCodeStr = storedAccessCode == null ? '' : String(storedAccessCode).trim();

    if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'Invalid access code' }) };
    }

    const agencyId = (customFields.find((f: any) => f.id === agencyIdFieldId)?.value || '').toString().trim();
    const agencyName = (customFields.find((f: any) => f.id === agencyNameFieldId)?.value || '').toString().trim();
    const agencyColor = (customFields.find((f: any) => f.id === agencyColorFieldId)?.value || '').toString().trim();
    const agencyLogo = (customFields.find((f: any) => f.id === agencyLogoFieldId)?.value || '').toString().trim();
    const isNew = agencyId === 'READY';

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
          id: agencyId || undefined,
          name: agencyName || undefined,
          color: agencyColor || undefined,
          logoUrl: agencyLogo || undefined,
          isNew,
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

