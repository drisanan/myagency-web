'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ClientRecruiterWizard } from '@/features/recruiter/ClientRecruiterWizard';
import { colors, gradients } from '@/theme/colors';

export default function ClientRecruiterPage() {
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
        Send Recruiting Emails
      </Typography>
      <Typography variant="body1" sx={{ color: '#0A0A0A80', mb: 3 }}>
        Select a coach from your assigned lists and send a personalized introduction email.
      </Typography>
      <Box
        sx={{
          borderRadius: 0,
          clipPath:
            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          bgcolor: colors.white,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'none',
          transition: 'box-shadow 0.25s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '3px',
            background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
            zIndex: 1,
          },
          '&:hover': {
            boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
          },
          p: 3,
        }}
      >
        <ClientRecruiterWizard />
      </Box>
    </Box>
  );
}
