'use client';

import React from 'react';
import NextLink from 'next/link';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { SettingsForm } from '@/features/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <Stack spacing={3}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h4">Settings</Typography>
        <Button
          component={NextLink}
          href="/settings/domains"
          variant="contained"
          sx={{
            bgcolor: '#000',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1,
            borderRadius: 1.5,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#111', boxShadow: 'none' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          Custom domains →
        </Button>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <SettingsForm />
      </Paper>
    </Stack>
  );
}

