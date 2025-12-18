export type FormSubmissionData = {
  email: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  sport: string;
  division?: string;
  graduationYear?: string;
  profileImageUrl?: string;
  radar?: Record<string, number>;
};

export type FormSubmissionRecord = {
  id: string;
  PK: string;
  SK: string;
  createdAt: number;
  consumed: boolean;
  agencyEmail: string;
  data: FormSubmissionData;
};

export type AgencyPublicProfile = {
  name: string;
  email: string;
  settings: Record<string, any>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

// Standardized fetch wrapper ensuring credentials (cookies) are sent
async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  if (typeof fetch === 'undefined') {
    throw new Error('fetch is not available');
  }

  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    ...(init?.headers as any) 
  };

  const url = `${base}${path}`;
  const options: RequestInit = { 
    ...init, 
    headers, 
    credentials: 'include' // <--- Key for session persistence
  };

  console.log('[forms.apiFetch]', {
    url,
    method: options.method || 'GET',
    hasBody: Boolean(options.body),
    credentials: options.credentials,
  });

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Issues a new signed token for a public form.
 */
export async function issueFormToken(agencyEmail: string) {
  // POST /forms/issue
  const data = await apiFetch('/forms/issue', {
    method: 'POST',
    body: JSON.stringify({ agencyEmail }),
  });
  return data as { ok: boolean; token: string; url: string };
}

/**
 * Retrieves public agency details using a form token.
 */
export async function getFormAgency(token: string) {
  // GET /forms/agency?token=...
  const qs = new URLSearchParams({ token }).toString();
  const data = await apiFetch(`/forms/agency?${qs}`);
  return data?.agency as AgencyPublicProfile;
}

/**
 * Submits a new form entry.
 */
export async function submitForm(token: string, form: Partial<FormSubmissionData>) {
  // POST /forms/submit
  const data = await apiFetch('/forms/submit', {
    method: 'POST',
    body: JSON.stringify({ token, form }),
  });
  return data as { ok: boolean; id: string };
}

/**
 * Lists pending (unconsumed) form submissions for an agency.
 */
export async function listFormSubmissions(agencyEmail: string) {
  // GET /forms/submissions?agencyEmail=...
  const qs = new URLSearchParams({ agencyEmail }).toString();
  const data = await apiFetch(`/forms/submissions?${qs}`);
  return (data?.items as FormSubmissionRecord[]) ?? [];
}

/**
 * Marks specific form submissions as consumed (processed).
 */
export async function consumeFormSubmissions(agencyEmail: string, ids: string[]) {
  // POST /forms/consume
  await apiFetch('/forms/consume', {
    method: 'POST',
    body: JSON.stringify({ agencyEmail, ids }),
  });
  return { ok: true };
}