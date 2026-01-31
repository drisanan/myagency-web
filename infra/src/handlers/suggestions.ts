import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { SuggestionRecord, SuggestionStatus } from '../lib/models';
import { getItem, putItem, scanTable } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const OPENAI_BASE = 'https://api.openai.com';
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const MODEL = 'gpt-4o-mini';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@myrecruiteragency.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.myrecruiteragency.com';

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-west-1' });

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getSuggestionId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

function validateStatus(status: any): status is SuggestionStatus {
  return status === 'pending' || status === 'resolved' || status === 'denied';
}

/**
 * Call OpenAI to generate structured requirements from a suggestion
 */
async function generateRequirements(suggestion: {
  screenPath: string;
  areaSelector: string;
  areaContext: string;
  originalSuggestion: string;
}): Promise<string> {
  if (!OPENAI_KEY) {
    console.warn('[suggestions] OpenAI key not configured, returning raw suggestion');
    return suggestion.originalSuggestion;
  }

  const systemPrompt = `You are a technical requirements analyst. Your job is to convert user feedback and suggestions into clear, actionable technical requirements that a developer can implement.

For each suggestion, provide:
1. **Summary**: A one-line summary of the improvement
2. **User Story**: As a [user type], I want [goal] so that [benefit]
3. **Acceptance Criteria**: Bullet points of what "done" looks like
4. **Technical Notes**: Any implementation hints based on the context
5. **Affected Area**: Which component/screen needs modification
6. **Priority**: Suggested priority (Low/Medium/High) based on user impact

Format the output in clean markdown that's easy to read and copy.`;

  const userPrompt = `Please analyze this user suggestion and create structured requirements:

**Screen/Page**: ${suggestion.screenPath}
**Area Clicked**: ${suggestion.areaSelector}
**Context**: ${suggestion.areaContext}
**User's Suggestion**: ${suggestion.originalSuggestion}

Generate the requirements document.`;

  try {
    const res = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('[suggestions] OpenAI error', { status: res.status, body: text });
      return suggestion.originalSuggestion;
    }

    const json = JSON.parse(text);
    return json?.choices?.[0]?.message?.content || suggestion.originalSuggestion;
  } catch (err) {
    console.error('[suggestions] Failed to generate requirements', err);
    return suggestion.originalSuggestion;
  }
}

/**
 * Send email notification when suggestion status changes
 */
async function sendStatusNotification(
  suggestion: SuggestionRecord,
  newStatus: SuggestionStatus,
  resolutionNotes?: string
): Promise<void> {
  if (!suggestion.submittedByEmail) {
    console.warn('[suggestions] No email to notify');
    return;
  }

  const isResolved = newStatus === 'resolved';
  const subject = isResolved
    ? '✅ Your suggestion has been implemented!'
    : '📋 Update on your suggestion';

  const statusText = isResolved ? 'resolved and implemented' : 'reviewed';
  const notesSection = resolutionNotes
    ? `\n\n**${isResolved ? 'What was done' : 'Notes'}:**\n${resolutionNotes}`
    : '';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${isResolved ? '#10b981' : '#6366f1'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .suggestion-box { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid ${isResolved ? '#10b981' : '#6366f1'}; margin: 15px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${isResolved ? '🎉 Suggestion Implemented' : '📋 Suggestion Update'}</h2>
    </div>
    <div class="content">
      <p>Hi ${suggestion.submittedByName || 'there'},</p>
      <p>Your suggestion has been ${statusText}!</p>
      
      <div class="suggestion-box">
        <strong>Your original suggestion:</strong><br>
        ${suggestion.originalSuggestion}
      </div>
      
      <p><strong>Screen:</strong> ${suggestion.screenPath}</p>
      ${notesSection ? `<div class="suggestion-box">${notesSection.replace(/\n/g, '<br>')}</div>` : ''}
      
      <p>Thank you for helping us improve the platform!</p>
    </div>
    <div class="footer">
      <p>My Recruiter Agency</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Hi ${suggestion.submittedByName || 'there'},

Your suggestion has been ${statusText}!

Your original suggestion:
${suggestion.originalSuggestion}

Screen: ${suggestion.screenPath}
${notesSection}

Thank you for helping us improve the platform!

- My Recruiter Agency`;

  try {
    await ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [suggestion.submittedByEmail],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody },
        },
      },
    }));
    console.info('[suggestions] Notification sent to', suggestion.submittedByEmail);
  } catch (err) {
    console.error('[suggestions] Failed to send notification', err);
    // Don't throw - notification failure shouldn't block the operation
  }
}

const suggestionsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || '';
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const suggestionId = getSuggestionId(event);

  // GET - List all suggestions or get one
  if (method === 'GET') {
    if (suggestionId) {
      const item = await getItem({ PK: `SUGGESTION#${suggestionId}`, SK: 'META' });
      return response(200, { ok: true, suggestion: item ?? null }, origin);
    }
    
    // Scan all suggestions (in production, use GSI for better performance)
    const items = await scanTable({
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: { ':pk': 'SUGGESTION#' },
    });
    
    // Sort by createdAt descending
    const sorted = (items || []).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    return response(200, { ok: true, suggestions: sorted }, origin);
  }

  // POST - Create new suggestion
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.originalSuggestion?.trim()) {
      return badRequest(origin, 'originalSuggestion is required');
    }
    if (!payload.screenPath) {
      return badRequest(origin, 'screenPath is required');
    }

    const id = newId('suggestion');
    const now = Date.now();

    // Generate AI requirements
    const requirements = await generateRequirements({
      screenPath: payload.screenPath,
      areaSelector: payload.areaSelector || 'unknown',
      areaContext: payload.areaContext || '',
      originalSuggestion: payload.originalSuggestion,
    });

    const rec: SuggestionRecord = {
      PK: `SUGGESTION#${id}`,
      SK: 'META',
      GSI1PK: 'STATUS#pending',
      GSI1SK: `SUGGESTION#${now}`,
      GSI2PK: `USER#${session.email || session.agencyEmail}`,
      GSI2SK: `SUGGESTION#${now}`,
      id,
      submittedByEmail: session.email || session.agencyEmail || '',
      submittedByName: [session.firstName, session.lastName].filter(Boolean).join(' ') || 'Unknown User',
      agencyId: session.agencyId,
      screenPath: payload.screenPath,
      areaSelector: payload.areaSelector || 'unknown',
      areaContext: payload.areaContext || '',
      originalSuggestion: payload.originalSuggestion,
      requirements,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await putItem(rec);
    console.info('[suggestions] Created suggestion', { id, submittedBy: rec.submittedByEmail });
    
    return response(200, { ok: true, suggestion: rec }, origin);
  }

  // PUT/PATCH - Update suggestion (mainly for status changes)
  if (method === 'PUT' || method === 'PATCH') {
    if (!suggestionId) return badRequest(origin, 'Missing suggestion id');
    if (!event.body) return badRequest(origin, 'Missing body');
    
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `SUGGESTION#${suggestionId}`, SK: 'META' }) as SuggestionRecord | undefined;
    
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);

    // Check if status is changing to resolved/denied
    const oldStatus = existing.status;
    const newStatus = payload.status;
    const statusChanging = newStatus && validateStatus(newStatus) && newStatus !== oldStatus && (newStatus === 'resolved' || newStatus === 'denied');

    const now = Date.now();
    const merged: SuggestionRecord = {
      ...existing,
      ...payload,
      // Update GSI1 if status changed
      ...(newStatus && validateStatus(newStatus) ? {
        GSI1PK: `STATUS#${newStatus}`,
        GSI1SK: `SUGGESTION#${existing.createdAt}`,
      } : {}),
      // Track who resolved
      ...(statusChanging ? {
        resolvedBy: session.email || session.agencyEmail,
      } : {}),
      updatedAt: now,
    };

    await putItem(merged);

    // Send notification if status changed to resolved/denied
    if (statusChanging) {
      await sendStatusNotification(merged, newStatus, payload.resolutionNotes);
    }

    return response(200, { ok: true, suggestion: merged }, origin);
  }

  // DELETE - Remove suggestion
  if (method === 'DELETE') {
    if (!suggestionId) return badRequest(origin, 'Missing suggestion id');
    
    const existing = await getItem({ PK: `SUGGESTION#${suggestionId}`, SK: 'META' });
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);

    // Soft delete by marking deletedAt
    await putItem({
      ...existing,
      deletedAt: new Date().toISOString(),
    });

    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(suggestionsHandler);
