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
} from '@mui/material';
import { useTasks } from './useTasks';
import { TaskStatus } from '@/services/tasks';
import { FaBell, FaEdit, FaTrash } from 'react-icons/fa';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import { listClientsByAgencyEmail } from '@/services/clients';

type Props = {
  assigneeClientId?: string | null;
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export function TasksPanel({ assigneeClientId }: Props) {
  const { session } = useSession();
  const agencyEmail = session?.email || '';
  const { tasks, query, createTask, updateTask, deleteTask } = useTasks(agencyEmail, assigneeClientId);
  const clientsQ = useQuery({
    queryKey: ['tasks-clients', agencyEmail],
    queryFn: () => listClientsByAgencyEmail(agencyEmail),
    enabled: Boolean(agencyEmail && !assigneeClientId),
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<TaskStatus>('todo');
  const [dueAt, setDueAt] = React.useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string>('');
  const [error, setError] = React.useState('');

  const startNew = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setDueAt('');
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
    setSelectedAssigneeId((t as any).assigneeClientId || t.athleteId || '');
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const dueMs = dueAt ? new Date(dueAt).getTime() : undefined;
    if (editingId) {
      await updateTask({
        id: editingId,
        title: title.trim(),
        description,
        status,
        dueAt: dueMs,
        assigneeClientId: selectedAssigneeId || assigneeClientId || null,
      });
    } else {
      await createTask({
        title: title.trim(),
        description,
        status,
        dueAt: dueMs,
        assigneeClientId: (assigneeClientId ?? selectedAssigneeId) || null,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
  };

  const athleteNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (clientsQ.data || []).forEach((c: any) => {
      map[c.id] = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.id;
    });
    return map;
  }, [clientsQ.data]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Tasks</Typography>
        <Button variant="contained" onClick={startNew} startIcon={<FaBell />}>
          Add task
        </Button>
      </Stack>

      {query.isLoading ? (
        <Typography>Loading...</Typography>
      ) : tasks.length === 0 ? (
        <Typography color="text.secondary">No tasks yet.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {tasks.map((t) => (
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
                  {((t as any).assigneeClientId || t.athleteId) && athleteNameById[(t as any).assigneeClientId || t.athleteId] ? (
                    <Chip size="small" label={athleteNameById[(t as any).assigneeClientId || t.athleteId]} />
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
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit task' : 'Add task'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />
          {!assigneeClientId ? (
            <TextField
              select
              label="Assign athlete (optional)"
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {(clientsQ.data || []).map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
          <TextField
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
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


