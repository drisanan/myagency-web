'use client';

import React from 'react';
import { Box, Stack, LinearProgress, Typography } from '@mui/material';
import { colors, gradients } from '@/theme/colors';

type LoadingStateProps = {
  message?: string;
};

/**
 * Standardized loading state used across all pages.
 * Nike-inspired angular progress indicator with gradient bar.
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
      {/* Angular progress container */}
      <Box
        sx={{
          width: 140,
          mb: 2,
          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        }}
      >
        <LinearProgress
          sx={{
            height: 5,
            bgcolor: '#E0E0E0',
            borderRadius: 0,
            '& .MuiLinearProgress-bar': {
              background: gradients.limeButton,
              borderRadius: 0,
            },
          }}
        />
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: '#0A0A0A99',
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}
      >
        {message}
      </Typography>
    </Stack>
  );
}
