'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { EmailDripsPanel } from '@/features/emailDrips';

export default function EmailDripsPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Email Drips</Typography>
      <EmailDripsPanel />
    </Box>
  );
}
