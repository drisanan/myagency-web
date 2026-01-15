'use client';
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { FaCalendarAlt, FaPlus, FaCheck, FaTimes, FaVideo, FaList, FaGoogle, FaLink } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
import { 
  listMeetings, 
  createMeetingRequest, 
  confirmMeeting, 
  declineMeeting, 
  cancelMeeting,
  MeetingRequest,
  MeetingStatus,
} from '@/services/meetings';
import {
  listCalendarEvents,
  createCalendarEvent,
  CalendarEvent,
  meetingToCalendarEvent,
  getEventColor,
} from '@/services/googleCalendar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateClickArg } from '@fullcalendar/core';

type Props = {
  clientId: string;
  isAthlete?: boolean;
};

const statusColors: Record<MeetingStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'error',
  cancelled: 'default',
  completed: 'primary',
};

export function MeetingsPanel({ clientId, isAthlete = false }: Props) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [eventDetailOpen, setEventDetailOpen] = React.useState(false);
  const [selectedMeeting, setSelectedMeeting] = React.useState<MeetingRequest | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [calendarConnecting, setCalendarConnecting] = React.useState(false);
  const popupRef = React.useRef<Window | null>(null);
  
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 30,
    meetingLink: '',
    syncToGoogle: false,
    createMeet: false,
  });

  const [confirmForm, setConfirmForm] = React.useState({
    scheduledAt: '',
    meetingLink: '',
  });

  // Platform meetings query
  const meetingsQuery = useQuery({
    queryKey: ['meetings', clientId],
    queryFn: () => listMeetings({ clientId }),
    staleTime: 30000,
  });

  // Google Calendar events query
  const calendarQuery = useQuery({
    queryKey: ['googleCalendar', clientId],
    queryFn: () => listCalendarEvents(clientId, 30),
    staleTime: 60000,
    retry: false,
    enabled: viewMode === 'calendar',
  });

  // Listen for OAuth popup messages for calendar reconnection
  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'google-oauth-success') {
        setCalendarConnecting(false);
        popupRef.current?.close();
        // Refresh calendar data
        queryClient.invalidateQueries({ queryKey: ['googleCalendar'] });
        calendarQuery.refetch();
        setSnackbar({ open: true, message: 'Google Calendar connected successfully!', severity: 'success' });
      } else if (e.data?.type === 'google-oauth-error') {
        setCalendarConnecting(false);
        popupRef.current?.close();
        setSnackbar({ open: true, message: 'Failed to connect Google Calendar', severity: 'error' });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [queryClient, calendarQuery]);

  /**
   * Trigger Google OAuth reconnection flow for calendar permissions
   */
  async function handleConnectCalendar() {
    if (!clientId) return;
    
    try {
      setCalendarConnecting(true);
      const oauthUrl = API_BASE_URL
        ? `${API_BASE_URL}/google/oauth/url?clientId=${encodeURIComponent(clientId)}`
        : `/api/google/oauth/url?clientId=${encodeURIComponent(clientId)}`;
      
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
      setCalendarConnecting(false);
      setSnackbar({ open: true, message: e?.message || 'Failed to connect Google Calendar', severity: 'error' });
    }
  }

  const createMutation = useMutation({
    mutationFn: createMeetingRequest,
    onSuccess: async (meeting) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
      // Optionally sync to Google Calendar
      if (form.syncToGoogle && meeting.scheduledAt) {
        try {
          await createCalendarEvent({
            clientId,
            title: meeting.title,
            start: meeting.scheduledAt,
            end: meeting.scheduledAt + (meeting.duration || 30) * 60000,
            description: meeting.description,
            createMeet: form.createMeet,
          });
          queryClient.invalidateQueries({ queryKey: ['googleCalendar'] });
          setSnackbar({ open: true, message: 'Meeting created and synced to Google Calendar', severity: 'success' });
        } catch (syncErr: any) {
          console.error('Google sync failed', syncErr);
          setSnackbar({ open: true, message: `Meeting created but Google sync failed: ${syncErr.message}`, severity: 'info' });
        }
      } else {
        setSnackbar({ open: true, message: 'Meeting request sent', severity: 'success' });
      }
      
      setDialogOpen(false);
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, scheduledAt, meetingLink }: { id: string; scheduledAt: number; meetingLink?: string }) =>
      confirmMeeting(id, scheduledAt, meetingLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setConfirmDialogOpen(false);
      setSnackbar({ open: true, message: 'Meeting confirmed', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => declineMeeting(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setSnackbar({ open: true, message: 'Meeting declined', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setSnackbar({ open: true, message: 'Meeting cancelled', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const openCreate = (prefillDate?: string) => {
    setForm({
      title: '',
      description: '',
      scheduledAt: prefillDate || '',
      duration: 30,
      meetingLink: '',
      syncToGoogle: false,
      createMeet: false,
    });
    setDialogOpen(true);
  };

  const openConfirm = (meeting: MeetingRequest) => {
    setSelectedMeeting(meeting);
    setConfirmForm({
      scheduledAt: meeting.scheduledAt ? new Date(meeting.scheduledAt).toISOString().slice(0, 16) : '',
      meetingLink: meeting.meetingLink || '',
    });
    setConfirmDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    
    await createMutation.mutateAsync({
      clientId,
      title: form.title,
      description: form.description || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).getTime() : undefined,
      duration: form.duration,
      meetingLink: form.meetingLink || undefined,
    });
  };

  const handleConfirm = async () => {
    if (!selectedMeeting || !confirmForm.scheduledAt) return;
    
    await confirmMutation.mutateAsync({
      id: selectedMeeting.id,
      scheduledAt: new Date(confirmForm.scheduledAt).getTime(),
      meetingLink: confirmForm.meetingLink || undefined,
    });
  };

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event;
    const extendedProps = event.extendedProps as { meeting?: MeetingRequest; calendarEvent?: CalendarEvent };
    
    if (extendedProps.meeting) {
      // Platform meeting
      setSelectedMeeting(extendedProps.meeting);
      setSelectedEvent(null);
    } else if (extendedProps.calendarEvent) {
      // Google Calendar event
      setSelectedEvent(extendedProps.calendarEvent);
      setSelectedMeeting(null);
    }
    setEventDetailOpen(true);
  };

  const handleDateClick = (info: DateClickArg) => {
    const dateStr = info.dateStr.length <= 10 
      ? `${info.dateStr}T09:00` 
      : info.dateStr.slice(0, 16);
    openCreate(dateStr);
  };

  const meetings = meetingsQuery.data || [];
  const googleEvents = calendarQuery.data || [];
  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' && m.scheduledAt && m.scheduledAt > Date.now());
  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const pastMeetings = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled' || m.status === 'declined');

  // Combine platform meetings and Google Calendar events for FullCalendar
  const calendarEvents = React.useMemo(() => {
    const platformEvents = meetings
      .filter(m => m.scheduledAt)
      .map(m => ({
        id: `platform-${m.id}`,
        title: m.title,
        start: new Date(m.scheduledAt!),
        end: m.duration ? new Date(m.scheduledAt! + m.duration * 60000) : undefined,
        backgroundColor: getEventColor({ ...meetingToCalendarEvent(m)!, source: 'platform' }, m.status),
        borderColor: getEventColor({ ...meetingToCalendarEvent(m)!, source: 'platform' }, m.status),
        extendedProps: { meeting: m },
      }));

    const googleCalendarEvents = googleEvents.map(e => ({
      id: `google-${e.id}`,
      title: e.title,
      start: e.start || undefined,
      end: e.end || undefined,
      allDay: e.allDay,
      backgroundColor: '#4285f4',
      borderColor: '#4285f4',
      extendedProps: { calendarEvent: e },
    }));

    return [...platformEvents, ...googleCalendarEvents];
  }, [meetings, googleEvents]);

  const MeetingCard = ({ meeting }: { meeting: MeetingRequest }) => (
    <Card variant="outlined" data-testid="meeting-item">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6">{meeting.title}</Typography>
              <Chip 
                size="small" 
                label={meeting.status} 
                color={statusColors[meeting.status]}
              />
              <Chip 
                size="small" 
                label={`Requested by ${meeting.requestedBy}`}
                variant="outlined"
              />
            </Stack>
            
            {meeting.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {meeting.description}
              </Typography>
            )}
            
            {meeting.scheduledAt && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaCalendarAlt /> {new Date(meeting.scheduledAt).toLocaleString()}
                {meeting.duration && ` (${meeting.duration} min)`}
              </Typography>
            )}
            
            {meeting.meetingLink && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<FaVideo />}
                href={meeting.meetingLink.startsWith('http') ? meeting.meetingLink : `https://${meeting.meetingLink}`}
                target="_blank"
                sx={{ mt: 1 }}
              >
                Join Meeting
              </Button>
            )}
          </Box>
          
          <Stack direction="row" spacing={1}>
            {meeting.status === 'pending' && !isAthlete && (
              <>
                <IconButton 
                  size="small" 
                  color="success" 
                  onClick={() => openConfirm(meeting)}
                  title="Confirm"
                >
                  <FaCheck />
                </IconButton>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => declineMutation.mutate({ id: meeting.id })}
                  title="Decline"
                >
                  <FaTimes />
                </IconButton>
              </>
            )}
            {meeting.status === 'confirmed' && (
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => cancelMutation.mutate(meeting.id)}
                title="Cancel"
              >
                <FaTimes />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const isLoading = meetingsQuery.isLoading || (viewMode === 'calendar' && calendarQuery.isLoading);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaCalendarAlt /> Meetings
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            data-testid="meetings-view-toggle"
          >
            <ToggleButton value="list" data-testid="list-view-btn">
              <Tooltip title="List View"><FaList /></Tooltip>
            </ToggleButton>
            <ToggleButton value="calendar" data-testid="calendar-view-btn">
              <Tooltip title="Calendar View"><FaCalendarAlt /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Button 
            variant="contained" 
            onClick={() => openCreate()} 
            startIcon={<FaPlus />}
            data-testid="request-meeting-btn"
          >
            {isAthlete ? 'Request Meeting' : 'Schedule Meeting'}
          </Button>
        </Stack>
      </Stack>

      {/* Calendar Error State with Reconnect Option */}
      {viewMode === 'calendar' && calendarQuery.error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleConnectCalendar}
              disabled={calendarConnecting}
              startIcon={calendarConnecting ? <CircularProgress size={14} color="inherit" /> : <FaLink />}
            >
              {calendarConnecting ? 'Connecting…' : 'Connect'}
            </Button>
          }
        >
          <Typography variant="body2">
            {(calendarQuery.error as any)?.message || 'Google Calendar not connected.'}{' '}
            <Typography component="span" sx={{ fontWeight: 600 }}>
              Connect to see your full schedule.
            </Typography>
          </Typography>
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'list' ? (
        /* List View */
        meetings.length === 0 ? (
          <Typography color="text.secondary">No meetings scheduled.</Typography>
        ) : (
          <Stack spacing={3}>
            {pendingMeetings.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Pending ({pendingMeetings.length})
                </Typography>
                <Stack spacing={1}>
                  {pendingMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                </Stack>
              </Box>
            )}
            
            {upcomingMeetings.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Upcoming ({upcomingMeetings.length})
                </Typography>
                <Stack spacing={1}>
                  {upcomingMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                </Stack>
              </Box>
            )}
            
            {pastMeetings.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Past ({pastMeetings.length})
                </Typography>
                <Stack spacing={1}>
                  {pastMeetings.slice(0, 5).map(m => <MeetingCard key={m.id} meeting={m} />)}
                </Stack>
              </Box>
            )}
          </Stack>
        )
      ) : (
        /* Calendar View */
        <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }} data-testid="fullcalendar-container">
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              size="small" 
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#15b79f', mr: 0.5 }} />}
              label="Confirmed" 
              variant="outlined"
            />
            <Chip 
              size="small" 
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f79009', mr: 0.5 }} />}
              label="Pending" 
              variant="outlined"
            />
            <Chip 
              size="small" 
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4285f4', mr: 0.5 }} />}
              label="Google Calendar" 
              variant="outlined"
            />
          </Box>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            aspectRatio={1.8}
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
          />
        </Paper>
      )}

      {/* Create Meeting Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isAthlete ? 'Request a Meeting' : 'Schedule a Meeting'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            size="small"
            label="Title"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            required
            data-testid="meeting-title"
          />
          <TextField
            size="small"
            label="Description"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            multiline
            minRows={2}
            data-testid="meeting-description"
          />
          <TextField
            size="small"
            type="datetime-local"
            label="Proposed Time"
            value={form.scheduledAt}
            onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            data-testid="meeting-time"
          />
          <TextField
            size="small"
            type="number"
            label="Duration (minutes)"
            value={form.duration}
            onChange={(e) => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
            data-testid="meeting-duration"
          />
          {!isAthlete && (
            <>
              <TextField
                size="small"
                label="Meeting Link (Zoom, Google Meet, etc.)"
                value={form.meetingLink}
                onChange={(e) => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                data-testid="meeting-link"
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant={form.syncToGoogle ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<FaGoogle />}
                  onClick={() => setForm(f => ({ ...f, syncToGoogle: !f.syncToGoogle }))}
                  data-testid="sync-google-btn"
                >
                  {form.syncToGoogle ? 'Syncing to Google' : 'Sync to Google Calendar'}
                </Button>
                {form.syncToGoogle && (
                  <Button
                    variant={form.createMeet ? 'contained' : 'outlined'}
                    size="small"
                    color="secondary"
                    startIcon={<FaVideo />}
                    onClick={() => setForm(f => ({ ...f, createMeet: !f.createMeet }))}
                    data-testid="create-meet-btn"
                  >
                    {form.createMeet ? 'Creating Meet Link' : 'Create Google Meet'}
                  </Button>
                )}
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate}
            disabled={createMutation.isPending}
            data-testid="submit-meeting-btn"
          >
            {createMutation.isPending ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Meeting Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Confirming: {selectedMeeting?.title}
          </Typography>
          <TextField
            size="small"
            type="datetime-local"
            label="Confirmed Time"
            value={confirmForm.scheduledAt}
            onChange={(e) => setConfirmForm(f => ({ ...f, scheduledAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            size="small"
            label="Meeting Link"
            value={confirmForm.meetingLink}
            onChange={(e) => setConfirmForm(f => ({ ...f, meetingLink: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? <CircularProgress size={20} /> : 'Confirm Meeting'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={eventDetailOpen} onClose={() => setEventDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedMeeting?.title || selectedEvent?.title || 'Event Details'}
        </DialogTitle>
        <DialogContent>
          {selectedMeeting && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip 
                  size="small" 
                  label={selectedMeeting.status} 
                  color={statusColors[selectedMeeting.status]}
                />
                <Chip 
                  size="small" 
                  label="Platform Meeting"
                  variant="outlined"
                />
              </Stack>
              {selectedMeeting.description && (
                <Typography variant="body2">{selectedMeeting.description}</Typography>
              )}
              {selectedMeeting.scheduledAt && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaCalendarAlt /> {new Date(selectedMeeting.scheduledAt).toLocaleString()}
                  {selectedMeeting.duration && ` (${selectedMeeting.duration} min)`}
                </Typography>
              )}
              {selectedMeeting.meetingLink && (
                <Button
                  variant="outlined"
                  startIcon={<FaVideo />}
                  href={selectedMeeting.meetingLink.startsWith('http') ? selectedMeeting.meetingLink : `https://${selectedMeeting.meetingLink}`}
                  target="_blank"
                >
                  Join Meeting
                </Button>
              )}
            </Stack>
          )}
          {selectedEvent && (
            <Stack spacing={2}>
              <Chip 
                size="small" 
                icon={<FaGoogle />}
                label="Google Calendar Event"
                color="primary"
                variant="outlined"
              />
              {selectedEvent.description && (
                <Typography variant="body2">{selectedEvent.description}</Typography>
              )}
              {selectedEvent.start && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaCalendarAlt /> {new Date(selectedEvent.start).toLocaleString()}
                  {selectedEvent.end && ` - ${new Date(selectedEvent.end).toLocaleTimeString()}`}
                </Typography>
              )}
              {selectedEvent.location && (
                <Typography variant="body2">📍 {selectedEvent.location}</Typography>
              )}
              {selectedEvent.meetLink && (
                <Button
                  variant="outlined"
                  startIcon={<FaVideo />}
                  href={selectedEvent.meetLink}
                  target="_blank"
                >
                  Join Google Meet
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDetailOpen(false)}>Close</Button>
          {selectedMeeting && selectedMeeting.status === 'pending' && !isAthlete && (
            <>
              <Button 
                color="success" 
                variant="contained"
                onClick={() => {
                  setEventDetailOpen(false);
                  openConfirm(selectedMeeting);
                }}
              >
                Confirm
              </Button>
              <Button 
                color="error"
                onClick={() => {
                  declineMutation.mutate({ id: selectedMeeting.id });
                  setEventDetailOpen(false);
                }}
              >
                Decline
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
