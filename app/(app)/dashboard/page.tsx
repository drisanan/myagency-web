'use client';
import React from 'react';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import { listAgencies } from '@/services/agencies';
import { listClientsByAgencyEmail } from '@/services/clients';
import { Typography, Box, Skeleton, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getMailEntries } from '@/services/mailStatus';
import { getScholarships, setScholarships } from '@/services/scholarships';
import { IoMailOpenOutline, IoPaperPlaneOutline, IoPersonAddOutline, IoTrendingUpOutline, IoFastFoodOutline } from 'react-icons/io5';
import { MetricCard } from './MetricCard';
import { RecruitingCalendarCard } from '@/features/recruiter/RecruitingCalendarCard';
import { CommitsSection } from '@/features/commits/CommitsSection';
import { computeEmailMetrics, computeOpenRateMetrics, countAddedThisMonth, formatDelta, type MetricsResponse } from './metrics';

export default function DashboardPage() {
  const { session } = useSession();
  const isParent = session?.role === 'parent';
  const q = useQuery<any[]>({
    queryKey: ['dashboard', session?.role, session?.agencyId],
    queryFn: () => isParent ? listAgencies() : listClientsByAgencyEmail(session!.email),
    enabled: !!session && (isParent || !!session?.email),
  });
  const [schInput, setSchInput] = React.useState<string>('');
  const [metrics, setMetrics] = React.useState<MetricsResponse | null>(null);
  const isLoading = q.isInitialLoading;

  React.useEffect(() => {
    if (!session?.email || isParent) return;
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    // load computed stats from server
    fetch(`/api/metrics/stats?agencyEmail=${encodeURIComponent(session.email)}&days=60`)
      .then(r => r.json())
      .then(d => {
        if (d?.ok) {
          setMetrics(d);
        }
      })
      .catch(() => {});
    setSchInput(String(getScholarships(session.email)));
  }, [session?.email, isParent]);
  if (!session) return null;

  if (isParent) {
    const rows = q.data ?? [];
    const columns: GridColDef[] = [{ field: 'name', headerName: 'Agency', flex: 1 }];
    return (
      <>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <div style={{ height: 520 }}>
          <DataGrid
            rows={rows as any[]}
            columns={columns}
            getRowId={(r)=>r.id}
            loading={isLoading}
          />
        </div>
      </>
    );
  }

  // Agency dashboard
  const clients = (q.data ?? []) as any[];
  const clientIds = new Set<string>(clients.map(c => c.id));
  const totalClients = clients.length;

  // Emails sent (count mail logs whose clientId belongs to this agency)
  const mail = getMailEntries().filter(m => clientIds.has(m.clientId));
  const emailsFallback = mail.length;

  const placeholderRate = Number(process.env.NEXT_PUBLIC_OPEN_RATE_PLACEHOLDER ?? '');
  const { emailsSent, deltaPct: emailsDelta } = computeEmailMetrics(metrics, emailsFallback);
  const { openRate, deltaPct: openRateDelta } = computeOpenRateMetrics(
    metrics,
    Number.isFinite(placeholderRate) ? placeholderRate : undefined,
  );
  const addedThisMonth = countAddedThisMonth(clients);

  // Grad year breakdown: current year..current+3 (inclusive)
  const thisYear = new Date().getFullYear();
  const years = [thisYear, thisYear + 1, thisYear + 2, thisYear + 3];
  const byYear: Record<number, number> = { [years[0]]: 0, [years[1]]: 0, [years[2]]: 0, [years[3]]: 0 };
  clients.forEach(c => {
    const gy = Number(c?.radar?.graduationYear || c?.graduationYear || 0);
    if (years.includes(gy)) byYear[gy] = (byYear[gy] || 0) + 1;
  });

  function saveScholarships() {
    if (!session?.email) return;
    setScholarships(session.email, Number(schInput) || 0);
    setSchInput(String(getScholarships(session.email)));
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {isLoading ? (
        <Skeleton variant="rectangular" height={260} sx={{ mb: 3, borderRadius: 2 }} />
      ) : (
      <RecruitingCalendarCard />
      )}

      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <MetricCard
          title="Emails Sent"
          value={emailsSent}
          icon={<IoPaperPlaneOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color="#15b79f" size={18} />
              <Typography variant="body2" sx={{ color: '#667085' }}>
                <Box component="span" sx={{ color: '#15b79f' }}>{formatDelta(emailsDelta)}</Box> vs last 30d
              </Typography>
            </>
          }
        />
        <MetricCard
          title="Open Rate"
          value={`${Math.round((openRate || 0) * 100)}%`}
          icon={<IoMailOpenOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color="#15b79f" size={18} />
              <Typography variant="body2" sx={{ color: '#667085' }}>
                <Box component="span" sx={{ color: '#15b79f' }}>{formatDelta(openRateDelta)}</Box> vs last 30d
              </Typography>
            </>
          }
        />
        <MetricCard
          title="Total Athletes"
          value={totalClients}
          icon={<IoPersonAddOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color="#15b79f" size={18} />
              <Typography variant="body2" sx={{ color: '#667085' }}>
                <Box component="span" sx={{ color: '#15b79f' }}>+{addedThisMonth}</Box> added this month
              </Typography>
            </>
          }
        />
      </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {years.map((y, idx) => (
          <MetricCard
            key={y}
            title={`Class of ${y}`}
            value={byYear[y] || 0}
            icon={<IoFastFoodOutline size={20} />}
            bgColor={idx === 0 ? '#5D4AFB' : undefined}
            textColor={idx === 0 ? '#FFFFFF' : undefined}
            bgImage={idx === 0 ? '/marketing/bg-an.png' : undefined}
          />
        ))}
      </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <CommitsSection sport="Football" />
        <CommitsSection sport="Basketball" />
      </Box>
    </>
  );
}


