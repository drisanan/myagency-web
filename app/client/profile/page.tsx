'use client';

import React from 'react';
import { Box, Typography, Stack, Alert } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { getClient } from '@/services/clients';
import { ClientWizard } from '@/features/clients/ClientWizard';
import { colors, gradients } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';

export default function ClientProfilePage() {
  const { session, loading } = useSession();
  const clientId = session?.clientId || '';
  const [client, setClient] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingClient, setLoadingClient] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const fetchClient = React.useCallback(async () => {
    if (!clientId) return;
    setLoadingClient(true);
    setError(null);
    try {
      const data = await getClient(clientId);
      setClient(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile.');
    } finally {
      setLoadingClient(false);
    }
  }, [clientId]);

  React.useEffect(() => {
    if (!clientId) return;
    fetchClient();
  }, [clientId, fetchClient]);

  if (loading || loadingClient) {
    return <LoadingState message="Loading profile..." />;
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  if (!client) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">Profile not found.</Alert>
      </Stack>
    );
  }

  const initialClient = {
    ...client,
    agencyEmail: client?.agencyEmail || session?.agencyEmail || session?.email,
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 1,
        }}
      >
        Edit Profile
      </Typography>
      <Typography variant="body1" sx={{ color: '#0A0A0A80', mb: 3 }}>
        Keep your profile up to date so coaches can discover you.
      </Typography>
      <Box
        sx={{
          borderRadius: 0,
          clipPath:
            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          bgcolor: colors.white,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'none',
          transition: 'box-shadow 0.25s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '3px',
            background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
            zIndex: 1,
          },
          '&:hover': {
            boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
          },
          p: 3,
        }}
      >
        <ClientWizard
          key={refreshKey}
          initialClient={initialClient}
          mode="edit"
          redirectOnSave={false}
          onSaved={() => {
            fetchClient();
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </Box>
    </Box>
  );
}
