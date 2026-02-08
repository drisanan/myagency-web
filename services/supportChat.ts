/**
 * Support Chat Service
 *
 * Handles communication with the AI-powered support chatbot backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  navigationLinks?: NavigationLink[];
};

export type NavigationLink = {
  path: string;
  label: string;
  description?: string;
  step?: number;
};

export type ChatResponse = {
  ok: boolean;
  message?: { role: 'assistant'; content: string };
  navigationLinks?: NavigationLink[];
  error?: string;
};

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<ChatResponse> {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not configured');
  }

  const res = await fetch(`${API_BASE_URL}/support-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Support chat failed: ${res.status} ${text}`);
  }

  return res.json();
}
