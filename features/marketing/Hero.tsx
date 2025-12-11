'use client';
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export function Hero() {
  return (
    <Box sx={{ py: 10, background: (t) => t.palette.grey[100] }}>
      <Container>
        <Box sx={{
          height: 320,
          borderRadius: 2,
          background: (t) => t.palette.grey[300],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="h5" color="text.secondary">Hero Image Placeholder</Typography>
        </Box>
      </Container>
    </Box>
  );
}


