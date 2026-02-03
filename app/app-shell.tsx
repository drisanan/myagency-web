'use client';
import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Button, Alert, Stack, Avatar, Badge, IconButton, Menu, MenuItem, Divider, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { useImpersonation } from '@/hooks/useImpersonation';
import { colors } from '@/theme/colors';
import { IoAppsOutline, IoBarbellOutline, IoFlaskOutline, IoClipboardOutline, IoSchoolOutline, IoPeopleOutline, IoMailOutline, IoListOutline, IoCheckmarkCircleOutline, IoEyeOutline, IoCalendarOutline, IoChatbubblesOutline, IoPersonCircleOutline, IoBulbOutline, IoMenuOutline, IoCloseOutline } from 'react-icons/io5';
import { IoNotificationsOutline } from 'react-icons/io5';
import { SuggestionButton } from '@/features/suggestions';
import { useQuery } from '@tanstack/react-query';
import { tasksDueSoon, Task } from '@/services/tasks';
import { listTasks } from '@/services/tasks';
const drawerWidth = 240;

function isColorLight(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useSession();
  const pathname = usePathname();
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
  const contentBg = s.contentBg || '#fff';
  const cardBg = s.cardBg || '#fff';
  const headerBg = s.headerBg || '#fff';
  const headerText = isColorLight(headerBg) ? '#101828' : '#FFFFFF';

  const navItemSx = {
    width: 'calc(100% - 20px)', // leave 10px inset on each side
    mx: '10px',
    px: 1.25, // ~10px horizontal padding inside
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

  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <IoAppsOutline /> },
    ...(session?.role === 'parent' && !session?.impersonatedBy ? [{ href: '/agencies', label: 'Agencies', icon: <IoAppsOutline /> }] : []),
    { href: '/clients', label: 'Athletes', icon: <IoBarbellOutline /> },
    // Only show Agents management to agency owners, not to agents themselves
    ...(session?.role !== 'agent' ? [{ href: '/agents', label: 'Agents', icon: <IoPeopleOutline /> }] : []),
    { href: '/ai/prompts', label: 'Prompts', icon: <IoFlaskOutline /> },
    { href: '/lists', label: 'Lists', icon: <IoListOutline /> },
    { href: '/tasks', label: 'Tasks', icon: <IoCheckmarkCircleOutline /> },
    { href: '/email-drips', label: 'Email Drips', icon: <IoMailOutline /> },
    { href: '/recruiter', label: 'Recruiter', icon: <IoSchoolOutline /> },
    { href: '/improvements', label: 'Improvements', icon: <IoBulbOutline /> },
  ];

  const navItems = session?.role === 'client'
    ? [
        { href: '/client/lists', label: 'Lists', icon: <IoListOutline /> },
        { href: '/client/recruiter', label: 'Recruiter', icon: <IoSchoolOutline /> },
        { href: '/client/tasks', label: 'Tasks', icon: <IoCheckmarkCircleOutline /> },
        { href: '/client/views', label: 'Profile Views', icon: <IoEyeOutline /> },
        { href: '/client/meetings', label: 'Meetings', icon: <IoCalendarOutline /> },
        { href: '/client/messages', label: 'Messages', icon: <IoChatbubblesOutline /> },
        { href: '/client/profile', label: 'Profile', icon: <IoPersonCircleOutline /> },
      ]
    : allNavItems;

  const tasksQuery = useQuery({
    queryKey: ['nav-tasks', session?.email],
    enabled: Boolean(session?.email),
    queryFn: async () => {
      if (!session?.email) return [] as Task[];
      return listTasks({});
    },
    staleTime: 30_000,
  });

  const allTasks = tasksQuery.data || [];
  const openTasks = allTasks.filter((t) => t.status !== 'done');
  const dueSoon = tasksDueSoon(allTasks);

  const [bellAnchor, setBellAnchor] = React.useState<null | HTMLElement>(null);
  const openBell = Boolean(bellAnchor);
  const handleBellOpen = (e: React.MouseEvent<HTMLElement>) => setBellAnchor(e.currentTarget);
  const handleBellClose = () => setBellAnchor(null);

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
          bgcolor: headerBg,
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
          color: headerText,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48, mr: 'auto' }}>
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
            {session?.agencyLogo ? (
              <img src={session.agencyLogo} alt="Agency Logo" style={{ height: 32, objectFit: 'contain' }} />
            ) : (
              <img src="/marketing/an-logo.png" alt="Athlete Narrative" style={{ height: 32, objectFit: 'contain' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {session ? (
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
                <Badge color="primary" badgeContent={openTasks.length || null} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
                  <IconButton color="inherit" onClick={handleBellOpen} aria-label="Tasks alerts">
                    <Badge variant="dot" color="error" invisible={dueSoon.length === 0}>
                      <IoNotificationsOutline size={20} />
                    </Badge>
                  </IconButton>
                </Badge>
                <IconButton onClick={handleUserOpen} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: '#5D4AFB', width: 32, height: 32, cursor: 'pointer' }}>
                      {(session.email || '?').charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
              </Stack>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={bellAnchor} open={openBell} onClose={handleBellClose}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">Tasks</Typography>
          <Typography variant="caption" color="text.secondary">
            {openTasks.length} open · {dueSoon.length} due soon
          </Typography>
        </Box>
        <Divider />
        {dueSoon.length === 0 ? (
          <MenuItem disabled>No tasks due soon</MenuItem>
        ) : (
          dueSoon.slice(0, 5).map((t) => (
            <MenuItem key={t.id} sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.title}</Typography>
                {t.dueAt ? (
                  <Typography variant="caption" color="text.secondary">
                    Due {new Date(t.dueAt).toLocaleString()}
                  </Typography>
                ) : null}
              </Box>
            </MenuItem>
          ))
        )}
        {dueSoon.length > 5 ? <MenuItem disabled>+{dueSoon.length - 5} more</MenuItem> : null}
      </Menu>

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
            {session?.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.role === 'agency' ? 'Agency' : session?.role}
          </Typography>
        </Box>
        <Divider />
        {/* Settings only visible to agency owners, not agents */}
        {session?.role !== 'agent' && (
          <MenuItem component={Link} href="/settings" onClick={handleUserClose}>
            Settings
          </MenuItem>
        )}
        <MenuItem component={Link} href="/profile" onClick={handleUserClose}>
          Profile
        </MenuItem>
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
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', md: 'none' },
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
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: contentBg,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: 0 },
        }}
      >
        <Toolbar />
        {/* Impersonation Banner - below utility header, in main content area */}
        {isImpersonating && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              '& .MuiAlert-message': { 
                flexGrow: 1,
              },
              '& .MuiAlert-action': {
                pt: 0,
                alignItems: 'center',
              },
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                variant="outlined"
                onClick={stopImpersonation}
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                }}
              >
                Stop Impersonating
              </Button>
            }
          >
            You are viewing as: {session?.firstName} {session?.lastName} ({session?.email})
          </Alert>
        )}
        {children}
      </Box>

      {/* Floating suggestion button */}
      <SuggestionButton hidden={session?.role === 'client'} />
    </Box>
  );
}


