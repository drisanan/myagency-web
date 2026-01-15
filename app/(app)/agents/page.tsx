'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Typography, Button, Stack, Box, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Chip, FormControlLabel, Checkbox,
  Snackbar,
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
  const [form, setForm] = React.useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    role: '',
    phone: '',
    accessCode: '',
    isAdmin: false,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [agentToDelete, setAgentToDelete] = React.useState<Agent | null>(null);

  const { data: agents = [], isLoading, refetch } = useQuery({
    queryKey: ['agents'],
    queryFn: listAgents,
    enabled: Boolean(session?.email || session?.agencyEmail),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Parameters<typeof upsertAgent>[0]) => upsertAgent(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      handleCloseDialog();
      const isEdit = Boolean(variables.id);
      setSnackbar({ 
        open: true, 
        message: isEdit ? 'Agent updated successfully!' : 'Agent created successfully!', 
        severity: 'success' 
      });
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to save agent');
      setSnackbar({ open: true, message: err?.message || 'Failed to save agent', severity: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
      setSnackbar({ open: true, message: 'Agent deleted successfully!', severity: 'success' });
    },
    onError: (err: any) => {
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
      setSnackbar({ open: true, message: err?.message || 'Failed to delete agent', severity: 'error' });
    }
  });

  const handleOpenNew = () => {
    setEditingAgent(null);
    setForm({ firstName: '', lastName: '', email: '', role: '', phone: '', accessCode: '', isAdmin: false });
    setError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({ 
      firstName: agent.firstName, 
      lastName: agent.lastName, 
      email: agent.email, 
      role: agent.role || '',
      phone: agent.phone || '',
      accessCode: '', // Never pre-fill - leave blank to keep existing
      isAdmin: agent.isAdmin ?? false,
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
    // For new agents, require phone and access code for login
    if (!editingAgent && !form.phone) {
      setError('Phone number is required for new agents');
      return;
    }
    if (!editingAgent && !form.accessCode) {
      setError('Access code is required for new agents (used for login)');
      return;
    }
    saveMutation.mutate({
      ...(editingAgent?.id ? { id: editingAgent.id } : {}),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role || undefined,
      phone: form.phone || undefined,
      accessCode: form.accessCode || undefined, // Only sent if user entered one
      authEnabled: true, // Enable login for all agents
      isAdmin: form.isAdmin,
    });
  };

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (agentToDelete) {
      deleteMutation.mutate(agentToDelete.id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    { 
      field: 'authEnabled', 
      headerName: 'Can Login', 
      width: 100,
      renderCell: (params) => params.row.authEnabled ? '✓' : '—',
    },
    { 
      field: 'isAdmin', 
      headerName: 'Admin', 
      width: 80,
      renderCell: (params) => params.row.isAdmin ? '✓' : '—',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => handleOpenEdit(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDeleteClick(params.row)}>Delete</Button>
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

  if (!session?.email && !session?.agencyEmail) {
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

      {/* Show Agency Name/ID for agents to use when logging in */}
      {session?.agencyId && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Share one of these with your agents so they can log in:
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Agency Name:</strong> Set a friendly name in <a href="/settings" style={{ color: '#1976d2' }}>Settings</a>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
            <strong>Fallback ID:</strong> <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{session.agencyId}</code>
          </Typography>
        </Alert>
      )}

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
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              required={!editingAgent}
              fullWidth
              helperText="Required for agent login"
            />
            <TextField
              label="Access Code"
              type="password"
              value={form.accessCode}
              onChange={(e) => setForm(f => ({ ...f, accessCode: e.target.value }))}
              required={!editingAgent}
              fullWidth
              helperText={editingAgent ? 'Leave blank to keep current code' : 'Agent will use this to log in (like a PIN or password)'}
            />
            <TextField
              label="Role (optional)"
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="e.g., Recruiting Coordinator"
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isAdmin}
                  onChange={(e) => setForm(f => ({ ...f, isAdmin: e.target.checked }))}
                />
              }
              label="Grant Admin privileges (can manage other agents)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={saveMutation.isPending}
            startIcon={saveMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => { setDeleteDialogOpen(false); setAgentToDelete(null); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{agentToDelete?.firstName} {agentToDelete?.lastName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setAgentToDelete(null); }}>
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
