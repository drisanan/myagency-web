'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listClientsByAgencyEmail, deleteClient, getGmailStatus, refreshGmailToken } from '@/services/clients';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Stack, Box, Typography, Avatar, Paper, Chip, CircularProgress } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { useImpersonation } from '@/hooks/useImpersonation';

function GmailStatusCell({ clientId }: { clientId: string }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['gmail-status', clientId],
    queryFn: () => getGmailStatus(clientId),
    staleTime: 60_000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGmailToken(clientId);
      queryClient.invalidateQueries({ queryKey: ['gmail-status', clientId] });
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) return <CircularProgress size={16} />;

  if (!status?.connected) {
    return <Chip label="Not Connected" size="small" color="default" />;
  }

  if (status.expired && status.canRefresh) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label="Expired" size="small" color="warning" />
        <Button 
          size="small" 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          {refreshing ? '...' : 'Refresh'}
        </Button>
      </Stack>
    );
  }

  return <Chip label="Connected" size="small" color="success" />;
}

export function ClientsList() {
  const { session } = useSession();
  const { impersonateClient, isImpersonating } = useImpersonation();
  
  // FIX: Check for agencyEmail OR email so it works with your API response
  const agencyEmail = session?.agencyEmail || session?.email || '';
  const canImpersonate = session?.role === 'agency' && !isImpersonating;

  const { data = [], refetch } = useQuery({
    queryKey: ['clients', agencyEmail],
    queryFn: () => agencyEmail ? listClientsByAgencyEmail(agencyEmail) : [],
    enabled: Boolean(agencyEmail), // Now true, so the fetch happens!
  });

  const cols: GridColDef[] = [
    {
      field: 'athlete',
      headerName: 'Athlete',
      flex: 1.0,
      sortable: false,
      renderCell: (params) => {
        const row = params.row as any;
        const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Unknown';
        const description = row?.description || row?.radar?.description || 'No description provided';
        const photo = row?.photoUrl || row?.profileImageUrl || '/marketing/an-logo.png';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, height: '100%' }}>
            <Avatar
              src={photo}
              alt={name}
              sx={{ width: 40, height: 40, borderRadius: '50%' }}
            />
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }} noWrap>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {description}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    { field: 'email', headerName: 'Email', flex: 0.5 },
    { field: 'sport', headerName: 'Sport', width: 120 },
    {
      field: 'gmail',
      headerName: 'Gmail',
      width: 160,
      sortable: false,
      renderCell: (params) => <GmailStatusCell clientId={params.row.id} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" href={`/clients/${p.row.id}`}>View</Button>
          <Button size="small" href={`/clients/${p.row.id}/edit`}>Edit</Button>
          <Button size="small" color="error" onClick={async ()=>{ await deleteClient(p.row.id); refetch(); }}>Delete</Button>
          {canImpersonate && (
            <Button 
              size="small" 
              color="secondary"
              onClick={() => impersonateClient({
                id: p.row.id,
                email: p.row.email,
                firstName: p.row.firstName,
                lastName: p.row.lastName,
              })}
            >
              Impersonate
            </Button>
          )}
        </Stack>
      )
    }
  ];
  return (
    <Paper sx={{ height: 520, width: '100%', borderRadius: 2.5, overflow: 'auto' }}>
      <DataGrid
        rows={data as any[]}
        columns={cols}
        getRowId={(r)=>r.id}
        disableRowSelectionOnClick
        sx={{
          minWidth: 900,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f9fafb',
            borderBottom: 'none',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: 'none',
          },
        }}
      />
    </Paper>
  );
}
