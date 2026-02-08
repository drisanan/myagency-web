'use client';

import React from 'react';
import { Box, Typography, Chip, Button, Stack } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { listTasks, updateTask, Task } from '@/services/tasks';
import { useTour } from '@/features/tour/TourProvider';
import { clientTasksSteps } from '@/features/tour/clientSteps';
import { colors, gradients } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

const statusColor: Record<string, string> = {
  todo: '#64748B',
  'in-progress': '#F59E0B',
  done: '#10B981',
};

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
    return <LoadingState message="Loading tasks..." />;
  }

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 3,
        }}
      >
        Tasks
      </Typography>

      {/* Task card */}
      <Box
        sx={{
          borderRadius: 0,
          clipPath:
            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          bgcolor: colors.white,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'none',
          transition: 'box-shadow 0.25s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '3px',
            background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
            zIndex: 1,
          },
          '&:hover': {
            boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: gradients.darkCard,
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IoCheckmarkCircleOutline color={colors.lime} size={18} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.8rem',
              color: colors.white,
            }}
          >
            Your Tasks
          </Typography>
          <Chip
            label={`${openTasks.length} open`}
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: `${colors.lime}20`,
              color: colors.lime,
              fontWeight: 700,
              fontSize: 11,
              height: 22,
            }}
          />
        </Box>

        <Box sx={{ px: 3, py: 2 }} data-tour="client-tasks-list">
          {fetching && <LoadingState message="Loading tasks..." />}
          {error && (
            <Typography sx={{ color: colors.error, fontSize: 13, mb: 1 }}>
              {error}
            </Typography>
          )}
          {!fetching && tasks.length === 0 && (
            <Typography sx={{ color: '#0A0A0A60' }}>No tasks assigned to you yet.</Typography>
          )}
          <Stack spacing={0}>
            {openTasks.map((t, i) => (
              <Box
                key={t.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderBottom: i < openTasks.length - 1 || doneTasks.length > 0 ? '1px solid #F0F0F0' : 'none',
                  transition: 'background 0.15s ease',
                  '&:hover': { bgcolor: `${colors.lime}06` },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0A0A0A60' }}>
                    {t.dueAt ? `Due ${new Date(t.dueAt).toLocaleString()}` : 'No due date'}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={t.status || 'todo'}
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    bgcolor: `${statusColor[t.status] || '#64748B'}15`,
                    color: statusColor[t.status] || '#64748B',
                  }}
                />
                <Button
                  size="small"
                  onClick={() => markDone(t.id)}
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: colors.black,
                    bgcolor: colors.lime,
                    borderRadius: 0,
                    px: 1.5,
                    minWidth: 'auto',
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                    '&:hover': { bgcolor: '#B8E600' },
                  }}
                >
                  Done
                </Button>
              </Box>
            ))}
            {doneTasks.map((t, i) => (
              <Box
                key={t.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderBottom: i < doneTasks.length - 1 ? '1px solid #F0F0F0' : 'none',
                  opacity: 0.6,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, textDecoration: 'line-through' }}
                  >
                    {t.title}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label="done"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    bgcolor: '#10B98115',
                    color: '#10B981',
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
