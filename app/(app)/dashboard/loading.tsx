import React from 'react';
import { Typography } from '@mui/material';
import { LoadingState } from '@/components/LoadingState';

export default function Loading() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <LoadingState message="Loading dashboard..." />
    </>
  );
}
