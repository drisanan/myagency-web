'use client';

export type EmailTemplate = {
  id: string;
  agencyEmail: string;
  clientId?: string | null;
  name: string;
  html: string; // uses placeholders like {{StudentFullName}}, {{UniversityName}}, etc.
  enabledSections?: Record<string, boolean>;
  createdAt: number;
};

const KEY = 'email_templates_v1';

function loadAll(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EmailTemplate[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: EmailTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function listTemplates(input: { agencyEmail: string; clientId?: string | null }): EmailTemplate[] {
  const all = loadAll();
  return all
    .filter(t => t.agencyEmail === input.agencyEmail && (input.clientId ? t.clientId === input.clientId : true))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function saveTemplate(input: Omit<EmailTemplate, 'id' | 'createdAt'>): EmailTemplate {
  const all = loadAll();
  const rec: EmailTemplate = { ...input, id: uid(), createdAt: Date.now() };
  saveAll([rec, ...all]);
  return rec;
}

export function getTemplate(id: string): EmailTemplate | undefined {
  return loadAll().find(t => t.id === id);
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Replace actual values with placeholders for saving as template
export function toTemplateHtml(
  html: string,
  ctx: {
    studentFirstName: string;
    studentLastName: string;
    studentFullName: string;
    universityName: string;
  }
) {
  let out = String(html);
  // Replace longer tokens first to avoid partial overlaps
  const replacements: Record<string, string> = {
    [ctx.studentFullName]: '{{StudentFullName}}',
    [ctx.studentFirstName]: '{{StudentFirstName}}',
    [ctx.studentLastName]: '{{StudentLastName}}',
    [ctx.universityName]: '{{UniversityName}}',
  };
  for (const [from, to] of Object.entries(replacements)) {
    if (from && from.trim().length) {
      const re = new RegExp(escapeRegExp(from), 'g');
      out = out.replace(re, to);
    }
  }
  return out;
}

// Apply placeholders to current context when loading a template
export function applyTemplate(
  html: string,
  ctx: {
    studentFirstName: string;
    studentLastName: string;
    studentFullName: string;
    universityName: string;
  }
) {
  let out = String(html);
  const map: Record<string, string> = {
    '{{StudentFirstName}}': ctx.studentFirstName || '',
    '{{StudentLastName}}': ctx.studentLastName || '',
    '{{StudentFullName}}': ctx.studentFullName || '',
    '{{UniversityName}}': ctx.universityName || '',
  };
  for (const [k, v] of Object.entries(map)) {
    const re = new RegExp(escapeRegExp(k), 'g');
    out = out.replace(re, v);
  }
  return out;
}


