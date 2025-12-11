'use client';

const INTRO_URL = '/api/ai/intro';

type IntroBody = {
  sport: string;
  collegeName: string;
  coachMessage: string;
  tone: string;
  qualities: string[];
  additionalInsights?: string;
};

export async function generateIntro(body: IntroBody): Promise<string> {
  const res = await fetch(INTRO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
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

export async function generateContentDraft(_body: unknown): Promise<string> {
  // Placeholder: will implement once the content endpoint is provided
  return '';
}


