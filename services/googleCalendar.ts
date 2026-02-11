/**
 * Google Calendar Service
 * Handles all calendar-related API interactions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const base = requireApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await res.json();
  
  if (!res.ok || data?.ok === false) {
    const error = new Error(data?.error || `API error: ${res.status}`);
    (error as any).needsReconnect = data?.needsReconnect;
    throw error;
  }

  return data as T;
}

export type CalendarEvent = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  location?: string | null;
  description?: string | null;
  meetLink?: string | null;
  allDay?: boolean;
  source: 'google' | 'platform';
};

export type CreateEventInput = {
  clientId?: string;
  title: string;
  start: string | number | Date;
  end?: string | number | Date;
  description?: string;
  location?: string;
  attendees?: string[];
  createMeet?: boolean;
};

export type UpdateEventInput = {
  clientId?: string;
  title?: string;
  start?: string | number | Date;
  end?: string | number | Date;
  description?: string;
  location?: string;
};

/**
 * Fetch calendar events from Google Calendar
 */
export async function listCalendarEvents(
  clientId: string,
  days: number = 14
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    clientId,
    days: String(days),
  });
  
  const data = await apiFetch<{ ok: boolean; events: CalendarEvent[] }>(
    `/google/calendar/events?${params.toString()}`
  );
  
  return data.events || [];
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  input: CreateEventInput
): Promise<CalendarEvent> {
  const data = await apiFetch<{ ok: boolean; event: CalendarEvent }>(
    '/google/calendar/events',
    {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        start: input.start instanceof Date ? input.start.toISOString() : input.start,
        end: input.end instanceof Date ? input.end.toISOString() : input.end,
      }),
    }
  );
  
  return data.event;
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  input: UpdateEventInput
): Promise<{ id: string }> {
  const data = await apiFetch<{ ok: boolean; event: { id: string } }>(
    `/google/calendar/events/${eventId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        ...input,
        start: input.start instanceof Date ? input.start.toISOString() : input.start,
        end: input.end instanceof Date ? input.end.toISOString() : input.end,
      }),
    }
  );
  
  return data.event;
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  eventId: string,
  clientId: string
): Promise<void> {
  await apiFetch(
    `/google/calendar/events/${eventId}?clientId=${encodeURIComponent(clientId)}`,
    { method: 'DELETE' }
  );
}

/**
 * Disconnect Google Calendar (revoke tokens and remove from system)
 */
export async function disconnectGoogleCalendar(
  clientId: string
): Promise<void> {
  await apiFetch('/google/disconnect?clientId=' + encodeURIComponent(clientId), {
    method: 'DELETE',
  });
}

/**
 * Convert platform meetings to calendar event format
 */
export function meetingToCalendarEvent(meeting: {
  id: string;
  title: string;
  scheduledAt?: number;
  duration?: number;
  description?: string;
  meetingLink?: string;
  status: string;
}): CalendarEvent | null {
  if (!meeting.scheduledAt) return null;
  
  const start = new Date(meeting.scheduledAt);
  const end = new Date(start.getTime() + (meeting.duration || 60) * 60000);
  
  return {
    id: meeting.id,
    title: meeting.title,
    start: start.toISOString(),
    end: end.toISOString(),
    description: meeting.description || null,
    meetLink: meeting.meetingLink || null,
    allDay: false,
    source: 'platform',
  };
}

/**
 * Get status color for calendar events
 */
export function getEventColor(event: CalendarEvent, meetingStatus?: string): string {
  if (event.source === 'platform') {
    switch (meetingStatus) {
      case 'confirmed': return '#CCFF00'; // Lime – confirmed
      case 'pending': return '#FFB800';   // Warning – pending
      case 'declined': return '#FF3B3B';   // Red
      case 'cancelled': return '#0A0A0A60';  // Muted
      default: return '#CCFF00';           // Lime (default)
    }
  }
  // Google Calendar events
  return '#CCFF00'; // Brand lime
}
