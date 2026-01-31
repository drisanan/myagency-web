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

// Query GSI2 for agency slug lookups (friendly names)
export async function queryGSI2(GSI2PK: string, beginsWith?: string) {
  try {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: beginsWith ? 'GSI2PK = :g2pk AND begins_with(GSI2SK, :g2sk)' : 'GSI2PK = :g2pk',
        ExpressionAttributeValues: beginsWith ? { ':g2pk': GSI2PK, ':g2sk': beginsWith } : { ':g2pk': GSI2PK },
      }),
    );
    return res.Items ?? [];
  } catch (e: any) {
    // GSI2 may not exist yet, fallback to scan
    console.warn('[queryGSI2] Index query failed, falling back to scan:', e.message);
    return scanByGSI2PK(GSI2PK);
  }
}

// Scan fallback for GSI2 if index doesn't exist yet
export async function scanByGSI2PK(GSI2PK: string) {
  const params: any = {
    TableName: TABLE_NAME,
    FilterExpression: 'GSI2PK = :g2pk',
    ExpressionAttributeValues: { ':g2pk': GSI2PK },
  };
  const res = await docClient.send(new ScanCommand(params));
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

export async function scanBySKPrefix(prefix: string) {
  const params: any = {
    TableName: TABLE_NAME,
    FilterExpression: 'begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':sk': prefix },
  };
  const res = await docClient.send(new ScanCommand(params));
  return res.Items ?? [];
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

// Generic scan with custom filter expression
export async function scanTable(params: {
  FilterExpression: string;
  ExpressionAttributeValues: Record<string, unknown>;
  ExpressionAttributeNames?: Record<string, string>;
}) {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: params.FilterExpression,
    ExpressionAttributeValues: params.ExpressionAttributeValues,
    ExpressionAttributeNames: params.ExpressionAttributeNames,
  }));
  return res.Items ?? [];
}

