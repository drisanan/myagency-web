import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { requireSession } from './common';
import { newId } from '../lib/ids';
import { putItem, queryByPK, getItem, deleteItem, updateItem } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';

// NOTE: In Node 18+ on AWS Lambda, 'fetch' is global. 
// If you are on Node 16 or older, ensure 'node-fetch' is installed and uncomment the import.
// import fetch from 'node-fetch'; 

const OPENAI_BASE = 'https://api.openai.com';
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const MODEL = 'gpt-4o-mini';

/**
 * Shared helper to call OpenAI with a conversation
 */
async function callOpenAI(messages: any[], temperature = 0.7) {
  if (!OPENAI_KEY) throw new Error('OpenAI key not configured');

  const res = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('openai.error', { status: res.status, body: text });
    throw new Error(`OpenAI request failed (${res.status}): ${text || res.statusText}`);
  }
  
  try {
    const json = JSON.parse(text);
    return json?.choices?.[0]?.message?.content || '';
  } catch {
    return '';
  }
}

const promptsHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  // 1. Handle CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 2. Require Session for ALL routes in this handler
  const session = requireSession(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: 'Missing session' }, origin);
  }
  const sessionContext = session;
  const agencyEmail = sessionContext.agencyEmail || '';

  async function incrementMetrics(delta: { generated?: number; used?: number; deleted?: number }) {
    const key = { PK: `AGENCY#${sessionContext.agencyId}`, SK: 'PROMPT_METRICS' };
    const now = Date.now();
    const generated = delta.generated ?? 0;
    const used = delta.used ?? 0;
    const deleted = delta.deleted ?? 0;
    const res = await updateItem({
      key,
      updateExpression: [
        'SET generated = if_not_exists(generated, :zero) + :generated',
        'used = if_not_exists(used, :zero) + :used',
        'deleted = if_not_exists(deleted, :zero) + :deleted',
        'updatedAt = :now',
        'createdAt = if_not_exists(createdAt, :now)',
      ].join(', '),
      expressionAttributeValues: {
        ':zero': 0,
        ':generated': generated,
        ':used': used,
        ':deleted': deleted,
        ':now': now,
      },
    });
    return res;
  }


  const DEFAULT_EMAIL_RULES = [
    'Never include a greeting or salutation — the system adds "Hello Coach {{coach_last_name}}," automatically.',
    'Never include a closing or sign-off (no "Best regards", "Sincerely", "Thank you", etc.).',
    'Always preserve {{template_tags}} exactly as-is (e.g. {{university_name}}, {{coach_last_name}}).',
    'Keep the introductory paragraph to 2-4 sentences and under 100 words.',
    'Write in first person as the athlete. Be genuine, confident, conversational — not robotic.',
    'Return plain text only — no HTML tags.',
  ];

  async function getEmailRules(): Promise<string[]> {
    try {
      const rec = await getItem({ PK: `AGENCY#${sessionContext.agencyId}`, SK: 'EMAIL_RULES' });
      if (rec?.rules && Array.isArray(rec.rules) && rec.rules.length > 0) return rec.rules as string[];
    } catch (e) {
      console.error('[prompts] Failed to fetch email rules', e);
    }
    return DEFAULT_EMAIL_RULES;
  }

  // =========================================================================
  // ROUTE: Get / Update Email Rules
  // GET /ai/rules  |  PUT /ai/rules
  // =========================================================================
  if (path.endsWith('/ai/rules')) {
    if (method === 'GET') {
      const rules = await getEmailRules();
      return response(200, { ok: true, rules }, origin);
    }
    if (method === 'PUT') {
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      const body = JSON.parse(event.body || '{}');
      if (!Array.isArray(body.rules)) return response(400, { ok: false, error: 'rules must be an array of strings' }, origin);
      const rules = body.rules.filter((r: any) => typeof r === 'string' && r.trim()).map((r: string) => r.trim());
      await putItem({ PK: `AGENCY#${sessionContext.agencyId}`, SK: 'EMAIL_RULES', rules, updatedAt: Date.now() });
      return response(200, { ok: true, rules }, origin);
    }
  }

  // =========================================================================
  // ROUTE: AI Generation (Used by "Run" button)
  // POST /ai/intro
  // =========================================================================
  if (method === 'POST' && path.endsWith('/ai/intro')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body || '{}');
    
    const { sport, collegeName, coachMessage, tone, qualities = [], additionalInsights } = body;

    const emailRules = await getEmailRules();
    const rulesBlock = emailRules.map((r, i) => `${i + 1}. ${r}`).join('\n');

    const systemMsg = `You are a college recruiting email writer. Write ONLY the introductory paragraph (2-4 sentences) for a high school athlete's email to a college coach.

RULES:
- Return PLAIN TEXT only. No HTML tags, no markdown, no formatting.
- Do NOT include any greeting or salutation (no "Hello", "Hey", "Hi", "Dear", "Coach X" — the system adds the greeting separately).
- Do NOT include any closing, sign-off, or signature (no "Best regards", "Sincerely", "Thank you", etc.).
- Do NOT use bracket placeholders like [Name] or [School] — use the actual names provided.
- If the college name or coach name is given as a {{template_tag}} (e.g. {{university_name}}, {{coach_last_name}}), preserve it EXACTLY as-is. Do NOT replace, rephrase, or remove these tags.
- Write in first person as the athlete.
- Be genuine, confident, and conversational — not robotic or overly formal.
- Keep it under 100 words.
- Start the paragraph directly with "I'm" or "My name is" or a similar first-person opening.

AGENCY-SPECIFIC RULES (follow these strictly):
${rulesBlock}

EXAMPLES:

Input: Sport: Football, Student: Drisan James, School: {{university_name}}
Good output: I'm Drisan James, a dedicated football player with a 3.8 GPA who thrives both on the field and in the classroom. I'd love the opportunity to contribute to the program at {{university_name}} and bring my work ethic and passion for the game to your team.

Input: Sport: Women's Soccer, Student: Maya Chen, School: {{university_name}}
Good output: My name is Maya Chen and I'm a committed soccer midfielder who has captained my varsity team for two seasons. I'm excited about the culture at {{university_name}} and believe my technical skill set and leadership would be a strong fit for your program.

BAD output (NEVER DO THIS): Hello Coach Smith, I'm Drisan James...
BAD output (NEVER DO THIS): I'm reaching out to express my interest... Best regards, Drisan
BAD output (NEVER DO THIS): <p>I'm a passionate athlete...</p>`;
    
    const userMsg = `Sport: ${sport || 'Not specified'}
Target College: ${collegeName || 'Not specified'}
Tone: ${tone || 'Professional yet personal'}
Key Qualities: ${qualities.join(', ')}
${coachMessage || 'Write an intro.'}
${additionalInsights || ''}
Return ONLY plain text — the introductory paragraph. No HTML, no greeting, no closing.`.trim();

    try {
      const intro = await callOpenAI([
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg }
      ], 0.4);
      await incrementMetrics({ generated: 1 });
      return response(200, { ok: true, intro }, origin);
    } catch (err: any) {
      console.error('AI Gen Error:', { message: err?.message, stack: err?.stack });
      const msg = err?.message || 'AI generation failed';
      const isConfig = msg.includes('not configured');
      return response(isConfig ? 503 : 502, {
        ok: false,
        error: isConfig ? 'AI service not configured' : 'AI generation failed. Please try again.',
      }, origin);
    }
  }

  // =========================================================================
  // ROUTE: AI Email Cleanup (Agent compose flow)
  // POST /ai/cleanup
  // =========================================================================
  if (method === 'POST' && path.endsWith('/ai/cleanup')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body || '{}');
    const { html } = body;
    if (!html) return response(400, { ok: false, error: 'html is required' }, origin);

    const cleanupRules = await getEmailRules();
    const cleanupRulesBlock = cleanupRules.map((r, i) => `${i + 1}. ${r}`).join('\n');

    const cleanupSystemMsg = `You are an expert email editor for college athletic recruiting. You receive a draft email written by a recruiting agent to college coaches on behalf of a high school athlete. Your job:

1. Clean up grammar, spelling, and sentence structure.
2. Make the tone professional yet personable — confident but not arrogant.
3. Replace any specific coach names with the EXACT dynamic tags below where appropriate:
   - {{coach_first_name}} for a coach's first name
   - {{coach_last_name}} for a coach's last name  
   - {{coach_full_name}} for the coach's full name
   - {{university_name}} for the university/college name
4. If the draft already uses these tags, preserve them exactly.
5. Keep the core message, facts, and links intact — do not invent information.
6. Return ONLY the cleaned-up HTML. No wrapping, no explanation, no markdown fences.

AGENCY-SPECIFIC RULES (follow these strictly):
${cleanupRulesBlock}`;

    const cleanupUserMsg = `Clean up this recruiting email draft. Return only the improved HTML:\n\n${html}`;

    try {
      const cleaned = await callOpenAI([
        { role: 'system', content: cleanupSystemMsg },
        { role: 'user', content: cleanupUserMsg },
      ]);
      return response(200, { ok: true, html: cleaned }, origin);
    } catch (err: any) {
      console.error('AI Cleanup Error:', { message: err?.message, stack: err?.stack });
      const msg = err?.message || 'AI cleanup failed';
      const isConfig = msg.includes('not configured');
      return response(isConfig ? 503 : 502, {
        ok: false,
        error: isConfig ? 'AI service not configured' : 'AI cleanup failed. Please try again.',
      }, origin);
    }
  }


  // =========================================================================
  // ROUTE: List Prompts
  // GET /prompts
  // =========================================================================
  if (method === 'GET' && path.endsWith('/prompts')) {
    // 1. Fetch all prompts for this agency
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'PROMPT#');
    
    // 2. Map raw Dynamo items to clean objects
    let prompts = (items || []).map((p: any) => ({
      id: p.id,
      agencyEmail: p.agencyEmail,
      clientId: p.clientId,
      name: p.name,
      text: p.text,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    // 3. Filter by clientId if requested (e.g. playground filtering for specific athlete)
    const filterClientId = event.queryStringParameters?.clientId;
    if (filterClientId) {
      prompts = prompts.filter((p: any) => p.clientId === filterClientId);
    }

    return response(200, { ok: true, prompts }, origin);
  }

  // =========================================================================
  // ROUTE: Metrics
  // GET /prompts/metrics
  // =========================================================================
  if (method === 'GET' && path.endsWith('/prompts/metrics')) {
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROMPT_METRICS' });
    return response(200, {
      ok: true,
      metrics: {
        generated: existing?.generated ?? 0,
        used: existing?.used ?? 0,
        deleted: existing?.deleted ?? 0,
        updatedAt: existing?.updatedAt ?? null,
      },
    }, origin);
  }


  // =========================================================================
  // ROUTE: Save/Create Prompt
  // POST /prompts
  // =========================================================================
  if (method === 'POST' && path.endsWith('/prompts')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body || '{}');
    let { name, text, clientId } = body;
    
    // Allow upsert if ID is provided, else new ID
    const id = body.id || newId('prompt');
    const now = Date.now();

    // Legacy Support: Generate text on save if 'generate=true' passed (Optional)
    if ((body.generate || !text)) {
       // ... existing logic if you still use "Generate on Save" ...
       // For now, we assume the UI uses /ai/intro to generate, then passes 'text' here to save.
    }

    if (!name || !text) {
      return response(400, { ok: false, error: 'name and text are required' }, origin);
    }

    const rec = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `PROMPT#${id}`,
      GSI1PK: `EMAIL#${agencyEmail}`,
      GSI1SK: `PROMPT#${id}`,
      id,
      agencyEmail,
      ...(clientId ? { clientId } : {}),
      name,
      text,
      createdAt: body.createdAt || now, // Preserve creation date on update
      updatedAt: now,
    };

    await putItem(rec);
    await incrementMetrics({ used: 1 });
    return response(200, { ok: true, prompt: rec }, origin);
  }


  // =========================================================================
  // ROUTE: Delete Prompt
  // DELETE /prompts/{id}
  // =========================================================================
  if (method === 'DELETE' && /\/prompts\/[^/]+$/.test(path)) {
    const id = path.split('/').pop(); // robust way to get ID from path
    if (!id) return response(400, { ok: false, error: 'Missing id' }, origin);
    
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `PROMPT#${id}` });
    if (existing) {
      await deleteItem({ PK: `AGENCY#${session.agencyId}`, SK: `PROMPT#${id}` });
      await incrementMetrics({ deleted: 1 });
    }
    return response(200, { ok: true }, origin);
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};

export const handler = withSentry(promptsHandler);