const STORAGE_KEY = 'mail_log_v1';

type MailEntry = { clientId: string; email: string; mailedAt: number };

function read(): MailEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MailEntry[]) : [];
  } catch {
    return [];
  }
}

function write(items: MailEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function hasMailed(clientId: string, email: string): boolean {
  const all = read();
  return all.some((e) => e.clientId === clientId && e.email === email);
}

export function markMailed(clientId: string, emails: string[]) {
  const now = Date.now();
  const all = read();
  const next = [...all];
  emails.forEach((e) => {
    const email = (e || '').trim();
    if (!email) return;
    if (!next.some((x) => x.clientId === clientId && x.email === email)) {
      next.push({ clientId, email, mailedAt: now });
    }
  });
  write(next);
}

export function getMailEntries() {
  return read();
}


