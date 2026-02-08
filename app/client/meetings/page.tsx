'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { MeetingsPanel } from '@/features/meetings';
import { colors } from '@/theme/colors';

export default function ClientMeetingsPage() {
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
        My Meetings
      </Typography>
      <Typography variant="body1" sx={{ color: '#0A0A0A80', mb: 3 }}>
        Schedule meetings with your agent to discuss your recruiting progress.
      </Typography>

      <MeetingsPanel clientId={clientId} isAthlete />
    </Box>
  );
}
