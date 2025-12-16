import { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../handlers/common';

const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';

export async function putItem(item: Record<string, unknown>) {
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

