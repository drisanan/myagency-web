'use client';
import React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { login, agentLogin } from '@/features/auth/service';
import { clientLogin } from '@/services/clientAuth';
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Paper, TextField } from '@mui/material';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';
import { colors, gradients } from '@/theme/colors';

export default function LoginPage() {
  const { setSession } = useSession();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'agency' | 'agent' | 'client'>('agency');
  const [agencyName, setAgencyName] = React.useState('');

  const onSubmit = async (creds: { email: string; phone: string; accessCode: string }) => {
    try {
      setError(null);
      if (mode === 'agency') {
        const s = await login(creds);
        setSession(s);
        router.push('/dashboard');
      } else if (mode === 'agent') {
        if (!agencyName.trim()) {
          setError('Agency name is required for agent login');
          return;
        }
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
          background: gradients.loginBg,
          color: colors.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          // Diagonal speed-line pattern overlay
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: gradients.speedLines,
            pointerEvents: 'none',
            zIndex: 0,
          },
          // Dramatic corner glow
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            background: `radial-gradient(ellipse, ${colors.lime}0A 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Paper
            data-testid="login-card"
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 0,
              // Angular Nike clip-path
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
              background: 'linear-gradient(135deg, #0A0A0A 0%, #111111 100%)',
              color: colors.white,
              border: 'none',
              width: '100%',
              maxWidth: 420,
              position: 'relative',
              // Top accent line
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: '20px',
                height: '3px',
                background: gradients.limeButton,
              },
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: colors.white }}>
              Sign in
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {(['agency', 'agent', 'client'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                    if (m !== 'agent') setAgencyName('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 0,
                    border: mode === m ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    background: mode === m
                      ? 'linear-gradient(135deg, #CCFF00 0%, #B8E600 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: mode === m ? '#0A0A0A' : '#FFFFFF',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    transition: 'all 0.2s ease',
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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: colors.white,
                    '& fieldset': { borderColor: '#FFFFFF30' },
                    '&:hover fieldset': { borderColor: '#FFFFFF50' },
                    '&.Mui-focused fieldset': { borderColor: colors.lime },
                  },
                  '& .MuiInputLabel-root': { color: '#FFFFFF80' },
                  '& .MuiInputLabel-root.Mui-focused': { color: colors.lime },
                }}
                placeholder="e.g., myrecruiteragency"
                helperText="The friendly name your agency set up (ask your admin)"
                FormHelperTextProps={{ sx: { color: '#FFFFFF60' } }}
              />
            )}
            {error ? (
              <Typography sx={{ mb: 2, color: colors.error }}>
                {error}
              </Typography>
            ) : null}
            <LoginForm key={mode} onSubmit={onSubmit} darkMode />
          </Paper>
        </Container>
      </Box>
    </>
  );
}
