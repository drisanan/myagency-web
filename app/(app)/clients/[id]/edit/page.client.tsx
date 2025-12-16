'use client';
import React from 'react';
import { getClients } from '@/services/clients';
import { Typography } from '@mui/material';
import { ClientWizard } from '@/features/clients/ClientWizard';

export function ClientEditClient({ id }: { id: string }) {
  const [client, setClient] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await getClients();
      const hit = all.find((c: any) => c.id === id);
      if (mounted) setClient(hit ?? null);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const base = client ?? { id, email: '', firstName: '', lastName: '', sport: '', agencyEmail: '' };
  return (
    <>
      <Typography variant="h4" gutterBottom>Edit Athlete</Typography>
      <ClientWizard initialClient={base} mode="edit" />
    </>
  );
}


