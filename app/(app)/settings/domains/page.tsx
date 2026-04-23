'use client';

import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { DomainWizard } from '@/features/whitelabel/DomainWizard';
import { DomainStatusBoard } from '@/features/whitelabel/DomainStatusBoard';

export default function DomainsSettingsPage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Custom domains
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect your own domain to run the white-label landing page. You keep
          control of your DNS; we provision the certificate and serve over HTTPS.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Add a domain
        </Typography>
        <DomainWizard />
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Attached domains
        </Typography>
        <DomainStatusBoard />
      </Box>
    </Stack>
  );
}
