'use client';
import React from 'react';
import { getClients } from '@/services/clients';
import { Typography } from '@mui/material';
import { ClientWizard } from '@/features/clients/ClientWizard';
import { useSession } from '@/features/auth/session';

export function ClientEditClient({ id }: { id: string }) {
  const { session, loading } = useSession();
  const [client, setClient] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setError(null);
    if (loading) return; // wait for session hydration
    if (!session?.email) {
      if (mounted) setError('Please log in to edit this client.');
      return;
    }
    (async () => {
      try {
        const all = await getClients();
        const hit = all.find((c: any) => c.id === id);
        if (mounted) setClient(hit ?? null);
      } catch (err) {
        console.error('getClients failed', err);
        if (mounted) setError('Unable to load client. Please ensure you are logged in.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, session?.email, loading]);

  if (loading) return <Typography>Verifying session…</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!client) return <Typography>Athlete not found</Typography>;

  const base = client ?? { id, email: '', firstName: '', lastName: '', sport: '', agencyEmail: '' };
  return (
    <>
      <Typography variant="h4" gutterBottom>Edit Athlete</Typography>
      <ClientWizard initialClient={base} mode="edit" />
    </>
  );
}


