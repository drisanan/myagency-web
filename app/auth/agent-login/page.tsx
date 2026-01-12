'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { agentLogin } from '@/features/auth/service';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';

export default function AgentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Agency ID can be passed via URL or entered manually
  const [agencyId, setAgencyId] = React.useState(searchParams.get('agencyId') || '');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [accessCode, setAccessCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      
      const result = await agentLogin({ agencyId, email, phone, accessCode });
      
      if (!result.ok) {
        setError(result.error || 'Login failed');
        return;
      }
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={600}>
                Agent Login
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sign in with your agency credentials
              </Typography>
            </Box>

            <form onSubmit={submit}>
              <Stack spacing={2}>
                <TextField
                  label="Agency ID"
                  value={agencyId}
                  onChange={(e) => setAgencyId(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  placeholder="Your agency's ID"
                  helperText="Provided by your agency administrator"
                />
                
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  autoComplete="email"
                />
                
                <TextField
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  placeholder="Your phone number"
                  autoComplete="tel"
                />
                
                <TextField
                  label="Access Code"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  autoComplete="current-password"
                />

                {error && (
                  <Alert severity="error" sx={{ py: 0.5 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Stack>
            </form>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              Contact your agency administrator if you need login credentials.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
