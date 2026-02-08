'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { CommunicationsPanel } from '@/features/communications';
import { colors } from '@/theme/colors';

export default function ClientMessagesPage() {
  const { session } = useSession();
  const clientId = session?.clientId || '';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 1,
        }}
      >
        Messages
      </Typography>
      <Typography variant="body1" sx={{ color: '#0A0A0A80', mb: 3 }}>
        Communicate with your agent about your recruiting journey.
      </Typography>

      <CommunicationsPanel athleteId={clientId} defaultType="athlete_to_agent" isAthlete={true} />
    </Box>
  );
}
