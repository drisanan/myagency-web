'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { TasksPanel } from '@/features/tasks/TasksPanel';

export default function TasksPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <TasksPanel />
    </Box>
  );
}


