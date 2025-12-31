import { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../handlers/common';

const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';

function normalizeCreatedAt(item: Record<string, unknown>) {
  if (!item) return item;
  const ca = (item as any).createdAt;
  if (typeof ca === 'string') {
    const num = Number(ca) || Date.parse(ca) || Date.now();
    (item as any).createdAt = num;
  }
  return item;
}

export async function putItem(item: Record<string, unknown>) {
  normalizeCreatedAt(item);
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

export async function getItem(key: { PK: string; SK: string }) {
  const res = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: key }));
  return res.Item;
}

export async function queryByPK(PK: string, beginsWith?: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: beginsWith ? 'PK = :pk AND begins_with(SK, :sk)' : 'PK = :pk',
      ExpressionAttributeValues: beginsWith ? { ':pk': PK, ':sk': beginsWith } : { ':pk': PK },
    }),
  );
  return res.Items ?? [];
}

export async function queryGSI1(GSI1PK: string, beginsWith?: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: beginsWith ? 'GSI1PK = :g1pk AND begins_with(GSI1SK, :g1sk)' : 'GSI1PK = :g1pk',
      ExpressionAttributeValues: beginsWith ? { ':g1pk': GSI1PK, ':g1sk': beginsWith } : { ':g1pk': GSI1PK },
    }),
  );
  return res.Items ?? [];
}

// Fallback query without specifying IndexName (only works if GSI1PK exists on base table projection)
// Fallback scan when GSI1 is misconfigured or absent; use sparingly (costly)
export async function scanByGSI1PK(GSI1PK: string, beginsWith?: string) {
  const params: any = {
    TableName: TABLE_NAME,
    FilterExpression: beginsWith ? 'GSI1PK = :g1pk AND begins_with(GSI1SK, :g1sk)' : 'GSI1PK = :g1pk',
    ExpressionAttributeValues: beginsWith
      ? { ':g1pk': GSI1PK, ':g1sk': beginsWith }
      : { ':g1pk': GSI1PK },
  };
  const res = await docClient.send(new ScanCommand(params));
  return res.Items ?? [];
}

export async function queryClientLists(clientId: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2ClientLists',
      KeyConditionExpression: 'clientId = :cid',
      ExpressionAttributeValues: { ':cid': clientId },
    }),
  );
  return res.Items ?? [];
}

export async function updateItem(params: {
  key: { PK: string; SK: string };
  updateExpression: string;
  expressionAttributeValues: Record<string, unknown>;
  expressionAttributeNames?: Record<string, string>;
}) {
  const res = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: params.key,
      UpdateExpression: params.updateExpression,
      ExpressionAttributeValues: params.expressionAttributeValues,
      ExpressionAttributeNames: params.expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    }),
  );
  return res.Attributes;
}

export async function deleteItem(key: { PK: string; SK: string }) {
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: key }));
}

// Query GSI3 for username lookups (vanity URLs)
export async function queryGSI3(GSI3PK: string, beginsWith?: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: beginsWith ? 'GSI3PK = :g3pk AND begins_with(GSI3SK, :g3sk)' : 'GSI3PK = :g3pk',
      ExpressionAttributeValues: beginsWith ? { ':g3pk': GSI3PK, ':g3sk': beginsWith } : { ':g3pk': GSI3PK },
    }),
  );
  return res.Items ?? [];
}

// Scan fallback for GSI3 if index doesn't exist yet
export async function scanByGSI3PK(GSI3PK: string) {
  const params: any = {
    TableName: TABLE_NAME,
    FilterExpression: 'GSI3PK = :g3pk',
    ExpressionAttributeValues: { ':g3pk': GSI3PK },
  };
  const res = await docClient.send(new ScanCommand(params));
  return res.Items ?? [];
}

