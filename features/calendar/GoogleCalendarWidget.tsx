'use client';
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import { FaGoogle, FaCalendarAlt, FaExternalLinkAlt, FaVideo, FaLink } from 'react-icons/fa';
import { LoadingState } from '@/components/LoadingState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { listCalendarEvents, CalendarEvent } from '@/services/googleCalendar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Props = {
  compact?: boolean;
  clientId?: string;
};

/**
 * Google Calendar Widget for Dashboard
 * Displays upcoming events from the user's Google Calendar
 */
export function GoogleCalendarWidget({ compact = false, clientId }: Props) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const targetClientId = clientId || session?.clientId || session?.email || '';
  const popupRef = React.useRef<Window | null>(null);
  const [connecting, setConnecting] = React.useState(false);

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['googleCalendar', targetClientId, 'dashboard'],
    queryFn: () => listCalendarEvents(targetClientId, 14),
    staleTime: 120000, // 2 minutes
    retry: false,
    enabled: Boolean(targetClientId),
  });

  // Listen for OAuth popup messages
  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'google-oauth-success') {
        setConnecting(false);
        popupRef.current?.close();
        // Refresh calendar data
        queryClient.invalidateQueries({ queryKey: ['googleCalendar'] });
        refetch();
      } else if (e.data?.type === 'google-oauth-error') {
        setConnecting(false);
        popupRef.current?.close();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [queryClient, refetch]);

  /**
   * Trigger Google OAuth reconnection flow
   * This will request the new calendar scopes
   */
  async function handleReconnectGoogle() {
    if (!targetClientId) return;
    
    try {
      setConnecting(true);
      const oauthUrl = API_BASE_URL
        ? `${API_BASE_URL}/google/oauth/url?clientId=${encodeURIComponent(targetClientId)}`
        : `/api/google/oauth/url?clientId=${encodeURIComponent(targetClientId)}`;
      
      const res = await fetch(oauthUrl, { credentials: 'include' });
      const data = await res.json();
      
      if (!data?.url) throw new Error('Failed to start Google connection flow');
      
      const w = 500, h = 700;
      const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 100;
      const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 100;
      
      popupRef.current = window.open(
        data.url,
        'an-google-oauth',
        `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
      );
      
      if (!popupRef.current) throw new Error('Popup blocked. Please allow popups and try again.');
    } catch (e: any) {
      setConnecting(false);
      console.error('Google connect failed:', e);
    }
  }

  // Convert events for FullCalendar
  const calendarEvents = React.useMemo(() => {
    return (events || []).map(e => ({
      id: e.id,
      title: e.title,
      start: e.start || undefined,
      end: e.end || undefined,
      allDay: e.allDay,
      backgroundColor: '#CCFF00',
      borderColor: '#CCFF00',
      textColor: '#0A0A0A',
      extendedProps: { event: e },
    }));
  }, [events]);

  // Upcoming events list (for compact view)
  const upcomingEvents = React.useMemo(() => {
    const now = Date.now();
    return (events || [])
      .filter(e => e.start && new Date(e.start).getTime() > now)
      .slice(0, 5);
  }, [events]);

  if (!targetClientId) {
    return null;
  }

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 0 }}>
        <LoadingState message="Loading calendar..." />
      </Paper>
    );
  }

  if (error) {
    const needsReconnect = (error as any)?.needsReconnect;
    const errorMessage = (error as any)?.message || 'Unable to load calendar events.';
    
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }} data-testid="google-calendar-widget">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaGoogle color="#CCFF00" /> My Schedule
          </Typography>
        </Stack>
        
        <Alert 
          severity={needsReconnect ? 'warning' : 'error'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {errorMessage}
          </Typography>
          {needsReconnect && (
            <Typography variant="caption" color="text.secondary">
              Re-authorize to grant calendar permissions.
            </Typography>
          )}
        </Alert>
        
        {needsReconnect && (
          <Button
            variant="contained"
            onClick={handleReconnectGoogle}
            disabled={connecting}
            startIcon={connecting ? <CircularProgress size={16} color="inherit" /> : <FaLink />}
            sx={{ 
              bgcolor: '#CCFF00', 
              color: '#0A0A0A', 
              '&:hover': { bgcolor: '#B8E600' },
            }}
            data-testid="reconnect-google-btn"
          >
            {connecting ? 'Connecting…' : 'Connect Google Calendar'}
          </Button>
        )}
      </Paper>
    );
  }

  if (compact) {
    // Compact list view for dashboard sidebar
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }} data-testid="google-calendar-widget">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaGoogle color="#CCFF00" /> My Schedule
          </Typography>
          <Chip size="small" label="Google Calendar" variant="outlined" />
        </Stack>

        {upcomingEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No upcoming events in the next 2 weeks.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </Stack>
        )}
      </Paper>
    );
  }

  // Full calendar view
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }} data-testid="google-calendar-widget">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaGoogle color="#CCFF00" /> My Schedule
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={`${events?.length || 0} events`} variant="outlined" />
          <Tooltip title="Open Google Calendar">
            <Button
              size="small"
              variant="outlined"
              startIcon={<FaExternalLinkAlt />}
              href="https://calendar.google.com"
              target="_blank"
            >
              Open Calendar
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,timeGridDay',
        }}
        events={calendarEvents}
        height={400}
        eventDisplay="block"
        dayMaxEvents={3}
      />
    </Paper>
  );
}

/**
 * Individual event card for compact view
 */
function EventCard({ event }: { event: CalendarEvent }) {
  const startDate = event.start ? new Date(event.start) : null;
  const isToday = startDate && startDate.toDateString() === new Date().toDateString();
  const isTomorrow = startDate && startDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const formatDate = () => {
    if (!startDate) return '';
    if (isToday) return `Today, ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (isTomorrow) return `Tomorrow, ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 0,
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        bgcolor: isToday ? 'action.selected' : 'background.default',
        border: '1px solid',
        borderColor: isToday ? 'primary.main' : 'divider',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {event.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <FaCalendarAlt style={{ marginRight: 4 }} />
            {formatDate()}
          </Typography>
        </Box>
        {event.meetLink && (
          <Tooltip title="Join Google Meet">
            <Button
              size="small"
              variant="text"
              href={event.meetLink}
              target="_blank"
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <FaVideo />
            </Button>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}

export default GoogleCalendarWidget;
