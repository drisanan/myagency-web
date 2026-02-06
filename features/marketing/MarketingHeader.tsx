'use client';
import React from 'react';
import { AppBar, Toolbar, Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export function MarketingHeader() {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      className="marketing-header"
      sx={{
        background: 'linear-gradient(90deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)',
        color: '#FFFFFF',
        borderBottom: 'none',
        position: 'relative',
        // Lime accent line at bottom
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(204,255,0,0.4) 50%, transparent 100%)',
        },
      }}
    >
      <Container>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
          <Box className="marketing-logo" sx={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
            <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/6BItDHErA4SVYrP81VMC/media/695dee7030b9c05796951592.png" alt="My Recruiter Agency" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            <Typography
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.3rem',
                color: '#FFFFFF',
                letterSpacing: '0.06em',
                lineHeight: 1,
              }}
            >
              My Recruiter Agency
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              LinkComponent={Link}
              href="/auth/login"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                '&:hover': { color: '#CCFF00' },
              }}
            >
              Sign in
            </Button>
            <Button
              LinkComponent={Link}
              href="https://marketing.myrecruiteragency.com/mrastart"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 60%, #A0CC00 100%)',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                px: 3,
                py: 1,
                borderRadius: 0,
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                boxShadow: '0 0 16px rgba(204,255,0,0.2)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D4FF1A 0%, #CCFF00 100%)',
                  boxShadow: '0 4px 24px rgba(204,255,0,0.35)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Sign up
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
