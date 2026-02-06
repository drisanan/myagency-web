'use client';
import React from 'react';
import { SessionProvider, useSession } from '@/features/auth/session';
import { TourProvider } from '@/features/tour/TourProvider';
import { DynamicThemeProvider } from '@/features/theme/DynamicThemeProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Stack, CssBaseline, Avatar, IconButton, Menu, MenuItem, Divider, Button, useMediaQuery, useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { colors, gradients } from '@/theme/colors';
import { useImpersonation } from '@/hooks/useImpersonation';
import { IoClipboardOutline, IoSchoolOutline, IoEyeOutline, IoCalendarOutline, IoChatbubblesOutline, IoMenuOutline, IoCloseOutline } from 'react-icons/io5';

const drawerWidth = 240;

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth/login');
    } else if (!loading && session && session.role !== 'client') {
      // Non-client user (e.g. agency returning from impersonation) — redirect to main app
      router.replace('/clients');
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
  const router = useRouter();
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Close drawer when route changes on mobile
  React.useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [pathname, isMobile]);
  
  // Dynamic colors from agency settings (white-label)
  const s = session?.agencySettings || {};
  const primaryColor = s.primaryColor || colors.sidebarBg;
  const secondaryColor = s.secondaryColor || colors.navActiveBg;
  const navText = s.navText || colors.sidebarText;
  const navActiveText = s.navActiveText || colors.navActiveText;
  const contentBg = s.contentBg || colors.contentBg;
  const agencyLogo = session?.agencyLogo;

  // User menu state
  const [userAnchor, setUserAnchor] = React.useState<null | HTMLElement>(null);
  const openUserMenu = Boolean(userAnchor);
  const handleUserOpen = (e: React.MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget);
  const handleUserClose = () => setUserAnchor(null);

  const queryClient = useQueryClient();

  const handleLogout = () => {
    setSession(null);
    queryClient.clear();
    document.cookie = 'an_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
  };

  const navItemSx = {
    width: 'calc(100% - 20px)',
    mx: '10px',
    px: 1.25,
    color: navText,
    borderRadius: 0,
    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
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
        bgcolor: contentBg,
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          background: gradients.header,
          boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
          color: colors.headerText,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '200%',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, transparent 25%, ${colors.lime}15 35%, ${colors.lime} 50%, ${colors.lime}15 65%, transparent 75%, transparent 100%)`,
            animation: 'headerStreak 4s linear infinite',
          },
          '@keyframes headerStreak': {
            '0%': { transform: 'translateX(-50%)' },
            '100%': { transform: 'translateX(0%)' },
          },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
            {/* Hamburger menu for mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              {mobileOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
            </IconButton>
            {agencyLogo ? (
              <img src={agencyLogo} alt="Agency Logo" style={{ height: 32, objectFit: 'contain' }} />
            ) : (
              <img src="/marketing/an-logo.png" alt="Athlete Narrative" style={{ height: 32, objectFit: 'contain' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {session && (
              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                {isImpersonating && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                      Impersonating:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                      {session.firstName || session.lastName
                        ? `${session.firstName || ''} ${session.lastName || ''}`.trim()
                        : session.email}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={stopImpersonation} sx={{ fontSize: { xs: 11, sm: 13 }, px: { xs: 1, sm: 2 } }}>
                      End
                    </Button>
                  </Stack>
                )}
                <IconButton onClick={handleUserOpen} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: colors.lime, color: colors.black, width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}>
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

      {/* Mobile Drawer - temporary */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: gradients.sidebar,
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
                onClick={handleDrawerToggle}
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

      {/* Desktop Drawer - permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: gradients.sidebar,
            color: navText,
            borderRight: 'none',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '1px',
              background: `linear-gradient(180deg, transparent 0%, ${colors.lime}20 30%, ${colors.lime}20 70%, transparent 100%)`,
            },
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
          p: { xs: 1.5, sm: 2, md: 3 },
          background: `${gradients.dottedGrid}, ${gradients.contentPane}`,
          backgroundSize: '24px 24px, 100% 100%',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: drawerWidth,
            width: '50vw',
            height: '50vh',
            background: 'radial-gradient(ellipse at 0% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          position: 'relative',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
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
