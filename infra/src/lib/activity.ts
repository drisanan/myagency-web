import { putItem } from './dynamo';
import { newId } from './ids';
import { ActivityLogRecord, ActivityType } from './models';

type LogActivityInput = {
  agencyId: string;
  clientId?: string;
  agentId?: string;
  actorEmail: string;
  actorType: ActivityLogRecord['actorType'];
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(input: LogActivityInput) {
  const id = newId('act');
  const now = Date.now();
  const rec: ActivityLogRecord = {
    PK: `AGENCY#${input.agencyId}`,
    SK: `ACTIVITY#${now}#${id}`,
    GSI3PK: input.clientId ? `CLIENT#${input.clientId}` : undefined,
    GSI3SK: input.clientId ? `ACTIVITY#${now}` : undefined,
    id,
    agencyId: input.agencyId,
    clientId: input.clientId,
    agentId: input.agentId,
    actorEmail: input.actorEmail,
    actorType: input.actorType,
    activityType: input.activityType,
    description: input.description,
    metadata: input.metadata,
    createdAt: now,
  };

  await putItem(rec);
  return rec;
}
