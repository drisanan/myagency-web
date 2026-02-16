'use client';
import React from 'react';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import { listAgencies } from '@/services/agencies';
import { listClientsByAgencyEmail } from '@/services/clients';
import { Typography, Box, Skeleton, Stack, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getScholarships, setScholarships } from '@/services/scholarships';
import { IoMailOpenOutline, IoPaperPlaneOutline, IoPersonAddOutline, IoTrendingUpOutline, IoFastFoodOutline } from 'react-icons/io5';
import { MetricCard } from './MetricCard';
import { RecruitingCalendarCard } from '@/features/recruiter/RecruitingCalendarCard';
import { CommitsSection } from '@/features/commits/CommitsSection';
import { GoogleCalendarWidget } from '@/features/calendar';
import { computeMetricsFromApi, countAddedThisMonth, formatDelta } from './metrics';
import { fetchEmailMetrics } from '@/services/emailTracking';
import { useTour } from '@/features/tour/TourProvider';
import { dashboardSteps } from '@/features/tour/dashboardSteps';
import { dashboardDataGridSx, dashboardTablePaperSx } from '@/components/tableStyles';

export default function DashboardPage() {
  const { session } = useSession();
  const { startTour } = useTour();
  const isParent = session?.role === 'parent';
  const q = useQuery<any[]>({
    queryKey: ['dashboard', session?.role, session?.agencyId],
    queryFn: () => isParent ? listAgencies() : listClientsByAgencyEmail(session!.email),
    enabled: !!session && (isParent || !!session?.email),
  });
  const [schInput, setSchInput] = React.useState<string>('');
  const isLoading = q.isInitialLoading;
  const metricsEnabled = !!session?.email && !isParent;

  const metrics30 = useQuery({
    queryKey: ['dashboard-metrics', session?.email, 30],
    queryFn: () => fetchEmailMetrics({ days: 30 }),
    enabled: metricsEnabled,
    refetchInterval: 60_000,
  });
  const metrics60 = useQuery({
    queryKey: ['dashboard-metrics', session?.email, 60],
    queryFn: () => fetchEmailMetrics({ days: 60 }),
    enabled: metricsEnabled,
    refetchInterval: 60_000,
  });

  React.useEffect(() => {
    if (!session?.email || isParent) return;
    setSchInput(String(getScholarships(session.email)));
  }, [session?.email, isParent]);
  React.useEffect(() => {
    if (!isParent) {
      startTour('dashboard', dashboardSteps);
    }
  }, [isParent, startTour]);
  if (!session) return null;

  if (isParent) {
    const rows = q.data ?? [];
    const columns: GridColDef[] = [{ field: 'name', headerName: 'Agency', flex: 1 }];
    return (
      <>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Paper sx={{ height: 520, ...dashboardTablePaperSx }}>
          <DataGrid
            rows={rows as any[]}
            columns={columns}
            getRowId={(r)=>r.id}
            loading={isLoading}
            sx={dashboardDataGridSx}
          />
        </Paper>
      </>
    );
  }

  // Agency dashboard
  const clients = (q.data ?? []) as any[];
  const totalClients = clients.length;

  // Metrics from durable Lambda API (DynamoDB-backed, refreshes every 60s)
  const { emailsSent, emailsDelta } = computeMetricsFromApi(
    metrics30.data ?? null,
    metrics60.data ?? null,
  );
  const addedThisMonth = countAddedThisMonth(clients);

  // Grad year breakdown: fixed window 2026-2029 (left-to-right)
  const years = [2026, 2027, 2028, 2029];
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
      <Box data-tour="calendar-widget">
        <RecruitingCalendarCard />
      </Box>
      )}

      {/* Google Calendar Widget - My Schedule */}
      {!isLoading && !isParent && (
        <Box sx={{ mb: 3 }} data-tour="google-calendar">
          <GoogleCalendarWidget />
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : (
      <Box
        id="metrics-cards"
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}
      >
        <MetricCard
          title="Emails Sent"
          value={emailsSent}
          icon={<IoPaperPlaneOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color="#CCFF00" size={18} />
              <Typography variant="body2" sx={{ color: '#FFFFFF60' }}>
                <Box component="span" sx={{ color: '#CCFF00' }}>{formatDelta(emailsDelta)}</Box> vs last 30d
              </Typography>
            </>
          }
        />
        <MetricCard
          title="Unique Recipients"
          value={metrics30.data?.totals?.uniqueRecipients ?? 0}
          icon={<IoMailOpenOutline size={20} />}
          footer={
            <>
              <IoTrendingUpOutline color="#CCFF00" size={18} />
              <Typography variant="body2" sx={{ color: '#FFFFFF60' }}>
                Last 30 days
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
              <IoTrendingUpOutline color="#CCFF00" size={18} />
              <Typography variant="body2" sx={{ color: '#FFFFFF60' }}>
                <Box component="span" sx={{ color: '#CCFF00' }}>+{addedThisMonth}</Box> added this month
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
            
          />
        ))}
      </Box>
      )}

      <Box data-tour="commits-section" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <CommitsSection sport="Football" />
        <CommitsSection sport="Basketball" />
      </Box>
    </>
  );
}


