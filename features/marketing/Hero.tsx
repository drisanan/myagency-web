'use client';
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export function Hero() {
  return (
    <Box
      sx={{
        py: 12,
        background: 'linear-gradient(135deg, #0A0A0A 0%, #141414 50%, #0A0A0A 100%)',
        position: 'relative',
        overflow: 'hidden',
        // Diagonal speed-line texture
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(204,255,0,0.02) 40px, rgba(204,255,0,0.02) 41px)',
          pointerEvents: 'none',
        },
        // Corner glow
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '50%',
          height: '80%',
          background: 'radial-gradient(ellipse, rgba(204,255,0,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            height: 320,
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
            background: 'linear-gradient(160deg, #1A1A1A 0%, #0F0F0F 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            // Top accent bar
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: '24px',
              height: '3px',
              background: 'linear-gradient(90deg, #CCFF00 0%, #B8E600 60%, transparent 100%)',
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Hero Image Placeholder
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
