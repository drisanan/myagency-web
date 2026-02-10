'use client';
import React from 'react';
import { Stack, Typography, Box, Paper, Alert } from '@mui/material';
import { LoadingState } from '@/components/LoadingState';
import { CommitsTable } from './CommitsTable';
import { Commit } from '@/services/commits';
import { useQuery } from '@tanstack/react-query';

async function fetchCommits(sport: 'Football' | 'Basketball', list: 'recent' | 'top') {
  const res = await fetch(`/api/commits?sport=${sport}&list=${list}`);
  if (!res.ok) throw new Error('Failed to load commits');
  const data = await res.json();
  return (data?.data as Commit[]) || [];
}

export function CommitsSection({ sport }: { sport: 'Football' | 'Basketball' }) {
  const baseQueryOpts = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
  };

  const recentQ = useQuery<Commit[]>({
    queryKey: ['commits', sport, 'recent'],
    queryFn: () => fetchCommits(sport, 'recent'),
    ...baseQueryOpts,
  });
  const topQ = useQuery<Commit[]>({
    queryKey: ['commits', sport, 'top'],
    queryFn: () => fetchCommits(sport, 'top'),
    ...baseQueryOpts,
  });

  const isLoading = recentQ.isLoading || topQ.isLoading;
  const recentData = recentQ.data || [];
  const topData = topQ.data || [];
  const hasNoData = !isLoading && recentData.length === 0 && topData.length === 0;

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">{sport} Commits</Typography>
        <LoadingState message="Loading recruits..." />
      </Stack>
    );
  }

  if (hasNoData) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">{sport} Commits</Typography>
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="info" sx={{ justifyContent: 'center' }}>
            Live recruiting data is currently unavailable for {sport}. Data refreshes automatically — check back shortly.
          </Alert>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{sport} Commits</Typography>
      {recentData.length > 0 && (
        <CommitsTable
          title="Recent Commits"
          rows={recentData}
          showRank={false}
          dataTestId={`commits-${sport.toLowerCase()}-recent-table`}
        />
      )}
      {topData.length > 0 && (
        <CommitsTable
          title="Top 50 Recruits"
          rows={topData}
          showRank
          dataTestId={`commits-${sport.toLowerCase()}-top-table`}
        />
      )}
    </Stack>
  );
}
