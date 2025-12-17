import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handler as ghlLoginHandler } from './ghl-login';

// For now, reuse the ghl-login logic; adjust here if login should differ.
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  return ghlLoginHandler(event);
};


