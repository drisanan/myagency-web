'use client';
import React from 'react';
import { Box, Paper, Typography, Stack, Chip, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';
import { useSession } from '@/features/auth/session';

type RecruitingPeriod = {
  id: string;
  sport: string;
  label: string;
  type: 'dead' | 'contact' | 'quiet' | 'eval' | 'test' | 'other';
  startDate: string;
  endDate: string;
};

const typeColor: Record<RecruitingPeriod['type'], string> = {
  dead: '#f04438', // red
  contact: '#15b79f', // green
  quiet: '#5D4AFB',
  eval: '#5D4AFB',
  test: '#5D4AFB',
  other: '#999DAA',
};

function useRecruitingPeriods(sport: string) {
  return useQuery({
    queryKey: ['recruiting-periods', sport],
    queryFn: async () => {
      const res = await fetch(`/api/recruiting-periods?sport=${encodeURIComponent(sport || 'Football')}`);
      if (!res.ok) throw new Error('Failed to load periods');
      const data = await res.json();
      return (data?.data as RecruitingPeriod[]) || [];
    },
  });
}

function formatRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString();
  const e = new Date(end).toLocaleDateString();
  return s === e ? s : `${s} – ${e}`;
}

function getWeekDays(from: Date) {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function findDayPeriods(day: Date, periods: RecruitingPeriod[]) {
  return periods.filter((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return day >= start && day <= end;
  });
}

function shortDate(day: Date) {
  return day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecruitingCalendarCard() {
  const { session, loading: sessionLoading } = useSession();
  const sports = getSports();
  
  // Use saved preference from agency settings, fallback to first sport or 'Football'
  const savedPreference = session?.agencySettings?.preferredSport;
  const fallbackSport = sports[0] || 'Football';
  
  // Track the last applied preference to detect changes
  const [lastAppliedPref, setLastAppliedPref] = React.useState<string | null>(null);
  const [sport, setSport] = React.useState(fallbackSport);
  
  // Sync sport with saved preference whenever it changes
  React.useEffect(() => {
    // Wait for session to finish loading
    if (sessionLoading) return;
    
    // If there's a saved preference and it's different from what we last applied
    if (savedPreference && sports.includes(savedPreference)) {
      if (savedPreference !== lastAppliedPref) {
        console.log('[RecruitingCalendar] Applying saved preference:', savedPreference);
        setSport(savedPreference);
        setLastAppliedPref(savedPreference);
      }
    } else if (!savedPreference && lastAppliedPref === null) {
      // No saved preference on initial load, mark as checked
      setLastAppliedPref('__none__');
    }
  }, [savedPreference, sports, sessionLoading, lastAppliedPref]);
  
  const { data = [], isLoading } = useRecruitingPeriods(sport);
  const today = new Date();
  const weekDays = getWeekDays(today);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '16px' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6">Recruiting Calendar</Typography>
        <Select
          size="small"
          value={sport}
          onChange={(e: SelectChangeEvent) => setSport(e.target.value)}
          data-testid="recruiting-calendar-sport"
        >
          {sports.map((s) => (
            <MenuItem key={s} value={s}>{formatSportLabel(s)}</MenuItem>
          ))}
        </Select>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip size="small" label="Dead" sx={{ bgcolor: typeColor.dead, color: '#fff' }} />
        <Chip size="small" label="Contact" sx={{ bgcolor: typeColor.contact, color: '#fff' }} />
        <Chip size="small" label="Quiet" sx={{ bgcolor: typeColor.quiet, color: '#fff' }} />
        <Chip size="small" label="Other/Test" sx={{ bgcolor: typeColor.test, color: '#fff' }} />
        <Chip size="small" label="Today" sx={{ bgcolor: '#fff', color: '#14151E', border: '1px solid #dcdfe4' }} />
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading periods…</Typography>
      ) : data.length === 0 ? (
        <Typography color="text.secondary">No periods available.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(110px, 1fr))', gap: 1 }}>
          {weekDays.map((day) => {
            const dayPeriods = findDayPeriods(day, data);
            const color = dayPeriods[0] ? typeColor[dayPeriods[0].type] || typeColor.other : '#dcdfe4';
            const isToday = day.toDateString() === today.toDateString();
            return (
              <Paper
                key={day.toISOString()}
                data-testid="calendar-day"
                variant="outlined"
                sx={{
                  position: 'relative',
                  p: 1.25,
                  borderRadius: '12px',
                  minHeight: 90,
                  bgcolor: isToday ? '#fff' : dayPeriods[0] ? `${color}1a` : '#fff',
                  border: `1px solid ${isToday ? '#dcdfe4' : dayPeriods[0] ? color : '#dcdfe4'}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="subtitle2">{shortDate(day)}</Typography>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ flexWrap: 'wrap', maxWidth: '70%' }}>
                    {dayPeriods.slice(0, 2).map((p) => {
                      const c = typeColor[p.type] || typeColor.other;
                      return (
                        <Chip
                          key={p.id}
                          size="small"
                          label={p.label}
                          sx={{ bgcolor: c, color: '#fff' }}
                          data-testid="calendar-period-chip"
                        />
                      );
                    })}
                    {dayPeriods.length > 2 ? (
                      <Chip size="small" label={`+${dayPeriods.length - 2}`} sx={{ bgcolor: '#999DAA', color: '#fff' }} />
                    ) : null}
                  </Stack>
                </Stack>
                {dayPeriods.length > 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    {formatRange(dayPeriods[0].startDate, dayPeriods[0].endDate)}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No period
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}


