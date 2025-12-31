'use client';
import React from 'react';
import { SessionProvider, useSession } from '@/features/auth/session';
import { TourProvider } from '@/features/tour/TourProvider';
import { useRouter } from 'next/navigation';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { colors } from '@/theme/colors';

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!session || session.role !== 'client')) {
      router.push('/auth/client-login');
    }
  }, [loading, session, router]);

  if (loading || !session || session.role !== 'client') {
    return <div style={{ padding: 24, fontFamily: 'sans-serif' }}>Loading…</div>;
  }

  return <>{children}</>;
}

function ClientShell({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  
  // Dynamic colors from agency settings (white-label)
  const primaryColor = session?.agencySettings?.primaryColor || colors.sidebarBg;
  const secondaryColor = session?.agencySettings?.secondaryColor || colors.navActiveBg;
  const agencyLogo = session?.agencyLogo;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: primaryColor,
          boxShadow: 1,
        }}
      >
        <Toolbar>
          {agencyLogo ? (
            <img 
              src={agencyLogo} 
              alt="Agency Logo" 
              style={{ height: 32, objectFit: 'contain', marginRight: 16 }} 
            />
          ) : null}
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>
            Client Portal
          </Typography>
          {session?.firstName && (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {session.firstName} {session.lastName}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Box 
        component="main" 
        sx={{ 
          p: 3,
          '& .MuiButton-contained': {
            bgcolor: secondaryColor,
            color: colors.navActiveText,
            '&:hover': {
              bgcolor: secondaryColor,
              filter: 'brightness(0.9)',
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TourProvider>
        <Guard>
          <ClientShell>{children}</ClientShell>
        </Guard>
      </TourProvider>
    </SessionProvider>
  );
}
