/**
 * Support Chat API Handler
 *
 * AI-powered support chatbot backed by OpenAI GPT-4o.
 * Provides context-aware help with navigation links, feature guidance,
 * and troubleshooting for all user roles (agency, agent, client).
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

const OPENAI_BASE = 'https://api.openai.com';
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const MODEL = 'gpt-4o';

// ─── Tool Definitions ───────────────────────────────────────────────

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'navigate_to_page',
      description:
        'Generate a clickable navigation link to help the user reach a specific page in the app. Use this whenever the user asks how to do something or where to find a feature.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The app route path, e.g. "/clients", "/reports", "/settings"',
          },
          label: {
            type: 'string',
            description: 'Human-readable label for the link, e.g. "Go to Athletes page"',
          },
          description: {
            type: 'string',
            description: 'Brief explanation of what the user will find on this page',
          },
        },
        required: ['path', 'label'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_help_topics',
      description:
        'Search the app knowledge base to find help articles, how-to guides, and troubleshooting steps for a specific topic.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query describing what the user needs help with',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_feature_guide',
      description:
        'Get a detailed step-by-step guide for using a specific app feature. Use when the user needs a walkthrough.',
      parameters: {
        type: 'object',
        properties: {
          feature: {
            type: 'string',
            enum: [
              'create_athlete',
              'send_email_campaign',
              'build_coach_list',
              'assign_tasks',
              'view_reports',
              'email_drips',
              'recruiter_wizard',
              'manage_agents',
              'client_portal',
              'impersonation',
              'settings',
              'ai_prompts',
              'profile_views',
              'meetings',
              'gmail_connect',
            ],
            description: 'The feature to get a guide for',
          },
        },
        required: ['feature'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'suggest_multiple_links',
      description:
        'When the user needs to visit multiple related pages or has a multi-step workflow, provide several navigation links at once.',
      parameters: {
        type: 'object',
        properties: {
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                label: { type: 'string' },
                step: { type: 'number', description: 'Step number in the workflow (1-based)' },
              },
              required: ['path', 'label'],
            },
            description: 'Array of navigation links with optional step ordering',
          },
          workflow_description: {
            type: 'string',
            description: 'Brief description of the overall workflow',
          },
        },
        required: ['links'],
      },
    },
  },
];

// ─── Knowledge Base (in-memory for tool responses) ──────────────────

const APP_PAGES: Record<string, { path: string; description: string; roles: string[] }> = {
  dashboard: { path: '/dashboard', description: 'Main dashboard with KPI metrics, task overview, and quick actions', roles: ['agency', 'agent'] },
  athletes: { path: '/clients', description: 'Manage all athletes — view profiles, add new athletes, edit details', roles: ['agency', 'agent'] },
  new_athlete: { path: '/clients/new', description: 'Add a new athlete to your agency', roles: ['agency'] },
  lists: { path: '/lists', description: 'Build and manage coach contact lists for recruiting outreach', roles: ['agency', 'agent'] },
  tasks: { path: '/tasks', description: 'View and manage all tasks assigned to athletes and agents', roles: ['agency', 'agent'] },
  reports: { path: '/reports', description: 'Analytics dashboard with KPIs, email metrics, profile views, and athlete leaderboard', roles: ['agency'] },
  email_drips: { path: '/email-drips', description: 'Create and manage automated email drip campaigns', roles: ['agency', 'agent'] },
  recruiter: { path: '/recruiter', description: 'Recruiter wizard — search universities, find coaches, send outreach emails', roles: ['agency', 'agent'] },
  agents: { path: '/agents', description: 'Manage agents who help run your agency', roles: ['agency'] },
  settings: { path: '/settings', description: 'Agency settings — branding, colors, logo, subscription management', roles: ['agency'] },
  ai_prompts: { path: '/ai/prompts', description: 'AI-powered introduction email generator for athletes', roles: ['agency', 'agent'] },
  improvements: { path: '/improvements', description: 'Submit feature suggestions and track improvement requests', roles: ['agency', 'agent'] },
  profile: { path: '/profile', description: 'Your user profile and account settings', roles: ['agency', 'agent', 'client'] },
  client_lists: { path: '/client/lists', description: 'Your interest lists and agency-assigned coach lists', roles: ['client'] },
  client_tasks: { path: '/client/tasks', description: 'Tasks assigned to you by your agency', roles: ['client'] },
  client_views: { path: '/client/views', description: 'See which coaches have viewed your profile', roles: ['client'] },
  client_recruiter: { path: '/client/recruiter', description: 'Browse universities and recruiter information', roles: ['client'] },
  client_meetings: { path: '/client/meetings', description: 'Schedule and manage meetings', roles: ['client'] },
  client_messages: { path: '/client/messages', description: 'Messages between you and your agency', roles: ['client'] },
  client_profile: { path: '/client/profile', description: 'Edit your athlete profile — photos, stats, highlights', roles: ['client'] },
};

const FEATURE_GUIDES: Record<string, string> = {
  create_athlete:
    '**How to Add a New Athlete:**\n1. Go to **Athletes** page\n2. Click the **"Add Athlete"** button (top-right)\n3. Fill in required fields: Name, Email, Sport, Phone\n4. Optionally set an access code for the athlete portal\n5. Click **Save**\n\nThe athlete will appear in your roster and can log into the client portal with their email + access code.',

  send_email_campaign:
    '**How to Send an Email Campaign:**\n1. Go to **Athletes** and select an athlete\n2. Navigate to their profile and click **"Send Campaign"**\n3. Select recipients from the coach list\n4. Compose your email with subject and body\n5. Choose to send immediately or schedule for later\n6. Click **Send**\n\nTrack opens and clicks in the **Reports** page.',

  build_coach_list:
    '**How to Build a Coach List:**\n1. Go to **Lists** page\n2. Select a Sport, Division, and State\n3. Click **"Load Universities"**\n4. Check the coaches you want to add\n5. Name your list and click **Save**\n6. Optionally assign the list to an athlete\n\nLists can be shared with athletes via the list assignment feature.',

  assign_tasks:
    '**How to Assign Tasks:**\n1. Go to **Tasks** page\n2. Click **"New Task"**\n3. Enter the task title, description, and due date\n4. Assign it to a specific athlete or agent\n5. Click **Create**\n\nAthletes will see their tasks in the Client Portal. Mark tasks as done when completed.',

  view_reports:
    '**How to Use Reports:**\n1. Go to **Reports** (agency owners only)\n2. View KPI summary cards at the top\n3. Scroll to see Email Activity and Profile Views charts\n4. Check the Athlete Leaderboard for engagement rankings\n5. Use the **"Email Report"** button to send report summaries to clients or agents',

  email_drips:
    '**How to Set Up Email Drips:**\n1. Go to **Email Drips** page\n2. Click **"Create Drip"**\n3. Set the trigger event (e.g., "on signup")\n4. Add email steps with day offsets and content\n5. Activate the drip\n\nNew athletes who match the trigger will automatically receive the email sequence.',

  recruiter_wizard:
    '**How to Use the Recruiter Wizard:**\n1. Go to **Recruiter** page\n2. Select Sport, Division, and State\n3. Browse universities and coaching staff\n4. Click on a coach to see their contact info\n5. Use the **email composer** to send personalized outreach\n6. Track responses in the campaign dashboard',

  manage_agents:
    '**How to Manage Agents:**\n1. Go to **Agents** page\n2. Click **"Add Agent"** to invite a new team member\n3. Set their permissions and access level\n4. Agents can manage athletes, lists, and tasks\n\nAgents log in via the **Agent Login** page.',

  client_portal:
    '**Client Portal Overview:**\nAthletes access the client portal with their email + access code.\n\n**Available features:**\n- **Lists** — View interest lists and agency-assigned coach lists\n- **Tasks** — See and complete assigned tasks\n- **Profile Views** — Track which coaches viewed their profile\n- **Recruiter** — Browse universities\n- **Meetings** — Schedule meetings\n- **Messages** — Communicate with the agency\n- **Profile** — Edit profile info and media',

  impersonation:
    '**How Impersonation Works:**\n1. Parents can "View As" their child\'s account\n2. A yellow banner shows when impersonating\n3. Click **"End"** or **"Stop Impersonating"** to return to your session\n4. All impersonation actions are logged for compliance\n\nImpersonation is read-only and does not allow making changes on behalf of the athlete.',

  settings:
    '**Agency Settings:**\n1. Go to **Settings** page\n2. **Branding** — Upload logo, set primary/secondary colors\n3. **Subscription** — View plan, manage billing\n4. Changes apply to the entire agency including the client portal\n\nWhite-label branding is applied to all pages.',

  ai_prompts:
    '**How to Use AI Prompts:**\n1. Go to **AI Prompts** page\n2. Select an athlete from the dropdown\n3. Choose or write a prompt template\n4. Click **Run** to generate an AI-powered introduction email\n5. Review, edit, and send the generated email\n\nTemplates are saved and reusable.',

  profile_views:
    '**Profile Views Tracking:**\nWhen coaches visit your athlete\'s public profile, the view is recorded.\n\n- **Athletes** see views in their Client Portal under **Profile Views**\n- **Agencies** see aggregate views in **Reports**\n- Weekly digest emails summarize new views',

  meetings:
    '**Meetings Feature:**\n1. Go to **Meetings** page\n2. Click **"Schedule Meeting"**\n3. Select date, time, and attendees\n4. Meetings sync with Google Calendar if connected\n5. Both agency and athlete can view upcoming meetings',

  gmail_connect:
    '**How to Connect Gmail:**\n1. Go to **Settings** page\n2. Click **"Connect Gmail"** in the integrations section\n3. Authorize with your Google account\n4. Once connected, you can send emails directly from the app\n\nGmail is used for campaigns, recruiter outreach, and drip emails.',
};

function handleToolCall(name: string, args: any, userRole: string): string {
  switch (name) {
    case 'navigate_to_page': {
      const page = Object.values(APP_PAGES).find((p) => p.path === args.path);
      const desc = args.description || page?.description || '';
      return JSON.stringify({
        type: 'navigation',
        path: args.path,
        label: args.label,
        description: desc,
      });
    }

    case 'search_help_topics': {
      const query = (args.query || '').toLowerCase();
      const matches = Object.entries(APP_PAGES)
        .filter(
          ([key, val]) =>
            key.includes(query) ||
            val.description.toLowerCase().includes(query) ||
            val.path.toLowerCase().includes(query),
        )
        .filter(([, val]) => val.roles.includes(userRole))
        .slice(0, 5)
        .map(([, val]) => ({ path: val.path, description: val.description }));

      const guideMatches = Object.entries(FEATURE_GUIDES)
        .filter(([key]) => key.includes(query) || query.split(' ').some((w: string) => key.includes(w)))
        .slice(0, 3)
        .map(([key, guide]) => ({ feature: key, excerpt: guide.slice(0, 200) + '...' }));

      return JSON.stringify({ pages: matches, guides: guideMatches });
    }

    case 'get_feature_guide': {
      const guide = FEATURE_GUIDES[args.feature];
      return guide || 'No guide found for this feature. Please ask your question and I will help.';
    }

    case 'suggest_multiple_links': {
      return JSON.stringify({
        type: 'multi_navigation',
        workflow: args.workflow_description || '',
        links: (args.links || []).map((l: any) => ({
          path: l.path,
          label: l.label,
          step: l.step,
        })),
      });
    }

    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}

// ─── System Prompt ──────────────────────────────────────────────────

function buildSystemPrompt(role: string, email: string): string {
  return `You are the **My Recruiter Agency** support assistant. You help users navigate the platform, troubleshoot issues, and learn how to use features effectively.

## About the Platform
My Recruiter Agency is a multi-tenant recruiting management platform that helps sports agencies manage their athletes, build coach lists, send recruiting emails, and track engagement. It has three user roles:

- **Agency Owner** — Full access: manage athletes, agents, lists, tasks, campaigns, reports, settings, AI prompts, email drips, recruiter wizard
- **Agent** — Manages athletes, lists, tasks, campaigns, recruiter, AI prompts on behalf of the agency
- **Client (Athlete)** — Access to their own portal: lists, tasks, profile views, recruiter, meetings, messages, profile

## Current User Context
- **Role:** ${role}
- **Email:** ${email}

## Key App Pages
${Object.entries(APP_PAGES)
  .filter(([, v]) => v.roles.includes(role))
  .map(([key, v]) => `- **${key}** → \`${v.path}\` — ${v.description}`)
  .join('\n')}

## Your Capabilities
1. **Navigate users** — Use the \`navigate_to_page\` tool to generate clickable links to app pages
2. **Multi-step workflows** — Use \`suggest_multiple_links\` when a task requires visiting multiple pages
3. **Feature guides** — Use \`get_feature_guide\` to provide step-by-step walkthroughs
4. **Search help** — Use \`search_help_topics\` to find relevant pages and guides

## Response Guidelines
- Be concise, friendly, and professional
- Always provide **clickable navigation links** when directing users to pages (use the tools!)
- Use **markdown formatting** for readability (bold, lists, headers)
- For multi-step tasks, number the steps clearly
- If the user has a role that doesn't have access to a feature, explain the restriction
- If you're unsure about something, say so honestly and suggest contacting their agency admin
- Keep responses focused and actionable — don't over-explain
- When providing navigation links, prefer tool calls so the UI can render proper clickable buttons`;
}

// ─── Main Handler ───────────────────────────────────────────────────

const supportChatHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'POST') return response(405, { ok: false, error: 'Method not allowed' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  if (!OPENAI_KEY) {
    return response(500, { ok: false, error: 'AI support is not configured' }, origin);
  }

  if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);

  let parsed: any;
  try {
    parsed = JSON.parse(event.body);
  } catch {
    return response(400, { ok: false, error: 'Invalid JSON body' }, origin);
  }

  const { messages: clientMessages } = parsed;
  if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
    return response(400, { ok: false, error: 'messages array is required' }, origin);
  }

  // Guard against oversized payloads
  if (clientMessages.length > 50) {
    return response(400, { ok: false, error: 'Too many messages (max 50)' }, origin);
  }

  // Validate each message has the required shape
  for (const m of clientMessages) {
    if (!m || typeof m.content !== 'string' || !m.content.trim()) {
      return response(400, { ok: false, error: 'Each message must have a non-empty content string' }, origin);
    }
    if (m.content.length > 4000) {
      return response(400, { ok: false, error: 'Message content exceeds 4000 character limit' }, origin);
    }
  }

  const userRole = session.role || 'agency';
  const userEmail = session.agencyEmail || session.agentEmail || (session as any).email || '';

  // Build conversation with system prompt
  const conversation: any[] = [
    { role: 'system', content: buildSystemPrompt(userRole, userEmail) },
    ...clientMessages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 4000),
    })),
  ];

  try {
    // Initial call to OpenAI with tools
    let aiResponse = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversation,
        tools,
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('[support-chat] OpenAI error:', errText);
      return response(502, { ok: false, error: 'AI service unavailable' }, origin);
    }

    let data = await aiResponse.json();
    let choice = data.choices?.[0];
    let assistantMessage = choice?.message;

    // Handle tool calls (may require multiple rounds)
    let rounds = 0;
    while (assistantMessage?.tool_calls && rounds < 5) {
      rounds++;
      conversation.push(assistantMessage);

      // Execute all tool calls
      for (const tc of assistantMessage.tool_calls) {
        let args: any = {};
        try {
          args = JSON.parse(tc.function.arguments || '{}');
        } catch (parseErr) {
          console.warn('[support-chat] Failed to parse tool arguments:', tc.function.name, parseErr);
        }
        const result = handleToolCall(tc.function.name, args, userRole);
        conversation.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        });
      }

      // Send tool results back to OpenAI
      aiResponse = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: conversation,
          tools,
          tool_choice: 'auto',
          temperature: 0.4,
          max_tokens: 1500,
        }),
      });

      if (!aiResponse.ok) {
        console.warn('[support-chat] OpenAI tool-round error, stopping tool loop');
        break;
      }

      data = await aiResponse.json();
      choice = data.choices?.[0];
      assistantMessage = choice?.message;
    }

    // Extract tool call results for the frontend to render as navigation links
    const navigationLinks: Array<{ path: string; label: string; description?: string; step?: number }> = [];
    if (assistantMessage?.tool_calls) {
      // If we still have pending tool calls after 5 rounds, execute them
      for (const tc of assistantMessage.tool_calls) {
        try {
          const args = JSON.parse(tc.function.arguments || '{}');
          const result = JSON.parse(handleToolCall(tc.function.name, args, userRole));
          if (result.type === 'navigation') {
            navigationLinks.push({ path: result.path, label: result.label, description: result.description });
          } else if (result.type === 'multi_navigation') {
            navigationLinks.push(...(result.links || []));
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Also scan the conversation for tool results that contain navigation
    for (const msg of conversation) {
      if (msg.role === 'tool') {
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed.type === 'navigation') {
            navigationLinks.push({ path: parsed.path, label: parsed.label, description: parsed.description });
          } else if (parsed.type === 'multi_navigation') {
            navigationLinks.push(...(parsed.links || []));
          }
        } catch {
          // Not JSON or not navigation
        }
      }
    }

    // Deduplicate links
    const seen = new Set<string>();
    const uniqueLinks = navigationLinks.filter((l) => {
      if (seen.has(l.path)) return false;
      seen.add(l.path);
      return true;
    });

    return response(200, {
      ok: true,
      message: {
        role: 'assistant',
        content: assistantMessage?.content || 'I apologize, I was unable to generate a response. Please try again.',
      },
      navigationLinks: uniqueLinks,
      usage: data.usage,
    }, origin);
  } catch (e: any) {
    console.error('[support-chat] Error:', e);
    return response(500, { ok: false, error: 'Failed to process support request' }, origin);
  }
};

export const handler = withSentry(supportChatHandler);
