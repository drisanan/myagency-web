'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { SettingsForm } from '@/features/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <SettingsForm />
      </Paper>
    </Box>
  );
}

