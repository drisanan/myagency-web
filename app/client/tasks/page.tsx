'use client';

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, Button, CircularProgress, Paper } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { listTasks, updateTask, Task } from '@/services/tasks';
import { useTour } from '@/features/tour/TourProvider';
import { clientTasksSteps } from '@/features/tour/clientSteps';

export default function ClientTasksPage() {
  const { session, loading } = useSession();
  const { startTour } = useTour();

  React.useEffect(() => {
    if (!loading && session?.role === 'client') startTour('client-tasks', clientTasksSteps);
  }, [loading, session, startTour]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!session || session.role !== 'client') return;
    setFetching(true);
    setError(null);
    try {
      const data = await listTasks({});
      setTasks(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tasks');
    } finally {
      setFetching(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (!loading && session?.role === 'client') {
      load();
    }
  }, [loading, session?.role, load]);

  const markDone = async (id: string) => {
    try {
      await updateTask(id, { status: 'done' });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'done' } : t)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update task');
    }
  };

  if (loading || (session && session.role !== 'client')) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        {fetching && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Loading tasks…</Typography>
          </Box>
        )}
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        {!fetching && tasks.length === 0 && (
          <Typography color="text.secondary">No tasks assigned to you yet.</Typography>
        )}
        <List data-tour="client-tasks-list">
          {tasks.map((t) => (
            <ListItem key={t.id} divider alignItems="flex-start">
              <ListItemText
                primary={t.title}
                secondary={t.dueAt ? `Due ${new Date(t.dueAt).toLocaleString()}` : 'No due date'}
              />
              <Chip size="small" label={t.status || 'open'} sx={{ mr: 1 }} />
              {t.status !== 'done' && (
                <Button size="small" onClick={() => markDone(t.id)}>
                  Mark done
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

