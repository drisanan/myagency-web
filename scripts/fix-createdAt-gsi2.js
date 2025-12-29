/**
 * One-time fix: coerce createdAt to numbers for list items that participate in GSI2ClientLists.
 *
 * Requirements:
 * - Set AWS credentials (env or profile via AWS_PROFILE).
 * - Ensure TABLE_NAME is set (defaults to 'agency-narrative-crm').
 *
 * Usage:
 *   AWS_PROFILE=myagency AWS_REGION=us-west-1 TABLE_NAME=agency-narrative-crm node scripts/fix-createdAt-gsi2.js
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';
const REGION = process.env.AWS_REGION || 'us-west-1';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true },
});

async function fix() {
  console.log(`Scanning table ${TABLE_NAME} for items with string createdAt...`);
  let lastKey;
  let updated = 0;
  let checked = 0;

  do {
    const res = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastKey,
        // No FilterExpression: we scan all items to catch any string createdAt
      })
    );

    for (const item of res.Items || []) {
      checked++;
      const ca = item.createdAt;
      if (typeof ca === 'number') continue;
      if (typeof ca === 'string') {
        const num = Number(ca) || Date.parse(ca) || Date.now();
        item.createdAt = num;
        item.updatedAt = num;
        await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
        updated++;
      }
    }

    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  console.log(`Checked ${checked} items, updated ${updated} items.`);
}

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});

