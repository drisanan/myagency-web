import { randomUUID } from 'crypto';
import { putItem, updateItem, queryByPK } from './dynamo';
import { EmailSendRecord, EmailOpenRecord, EmailClickRecord } from './models';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function recordEmailSendsInternal(input: {
  agencyId: string;
  clientId: string;
  clientEmail: string;
  recipients: Array<{ email: string; name?: string; university?: string }>;
  subject?: string;
  draftId?: string;
  campaignId?: string;
  sentAt?: number;
}) {
  const now = input.sentAt ?? Date.now();
  const month = getCurrentMonth();
  const saved: EmailSendRecord[] = [];

  for (const recipient of input.recipients) {
    const sendId = randomUUID();
    const record: EmailSendRecord = {
      PK: `AGENCY#${input.agencyId}`,
      SK: `EMAIL_SEND#${now}#${sendId}`,
      GSI3PK: `CLIENT#${input.clientId}`,
      GSI3SK: `EMAIL_SEND#${now}`,
      clientId: input.clientId,
      clientEmail: input.clientEmail || '',
      recipientEmail: recipient.email,
      recipientName: recipient.name || '',
      university: recipient.university || '',
      subject: input.subject || '',
      draftId: input.draftId || '',
      campaignId: input.campaignId,
      sentAt: now,
      createdAt: now,
    };
    await putItem(record);
    saved.push(record);
  }

  try {
    await updateItem({
      key: { PK: `AGENCY#${input.agencyId}`, SK: `EMAIL_STATS#${input.clientId}#${month}` },
      updateExpression: `
        SET sentCount = if_not_exists(sentCount, :zero) + :count,
            clientId = :clientId,
            period = :period,
            updatedAt = :now
      `,
      expressionAttributeValues: {
        ':zero': 0,
        ':count': input.recipients.length,
        ':clientId': input.clientId,
        ':period': month,
        ':now': now,
      },
    });
  } catch (err) {
    console.error('[email-metrics] Stats update failed', err);
  }

  return { saved, month };
}

export async function recordEmailOpenInternal(input: {
  agencyId: string;
  clientId: string;
  clientEmail: string;
  recipientEmail: string;
  university?: string;
  campaignId?: string;
  userAgent?: string;
  ipAddress?: string;
  openedAt?: number;
}) {
  const now = input.openedAt ?? Date.now();
  const openId = randomUUID();
  const record: EmailOpenRecord = {
    PK: `AGENCY#${input.agencyId}`,
    SK: `EMAIL_OPEN#${now}#${openId}`,
    GSI3PK: `CLIENT#${input.clientId}`,
    GSI3SK: `EMAIL_OPEN#${now}`,
    clientId: input.clientId,
    clientEmail: input.clientEmail || '',
    recipientEmail: input.recipientEmail,
    university: input.university,
    campaignId: input.campaignId,
    openedAt: now,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
    createdAt: now,
  };
  await putItem(record);
  return record;
}

export async function listCampaignEmailStats(input: {
  agencyId: string;
  clientId: string;
  campaignId: string;
}) {
  const sends = await queryByPK(`AGENCY#${input.agencyId}`, 'EMAIL_SEND#') as EmailSendRecord[];
  const opens = await queryByPK(`AGENCY#${input.agencyId}`, 'EMAIL_OPEN#') as EmailOpenRecord[];
  const clicks = await queryByPK(`AGENCY#${input.agencyId}`, 'EMAIL_CLICK#') as EmailClickRecord[];

  const campaignSends = sends.filter((s) => s.clientId === input.clientId && s.campaignId === input.campaignId);
  const campaignOpens = opens.filter((o) => o.clientId === input.clientId && o.campaignId === input.campaignId);
  const campaignClicks = clicks.filter((c) => c.clientId === input.clientId && c.campaignId === input.campaignId);

  return {
    sentCount: campaignSends.length,
    openCount: campaignOpens.length,
    clickCount: campaignClicks.length,
  };
}
