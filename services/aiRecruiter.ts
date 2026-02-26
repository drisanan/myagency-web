'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

type IntroBody = {
  sport: string;
  collegeName: string;
  coachMessage: string;
  tone: string;
  qualities: string[];
  additionalInsights?: string;
};

export async function generateIntro(body: IntroBody): Promise<string> {
  const base = requireApiBase();
  const url = `${base}/ai/intro`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // <--- Critical: Sends the session cookie
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  if (data?.error) {
    throw new Error(data.error);
  }
  
  return String(data.intro ?? '');
}

export async function cleanupEmail(html: string): Promise<string> {
  const base = requireApiBase();
  const url = `${base}/ai/cleanup`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ html }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  if (data?.error) {
    throw new Error(data.error);
  }

  return String(data.html ?? '');
}

export async function generateContentDraft(_body: unknown): Promise<string> {
  // Placeholder: will implement once the content endpoint is provided
  return '';
}