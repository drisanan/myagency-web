'use client';
import React from 'react';
import { AppBar, Toolbar, Box, Button, Container } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export function MarketingHeader() {
  return (
    <AppBar position="static" color="inherit" elevation={0} className="marketing-header">
      <Container>
        <Toolbar disableGutters>
          <Box className="marketing-logo" sx={{ flex: 1, display: 'inline-flex', alignItems: 'center' }}>
            <Image src="/marketing/logo.svg" alt="Athlete Narrative" width={120} height={28} />
          </Box>
          <Box>
            <Button LinkComponent={Link} href="/auth/login" color="inherit">Sign in</Button>
            <Button LinkComponent={Link} href="https://marketing.myrecruiteragency.com/mrastart" variant="contained" sx={{ ml: 1 }}>
              Sign up
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}


