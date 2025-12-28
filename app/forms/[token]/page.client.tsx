'use client';
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ClientWizard } from '@/features/clients/ClientWizard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
const resolvedApiBase = API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');

export default function IntakeFormPageClient({ token }: { token: string }) {
  const decodedToken = React.useMemo(() => {
    try { return decodeURIComponent(token); } catch { return token; }
  }, [token]);
  const [agency, setAgency] = React.useState<{ name?: string; email?: string; settings?: { primaryColor?: string; secondaryColor?: string; logoDataUrl?: string } }>({});
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

  async function submitPublic(payload: Record<string, any>) {
    if (!resolvedApiBase) throw new Error('API_BASE_URL is not configured');
    const res = await fetch(`${resolvedApiBase}/forms/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: decodedToken, form: payload }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Submit failed');
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 900, m: '32px auto', px: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            {agency?.settings?.logoDataUrl ? (
              <img src={agency.settings.logoDataUrl} alt="Agency Logo" style={{ height: 48, objectFit: 'contain' }} />
            ) : null}
            <Box>
              <Typography variant="h5" gutterBottom sx={{ m: 0 }}>{agency?.name || 'Athlete Intake'}</Typography>
              {submitSuccess ? <Typography color="success.main">{submitSuccess}</Typography> : null}
            </Box>
          </Box>
          <ClientWizard
            mode="create"
            initialClient={{}}
            publicMode
            publicSubmit={submitPublic}
            overrideAgencyEmail={agency?.email}
            onSubmitSuccess={() => setSubmitSuccess('Submitted! You may close this page.')}
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

