import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler } from './common';
import { buildOAuthUrl, exchangeCode } from '../lib/google';
import { response } from './cors';

const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/url')) {
    try {
      const url = buildOAuthUrl(SCOPES);
      return response(200, { ok: true, url }, origin);
    } catch (e: any) {
      return response(400, { ok: false, error: e?.message || 'Failed to build OAuth URL' }, origin);
    }
  }

  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/callback')) {
    const code = event.queryStringParameters?.code;
    if (!code) return response(400, { ok: false, error: 'Missing code' }, origin);
    try {
      const tokens = await exchangeCode(code);
      // TODO: persist encrypted tokens in DynamoDB keyed by client/agency
      return response(200, { ok: true, tokens }, origin);
    } catch (e: any) {
      return response(400, { ok: false, error: e?.message || 'OAuth exchange failed' }, origin);
    }
  }

  return response(400, { ok: false, error: `Unsupported path ${event.rawPath}` }, origin);
};

