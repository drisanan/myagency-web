'use client';

import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { colors } from '@/theme/colors';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

/**
 * Standardized error state used across all pages.
 * Nike-inspired angular error card with gradient accent.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
      {/* Angular error badge */}
      <Box
        sx={{
          px: 3,
          py: 0.5,
          mb: 2,
          background: `linear-gradient(135deg, ${colors.error} 0%, #CC2F2F 100%)`,
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: colors.white, fontWeight: 700, letterSpacing: '0.1em' }}
        >
          ERROR
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color: colors.error, mb: 1 }}>
        Something went wrong
      </Typography>
      <Typography variant="body2" sx={{ color: '#0A0A0A99', mb: 2, textAlign: 'center', maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" color="error" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Stack>
  );
}
