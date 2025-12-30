'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { TasksPanel } from '@/features/tasks/TasksPanel';
import { useTour } from '@/features/tour/TourProvider';
import { tasksSteps } from '@/features/tour/tasksSteps';
import { useSession } from '@/features/auth/session';

export default function TasksPage() {
  const { session, loading } = useSession();
  const { startTour } = useTour();

  React.useEffect(() => {
    if (!loading && session) startTour('tasks', tasksSteps);
  }, [loading, session, startTour]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <Box data-tour="tasks-list">
        <TasksPanel />
      </Box>
    </Box>
  );
}


