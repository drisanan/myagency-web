import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { requireSession } from './common';
import { newId } from '../lib/ids';
import { putItem, queryByPK, getItem, deleteItem } from '../lib/dynamo';

// NOTE: In Node 18+ on AWS Lambda, 'fetch' is global. 
// If you are on Node 16 or older, ensure 'node-fetch' is installed and uncomment the import.
// import fetch from 'node-fetch'; 

const OPENAI_BASE = 'https://api.openai.com';
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const MODEL = 'gpt-4o-mini';

/**
 * Shared helper to call OpenAI with a conversation
 */
async function callOpenAI(messages: any[]) {
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
      temperature: 0.7,
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

export const handler = async (event: APIGatewayProxyEventV2) => {
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
  const agencyEmail = (session as any).agencyEmail || '';


  // =========================================================================
  // ROUTE: AI Generation (Used by "Run" button)
  // POST /ai/intro
  // =========================================================================
  if (method === 'POST' && path.endsWith('/ai/intro')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body || '{}');
    
    // Destructure known fields from services/aiRecruiter.ts
    const { sport, collegeName, coachMessage, tone, qualities = [], additionalInsights } = body;

    // Construct the prompt messages
    const systemMsg = `You are an expert college recruiting assistant. Write a concise, effective intro email for a high school athlete contacting a college coach. Keep it under 150 words.`;
    
    const userMsg = `
      Context:
      - Sport: ${sport || 'Not specified'}
      - Target College: ${collegeName || 'Not specified'}
      - Tone: ${tone || 'Professional yet personal'}
      - Key Qualities to highlight: ${qualities.join(', ')}
      
      Instructions from User: ${coachMessage || 'Write an intro.'}
      
      Additional Data: ${additionalInsights || ''}
      
      Write the email body only. Do not include subject lines unless asked.
    `.trim();

    try {
      const intro = await callOpenAI([
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg }
      ]);
      return response(200, { ok: true, intro }, origin);
    } catch (err: any) {
      console.error('AI Gen Error:', err);
      return response(500, { ok: false, error: 'AI generation failed' }, origin);
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
      clientId: clientId || null,
      name,
      text,
      createdAt: body.createdAt || now, // Preserve creation date on update
      updatedAt: now,
    };

    await putItem(rec);
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
    }
    return response(200, { ok: true }, origin);
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};