'use client';
import React from 'react';
import { Stack, Typography, CircularProgress, Box } from '@mui/material';
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
  // Removed initialData/placeholderData - always fetch fresh from API
  // This ensures we never show client-side placeholder data
  const baseQueryOpts = {
    staleTime: 5 * 60 * 1000, // 5 minutes (reduced from 24h)
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">{sport} Commits</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading recruits...</Typography>
        </Box>
      </Stack>
    );
  }

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


