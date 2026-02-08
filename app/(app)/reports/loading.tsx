'use client';

import React from 'react';
import { Box, Skeleton, Typography, Stack } from '@mui/material';
import { colors, gradients } from '@/theme/colors';

/** Angular skeleton card matching MetricCard clip-path */
function MetricSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        background: gradients.darkCard,
        p: 2.5,
        minHeight: 120,
      }}
    >
      <Skeleton variant="text" width="50%" sx={{ bgcolor: '#FFFFFF15', mb: 1 }} />
      <Skeleton variant="text" width="35%" height={40} sx={{ bgcolor: '#FFFFFF10' }} />
      <Skeleton variant="text" width="60%" sx={{ bgcolor: '#FFFFFF08', mt: 1 }} />
    </Box>
  );
}

/** Chart skeleton matching the angular card style */
function ChartSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        bgcolor: colors.white,
        p: 3,
        minHeight: 300,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
        },
      }}
    >
      <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={200} sx={{ bgcolor: '#0A0A0A08' }} />
    </Box>
  );
}

/** Table skeleton matching the leaderboard/timeline style */
function TableSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        bgcolor: colors.white,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ background: gradients.darkCard, px: 2, py: 1.5 }}>
        <Skeleton variant="text" width="20%" sx={{ bgcolor: '#FFFFFF20' }} />
      </Box>
      {/* Rows */}
      <Stack spacing={0}>
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #E0E0E0',
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="text" width="15%" />
            <Skeleton variant="text" width="10%" />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default function Loading() {
  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Page title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 3,
        }}
      >
        Reports
      </Typography>

      {/* KPI row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <ChartSkeleton />
        <ChartSkeleton />
      </Box>

      {/* Leaderboard & Timeline */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          gap: 3,
        }}
      >
        <TableSkeleton />
        <TableSkeleton />
      </Box>
    </Box>
  );
}
