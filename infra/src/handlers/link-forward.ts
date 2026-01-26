import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { putItem, updateItem } from '../lib/dynamo';
import { EmailClickRecord } from '../lib/models';
import { withSentry } from '../lib/sentry';

/**
 * Decode a potentially multi-encoded URL parameter
 */
function decodeParam(value: string | undefined): string {
  if (!value) return '';
  let decoded = value;
  let attempts = 0;
  while (decoded.includes('%') && attempts < 5) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      attempts++;
    } catch {
      break;
    }
  }
  return decoded;
}

/**
 * Detect link type from URL
 */
function detectLinkType(url: string): EmailClickRecord['linkType'] {
  const lower = url.toLowerCase();
  if (lower.includes('hudl.com')) return 'hudl';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('/athlete/') || lower.includes('myrecruiteragency.com')) return 'profile';
  if (lower.includes('article') || lower.includes('news')) return 'article';
  return 'other';
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Increment monthly click stats (non-blocking)
 */
async function incrementClickStats(agencyId: string, clientId: string) {
  const month = getCurrentMonth();
  const statsKey = {
    PK: `AGENCY#${agencyId}`,
    SK: `EMAIL_STATS#${clientId}#${month}`,
  };

  try {
    await updateItem({
      key: statsKey,
      updateExpression: 'SET clickCount = if_not_exists(clickCount, :zero) + :one, clientId = :clientId, period = :period, updatedAt = :now',
      expressionAttributeValues: {
        ':zero': 0,
        ':one': 1,
        ':clientId': clientId,
        ':period': month,
        ':now': Date.now(),
      },
    });
  } catch (err) {
    console.error('[link-forward] Stats update failed', err);
  }
}

const linkForwardHandler = async (event: APIGatewayProxyEventV2) => {
  const startTime = Date.now();
  const params = event.queryStringParameters || {};
  const headers = event.headers || {};

  // Extract and decode parameters
  // Short params: d=destination, g=agencyId, c=clientId, a=athleteEmail, r=recipientEmail, u=university, p=campaignId
  // Long params supported for backwards compatibility
  const destination = decodeParam(params.d || params.destination);
  const agencyId = decodeParam(params.g || params.agency);
  const clientId = decodeParam(params.c || params.client);
  const athleteEmail = decodeParam(params.a || params.athlete);
  const recipientEmail = decodeParam(params.r || params.recipient);
  const university = decodeParam(params.u || params.university);
  const campaignId = decodeParam(params.p || params.campaignId);

  console.log('[link-forward] Request', {
    destination: destination?.substring(0, 100),
    agencyId,
    clientId,
    recipientEmail,
    university,
  });

  // Validate required parameter
  if (!destination) {
    console.warn('[link-forward] Missing destination');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing destination parameter' }),
    };
  }

  // Build final destination URL
  let finalDestination = destination;
  
  // Ensure protocol
  if (!finalDestination.startsWith('http://') && !finalDestination.startsWith('https://')) {
    finalDestination = `https://${finalDestination}`;
  }

  // Record click if we have agency context (non-blocking - don't wait)
  if (agencyId && clientId) {
    const now = Date.now();
    const clickId = randomUUID();
    
    const clickRecord: EmailClickRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `EMAIL_CLICK#${now}#${clickId}`,
      GSI3PK: `CLIENT#${clientId}`,
      GSI3SK: `EMAIL_CLICK#${now}`,
      clientId,
      clientEmail: athleteEmail,
      recipientEmail: recipientEmail || 'unknown',
      destination: finalDestination,
      linkType: detectLinkType(finalDestination),
      university: university || undefined,
      campaignId: campaignId || undefined,
      clickedAt: now,
      userAgent: headers['user-agent'] || undefined,
      ipAddress: headers['x-forwarded-for']?.split(',')[0]?.trim() || undefined,
      createdAt: now,
    };

    // Fire and forget - don't block redirect
    Promise.all([
      putItem(clickRecord).catch(err => console.error('[link-forward] Click save failed', err)),
      incrementClickStats(agencyId, clientId).catch(err => console.error('[link-forward] Stats update failed', err)),
    ]);

    console.log('[link-forward] Click recorded', {
      clickId,
      agencyId,
      clientId,
      linkType: clickRecord.linkType,
      duration: Date.now() - startTime,
    });
  }

  // Redirect to final destination
  return {
    statusCode: 302,
    headers: {
      Location: finalDestination,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    body: '',
  };
};

export const handler = withSentry(linkForwardHandler);
