import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handler as ghlLoginHandler } from './ghl-login';
import { withSentry } from '../lib/sentry';

// For now, reuse the ghl-login logic; adjust here if login should differ.
const loginHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  return ghlLoginHandler(event);
};

export const handler = withSentry(loginHandler);


