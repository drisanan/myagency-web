'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listClientsByAgencyEmail, deleteClient } from '@/services/clients';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Stack, Box, Typography, Avatar, Paper } from '@mui/material';
import { useSession } from '@/features/auth/session';

export function ClientsList() {
  const { session } = useSession();
  const agencyEmail = session?.email || '';
  const { data = [], refetch } = useQuery({
    queryKey: ['clients', agencyEmail],
    queryFn: () => agencyEmail ? listClientsByAgencyEmail(agencyEmail) : [],
    enabled: Boolean(agencyEmail),
  });
  const cols: GridColDef[] = [
    {
      field: 'athlete',
      headerName: 'Athlete',
      flex: 1.4,
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
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'sport', headerName: 'Sport', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" href={`/clients/${p.row.id}`}>View</Button>
          <Button size="small" href={`/clients/${p.row.id}/edit`}>Edit</Button>
          <Button size="small" color="error" onClick={async ()=>{ await deleteClient(p.row.id); refetch(); }}>Delete</Button>
        </Stack>
      )
    }
  ];
  return (
    <Paper sx={{ height: 520, width: '100%', borderRadius: 2.5, overflow: 'hidden' }}>
      <DataGrid
        rows={data as any[]}
        columns={cols}
        getRowId={(r)=>r.id}
        disableRowSelectionOnClick
        sx={{
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


