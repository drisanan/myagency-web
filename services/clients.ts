import { getAgencyById } from '@/services/agencies';

type Client = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
  agencyEmail: string;
  agencyId?: string;
  password?: string;
  radar?: any;
  gmailTokens?: any;
  gmailConnected?: boolean;
  createdAt?: string;
};

const STORAGE_KEY = 'clients_data';

const now = new Date();
const THIS_MONTH_ISO = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 5)).toISOString();
const LAST_MONTH_ISO = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 12)).toISOString();

const SEED_CLIENTS: Client[] = [
  { id: 'ag1-c1', email: 'a1@athletes.test', firstName: 'Ava', lastName: 'Smith', sport: 'Football', agencyEmail: 'agency1@an.test', createdAt: THIS_MONTH_ISO },
  { id: 'ag1-c2', email: 'a2@athletes.test', firstName: 'Ben', lastName: 'Jones', sport: 'Basketball', agencyEmail: 'agency1@an.test', createdAt: THIS_MONTH_ISO },
  { id: 'ag1-c3', email: 'a3@athletes.test', firstName: 'Chloe', lastName: 'Diaz', sport: 'Soccer', agencyEmail: 'agency1@an.test', createdAt: LAST_MONTH_ISO },
  { id: 'ag2-c1', email: 'b1@athletes.test', firstName: 'Cara', lastName: 'Lee', sport: 'Baseball', agencyEmail: 'agency2@an.test', createdAt: LAST_MONTH_ISO },
  { id: 'ag3-c1', email: 'c1@athletes.test', firstName: 'Dan', lastName: 'Kim', sport: 'Soccer', agencyEmail: 'agency3@an.test', createdAt: LAST_MONTH_ISO },
  { id: 'ag3-c2', email: 'c2@athletes.test', firstName: 'Eli', lastName: 'Moore', sport: 'Football', agencyEmail: 'agency3@an.test', createdAt: LAST_MONTH_ISO },
];

function readStore(): Client[] {
  if (typeof window === 'undefined') return [...SEED_CLIENTS];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...SEED_CLIENTS];
  try {
    const parsed = JSON.parse(raw) as Client[];
    return parsed.length ? parsed : [...SEED_CLIENTS];
  } catch {
    return [...SEED_CLIENTS];
  }
}

function writeStore(items: Client[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let CLIENTS: Client[] = readStore();

export async function listClientsByAgencyEmail(agencyEmail: string) {
  if (typeof window !== 'undefined') {
    CLIENTS = readStore();
  }
  return CLIENTS.filter(c => c.agencyEmail === agencyEmail);
}

export async function listClientsByAgency(agencyId: string) {
  const agency = await getAgencyById(agencyId);
  if (!agency) return [];
  return listClientsByAgencyEmail(agency.email);
}
export async function upsertClient(input: any) {
  const id = input.id ?? `c-${(Math.random() * 1e6).toFixed(0)}`;
  const idx = CLIENTS.findIndex(c => c.id === id);
  if (typeof window !== 'undefined') {
    // helpful for e2e debugging
    // eslint-disable-next-line no-console
    console.debug('[clients] upsertClient payload', input);
  }
  const createdAt = input.createdAt ?? CLIENTS[idx]?.createdAt ?? new Date().toISOString();
  const next: Client = { ...CLIENTS[idx] , ...input, id, createdAt };
  if (idx >= 0) {
    CLIENTS[idx] = next;
  } else {
    CLIENTS.push(next);
  }
  writeStore(CLIENTS);
  return next;
}
export async function getClient(id: string) {
  if (typeof window !== 'undefined') {
    CLIENTS = readStore();
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as Client[];
        const hit = list.find((c) => c.id === id);
        if (hit) {
          CLIENTS = list;
          return hit;
        }
      }
    } catch {
      // ignore
    }
  }
  let found = CLIENTS.find(c => c.id === id);
  if (!found) {
    CLIENTS = readStore();
    found = CLIENTS.find(c => c.id === id);
  }
  return found ?? { id, email: 'athlete1@example.com', firstName: 'A1', lastName: 'L1', sport: 'Football', agencyEmail: '' };
}
export async function deleteClient(id: string) {
  const idx = CLIENTS.findIndex(c => c.id === id);
  if (idx >= 0) {
    CLIENTS.splice(idx, 1);
    writeStore(CLIENTS);
  }
  return { ok: true };
}
export async function getClients() {
  // Determine current session from localStorage to enforce tenancy
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('session') : null;
  if (raw) {
    try {
      const s = JSON.parse(raw) as { role: 'parent' | 'agency'; email: string };
      if (s.role === 'agency') {
        const list = await listClientsByAgencyEmail(s.email);
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.debug('[clients] getClients list size', list.length);
        }
        return list;
      }
    } catch {
      // fall through
    }
  }
  return [];
}

export function setClientGmailTokens(clientId: string, tokens: any) {
  const idx = CLIENTS.findIndex(c => c.id === clientId);
  if (idx >= 0) {
    CLIENTS[idx] = { ...CLIENTS[idx], gmailTokens: tokens, gmailConnected: true };
    writeStore(CLIENTS);
  }
}

export function getClientGmailTokens(clientId: string): any | null {
  const found = CLIENTS.find(c => c.id === clientId);
  return found?.gmailTokens ?? null;
}


