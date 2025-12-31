'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ProfileForm } from '@/features/settings/ProfileForm';

export default function ProfilePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <ProfileForm />
      </Paper>
    </Box>
  );
}
