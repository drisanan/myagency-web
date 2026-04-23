'use client';

import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import type { LandingTemplateProps } from './types';

export function MinimalDarkTemplate({
  agencyName,
  branding,
  landing,
  signInHref,
}: LandingTemplateProps) {
  const primary = branding.primaryColor || '#0A0A0A';
  const secondary = branding.secondaryColor || '#FFFFFF';
  const hero = landing.hero || {};

  return (
    <Box sx={{ bgcolor: primary, color: secondary, minHeight: '100vh', fontFamily: 'inherit' }}>
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 18 }, textAlign: 'center' }}>
        {branding.logoUrl || branding.logoDataUrl ? (
          <Box
            component="img"
            src={branding.logoUrl || branding.logoDataUrl}
            alt={`${agencyName} logo`}
            sx={{ height: 48, mx: 'auto', mb: 6 }}
          />
        ) : null}

        <Typography sx={{ fontSize: '0.875rem', letterSpacing: '0.25em', opacity: 0.7, mb: 3 }}>
          {agencyName.toUpperCase()}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 300,
            lineHeight: 1.1,
            mb: 4,
          }}
        >
          {hero.headline || 'A quieter kind of recruiting.'}
        </Typography>

        <Typography sx={{ fontSize: '1.125rem', opacity: 0.75, maxWidth: 520, mx: 'auto', mb: 6 }}>
          {hero.subhead || 'Precision matchmaking between athletes and programs. No noise.'}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            component="a"
            href={hero.ctaHref || signInHref}
            variant="outlined"
            sx={{
              borderColor: secondary,
              color: secondary,
              px: 4,
              py: 1.5,
              '&:hover': { borderColor: secondary, bgcolor: `${secondary}10` },
            }}
          >
            {hero.ctaLabel || 'Enter'}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
