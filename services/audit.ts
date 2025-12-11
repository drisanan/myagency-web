export type AuditEventType = 'impersonation_start' | 'impersonation_end' | 'navigation' | 'action';
export type AuditEvent = {
  id: string;
  type: AuditEventType;
  timestamp: number;
  actorEmail: string;
  actorRole: string;
  targetAgencyEmail?: string;
  details?: Record<string, any>;
};

const STORAGE_KEY = 'audit_log';

function readLog(): AuditEvent[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AuditEvent[];
  } catch {
    return [];
  }
}

function writeLog(events: AuditEvent[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  const ev: AuditEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  const current = readLog();
  current.push(ev);
  writeLog(current);
  return ev.id;
}

export function logImpersonationStart(parentEmail: string, agencyEmail: string) {
  return logEvent({
    type: 'impersonation_start',
    actorEmail: parentEmail,
    actorRole: 'parent',
    targetAgencyEmail: agencyEmail,
  });
}

export function logImpersonationEnd(parentEmail: string, agencyEmail: string) {
  return logEvent({
    type: 'impersonation_end',
    actorEmail: parentEmail,
    actorRole: 'parent',
    targetAgencyEmail: agencyEmail,
  });
}

export function listAuditLog(): AuditEvent[] {
  return readLog();
}

export function clearAuditLog() {
  writeLog([]);
}


