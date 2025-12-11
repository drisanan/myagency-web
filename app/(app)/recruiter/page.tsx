'use client';
import React from 'react';
import { Typography } from '@mui/material';
import { RecruiterWizard } from '@/features/recruiter/RecruiterWizard';

export default function RecruiterBackofficePage() {
  return (
    <main style={{ padding: 24 }}>
      <Typography variant="h4" gutterBottom>Recruiter</Typography>
      <RecruiterWizard />
    </main>
  );
}


