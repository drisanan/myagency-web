'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Typography, Button, Stack, Box, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { useSession } from '@/features/auth/session';
import { listAgents, upsertAgent, deleteAgent, Agent } from '@/services/agents';
import { SubscriptionQuota, useCanAddAthlete } from '@/features/settings/SubscriptionQuota';

export default function AgentsPage() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();
  const { canAdd, isAtLimit } = useCanAddAthlete();
  
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', role: '' });
  const [error, setError] = React.useState<string | null>(null);

  const { data: agents = [], isLoading, refetch } = useQuery({
    queryKey: ['agents'],
    queryFn: listAgents,
    enabled: Boolean(session?.email),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Parameters<typeof upsertAgent>[0]) => upsertAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      handleCloseDialog();
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to save agent');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  const handleOpenNew = () => {
    setEditingAgent(null);
    setForm({ firstName: '', lastName: '', email: '', role: '' });
    setError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({ 
      firstName: agent.firstName, 
      lastName: agent.lastName, 
      email: agent.email, 
      role: agent.role || '' 
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAgent(null);
    setError(null);
  };

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setError('First name, last name, and email are required');
      return;
    }
    saveMutation.mutate({
      ...(editingAgent?.id ? { id: editingAgent.id } : {}),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role || undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => handleOpenEdit(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </Stack>
      ),
    },
  ];

  if (loading || isLoading) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        <CircularProgress size={24} />
        <Typography>Loading agents…</Typography>
      </Stack>
    );
  }

  if (!session?.email) {
    return (
      <Stack spacing={2} sx={{ py: 4 }}>
        <Typography>Please log in to view agents.</Typography>
        <Button LinkComponent={Link} href="/auth/login" variant="outlined">Go to Login</Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4">Agents</Typography>
          <SubscriptionQuota compact showUpgradeButton={false} />
        </Stack>
        <Button 
          variant="contained" 
          onClick={handleOpenNew}
          disabled={isAtLimit}
          title={isAtLimit ? 'Upgrade to add more users' : 'Add new agent'}
        >
          {isAtLimit ? 'Limit Reached' : 'New Agent'}
        </Button>
      </Stack>

      {isAtLimit && (
        <SubscriptionQuota showUpgradeButton />
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid 
          rows={agents} 
          columns={columns} 
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAgent ? 'Edit Agent' : 'New Agent'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Role (optional)"
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="e.g., Recruiting Coordinator"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
