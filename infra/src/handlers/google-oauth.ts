import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok } from './common';
import { buildOAuthUrl, exchangeCode } from '../lib/google';

const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest('Missing method');

  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/url')) {
    try {
      const url = buildOAuthUrl(SCOPES);
      return ok({ ok: true, url });
    } catch (e: any) {
      return badRequest(e?.message || 'Failed to build OAuth URL');
    }
  }

  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/callback')) {
    const code = event.queryStringParameters?.code;
    if (!code) return badRequest('Missing code');
    try {
      const tokens = await exchangeCode(code);
      // TODO: persist encrypted tokens in DynamoDB keyed by client/agency
      return ok({ ok: true, tokens });
    } catch (e: any) {
      return badRequest(e?.message || 'OAuth exchange failed');
    }
  }

  return badRequest(`Unsupported path ${event.rawPath}`);
};

