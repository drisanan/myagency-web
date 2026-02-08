'use client';
import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Button, Alert, Stack, Avatar, Badge, IconButton, Menu, MenuItem, Divider, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { useQueryClient } from '@tanstack/react-query';
import { useImpersonation } from '@/hooks/useImpersonation';
import { colors, gradients } from '@/theme/colors';
import { IoAppsOutline, IoBarbellOutline, IoFlaskOutline, IoClipboardOutline, IoSchoolOutline, IoPeopleOutline, IoMailOutline, IoListOutline, IoCheckmarkCircleOutline, IoEyeOutline, IoCalendarOutline, IoChatbubblesOutline, IoPersonCircleOutline, IoBulbOutline, IoMenuOutline, IoCloseOutline, IoStatsChartOutline } from 'react-icons/io5';
import { IoNotificationsOutline } from 'react-icons/io5';
import { SuggestionButton } from '@/features/suggestions';
import { useQuery } from '@tanstack/react-query';
import { tasksDueSoon, Task } from '@/services/tasks';
import { listTasks } from '@/services/tasks';
const drawerWidth = 240;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
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
  const headerBg = s.headerBg || colors.headerBg;

  const navItemSx = {
    width: 'calc(100% - 20px)',
    mx: '10px',
    px: 1.25,
    color: navText,
    borderRadius: 0,
    py: 0.5,
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
    transition: 'all 0.15s ease',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      background: `linear-gradient(135deg, ${secondaryColor} 0%, ${secondaryColor}DD 100%)`,
      color: navActiveText,
      boxShadow: `0 0 12px ${secondaryColor}30`,
    },
    justifyContent: 'flex-start',
  };

  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <IoAppsOutline /> },
    ...(session?.role === 'parent' && !session?.impersonatedBy ? [{ href: '/agencies', label: 'Agencies', icon: <IoAppsOutline /> }] : []),
    ...(session?.role === 'agency' ? [{ href: '/reports', label: 'Reports', icon: <IoStatsChartOutline /> }] : []),
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
    queryClient.clear();
    document.cookie = 'an_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
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
          // Animated streak-of-light bottom border
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
                    <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' }, color: colors.white }}>
                      Impersonating:
                    </Typography>
                    <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, color: '#FFFFFF80' }}>
                      {session.firstName || session.lastName
                        ? `${session.firstName || ''} ${session.lastName || ''}`.trim()
                        : session.email}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={stopImpersonation} sx={{ fontSize: { xs: 11, sm: 13 }, px: { xs: 1, sm: 2 }, borderColor: colors.lime, color: colors.lime }}>
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
                    <Avatar sx={{ bgcolor: colors.lime, color: colors.black, width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}>
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
                  <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' } }} />
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
            // Right-edge lime accent
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
                  <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' } }} />
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
          // Dotted grid texture over content gradient
          background: `${gradients.dottedGrid}, ${gradients.contentPane}`,
          backgroundSize: '24px 24px, 100% 100%',
          // Subtle lime radial glow in the top-left corner for energy
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
          ml: { md: 0 },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {/* Impersonation Banner */}
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
