'use client';
import React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { login } from '@/features/auth/service';
import { clientLogin } from '@/services/clientAuth';
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Paper } from '@mui/material';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';

export default function LoginPage() {
  const { setSession } = useSession();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'agency' | 'client'>('agency');

  const onSubmit = async (creds: { email: string; phone: string; accessCode: string }) => {
    try {
      setError(null);
      if (mode === 'agency') {
        const s = await login(creds);
        setSession(s);
        router.push('/dashboard');
      } else {
        await clientLogin({ email: creds.email, phone: creds.phone, accessCode: creds.accessCode });
        // refresh session via clientLogin: assume session cookie set
        setSession({ email: creds.email, role: 'client', clientId: undefined } as any);
        router.push('/client/lists');
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    }
  };
  return (
    <>
      <MarketingHeader />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#121212',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            data-testid="login-card"
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: '#fff',
              color: 'inherit',
              width: '100%',
              maxWidth: 420,
            }}
          >
            <Typography variant="h4" gutterBottom color="text.primary">
              Sign in
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <button
                onClick={() => setMode('agency')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: mode === 'agency' ? '2px solid #1976d2' : '1px solid #ccc',
                  background: mode === 'agency' ? '#e3f2fd' : '#f7f7f7',
                  cursor: 'pointer',
                }}
              >
                Agency
              </button>
              <button
                onClick={() => setMode('client')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: mode === 'client' ? '2px solid #1976d2' : '1px solid #ccc',
                  background: mode === 'client' ? '#e3f2fd' : '#f7f7f7',
                  cursor: 'pointer',
                }}
              >
                Athlete
              </button>
            </Box>
            {error ? (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            ) : null}
            <LoginForm onSubmit={onSubmit} />
          </Paper>
        </Container>
      </Box>
    </>
  );
}


