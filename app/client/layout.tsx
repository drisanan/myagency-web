'use client';
import React from 'react';
import { SessionProvider, useSession } from '@/features/auth/session';
import { TourProvider } from '@/features/tour/TourProvider';
import { DynamicThemeProvider } from '@/features/theme/DynamicThemeProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Stack, CssBaseline, Avatar, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { colors } from '@/theme/colors';
import { useImpersonation } from '@/hooks/useImpersonation';
import { IoClipboardOutline, IoSchoolOutline, IoEyeOutline, IoCalendarOutline, IoChatbubblesOutline } from 'react-icons/io5';

const drawerWidth = 240;

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!session || session.role !== 'client')) {
      router.push('/auth/login');
    }
  }, [loading, session, router]);

  if (loading || !session || session.role !== 'client') {
    return <div style={{ padding: 24, fontFamily: 'sans-serif' }}>Loading…</div>;
  }

  return <>{children}</>;
}

const navItems = [
  { label: 'Lists', href: '/client/lists', icon: <IoClipboardOutline /> },
  { label: 'Recruiter', href: '/client/recruiter', icon: <IoSchoolOutline /> },
  { label: 'Tasks', href: '/client/tasks', icon: <IoClipboardOutline /> },
  { label: 'Profile Views', href: '/client/views', icon: <IoEyeOutline /> },
  { label: 'Meetings', href: '/client/meetings', icon: <IoCalendarOutline /> },
  { label: 'Messages', href: '/client/messages', icon: <IoChatbubblesOutline /> },
];

function ClientShell({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useSession();
  const pathname = usePathname();
  const { isImpersonating, stopImpersonation } = useImpersonation();
  
  // Dynamic colors from agency settings (white-label)
  const s = session?.agencySettings || {};
  const primaryColor = s.primaryColor || colors.sidebarBg;
  const secondaryColor = s.secondaryColor || colors.navActiveBg;
  const navText = s.navText || colors.sidebarText;
  const navActiveText = s.navActiveText || colors.navActiveText;
  const contentBg = s.contentBg || '#fff';
  const agencyLogo = session?.agencyLogo;

  // User menu state
  const [userAnchor, setUserAnchor] = React.useState<null | HTMLElement>(null);
  const openUserMenu = Boolean(userAnchor);
  const handleUserOpen = (e: React.MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget);
  const handleUserClose = () => setUserAnchor(null);

  const handleLogout = () => {
    setSession(null);
    document.cookie = 'an_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/auth/login';
  };

  const navItemSx = {
    width: 'calc(100% - 20px)',
    mx: '10px',
    px: 1.25,
    color: navText,
    borderRadius: '5px',
    py: 0.5,
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      bgcolor: secondaryColor,
      color: navActiveText,
    },
    justifyContent: 'flex-start',
  };

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
            {agencyLogo ? (
              <img src={agencyLogo} alt="Agency Logo" style={{ height: 32, objectFit: 'contain' }} />
            ) : (
              <img src="/marketing/an-logo.png" alt="Athlete Narrative" style={{ height: 32, objectFit: 'contain' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {session && (
              <Stack direction="row" spacing={2} alignItems="center">
                {isImpersonating && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Impersonating:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {session.firstName || session.lastName
                        ? `${session.firstName || ''} ${session.lastName || ''}`.trim()
                        : session.email}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={stopImpersonation}>
                      End Impersonation
                    </Button>
                  </Stack>
                )}
                <IconButton onClick={handleUserOpen} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#5D4AFB', width: 32, height: 32, cursor: 'pointer' }}>
                    {(session.firstName || session.email || '?').charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Account Menu */}
      <Menu
        anchorEl={userAnchor}
        open={openUserMenu}
        onClose={handleUserClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 180, mt: 1 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {session?.firstName} {session?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Athlete
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: primaryColor,
            color: navText,
          },
        }}
      >
        <Toolbar />
        <List sx={{ display: 'flex', flexDirection: 'column', gap: '5px', mt: 2.5 }}>
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
          bgcolor: contentBg,
        }}
      >
        <Toolbar />
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
