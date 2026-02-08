'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import {
  IoPeopleOutline,
  IoPaperPlaneOutline,
  IoEyeOutline,
  IoMailOpenOutline,
  IoCheckmarkCircleOutline,
  IoMegaphoneOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';

import { MetricCard } from '../dashboard/MetricCard';
import { EmailActivityChart, ProfileViewsChart } from './ReportCharts';
import { ClientLeaderboard, type LeaderboardRow } from './ClientLeaderboard';
import { ActivityTimeline } from './ActivityTimeline';

import { getClients, type Client } from '@/services/clients';
import { getActivityReport, listActivities, type Activity } from '@/services/activity';
import { fetchEmailMetrics, type EmailMetrics } from '@/services/emailTracking';
import { getWeeklyDigest } from '@/services/profileViews';
import { listTasks, type Task } from '@/services/tasks';
import { listCampaigns, type Campaign } from '@/services/campaigns';
import { colors } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */

/** Format a date as "Jan 12" */
function fmtShort(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Build array of last N day labels */
function last30DayLabels(): string[] {
  const out: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(fmtShort(d));
  }
  return out;
}

/** Bucket timestamps into daily counts over last 30 days. Returns map: dateLabel -> count */
function bucketByDay(timestamps: number[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const ts of timestamps) {
    const label = fmtShort(new Date(ts));
    map[label] = (map[label] || 0) + 1;
  }
  return map;
}

/** Relative time for leaderboard "last active" */
function relativeTime(ts: number | undefined): string {
  if (!ts) return 'Never';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Delta formatted with sign */
function fmtDelta(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

/* ------------------------------------------------------------------ */
/*  page component                                                     */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();

  /* ---- role guard ---- */
  React.useEffect(() => {
    if (!sessionLoading && session?.role !== 'agency') {
      router.replace('/dashboard');
    }
  }, [session, sessionLoading, router]);

  /* ---- data queries (all in parallel) ---- */

  const clientsQ = useQuery({
    queryKey: ['reports-clients'],
    queryFn: () => getClients(),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  const activityReportQ = useQuery({
    queryKey: ['reports-activity-report'],
    queryFn: () => getActivityReport(),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  const recentActivitiesQ = useQuery({
    queryKey: ['reports-recent-activities'],
    queryFn: () => listActivities({ limit: 20 }),
    enabled: session?.role === 'agency',
    staleTime: 30_000,
  });

  const emailMetricsQ = useQuery({
    queryKey: ['reports-email-metrics', 30],
    queryFn: () => fetchEmailMetrics({ days: 30 }),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  const emailMetricsPrevQ = useQuery({
    queryKey: ['reports-email-metrics-prev', 60],
    queryFn: () => fetchEmailMetrics({ days: 60 }),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  const profileDigestQ = useQuery({
    queryKey: ['reports-profile-digest'],
    queryFn: () => getWeeklyDigest(),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  const tasksQ = useQuery({
    queryKey: ['reports-tasks'],
    queryFn: () => listTasks({}),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  const campaignsQ = useQuery({
    queryKey: ['reports-campaigns'],
    queryFn: () => listCampaigns(),
    enabled: session?.role === 'agency',
    staleTime: 60_000,
  });

  /* ---- guard rendering ---- */
  if (sessionLoading || session?.role !== 'agency') {
    return <LoadingState message="Loading reports..." />;
  }

  const isLoading =
    clientsQ.isLoading ||
    activityReportQ.isLoading ||
    emailMetricsQ.isLoading ||
    profileDigestQ.isLoading ||
    tasksQ.isLoading ||
    campaignsQ.isLoading;

  if (isLoading) {
    return <LoadingState message="Loading reports..." />;
  }

  /* ---- derive KPI values ---- */

  const clients: Client[] = clientsQ.data ?? [];
  const activityReport = activityReportQ.data;
  const emailMetrics: EmailMetrics = emailMetricsQ.data ?? { ok: false };
  const emailMetricsPrev: EmailMetrics = emailMetricsPrevQ.data ?? { ok: false };
  const digest = profileDigestQ.data;
  const tasks: Task[] = tasksQ.data ?? [];
  const campaigns: Campaign[] = campaignsQ.data ?? [];
  const recentActivities: Activity[] = recentActivitiesQ.data ?? [];

  // Total athletes
  const totalAthletes = clients.length;
  const now = Date.now();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const addedThisMonth = clients.filter(
    (c) => c.createdAt && new Date(c.createdAt).getTime() >= startOfMonth.getTime()
  ).length;

  // Emails sent (30d)
  const emailsSent30d = emailMetrics.stats?.sentCount ?? emailMetrics.totals?.sentCount ?? 0;
  const emailsSent60d = emailMetricsPrev.stats?.sentCount ?? emailMetricsPrev.totals?.sentCount ?? 0;
  const emailsSentPrev30d = emailsSent60d - emailsSent30d; // approximate previous 30d
  const emailsDelta = fmtDelta(emailsSent30d, emailsSentPrev30d > 0 ? emailsSentPrev30d : 0);

  // Profile views (7d)
  const profileViewsTotal = digest?.summary?.totalViews ?? 0;

  // Open rate
  const clicks30d = emailMetrics.stats?.clickCount ?? emailMetrics.totals?.clickCount ?? 0;
  const openRate = emailsSent30d > 0 ? Math.round((clicks30d / emailsSent30d) * 100) : 0;
  const clicksPrev = (emailMetricsPrev.stats?.clickCount ?? emailMetricsPrev.totals?.clickCount ?? 0) - clicks30d;
  const prevOpenRate =
    emailsSentPrev30d > 0 ? Math.round((clicksPrev / emailsSentPrev30d) * 100) : 0;
  const openRateDelta = fmtDelta(openRate, prevOpenRate);

  // Tasks completed (30d)
  const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;
  const completedTasks = tasks.filter(
    (t) => t.status === 'done' && t.updatedAt && t.updatedAt >= thirtyDaysAgo
  ).length;

  // Active campaigns
  const activeCampaigns = campaigns.filter((c) => c.status === 'sent').length;

  /* ---- chart data ---- */

  const dayLabels = last30DayLabels();

  // Email chart data: bucket recentSends by day
  const sendTimestamps = emailMetrics.recentSends?.map((s) => s.sentAt) ?? [];
  const sendBuckets = bucketByDay(sendTimestamps);

  // For opens, use activity report data
  const openActivities =
    activityReport?.recentActivities?.filter((a) => a.activityType === 'email_opened') ?? [];
  const openBuckets = bucketByDay(openActivities.map((a) => a.createdAt));

  const emailChartData = dayLabels.map((label) => ({
    date: label,
    sends: sendBuckets[label] || 0,
    opens: openBuckets[label] || 0,
  }));

  // Profile views chart data
  const viewActivities =
    activityReport?.recentActivities?.filter(
      (a) => a.activityType === 'profile_viewed_by_coach'
    ) ?? [];
  const viewBuckets = bucketByDay(viewActivities.map((a) => a.createdAt));
  const viewChartData = dayLabels.map((label) => ({
    date: label,
    views: viewBuckets[label] || 0,
  }));

  /* ---- leaderboard data ---- */

  // Build per-client engagement from emailMetrics.byClient, digest.digests, and tasks
  const clientMap = new Map<string, { emailsSent: number; views: number; tasks: number; lastActive: number }>();

  // Seed from clients list
  for (const c of clients) {
    clientMap.set(c.id, { emailsSent: 0, views: 0, tasks: 0, lastActive: 0 });
  }

  // Email counts per client
  if (emailMetrics.byClient) {
    for (const [cid, data] of Object.entries(emailMetrics.byClient)) {
      const existing = clientMap.get(cid);
      if (existing) {
        existing.emailsSent = data.sent;
      }
    }
  }

  // Profile views per client
  if (digest?.digests) {
    for (const d of digest.digests) {
      const existing = clientMap.get(d.clientId);
      if (existing) {
        existing.views = d.totalViews;
      }
    }
  }

  // Tasks per client
  for (const t of tasks) {
    if (t.status === 'done' && t.assigneeClientId) {
      const existing = clientMap.get(t.assigneeClientId);
      if (existing) {
        existing.tasks += 1;
      }
    }
  }

  // Last active from activities
  for (const act of recentActivities) {
    if (act.clientId) {
      const existing = clientMap.get(act.clientId);
      if (existing && act.createdAt > existing.lastActive) {
        existing.lastActive = act.createdAt;
      }
    }
  }

  const leaderboardRows: LeaderboardRow[] = clients
    .map((c) => {
      const stats = clientMap.get(c.id) || { emailsSent: 0, views: 0, tasks: 0, lastActive: 0 };
      return {
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        emailsSent: stats.emailsSent,
        profileViews: stats.views,
        tasksCompleted: stats.tasks,
        lastActive: relativeTime(stats.lastActive || undefined),
        engagementScore: stats.emailsSent + stats.views + stats.tasks,
        rank: 0,
      };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .map((row, i) => ({ ...row, rank: i + 1 }))
    .slice(0, 25);

  /* ---- render ---- */

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Page title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 3,
        }}
      >
        Reports
      </Typography>

      {/* ── KPI Summary Row ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <MetricCard
          title="Total Athletes"
          value={totalAthletes}
          icon={<IoPeopleOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color={colors.lime} size={16} />
              <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
                <Box component="span" sx={{ color: colors.lime }}>+{addedThisMonth}</Box>{' '}
                this month
              </Typography>
            </>
          }
        />
        <MetricCard
          title="Emails Sent"
          value={emailsSent30d}
          icon={<IoPaperPlaneOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color={colors.lime} size={16} />
              <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
                <Box component="span" sx={{ color: colors.lime }}>{emailsDelta}</Box>{' '}
                vs prev 30d
              </Typography>
            </>
          }
        />
        <MetricCard
          title="Profile Views"
          value={profileViewsTotal}
          icon={<IoEyeOutline size={20} />}
          footer={
            <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
              Last 7 days
            </Typography>
          }
        />
        <MetricCard
          title="Click Rate"
          value={`${openRate}%`}
          icon={<IoMailOpenOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color={colors.lime} size={16} />
              <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
                <Box component="span" sx={{ color: colors.lime }}>{openRateDelta}</Box>{' '}
                vs prev 30d
              </Typography>
            </>
          }
        />
        <MetricCard
          title="Tasks Done"
          value={completedTasks}
          icon={<IoCheckmarkCircleOutline size={20} />}
          footer={
            <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
              Last 30 days
            </Typography>
          }
        />
        <MetricCard
          title="Campaigns"
          value={activeCampaigns}
          icon={<IoMegaphoneOutline size={20} />}
          footer={
            <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
              Sent campaigns
            </Typography>
          }
        />
      </Box>

      {/* ── Trend Charts ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <EmailActivityChart data={emailChartData} />
        <ProfileViewsChart data={viewChartData} />
      </Box>

      {/* ── Leaderboard + Timeline ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          gap: 3,
        }}
      >
        <ClientLeaderboard rows={leaderboardRows} />
        <ActivityTimeline activities={recentActivities} />
      </Box>
    </Box>
  );
}
