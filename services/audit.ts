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

/**
 * Fire-and-forget POST to /activity for server-side persistence.
 * Falls back silently on failure — localStorage still captures the event.
 */
async function syncToServer(event: AuditEvent) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;
    if (!API_BASE_URL) return;

    await fetch(`${API_BASE_URL}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        activityType: event.type, // maps to 'impersonation_start' | 'impersonation_end'
        description: `${event.type === 'impersonation_start' ? 'Started' : 'Stopped'} impersonation of ${event.targetAgencyEmail}`,
        metadata: {
          actorEmail: event.actorEmail,
          actorRole: event.actorRole,
          targetAgencyEmail: event.targetAgencyEmail,
          ...event.details,
        },
      }),
    });
  } catch {
    // Silently fail — localStorage is the local fallback
  }
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

  // Persist impersonation events to the server for compliance
  if (ev.type === 'impersonation_start' || ev.type === 'impersonation_end') {
    syncToServer(ev);
  }

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


