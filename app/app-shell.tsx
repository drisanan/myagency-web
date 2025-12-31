'use client';
import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Button, Alert, Stack, Avatar, Badge, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { logImpersonationEnd } from '@/services/audit';
import { colors } from '@/theme/colors';
import { IoAppsOutline, IoBarbellOutline, IoFlaskOutline, IoClipboardOutline, IoSchoolOutline } from 'react-icons/io5';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import { tasksDueSoon, Task } from '@/services/tasks';
import { listTasks } from '@/services/tasks';
const drawerWidth = 240;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useSession();
  const pathname = usePathname();

  // Dynamic colors from agency settings
  const primaryColor = session?.agencySettings?.primaryColor || colors.sidebarBg;
  const secondaryColor = session?.agencySettings?.secondaryColor || colors.navActiveBg;

  const stopImpersonation = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const baseRaw = null;
    if (session?.impersonatedBy && baseRaw) {
      const base = JSON.parse(baseRaw);
      logImpersonationEnd(base.email, session.email);
      setSession(base);
      // no-op; legacy impersonation store removed
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
      bgcolor: secondaryColor,
      color: colors.navActiveText,
    },
    justifyContent: 'flex-start',
  };

  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <IoAppsOutline /> },
    ...(session?.role === 'parent' && !session?.impersonatedBy ? [{ href: '/agencies', label: 'Agencies', icon: <IoAppsOutline /> }] : []),
    { href: '/clients', label: 'Athletes', icon: <IoBarbellOutline /> },
    { href: '/ai/prompts', label: 'Prompts', icon: <IoFlaskOutline /> },
    { href: '/lists', label: 'Lists', icon: <IoClipboardOutline /> },
    { href: '/tasks', label: 'Tasks', icon: <IoClipboardOutline /> },
    { href: '/recruiter', label: 'Recruiter', icon: <IoSchoolOutline /> },
  ];

  const navItems = session?.role === 'client'
    ? [
        { href: '/client/lists', label: 'Lists', icon: <IoClipboardOutline /> },
        { href: '/client/tasks', label: 'Tasks', icon: <IoClipboardOutline /> },
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {session?.impersonatedBy && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: '#212636' }}>
                  Impersonating {typeof session.impersonatedBy === 'string'
                    ? session.impersonatedBy
                    : (session.impersonatedBy as any)?.email || 'another user'}
                </Typography>
                <Button color="inherit" variant="outlined" onClick={stopImpersonation}>Stop Impersonating</Button>
              </Box>
            )}
            {session ? (
              <Stack direction="row" spacing={2} alignItems="center">
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
        <MenuItem component={Link} href="/settings" onClick={handleUserClose}>
          Settings
        </MenuItem>
        <MenuItem component={Link} href="/profile" onClick={handleUserClose}>
          Profile
        </MenuItem>
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
          bgcolor: '#fff',
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


