'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ClientRecruiterWizard } from '@/features/recruiter/ClientRecruiterWizard';

export default function ClientRecruiterPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Send Recruiting Emails
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select a coach from your assigned lists and send a personalized introduction email.
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <ClientRecruiterWizard />
      </Paper>
    </Box>
  );
}

