'use client';
import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Box, Typography, Button, Stack } from '@mui/material';
import * as Sentry from '@sentry/nextjs';
import { colors } from '@/theme/colors';

function FallbackUI({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Box
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
        bgcolor: '#fef2f2',
        border: '1px solid #fecaca',
        p: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: 'linear-gradient(180deg, #ef4444 0%, #ef444440 100%)',
        },
      }}
    >
      <Stack spacing={1.5}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.75rem',
            color: '#dc2626',
          }}
        >
          Something went wrong
        </Typography>
        <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
          {(error as any)?.message || 'An unexpected error occurred in this section.'}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={resetErrorBoundary}
          sx={{
            alignSelf: 'flex-start',
            borderColor: '#dc2626',
            color: '#dc2626',
            fontWeight: 700,
            fontSize: '0.75rem',
            borderRadius: 0,
            clipPath:
              'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
            '&:hover': { bgcolor: '#fef2f2', borderColor: '#b91c1c' },
          }}
        >
          Retry
        </Button>
      </Stack>
    </Box>
  );
}

type Props = {
  /** Optional name for Sentry tagging */
  name?: string;
  children: React.ReactNode;
};

export function FeatureErrorBoundary({ name, children }: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackUI}
      onError={(error, info) => {
        Sentry.captureException(error, {
          tags: { boundary: name || 'unknown' },
          extra: { componentStack: info?.componentStack },
        });
      }}
      onReset={() => {
        // Optional: clear query caches or local state on retry
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
