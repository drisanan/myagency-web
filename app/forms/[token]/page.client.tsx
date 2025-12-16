'use client';
import React from 'react';
import { Box, TextField, Button, Typography, Paper, MenuItem } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
const resolvedApiBase = API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');

const sportsOptions = ['Football', 'Basketball', 'Baseball', 'Soccer', 'Track', 'Volleyball', 'Swimming'];
const divisionOptions = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
const gradYearOptions = ['2025', '2026', '2027', '2028'];

const sportPositions: Record<string, string[]> = {
  Football: ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P', 'LS'],
  Basketball: ['PG', 'SG', 'SF', 'PF', 'C'],
  Baseball: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'],
  Soccer: ['GK', 'RB', 'LB', 'CB', 'CDM', 'CM', 'CAM', 'RW', 'LW', 'ST'],
  Volleyball: ['Setter', 'Opposite', 'Middle Blocker', 'Outside Hitter', 'Libero', 'Defensive Specialist'],
  Track: ['Sprints', 'Middle Distance', 'Long Distance', 'Hurdles', 'Jumps', 'Throws', 'Relays'],
};

function getPositions(sport: string): string[] | null {
  const list = sportPositions[sport];
  return Array.isArray(list) && list.length ? list : null;
}

export default function IntakeFormPageClient({ token }: { token: string }) {
  const decodedToken = React.useMemo(() => {
    try { return decodeURIComponent(token); } catch { return token; }
  }, [token]);
  const [agency, setAgency] = React.useState<{ name?: string; email?: string; settings?: { primaryColor?: string; secondaryColor?: string; logoDataUrl?: string } }>({});
  const initialForm = React.useMemo(() => ({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    sport: '',
    division: '',
    graduationYear: '',
    profileImageUrl: '',
    radar: {
      preferredPosition: '',
      school: '',
      gpa: '',
      youtubeHighlightUrl: '',
      hudlLink: '',
      instagramProfileUrl: '',
      athleteMetricsTitleOne: '',
      athleteMetricsValueOne: '',
    },
  }), []);
  const [form, setForm] = React.useState<any>(initialForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState('');

  React.useEffect(() => {
    (async () => {
      if (!resolvedApiBase) {
        console.error('[intake:agency:error]', { error: 'API_BASE_URL missing' });
        return;
      }
      try {
        const res = await fetch(`${resolvedApiBase}/forms/agency?token=${encodeURIComponent(decodedToken)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data?.ok) setAgency(data.agency || {});
      } catch {}
    })();
  }, [decodedToken]);

  async function submit() {
    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitSuccess('');

      const nextErrors: Record<string, string> = {};
      if (!form.email) nextErrors.email = 'Email is required';
      if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
      if (!form.password) nextErrors.password = 'Password is required';
      if (!form.phone) nextErrors.phone = 'Phone is required';
      else if (!/^\+?\d+$/.test(String(form.phone).trim())) nextErrors.phone = 'Phone must be digits only';
      if (!form.firstName) nextErrors.firstName = 'First name is required';
      if (!form.lastName) nextErrors.lastName = 'Last name is required';
      if (!form.sport) nextErrors.sport = 'Sport is required';
      if (!form.division) nextErrors.division = 'Division is required';
      if (!form.graduationYear) nextErrors.graduationYear = 'Graduation year is required';
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        setSubmitting(false);
        return;
      }

      if (!resolvedApiBase) throw new Error('API_BASE_URL is not configured');

      const res = await fetch(`${resolvedApiBase}/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: decodedToken, form }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Submit failed');
      console.info('[intake:submit:success]', { id: data?.id });
      setSubmitSuccess('Submitted! You may close this page.');
      setForm(initialForm);
      setErrors({});
    } catch (e: any) {
      console.error('[intake:submit:error]', { error: e?.message });
      setSubmitError(e?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  const theme = React.useMemo(() => {
    const primary = agency?.settings?.primaryColor || '#1976d2';
    const secondary = agency?.settings?.secondaryColor || '#9c27b0';
    return createTheme({
      palette: {
        primary: { main: primary },
        secondary: { main: secondary },
      },
    });
  }, [agency?.settings?.primaryColor, agency?.settings?.secondaryColor]);

  const positions = getPositions(form.sport);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 720, m: '40px auto' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {agency?.settings?.logoDataUrl ? (
              <img src={agency.settings.logoDataUrl} alt="Agency Logo" style={{ height: 48, objectFit: 'contain' }} />
            ) : null}
            <Typography variant="h5" gutterBottom sx={{ m: 0 }}>{agency?.name || 'Athlete Intake'}</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <TextField label="Email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} error={Boolean(errors.email)} helperText={errors.email} />
            <TextField label="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} error={Boolean(errors.phone)} helperText={errors.phone} />
            <TextField label="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} error={Boolean(errors.password)} helperText={errors.password} />
            <TextField label="First name" value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} error={Boolean(errors.firstName)} helperText={errors.firstName} />
            <TextField label="Last name" value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} error={Boolean(errors.lastName)} helperText={errors.lastName} />
            <TextField select label="Sport" value={form.sport} onChange={(e)=>setForm({...form, sport: e.target.value})} error={Boolean(errors.sport)} helperText={errors.sport}>
              {sportsOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField select label="Division" value={form.division} onChange={(e)=>setForm({...form, division: e.target.value})} error={Boolean(errors.division)} helperText={errors.division}>
              {divisionOptions.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select label="Graduation Year" value={form.graduationYear} onChange={(e)=>setForm({...form, graduationYear: e.target.value})} error={Boolean(errors.graduationYear)} helperText={errors.graduationYear}>
              {gradYearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField
              select={Boolean(positions && positions.length)}
              label="Preferred Position"
              value={form.radar.preferredPosition}
              onChange={(e)=>setForm({...form, radar: { ...form.radar, preferredPosition: e.target.value }})}
            >
              {positions && positions.length
                ? positions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)
                : null}
            </TextField>
            <TextField label="School" value={form.radar.school} onChange={(e)=>setForm({...form, radar: { ...form.radar, school: e.target.value }})} />
            <TextField label="GPA" value={form.radar.gpa} onChange={(e)=>setForm({...form, radar: { ...form.radar, gpa: e.target.value }})} />
            <TextField label="YouTube" value={form.radar.youtubeHighlightUrl} onChange={(e)=>setForm({...form, radar: { ...form.radar, youtubeHighlightUrl: e.target.value }})} />
            <TextField label="Hudl" value={form.radar.hudlLink} onChange={(e)=>setForm({...form, radar: { ...form.radar, hudlLink: e.target.value }})} />
            <TextField label="Instagram" value={form.radar.instagramProfileUrl} onChange={(e)=>setForm({...form, radar: { ...form.radar, instagramProfileUrl: e.target.value }})} />
            <TextField label="Metric 1 Title" value={form.radar.athleteMetricsTitleOne} onChange={(e)=>setForm({...form, radar: { ...form.radar, athleteMetricsTitleOne: e.target.value }})} />
            <TextField label="Metric 1 Value" value={form.radar.athleteMetricsValueOne} onChange={(e)=>setForm({...form, radar: { ...form.radar, athleteMetricsValueOne: e.target.value }})} />
            <TextField
              type="file"
              inputProps={{ accept: 'image/png,image/jpeg,image/jpg' }}
              label="Profile Image"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setForm({ ...form, profileImageUrl: String(reader.result || '') });
                reader.readAsDataURL(file);
              }}
              helperText="Upload png or jpg"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="contained" onClick={submit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} /> : undefined}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
            {submitError ? <Typography variant="body2" color="error">{submitError}</Typography> : null}
            {submitSuccess ? <Typography variant="body2" color="success.main">{submitSuccess}</Typography> : null}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

