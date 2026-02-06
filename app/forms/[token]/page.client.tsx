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
    const primary = agency?.settings?.primaryColor || '#0A0A0A';
    const secondary = agency?.settings?.secondaryColor || '#CCFF00';
    return createTheme({
      palette: {
        primary: { main: primary },
        secondary: { main: secondary },
      },
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

