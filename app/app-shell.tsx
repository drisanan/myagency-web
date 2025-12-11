'use client';
import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Button, Alert, Stack } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { logImpersonationEnd } from '@/services/audit';
import { colors } from '@/theme/colors';
import { IoAppsOutline, IoBarbellOutline, IoFlaskOutline, IoClipboardOutline, IoSchoolOutline } from 'react-icons/io5';
const drawerWidth = 240;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useSession();
  const pathname = usePathname();

  const stopImpersonation = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const baseRaw = window.localStorage.getItem('session_impersonation_base');
    if (session?.impersonatedBy && baseRaw) {
      const base = JSON.parse(baseRaw);
      logImpersonationEnd(base.email, session.email);
      setSession(base);
      window.localStorage.removeItem('session_impersonation_base');
    }
  }, [session, setSession]);

  const navItemSx = {
    width: 'calc(100% - 20px)', // leave 10px inset on each side
    mx: '10px',
    px: 1.25, // ~10px horizontal padding inside
    color: colors.sidebarText,
    borderRadius: '5px',
    py: 0.5,
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.04)',
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      bgcolor: colors.navActiveBg,
      color: colors.navActiveText,
    },
    justifyContent: 'flex-start',
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <IoAppsOutline /> },
    ...(session?.role === 'parent' && !session?.impersonatedBy ? [{ href: '/agencies', label: 'Agencies', icon: <IoAppsOutline /> }] : []),
    { href: '/clients', label: 'Athletes', icon: <IoBarbellOutline /> },
    { href: '/ai/prompts', label: 'Prompts', icon: <IoFlaskOutline /> },
    { href: '/lists', label: 'Lists', icon: <IoClipboardOutline /> },
    { href: '/recruiter', label: 'Recruiter', icon: <IoSchoolOutline /> },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundImage: 'url(/marketing/bg-an.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: 'transparent',
          boxShadow: 'none',
          color: 'inherit',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
            {session?.agencyLogo ? (
              <img src={session.agencyLogo} alt="Agency Logo" style={{ height: 32, objectFit: 'contain' }} />
            ) : (
              <img src="/marketing/an-logo.png" alt="Athlete Narrative" style={{ height: 32, objectFit: 'contain' }} />
            )}
          </Box>
          {session?.impersonatedBy && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#212636' }}>
                Impersonating drisanjames@gmail.com as admin
              </Typography>
              <Button color="inherit" variant="outlined" onClick={stopImpersonation}>Stop Impersonating</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: colors.sidebarBg,
            color: colors.sidebarText,
          },
        }}
      >
        <Toolbar />
        <List sx={{ display: 'flex', flexDirection: 'column', gap: '5px', mt: 2.5 /* ~20px */ }}>
          {navItems.map((item) => {
            const selected = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <ListItemButton
                key={item.href}
                LinkComponent={Link}
                href={item.href}
                sx={navItemSx}
                selected={selected}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {item.icon}
                  <ListItemText primary={item.label} />
                </Stack>
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Toolbar />
        {session?.impersonatedBy && (
          <Alert severity="error" sx={{ mb: 2 }}>
            You are impersonating agency account: {session.email}. Actions will be logged.
          </Alert>
        )}
        {children}
      </Box>
    </Box>
  );
}


