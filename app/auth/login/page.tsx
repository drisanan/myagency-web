'use client';
import React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { login } from '@/features/auth/service';
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Paper } from '@mui/material';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';

export default function LoginPage() {
  const { setSession } = useSession();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const onSubmit = async (creds: { email: string; phone: string; accessCode: string }) => {
    try {
      setError(null);
      const s = await login(creds);
      setSession(s);
      router.push('/dashboard');
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


