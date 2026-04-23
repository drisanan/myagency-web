'use client';

import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import type { AgencyLandingConfig } from '../../../infra/src/lib/models';
import type { LandingTemplateProps } from './types';

type FeatureItem = NonNullable<AgencyLandingConfig['features']>[number];
type TestimonialItem = NonNullable<AgencyLandingConfig['testimonials']>[number];
type FooterLink = NonNullable<NonNullable<AgencyLandingConfig['footer']>['links']>[number];

export function AthleteClassicTemplate({
  agencyName,
  branding,
  landing,
  signInHref,
}: LandingTemplateProps) {
  const primary = branding.primaryColor || '#0A0A0A';
  const secondary = branding.secondaryColor || '#CCFF00';
  const hero = landing.hero || {};
  const features = landing.features || [];
  const testimonials = landing.testimonials || [];
  const footer = landing.footer;

  return (
    <Box sx={{ bgcolor: '#FFFFFF', color: primary, fontFamily: 'inherit' }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 8 },
          py: 3,
          borderBottom: `1px solid ${primary}14`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {branding.logoUrl || branding.logoDataUrl ? (
            <Box
              component="img"
              src={branding.logoUrl || branding.logoDataUrl}
              alt={`${agencyName} logo`}
              sx={{ height: 40, width: 'auto' }}
            />
          ) : null}
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
            {agencyName}
          </Typography>
        </Stack>
        <Button
          component="a"
          href={signInHref}
          variant="contained"
          sx={{
            bgcolor: secondary,
            color: primary,
            textTransform: 'uppercase',
            fontWeight: 700,
            '&:hover': { bgcolor: secondary, opacity: 0.9 },
          }}
        >
          Sign in
        </Button>
      </Box>

      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 14 },
          px: { xs: 3, md: 8 },
          color: primary,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} sx={{ maxWidth: 820 }}>
            <Typography
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 900,
                lineHeight: 1.02,
                textTransform: 'uppercase',
              }}
            >
              {hero.headline || `${agencyName} — Build your recruiting narrative.`}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, color: `${primary}B0` }}>
              {hero.subhead ||
                'Athlete-first recruiting, delivered by the agency that knows your story.'}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component="a"
                href={hero.ctaHref || signInHref}
                variant="contained"
                sx={{
                  bgcolor: secondary,
                  color: primary,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  py: 1.5,
                  px: 3,
                }}
              >
                {hero.ctaLabel || 'Get started'}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {features.length > 0 ? (
        <Box component="section" sx={{ py: 8, px: { xs: 3, md: 8 }, bgcolor: `${primary}06` }}>
          <Container maxWidth="lg">
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 4, textTransform: 'uppercase' }}>
              What we do
            </Typography>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
              {features.map((feature: FeatureItem, idx: number) => (
                <Box key={idx} sx={{ p: 3, bgcolor: '#FFFFFF', borderLeft: `3px solid ${secondary}` }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
                  <Typography sx={{ color: `${primary}99` }}>{feature.body}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      ) : null}

      {testimonials.length > 0 ? (
        <Box component="section" sx={{ py: 8, px: { xs: 3, md: 8 } }}>
          <Container maxWidth="lg">
            <Stack spacing={3}>
              {testimonials.map((t: TestimonialItem, idx: number) => (
                <Box key={idx} sx={{ borderLeft: `3px solid ${primary}`, pl: 3 }}>
                  <Typography sx={{ fontStyle: 'italic', fontSize: '1.125rem', mb: 1 }}>
                    “{t.quote}”
                  </Typography>
                  <Typography sx={{ color: `${primary}99`, fontSize: '0.875rem' }}>
                    — {t.author}
                    {t.role ? `, ${t.role}` : ''}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Container>
        </Box>
      ) : null}

      <Box
        component="footer"
        sx={{
          py: 4,
          px: { xs: 3, md: 8 },
          bgcolor: primary,
          color: '#FFFFFFB0',
          fontSize: '0.875rem',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Typography>{footer?.legal || `© ${new Date().getFullYear()} ${agencyName}`}</Typography>
            <Stack direction="row" spacing={3}>
              {(footer?.links || []).map((link: FooterLink, idx: number) => (
                <Typography
                  key={idx}
                  component="a"
                  href={link.href}
                  sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: secondary } }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
