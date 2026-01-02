import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ghlLoginHandler } from './ghl-login';
import { withSentry } from '../lib/sentry';

// Reuse the ghl-login logic; wrap with Sentry only once here
export const handler = withSentry(async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  return ghlLoginHandler(event);
});


