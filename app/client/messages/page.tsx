'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { CommunicationsPanel } from '@/features/communications';

export default function ClientMessagesPage() {
  const { session } = useSession();
  const clientId = session?.clientId || '';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Messages
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Communicate with your agent about your recruiting journey.
      </Typography>
      
      <CommunicationsPanel athleteId={clientId} defaultType="athlete_to_agent" isAthlete={true} />
    </Box>
  );
}
