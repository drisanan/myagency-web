import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

export default function Loading() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Skeleton variant="rectangular" height={260} sx={{ mb: 3, borderRadius: 2 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {[1, 2, 3].map((k) => (
          <Skeleton key={k} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[1, 2, 3, 4].map((k) => (
          <Skeleton key={k} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {[1, 2].map((k) => (
          <Skeleton key={k} variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    </>
  );
}
