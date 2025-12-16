import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';
const client = new DynamoDBClient({ region: REGION });
const doc = DynamoDBDocumentClient.from(client);

const agencies = [
  { id: 'agency-001', name: 'Prime Sports', email: 'agency1@an.test', settings: { primaryColor: '#1976d2' } },
  { id: 'agency-002', name: 'NextGen', email: 'agency2@an.test', settings: { primaryColor: '#9c27b0' } },
  { id: 'agency-003', name: 'Elite Edge', email: 'agency3@an.test', settings: { primaryColor: '#2e7d32' } },
];

const clients = [
  { id: 'ag1-c1', email: 'seed@example.com', firstName: 'Seed', lastName: 'Client', sport: 'Football', agencyEmail: 'agency1@an.test', agencyId: 'agency-001' },
  { id: 'ag1-c2', email: 'a2@athletes.test', firstName: 'Ben', lastName: 'Jones', sport: 'Basketball', agencyEmail: 'agency1@an.test', agencyId: 'agency-001' },
];

const lists = [
  {
    id: 'list-1',
    agencyEmail: 'agency1@an.test',
    agencyId: 'agency-001',
    name: 'Selenium List',
    items: [
      { id: 'coach-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@u.test', title: 'HC', school: 'Test U', division: 'D1', state: 'CA' },
      { id: 'coach-2', firstName: 'Alan', lastName: 'Turing', email: 'alan@u.test', title: 'OC', school: 'Test U', division: 'D1', state: 'CA' },
    ],
  },
];

async function put(item) {
  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

async function seed() {
  for (const a of agencies) {
    await put({
      PK: `AGENCY#${a.id}`,
      SK: 'PROFILE',
      id: a.id,
      name: a.name,
      email: a.email,
      settings: a.settings,
      GSI1PK: `EMAIL#${a.email}`,
      GSI1SK: `AGENCY#${a.id}`,
    });
  }

  for (const c of clients) {
    const now = new Date().toISOString();
    await put({
      PK: `AGENCY#${c.agencyId}`,
      SK: `CLIENT#${c.id}`,
      GSI1PK: `EMAIL#${c.email}`,
      GSI1SK: `CLIENT#${c.id}`,
      id: c.id,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      sport: c.sport,
      agencyId: c.agencyId,
      agencyEmail: c.agencyEmail,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const l of lists) {
    const now = Date.now();
    await put({
      PK: `AGENCY#${l.agencyId}`,
      SK: `LIST#${l.id}`,
      id: l.id,
      name: l.name,
      items: l.items,
      agencyId: l.agencyId,
      agencyEmail: l.agencyEmail,
      createdAt: now,
      updatedAt: now,
    });
  }
}

seed()
  .then(() => {
    console.log('Seeded DynamoDB table', TABLE_NAME);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  });

