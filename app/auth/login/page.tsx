'use client';
import React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { login, agentLogin } from '@/features/auth/service';
import { clientLogin } from '@/services/clientAuth';
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Paper, TextField } from '@mui/material';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';

export default function LoginPage() {
  const { setSession } = useSession();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'agency' | 'agent' | 'client'>('agency');
  const [agencyName, setAgencyName] = React.useState(''); // For agent login (slug or UUID)

  const onSubmit = async (creds: { email: string; phone: string; accessCode: string }) => {
    try {
      setError(null);
      if (mode === 'agency') {
        const s = await login(creds);
        setSession(s);
        router.push('/dashboard');
      } else if (mode === 'agent') {
        // Agent login requires agency name or ID
        if (!agencyName.trim()) {
          setError('Agency name is required for agent login');
          return;
        }
        // Determine if it's a UUID or a friendly slug
        const trimmed = agencyName.trim();
        const isUuid = trimmed.startsWith('agency-');
        const result = await agentLogin({ 
          ...(isUuid ? { agencyId: trimmed } : { agencySlug: trimmed.toLowerCase() }),
          email: creds.email, 
          phone: creds.phone, 
          accessCode: creds.accessCode 
        });
        if (!result.ok) {
          setError(result.error || 'Agent login failed');
          return;
        }
        // Session cookie is set by the API, refresh session context
        setSession({ 
          email: creds.email, 
          role: 'agent', 
          agentId: result.agent?.id,
          firstName: result.agent?.firstName,
          lastName: result.agent?.lastName,
        } as any);
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
              {(['agency', 'agent', 'client'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: mode === m ? '2px solid #1976d2' : '1px solid #ccc',
                    background: mode === m ? '#e3f2fd' : '#f7f7f7',
                    cursor: 'pointer',
                    fontWeight: mode === m ? 600 : 400,
                  }}
                >
                  {m === 'client' ? 'Athlete' : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </Box>
            
            {/* Agency Name field - only shown for agent login */}
            {mode === 'agent' && (
              <TextField
                label="Agency Name"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                fullWidth
                required
                size="small"
                sx={{ mb: 2 }}
                placeholder="e.g., myrecruiteragency"
                helperText="The friendly name your agency set up (ask your admin)"
              />
            )}
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


