import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { useTasks } from './useTasks';
import { TaskStatus } from '@/services/tasks';
import { FaBell, FaEdit, FaTrash, FaUser, FaUserTie } from 'react-icons/fa';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import { listClientsByAgencyEmail } from '@/services/clients';
import { listAgents } from '@/services/agents';
import { MetricCard } from '@/app/(app)/dashboard/MetricCard';
import { IoCheckmarkCircleOutline, IoListOutline, IoTimerOutline } from 'react-icons/io5';

type Props = {
  assigneeClientId?: string | null;
};

type AssigneeType = 'none' | 'client' | 'agent';

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export function TasksPanel({ assigneeClientId }: Props) {
  const { session } = useSession();
  // Use agencyEmail if available (for agents), otherwise fall back to email (for agency owners)
  const agencyEmail = session?.agencyEmail || session?.email || '';
  const { tasks, query, createTask, updateTask, deleteTask } = useTasks(agencyEmail, assigneeClientId);
  
  // Fetch clients and agents
  const clientsQ = useQuery({
    queryKey: ['tasks-clients', agencyEmail],
    queryFn: () => listClientsByAgencyEmail(agencyEmail),
    enabled: Boolean(agencyEmail && !assigneeClientId),
  });
  
  const agentsQ = useQuery({
    queryKey: ['tasks-agents'],
    queryFn: () => listAgents(),
    enabled: Boolean(agencyEmail && !assigneeClientId),
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<TaskStatus>('todo');
  const [dueAt, setDueAt] = React.useState<string>('');
  const [assigneeType, setAssigneeType] = React.useState<AssigneeType>('none');
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string>('');
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const startNew = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setDueAt('');
    setAssigneeType('none');
    setSelectedAssigneeId('');
    setError('');
    setDialogOpen(true);
  };

  const startEdit = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setEditingId(id);
    setTitle(t.title);
    setDescription(t.description || '');
    setStatus(t.status);
    setDueAt(t.dueAt ? new Date(t.dueAt).toISOString().slice(0, 16) : '');
    
    // Determine assignee type and ID
    if (t.assigneeAgentId) {
      setAssigneeType('agent');
      setSelectedAssigneeId(t.assigneeAgentId);
    } else if (t.assigneeClientId || (t as any).athleteId) {
      setAssigneeType('client');
      setSelectedAssigneeId(t.assigneeClientId || (t as any).athleteId || '');
    } else {
      setAssigneeType('none');
      setSelectedAssigneeId('');
    }
    
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      const dueMs = dueAt ? new Date(dueAt).getTime() : undefined;
      
      // Determine assignee fields based on type
      const assigneeClientId_val = assigneeType === 'client' ? selectedAssigneeId : null;
      const assigneeAgentId_val = assigneeType === 'agent' ? selectedAssigneeId : null;
      
      if (editingId) {
        await updateTask({
          id: editingId,
          title: title.trim(),
          description,
          status,
          dueAt: dueMs,
          assigneeClientId: assigneeClientId_val,
          assigneeAgentId: assigneeAgentId_val,
        });
        setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
      } else {
        await createTask({
          title: title.trim(),
          description,
          status,
          dueAt: dueMs,
          assigneeClientId: assigneeClientId ?? assigneeClientId_val,
          assigneeAgentId: assigneeAgentId_val,
        });
        setSnackbar({ open: true, message: 'Task created successfully!', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to save task');
      setSnackbar({ open: true, message: e?.message || 'Failed to save task', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to delete task', severity: 'error' });
    }
  };

  // Build name lookup maps
  const clientNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (clientsQ.data || []).forEach((c: any) => {
      map[c.id] = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || c.id;
    });
    return map;
  }, [clientsQ.data]);
  
  const agentNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (agentsQ.data || []).forEach((a: any) => {
      map[a.id] = a.name || a.email || a.id;
    });
    return map;
  }, [agentsQ.data]);

  // Get assignee display name for a task
  const getAssigneeLabel = (t: any) => {
    if (t.assigneeAgentId && agentNameById[t.assigneeAgentId]) {
      return { name: agentNameById[t.assigneeAgentId], type: 'agent' as const };
    }
    if ((t.assigneeClientId || t.athleteId) && clientNameById[t.assigneeClientId || t.athleteId]) {
      return { name: clientNameById[t.assigneeClientId || t.athleteId], type: 'client' as const };
    }
    return null;
  };

  const tasksWithDueDates = tasks.filter((t) => t.dueAt);
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const completedOnTime = completedTasks.filter((t) => t.dueAt && t.updatedAt <= t.dueAt);
  const completionRate = tasksWithDueDates.length
    ? Math.round((completedOnTime.length / tasksWithDueDates.length) * 100)
    : 0;

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <MetricCard
          title="Total Tasks"
          value={query.isLoading ? '—' : tasks.length}
          icon={<IoListOutline size={20} />}
        />
        <MetricCard
          title="On-time Completion Rate"
          value={query.isLoading ? '—' : `${completionRate}%`}
          icon={<IoTimerOutline size={20} />}
        />
        <MetricCard
          title="Completed Tasks"
          value={query.isLoading ? '—' : completedTasks.length}
          icon={<IoCheckmarkCircleOutline size={20} />}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'divider' }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Create Task</Typography>
              <Button data-tour="create-task-btn" variant="contained" onClick={startNew}>
                Task +
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Create tasks for agents or athletes and track completion status.
            </Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Tasks Queue
          </Typography>
          {query.isLoading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} variant="rounded" height={88} />
              ))}
            </Stack>
          ) : tasks.length === 0 ? (
            <Typography color="text.secondary">No tasks yet.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {tasks.map((t) => {
                const assignee = getAssigneeLabel(t);
                return (
                  <Paper
                    key={t.id}
                    variant="outlined"
                    sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}
                    data-testid="task-item"
                  >
                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Chip size="small" label={statusOptions.find((s) => s.value === t.status)?.label || t.status} />
                        {t.dueAt ? (
                          <Chip
                            size="small"
                            color="warning"
                            label={`Due ${new Date(t.dueAt).toLocaleString()}`}
                          />
                        ) : null}
                        {assignee ? (
                          <Chip 
                            size="small" 
                            icon={assignee.type === 'agent' ? <FaUserTie /> : <FaUser />}
                            label={assignee.name}
                            color={assignee.type === 'agent' ? 'primary' : 'default'}
                            variant={assignee.type === 'agent' ? 'filled' : 'outlined'}
                          />
                        ) : null}
                      </Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {t.title}
                      </Typography>
                      {t.description ? (
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {t.description}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <IconButton aria-label="Edit task" onClick={() => startEdit(t.id)} size="small">
                        <FaEdit />
                      </IconButton>
                      <IconButton aria-label="Delete task" onClick={() => handleDelete(t.id)} size="small">
                        <FaTrash />
                      </IconButton>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit task' : 'Add task'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            size="small"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            size="small"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />
          
          {/* Assignee Type and Selection */}
          {!assigneeClientId && (
            <>
              <FormControl size="small" fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={assigneeType}
                  label="Assign To"
                  onChange={(e) => {
                    setAssigneeType(e.target.value as AssigneeType);
                    setSelectedAssigneeId('');
                  }}
                >
                  <MenuItem value="none">Unassigned</MenuItem>
                  <MenuItem value="client">Athlete/Client</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                </Select>
              </FormControl>
              
              {assigneeType === 'client' && (
                <TextField
                  size="small"
                  select
                  label="Select Athlete"
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {(clientsQ.data || []).map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              
              {assigneeType === 'agent' && (
                <TextField
                  size="small"
                  select
                  label="Select Agent"
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {(agentsQ.data || []).map((a: any) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name || a.email}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </>
          )}
          
          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {statusOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Due date/time"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}
