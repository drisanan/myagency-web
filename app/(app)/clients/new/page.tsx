'use client';
import React from 'react';
import { ClientWizard } from '@/features/clients/ClientWizard';
import { Typography } from '@mui/material';

export default function NewClientPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>New Client</Typography>
      <ClientWizard />
    </>
  );
}


