type Submission = {
  id: string;
  createdAt: number;
  data: any;
  consumed?: boolean;
};

const SUBMISSIONS: { [agencyEmail: string]: Submission[] } = {};
const STORAGE_KEY = 'form_submissions_v1';
const FILE_PATH = (() => {
  try {
    const path = require('path');
    return path.join(process.cwd(), 'tmp-forms-submissions.json');
  } catch {
    return null;
  }
})();
const fs = (() => {
  try { return require('fs'); } catch { return null; }
})();

function readStore(): { [agencyEmail: string]: Submission[] } {
  if (typeof window === 'undefined') {
    if (fs && FILE_PATH && fs.existsSync(FILE_PATH)) {
      try {
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        return raw ? (JSON.parse(raw) as { [agencyEmail: string]: Submission[] }) : {};
      } catch {
        return {};
      }
    }
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { [agencyEmail: string]: Submission[] }) : {};
  } catch {
    return {};
  }
}

function writeStore(data: { [agencyEmail: string]: Submission[] }) {
  if (typeof window === 'undefined') {
    try {
      if (fs && FILE_PATH) {
        const path = require('path');
        const dir = path.dirname(FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(FILE_PATH, JSON.stringify(data), 'utf-8');
      }
    } catch {
      // ignore
    }
  } else {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

function syncFromStorage() {
  const latest = readStore();
  // Replace in-memory with latest
  Object.keys(SUBMISSIONS).forEach((k) => delete SUBMISSIONS[k]);
  Object.entries(latest).forEach(([k, v]) => {
    SUBMISSIONS[k] = v;
  });
}

// Initialize from storage
Object.assign(SUBMISSIONS, readStore());

function persist() {
  writeStore(SUBMISSIONS);
}

export function putSubmission(agencyEmail: string, data: any): Submission {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const rec: Submission = { id, createdAt: Date.now(), data, consumed: false };
  if (!SUBMISSIONS[agencyEmail]) SUBMISSIONS[agencyEmail] = [];
  SUBMISSIONS[agencyEmail].unshift(rec);
  persist();
  return rec;
}

export function listSubmissions(agencyEmail: string, includeConsumed = false): Submission[] {
  syncFromStorage();
  const all = SUBMISSIONS[agencyEmail] || [];
  return includeConsumed ? all.slice() : all.filter((s) => !s.consumed);
}

export function consumeSubmissions(agencyEmail: string, ids: string[]) {
  const all = SUBMISSIONS[agencyEmail] || [];
  const set = new Set(ids);
  all.forEach((s) => {
    if (set.has(s.id)) s.consumed = true;
  });
  persist();
}


