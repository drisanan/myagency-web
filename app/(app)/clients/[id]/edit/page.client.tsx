'use client';
import React from 'react';
import { getClients } from '@/services/clients';
import { Typography, CircularProgress, Stack, Button } from '@mui/material';
import Link from 'next/link';
import { ClientWizard } from '@/features/clients/ClientWizard';
import { useSession } from '@/features/auth/session';

export function ClientEditClient({ id }: { id: string }) {
  const { session, loading } = useSession();
  const [client, setClient] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Helper to safely get the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  React.useEffect(() => {
    let mounted = true;
    setError(null);

    // 1. Wait for session to load
    if (loading) return; 

    // 2. Check for email using the corrected property
    if (!userEmail) {
      if (mounted) setError('Please log in to edit this client.');
      return;
    }

    // 3. Fetch Client Data
    (async () => {
      try {
        // Optimization: Ideally, you should have a getClientById(id) service 
        // instead of fetching ALL clients, but this works for now.
        const all = await getClients();
        const hit = all.find((c: any) => c.id === id);
        
        if (mounted) {
            if (hit) {
                setClient(hit);
            } else {
                setError('Client not found.');
            }
        }
      } catch (err) {
        console.error('getClients failed', err);
        if (mounted) setError('Unable to load client. Please try again.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, userEmail, loading]);

  // Loading State
  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
        <CircularProgress size={24} />
        <Typography>Verifying session…</Typography>
      </Stack>
    );
  }

  // Error State (Logged Out or Fetch Failed)
  if (error) {
    return (
      <Stack spacing={2} sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        {!userEmail && (
            <Button LinkComponent={Link} href="/login" variant="outlined">
                Go to Login
            </Button>
        )}
      </Stack>
    );
  }

  // Not Found State
  if (!client && !loading) return <Typography>Athlete not found</Typography>;

  // Success State
  // Ensure we pass the correct email property back into the form if needed
  const base = client ?? { 
      id, 
      email: '', 
      firstName: '', 
      lastName: '', 
      sport: '', 
      agencyEmail: userEmail 
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Edit Athlete</Typography>
      <ClientWizard initialClient={base} mode="edit" />
    </>
  );
}