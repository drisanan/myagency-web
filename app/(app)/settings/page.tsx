'use client';

import React from 'react';
import NextLink from 'next/link';
import { Box, Typography, Paper, Stack, Link as MuiLink } from '@mui/material';
import { SettingsForm } from '@/features/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <Stack spacing={3}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h4">Settings</Typography>
        <MuiLink component={NextLink} href="/settings/domains" underline="hover">
          Custom domains →
        </MuiLink>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <SettingsForm />
      </Paper>
    </Stack>
  );
}

