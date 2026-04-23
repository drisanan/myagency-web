'use client';

import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import type { LandingTemplateProps } from './types';

export function RecruiterBoldTemplate({
  agencyName,
  branding,
  landing,
  signInHref,
}: LandingTemplateProps) {
  const primary = branding.primaryColor || '#0B1220';
  const secondary = branding.secondaryColor || '#F97316';
  const hero = landing.hero || {};

  return (
    <Box sx={{ bgcolor: primary, color: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: { xs: 8, md: 14 } }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {branding.logoUrl || branding.logoDataUrl ? (
              <Box
                component="img"
                src={branding.logoUrl || branding.logoDataUrl}
                alt={`${agencyName} logo`}
                sx={{ height: 36 }}
              />
            ) : null}
            <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>{agencyName}</Typography>
          </Stack>
          <Button
            component="a"
            href={signInHref}
            variant="outlined"
            sx={{
              borderColor: '#FFFFFF55',
              color: '#FFFFFF',
              '&:hover': { borderColor: secondary, color: secondary },
            }}
          >
            Sign in
          </Button>
        </Stack>

        <Stack spacing={4} sx={{ maxWidth: 720 }}>
          <Typography
            sx={{
              fontSize: { xs: '2.25rem', md: '3.75rem' },
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {hero.headline || `Place more athletes. With ${agencyName}.`}
          </Typography>
          <Typography sx={{ fontSize: '1.125rem', color: '#FFFFFFB0', maxWidth: 560 }}>
            {hero.subhead ||
              'Recruiting operations, AI-assisted outreach, and scholarship tracking — in one agency command center.'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              component="a"
              href={hero.ctaHref || signInHref}
              variant="contained"
              sx={{
                bgcolor: secondary,
                color: '#0B1220',
                fontWeight: 700,
                px: 3,
                py: 1.5,
                '&:hover': { bgcolor: secondary, opacity: 0.9 },
              }}
            >
              {hero.ctaLabel || 'Start your pipeline'}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
