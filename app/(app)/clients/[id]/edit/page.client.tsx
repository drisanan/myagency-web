'use client';
import React from 'react';
import { getClients } from '@/services/clients';
import { Typography } from '@mui/material';
import { ClientWizard } from '@/features/clients/ClientWizard';

export function ClientEditClient({ id }: { id: string }) {
  const initialClient = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('clients_data');
      if (!raw) return null;
      const list = JSON.parse(raw) as any[];
      return list.find((c) => c.id === id) ?? null;
    } catch {
      return null;
    }
  }, [id]);

  const [client, setClient] = React.useState<any | null>(initialClient);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await getClients();
      const hit = all.find((c: any) => c.id === id);
      if (mounted) setClient(hit ?? initialClient ?? null);
    })();
    return () => {
      mounted = false;
    };
  }, [id, initialClient]);

  const base = client ?? { id, email: '', firstName: '', lastName: '', sport: '', agencyEmail: '' };
  return (
    <>
      <Typography variant="h4" gutterBottom>Edit Athlete</Typography>
      <ClientWizard initialClient={base} mode="edit" />
    </>
  );
}


