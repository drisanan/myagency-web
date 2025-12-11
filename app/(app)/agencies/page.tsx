'use client';
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import { getAgencies } from '@/services/agencies';
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { logImpersonationStart } from '@/services/audit';

export default function AgenciesPage() {
  const { session, setSession } = useSession();
  const router = useRouter();
  const [rows, setRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (session?.role !== 'parent') {
      router.push('/dashboard');
      return;
    }
    getAgencies().then(list => {
      setRows(list.map(a => ({ id: a.id, name: a.name, email: a.email, active: a.active ?? true })));
    });
  }, [session, router]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'active', headerName: 'Active', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => {
        const impersonate = () => {
          if (!session) return;
          const parent = session;
          // save base session to restore later
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('session_impersonation_base', JSON.stringify(parent));
          }
          logImpersonationStart(parent.email, params.row.email);
          setSession({ role: 'agency', email: params.row.email, agencyId: params.row.id, impersonatedBy: { email: parent.email, role: 'parent' } } as any);
          router.push('/dashboard');
        };
        return (
          <Button size="small" onClick={impersonate}>Impersonate</Button>
        );
      }
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Agencies</Typography>
        <Button data-testid="agencies-new" LinkComponent={Link} href="/agencies/new" variant="contained">New Agency</Button>
      </Box>
      <div style={{ height: 440, width: 800 }}>
        <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
      </div>
    </Box>
  );
}


