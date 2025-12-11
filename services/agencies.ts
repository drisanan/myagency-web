const STORAGE_KEY = 'agencies_data';

function readStore(): Agency[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Agency[];
  } catch {
    return [];
  }
}

function writeStore(items: Agency[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export type AgencySettings = {
  primaryColor?: string;
  secondaryColor?: string;
  logoDataUrl?: string;
};
export type Agency = {
  id: string;
  name: string;
  email: string;
  password?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  active?: boolean;
  settings?: AgencySettings;
};

const SEED_AGENCIES: Agency[] = [
  { id: 'agency-001', name: 'Prime Sports', email: 'agency1@an.test', settings: { primaryColor: '#1976d2' } },
  { id: 'agency-002', name: 'NextGen', email: 'agency2@an.test', settings: { primaryColor: '#9c27b0' } },
  { id: 'agency-003', name: 'Elite Edge', email: 'agency3@an.test', settings: { primaryColor: '#2e7d32' } },
];

let AGENCIES: Agency[] = (() => {
  const fromStore = readStore();
  if (fromStore.length > 0) return fromStore;
  writeStore(SEED_AGENCIES);
  return [...SEED_AGENCIES];
})();

export { AGENCIES };

export async function listAgencies() {
  return AGENCIES.map(a => ({ id: a.id, name: a.name }));
}

export async function getAgencies() {
  return [...AGENCIES];
}

export async function getAgencyByEmail(email: string) {
  return AGENCIES.find(a => a.email === email) ?? null;
}

export async function getAgencyById(id: string) {
  return AGENCIES.find(a => a.id === id) ?? null;
}

export async function getAgencySettings(email: string) {
  const a = AGENCIES.find(x => x.email === email);
  return a?.settings ?? {};
}

export async function updateAgencySettings(email: string, settings: AgencySettings) {
  const a = AGENCIES.find(x => x.email === email);
  if (!a) return { ok: false };
  a.settings = { ...(a.settings ?? {}), ...settings };
  writeStore(AGENCIES);
  return { ok: true, settings: a.settings };
}

type UpsertInput = Omit<Agency, 'id'> & { id?: string };
export async function upsertAgency(input: UpsertInput) {
  if (input.id) {
    const idx = AGENCIES.findIndex(a => a.id === input.id);
    if (idx >= 0) {
      AGENCIES[idx] = { ...AGENCIES[idx], ...input, id: input.id };
      writeStore(AGENCIES);
      return { id: input.id };
    }
  }
  const id = `agency-${(Math.random() * 1e6).toFixed(0)}`;
  AGENCIES.push({
    id,
    name: input.name,
    email: input.email,
    password: input.password,
    ownerFirstName: input.ownerFirstName,
    ownerLastName: input.ownerLastName,
    ownerEmail: input.ownerEmail,
    ownerPhone: input.ownerPhone,
    active: input.active ?? true,
    settings: input.settings ?? {},
  });
  writeStore(AGENCIES);
  return { id };
}

export async function deleteAgency(id: string) {
  const idx = AGENCIES.findIndex(a => a.id === id);
  if (idx >= 0) {
    AGENCIES.splice(idx, 1);
    writeStore(AGENCIES);
    return { ok: true };
  }
  return { ok: false };
}


