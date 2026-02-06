'use client';
import React from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
const resolvedApiBase = API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');

type EventRow = { name: string; date: string; location: string };

export default function UpdateFormPageClient({ token }: { token: string }) {
  const decodedToken = React.useMemo(() => {
    try { return decodeURIComponent(token); } catch { return token; }
  }, [token]);
  const [agency, setAgency] = React.useState<{ name?: string; email?: string; settings?: { primaryColor?: string; secondaryColor?: string; logoDataUrl?: string } }>({});
  const [submitSuccess, setSubmitSuccess] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const [size, setSize] = React.useState({ height: '', weight: '', wingspan: '' });
  const [speed, setSpeed] = React.useState({ fortyYard: '', shuttle: '', vertical: '' });
  const [academics, setAcademics] = React.useState({ gpa: '', satScore: '', actScore: '', classRank: '' });
  const [events, setEvents] = React.useState<EventRow[]>([{ name: '', date: '', location: '' }]);
  const [highlightVideo, setHighlightVideo] = React.useState('');
  const [schoolInterests, setSchoolInterests] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    (async () => {
      if (!resolvedApiBase) return;
      try {
        const res = await fetch(`${resolvedApiBase}/update-forms/agency?token=${encodeURIComponent(decodedToken)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data?.ok) setAgency(data.agency || {});
      } catch {}
    })();
  }, [decodedToken]);

  const theme = React.useMemo(() => {
    const primary = agency?.settings?.primaryColor || '#0A0A0A';
    const secondary = agency?.settings?.secondaryColor || '#CCFF00';
    return createTheme({
      palette: { primary: { main: primary }, secondary: { main: secondary } },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 0,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            containedPrimary: {
              background: `linear-gradient(135deg, ${secondary} 0%, ${secondary}DD 100%)`,
              color: primary,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 20px ${secondary}40`,
                transform: 'translateY(-1px)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 0,
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
            },
          },
        },
      },
    });
  }, [agency?.settings?.primaryColor, agency?.settings?.secondaryColor]);

  const updateEvent = (idx: number, patch: Partial<EventRow>) => {
    setEvents((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  };

  const addEvent = () => setEvents((prev) => [...prev, { name: '', date: '', location: '' }]);
  const removeEvent = (idx: number) => setEvents((prev) => prev.filter((_, i) => i !== idx));

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError('');
      if (!resolvedApiBase) throw new Error('API_BASE_URL is not configured');
      const payload = {
        size,
        speed,
        academics,
        upcomingEvents: events.filter((e) => e.name || e.date || e.location),
        highlightVideo,
        schoolInterests: schoolInterests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        notes,
      };
      const res = await fetch(`${resolvedApiBase}/update-forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: decodedToken, form: payload }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Submit failed');
      setSubmitSuccess('Submitted! You may close this page.');
    } catch (e: any) {
      setError(e?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          maxWidth: 900,
          m: '0 auto',
          px: 2,
          py: 4,
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #F2F2F0 0%, #F5F5F5 45%, #EEF2E8 100%)',
          backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(204,255,0,0.02) 40px, rgba(204,255,0,0.02) 41px), linear-gradient(160deg, #F2F2F0 0%, #F5F5F5 45%, #EEF2E8 100%)',
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            {agency?.settings?.logoDataUrl ? (
              <img src={agency.settings.logoDataUrl} alt="Agency Logo" style={{ height: 48, objectFit: 'contain' }} />
            ) : null}
            <Box>
              <Typography variant="h5" gutterBottom sx={{ m: 0 }}>{agency?.name || 'Athlete Update'}</Typography>
              {submitSuccess ? <Typography color="success.main">{submitSuccess}</Typography> : null}
              {error ? <Typography color="error.main">{error}</Typography> : null}
            </Box>
          </Stack>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Size</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
            <TextField size="small" label="Height" value={size.height} onChange={(e) => setSize((p) => ({ ...p, height: e.target.value }))} />
            <TextField size="small" label="Weight" value={size.weight} onChange={(e) => setSize((p) => ({ ...p, weight: e.target.value }))} />
            <TextField size="small" label="Wingspan" value={size.wingspan} onChange={(e) => setSize((p) => ({ ...p, wingspan: e.target.value }))} />
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Speed</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
            <TextField size="small" label="40-yard" value={speed.fortyYard} onChange={(e) => setSpeed((p) => ({ ...p, fortyYard: e.target.value }))} />
            <TextField size="small" label="Shuttle" value={speed.shuttle} onChange={(e) => setSpeed((p) => ({ ...p, shuttle: e.target.value }))} />
            <TextField size="small" label="Vertical" value={speed.vertical} onChange={(e) => setSpeed((p) => ({ ...p, vertical: e.target.value }))} />
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Academics</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
            <TextField size="small" label="GPA" value={academics.gpa} onChange={(e) => setAcademics((p) => ({ ...p, gpa: e.target.value }))} />
            <TextField size="small" label="SAT Score" value={academics.satScore} onChange={(e) => setAcademics((p) => ({ ...p, satScore: e.target.value }))} />
            <TextField size="small" label="ACT Score" value={academics.actScore} onChange={(e) => setAcademics((p) => ({ ...p, actScore: e.target.value }))} />
            <TextField size="small" label="Class Rank" value={academics.classRank} onChange={(e) => setAcademics((p) => ({ ...p, classRank: e.target.value }))} />
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Upcoming Events</Typography>
          <Stack spacing={2} sx={{ mb: 2 }}>
            {events.map((row, idx) => (
              <Box key={`event-${idx}`} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                <TextField size="small" label="Event name" value={row.name} onChange={(e) => updateEvent(idx, { name: e.target.value })} />
                <TextField size="small" label="Date" type="date" InputLabelProps={{ shrink: true }} value={row.date} onChange={(e) => updateEvent(idx, { date: e.target.value })} />
                <TextField size="small" label="Location" value={row.location} onChange={(e) => updateEvent(idx, { location: e.target.value })} />
                <Button size="small" color="error" onClick={() => removeEvent(idx)}>Remove</Button>
              </Box>
            ))}
            <Button size="small" variant="outlined" onClick={addEvent}>Add event</Button>
          </Stack>

          <TextField
            size="small"
            fullWidth
            label="New highlight video link"
            value={highlightVideo}
            onChange={(e) => setHighlightVideo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            size="small"
            fullWidth
            label="New school interests (comma separated)"
            value={schoolInterests}
            onChange={(e) => setSchoolInterests(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            size="small"
            fullWidth
            label="Additional notes"
            multiline
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Update'}
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
