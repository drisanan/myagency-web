'use client';
import React from 'react';
import { SessionProvider, useSession } from '@/features/auth/session';
import { TourProvider } from '@/features/tour/TourProvider';
import { DynamicThemeProvider } from '@/features/theme/DynamicThemeProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, AppBar, Toolbar, Typography, Button, Stack, Alert } from '@mui/material';
import { colors } from '@/theme/colors';
import { useImpersonation } from '@/hooks/useImpersonation';

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

const navItems = [
  { label: 'Lists', href: '/client/lists' },
  { label: 'Recruiter', href: '/client/recruiter' },
  { label: 'Tasks', href: '/client/tasks' },
];

function ClientShell({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const pathname = usePathname();
  const { isImpersonating, impersonatedBy, stopImpersonation } = useImpersonation();
  
  // Dynamic colors from agency settings (white-label)
  const primaryColor = session?.agencySettings?.primaryColor || colors.sidebarBg;
  const secondaryColor = session?.agencySettings?.secondaryColor || colors.navActiveBg;
  const agencyLogo = session?.agencyLogo;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      
      {/* Hide navigation bar when impersonating */}
      {!isImpersonating && (
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
            <Typography variant="h6" sx={{ color: '#fff', mr: 4 }}>
              Client Portal
            </Typography>
            
            {/* Navigation */}
            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      color: isActive ? secondaryColor : 'rgba(255,255,255,0.8)',
                      bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.15)',
                      },
                      fontWeight: isActive ? 600 : 400,
                      textTransform: 'none',
                      px: 2,
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            {session?.firstName && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {session.firstName} {session.lastName}
              </Typography>
            )}
          </Toolbar>
        </AppBar>
      )}
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
          <DynamicThemeProvider>
            <ClientShell>{children}</ClientShell>
          </DynamicThemeProvider>
        </Guard>
      </TourProvider>
    </SessionProvider>
  );
}
