'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { MeetingsPanel } from '@/features/meetings';

export default function ClientMeetingsPage() {
  const { session } = useSession();
  const clientId = session?.clientId || '';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Meetings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Schedule meetings with your agent to discuss your recruiting progress.
      </Typography>
      
      <MeetingsPanel clientId={clientId} isAthlete />
    </Box>
  );
}
