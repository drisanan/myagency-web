'use client';
import React from 'react';
import { Box, Typography, Stack, LinearProgress, Alert, Button, Chip } from '@mui/material';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  IoCheckmarkCircleOutline,
  IoChatbubblesOutline,
  IoEyeOutline,
  IoMailOutline,
  IoMailOpenOutline,
  IoOpenOutline,
  IoCalendarOutline,
  IoClipboardOutline,
  IoSchoolOutline,
  IoPersonCircleOutline,
} from 'react-icons/io5';
import { useSession } from '@/features/auth/session';
import { listTasks, tasksDueSoon, type Task } from '@/services/tasks';
import { listThreads } from '@/services/communications';
import { getProfileViews } from '@/services/profileViews';
import { fetchEmailMetrics } from '@/services/emailTracking';
import { listMeetings } from '@/services/meetings';
import { listAssignments } from '@/services/listAssignments';
import { getClient } from '@/services/clients';
import { MetricCard } from '@/app/(app)/dashboard/MetricCard';
import { colors, gradients } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';

function QueryError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <Alert
      severity="error"
      sx={{ m: 0, borderRadius: 0 }}
      action={<Button color="inherit" size="small" onClick={(e) => { e.preventDefault(); onRetry(); }}>Retry</Button>}
    >
      Could not load {label}.
    </Alert>
  );
}

const cardSx = {
  borderRadius: 0,
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
  bgcolor: colors.white,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: 'none',
  transition: 'box-shadow 0.25s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '3px',
    background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
    zIndex: 1,
  },
  '&:hover': {
    boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
  },
} as const;

const sectionHeaderSx = {
  background: gradients.darkCard,
  px: 3,
  py: 1.5,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
} as const;

const sectionTitleSx = {
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontSize: '0.8rem',
  color: colors.white,
} as const;

const PROFILE_FIELDS = [
  { key: 'email', label: 'Email', check: (c: any) => { const e = String(c?.email || '').trim(); return Boolean(e && e.toLowerCase() !== 'admin@example.com'); } },
  { key: 'firstName', label: 'First Name', check: (c: any) => Boolean(c?.firstName) },
  { key: 'lastName', label: 'Last Name', check: (c: any) => Boolean(c?.lastName) },
  { key: 'phone', label: 'Phone', check: (c: any) => Boolean(c?.phone) },
  { key: 'sport', label: 'Sport', check: (c: any) => Boolean(c?.sport) },
  { key: 'username', label: 'Profile URL', check: (c: any) => Boolean(c?.username) },
  { key: 'accessCode', label: 'Access Code', check: (c: any) => Boolean(c?.accessCodeHash || c?.accessCode || c?.authEnabled) },
  { key: 'photo', label: 'Photo', check: (c: any) => Boolean(c?.radar?.profileImage || c?.profileImageUrl || c?.photoUrl) },
];

export default function ClientDashboardPage() {
  const { session } = useSession();
  const clientId = session?.clientId || '';

  const tasksQuery = useQuery({
    queryKey: ['dashTasks', clientId],
    queryFn: () => listTasks({ assigneeClientId: clientId }),
    enabled: Boolean(clientId),
    staleTime: 60_000,
  });

  const threadsQuery = useQuery({
    queryKey: ['dashThreads', clientId],
    queryFn: () => listThreads(clientId),
    enabled: Boolean(clientId),
    staleTime: 60_000,
  });

  const viewsQuery = useQuery({
    queryKey: ['dashViews', clientId],
    queryFn: () => getProfileViews(clientId, { limit: 5 }),
    enabled: Boolean(clientId),
    staleTime: 2 * 60_000,
  });

  const metricsQuery = useQuery({
    queryKey: ['dashMetrics', clientId],
    queryFn: () => fetchEmailMetrics({ clientId }),
    enabled: Boolean(clientId),
    staleTime: 2 * 60_000,
  });

  const meetingsQuery = useQuery({
    queryKey: ['dashMeetings', clientId],
    queryFn: () => listMeetings({ clientId, upcoming: true }),
    enabled: Boolean(clientId),
    staleTime: 2 * 60_000,
  });

  const listsQuery = useQuery({
    queryKey: ['dashLists', clientId],
    queryFn: () => listAssignments({ clientId, includeLists: true }),
    enabled: Boolean(clientId),
    staleTime: 2 * 60_000,
  });

  const profileQuery = useQuery({
    queryKey: ['dashProfile', clientId],
    queryFn: () => getClient(clientId),
    enabled: Boolean(clientId),
    staleTime: 5 * 60_000,
  });

  const openTasks = (tasksQuery.data || []).filter((t: Task) => t.status !== 'done');
  const dueSoon = tasksDueSoon(tasksQuery.data || []);
  const unreadThreads = (threadsQuery.data || []).filter((t) => t.unreadCount > 0);
  const viewStats = viewsQuery.data?.stats;
  const emailStats = metricsQuery.data?.stats;
  const upcomingMeetings = (meetingsQuery.data || []).slice(0, 3);
  const assignedLists = (listsQuery.data?.lists || []) as any[];
  const totalCoaches = assignedLists.reduce((sum: number, l: any) => sum + ((l.items || []).length), 0);

  const profileComplete = PROFILE_FIELDS.filter((f) => f.check(profileQuery.data)).length;
  const profileTotal = PROFILE_FIELDS.length;
  const profilePct = profileTotal ? Math.round((profileComplete / profileTotal) * 100) : 0;
  const missingFields = PROFILE_FIELDS.filter((f) => !f.check(profileQuery.data)).map((f) => f.label);

  if (!clientId) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: colors.black, mb: 1 }}
      >
        {`Welcome back${session?.firstName ? `, ${session.firstName}` : ''}`}
      </Typography>
      <Typography variant="body1" sx={{ color: '#0A0A0A80', mb: 3 }}>
        Here's what's happening with your recruiting.
      </Typography>

      {/* Top Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <MetricCard
          title="Open Tasks"
          value={openTasks.length}
          icon={<IoCheckmarkCircleOutline size={20} />}
          footer={dueSoon.length > 0 ? <Typography variant="caption">{dueSoon.length} due soon</Typography> : undefined}
        />
        <MetricCard
          title="Unread Messages"
          value={unreadThreads.length}
          icon={<IoChatbubblesOutline size={20} />}
        />
        <MetricCard
          title="Profile Views"
          value={viewStats?.totalViews ?? 0}
          icon={<IoEyeOutline size={20} />}
          footer={viewStats?.uniqueViewers ? <Typography variant="caption">{viewStats.uniqueViewers} coaches</Typography> : undefined}
        />
        <MetricCard
          title="Emails Sent"
          value={emailStats?.sentCount ?? 0}
          icon={<IoMailOutline size={20} />}
          footer={emailStats?.openCount ? <Typography variant="caption">{emailStats.openCount} opened</Typography> : undefined}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Profile Completeness */}
        <Link href="/client/profile" style={{ textDecoration: 'none' }}>
          <Box sx={cardSx}>
            <Box sx={sectionHeaderSx}>
              <IoPersonCircleOutline color={colors.lime} size={18} />
              <Typography variant="h6" sx={sectionTitleSx}>Profile Completeness</Typography>
              <Chip label={`${profilePct}%`} size="small" sx={{ ml: 'auto', bgcolor: `${colors.lime}20`, color: colors.lime, fontWeight: 700, fontSize: 11, height: 22 }} />
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {profileQuery.isError ? (
                <QueryError label="profile" onRetry={() => profileQuery.refetch()} />
              ) : (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={profilePct}
                    sx={{
                      height: 8,
                      borderRadius: 0,
                      bgcolor: '#E0E0E0',
                      mb: 1.5,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: profilePct === 100 ? colors.lime : colors.black,
                        borderRadius: 0,
                      },
                    }}
                  />
                  {missingFields.length > 0 ? (
                    <Typography variant="body2" sx={{ color: '#0A0A0A80' }}>
                      Missing: {missingFields.join(', ')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: colors.black, fontWeight: 600 }}>
                      Your profile is complete!
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Link>

        {/* Outstanding Tasks */}
        <Link href="/client/tasks" style={{ textDecoration: 'none' }}>
          <Box sx={cardSx}>
            <Box sx={sectionHeaderSx}>
              <IoClipboardOutline color={colors.lime} size={18} />
              <Typography variant="h6" sx={sectionTitleSx}>Tasks</Typography>
              {openTasks.length > 0 && (
                <Chip label={`${openTasks.length} open`} size="small" sx={{ ml: 'auto', bgcolor: `${colors.lime}20`, color: colors.lime, fontWeight: 700, fontSize: 11, height: 22 }} />
              )}
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {tasksQuery.isError ? (
                <QueryError label="tasks" onRetry={() => tasksQuery.refetch()} />
              ) : openTasks.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#0A0A0A60' }}>
                  No tasks yet -- your agency will assign them.
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  {openTasks.slice(0, 4).map((t) => (
                    <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={t.status} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: t.status === 'in-progress' ? `${colors.lime}20` : '#F0F0F0' }} />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{t.title}</Typography>
                      {t.dueAt && (
                        <Typography variant="caption" sx={{ ml: 'auto', color: '#0A0A0A50', whiteSpace: 'nowrap' }}>
                          {new Date(t.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {openTasks.length > 4 && (
                    <Typography variant="caption" sx={{ color: '#0A0A0A50' }}>+ {openTasks.length - 4} more</Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Link>

        {/* Recent Messages */}
        <Link href="/client/messages" style={{ textDecoration: 'none' }}>
          <Box sx={cardSx}>
            <Box sx={sectionHeaderSx}>
              <IoChatbubblesOutline color={colors.lime} size={18} />
              <Typography variant="h6" sx={sectionTitleSx}>Messages</Typography>
              {unreadThreads.length > 0 && (
                <Chip label={`${unreadThreads.length} unread`} size="small" sx={{ ml: 'auto', bgcolor: `${colors.lime}20`, color: colors.lime, fontWeight: 700, fontSize: 11, height: 22 }} />
              )}
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {threadsQuery.isError ? (
                <QueryError label="messages" onRetry={() => threadsQuery.refetch()} />
              ) : (threadsQuery.data || []).length === 0 ? (
                <Typography variant="body2" sx={{ color: '#0A0A0A60' }}>
                  No conversations yet. Send a message to your agent from the Messages page.
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  {(threadsQuery.data || []).slice(0, 3).map((t) => (
                    <Box key={t.threadId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {t.unreadCount > 0 && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.lime, flexShrink: 0 }} />
                      )}
                      <Typography variant="body2" noWrap sx={{ fontWeight: t.unreadCount > 0 ? 700 : 500, flex: 1 }}>
                        {t.subject || 'No subject'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0A0A0A50', whiteSpace: 'nowrap' }}>
                        {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Link>

        {/* Upcoming Meetings */}
        <Link href="/client/meetings" style={{ textDecoration: 'none' }}>
          <Box sx={cardSx}>
            <Box sx={sectionHeaderSx}>
              <IoCalendarOutline color={colors.lime} size={18} />
              <Typography variant="h6" sx={sectionTitleSx}>Meetings</Typography>
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {meetingsQuery.isError ? (
                <QueryError label="meetings" onRetry={() => meetingsQuery.refetch()} />
              ) : upcomingMeetings.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#0A0A0A60' }}>
                  No upcoming meetings. Your agent can schedule one for you.
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  {upcomingMeetings.map((m) => (
                    <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={m.status} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: m.status === 'confirmed' ? `${colors.lime}20` : '#F0F0F0' }} />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500, flex: 1 }}>{m.title}</Typography>
                      {m.scheduledAt && (
                        <Typography variant="caption" sx={{ color: '#0A0A0A50', whiteSpace: 'nowrap' }}>
                          {new Date(m.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Link>

        {/* Assigned Coach Lists */}
        <Link href="/client/lists" style={{ textDecoration: 'none' }}>
          <Box sx={cardSx}>
            <Box sx={sectionHeaderSx}>
              <IoSchoolOutline color={colors.lime} size={18} />
              <Typography variant="h6" sx={sectionTitleSx}>Coach Lists</Typography>
              {assignedLists.length > 0 && (
                <Chip label={`${totalCoaches} coaches`} size="small" sx={{ ml: 'auto', bgcolor: `${colors.lime}20`, color: colors.lime, fontWeight: 700, fontSize: 11, height: 22 }} />
              )}
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {listsQuery.isError ? (
                <QueryError label="coach lists" onRetry={() => listsQuery.refetch()} />
              ) : assignedLists.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#0A0A0A60' }}>
                  No coach lists assigned yet. Your agency will assign lists for you to work through.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {assignedLists.slice(0, 3).map((l: any) => (
                    <Box key={l.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600, flex: 1 }}>{l.name}</Typography>
                      <Chip label={`${(l.items || []).length} coaches`} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: '#F0F0F0' }} />
                    </Box>
                  ))}
                  {assignedLists.length > 3 && (
                    <Typography variant="caption" sx={{ color: '#0A0A0A50' }}>+ {assignedLists.length - 3} more lists</Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Link>

        {/* Email Activity */}
        <Link href="/client/views" style={{ textDecoration: 'none' }}>
          <Box sx={cardSx}>
            <Box sx={sectionHeaderSx}>
              <IoMailOpenOutline color={colors.lime} size={18} />
              <Typography variant="h6" sx={sectionTitleSx}>Email Activity</Typography>
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {metricsQuery.isError ? (
                <QueryError label="email activity" onRetry={() => metricsQuery.refetch()} />
              ) : !emailStats || emailStats.sentCount === 0 ? (
                <Typography variant="body2" sx={{ color: '#0A0A0A60' }}>
                  No email activity yet. Send your first recruiting email from the Recruiter page.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#0A0A0A60' }}>Sent</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{emailStats.sentCount}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#0A0A0A60' }}>Opened</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{emailStats.openCount ?? 0}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#0A0A0A60' }}>Clicks</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{emailStats.clickCount}</Typography>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </Link>
      </Box>
    </Box>
  );
}
