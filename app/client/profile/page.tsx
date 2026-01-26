'use client';

import React from 'react';
import { Box, Typography, Paper, CircularProgress, Stack, Alert } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { getClient } from '@/services/clients';
import { ClientWizard } from '@/features/clients/ClientWizard';

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
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
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Keep your profile up to date so coaches can discover you.
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
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
      </Paper>
    </Box>
  );
}
