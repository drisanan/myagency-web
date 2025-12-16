'use client';
import React from 'react';
import { Stack, Typography } from '@mui/material';
import { CommitsTable } from './CommitsTable';
import { Commit, listCommits } from '@/services/commits';
import { useQuery } from '@tanstack/react-query';

async function fetchCommits(sport: 'Football' | 'Basketball', list: 'recent' | 'top') {
  const res = await fetch(`/api/commits?sport=${sport}&list=${list}`);
  if (!res.ok) throw new Error('Failed to load commits');
  const data = await res.json();
  return (data?.data as Commit[]) || [];
}

export function CommitsSection({ sport }: { sport: 'Football' | 'Basketball' }) {
  const initialRecent = React.useMemo(() => listCommits(sport, 'recent'), [sport]);
  const initialTop = React.useMemo(() => listCommits(sport, 'top'), [sport]);

  const baseQueryOpts = {
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 25 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always' as const,
  };

  const recentQ = useQuery<Commit[]>({
    queryKey: ['commits', sport, 'recent'],
    queryFn: () => fetchCommits(sport, 'recent'),
    initialData: initialRecent,
    placeholderData: initialRecent,
    ...baseQueryOpts,
  });
  const topQ = useQuery<Commit[]>({
    queryKey: ['commits', sport, 'top'],
    queryFn: () => fetchCommits(sport, 'top'),
    initialData: initialTop,
    placeholderData: initialTop,
    ...baseQueryOpts,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{sport} Commits</Typography>
      <CommitsTable
        title="Recent Commits (last 365 days)"
        rows={recentQ.data || []}
        showRank={false}
        dataTestId={`commits-${sport.toLowerCase()}-recent-table`}
      />
      <CommitsTable
        title="Top 50 Recruits"
        rows={topQ.data || []}
        showRank
        dataTestId={`commits-${sport.toLowerCase()}-top-table`}
      />
    </Stack>
  );
}


