'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, Skeleton, Stack, Tooltip } from '@mui/material';
import { fetchEmailMetrics } from '@/services/emailTracking';
import { useSession } from '@/features/auth/session';

type Props = {
  clientId?: string;
  compact?: boolean;
};

export function EmailMetricsCard({ clientId, compact = false }: Props) {
  const { session } = useSession();
  
  const { data, isLoading } = useQuery({
    queryKey: ['emailMetrics', clientId, session?.agencyId],
    queryFn: () => fetchEmailMetrics({ clientId, days: 30 }),
    enabled: Boolean(session?.agencyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <Skeleton variant="rounded" height={compact ? 80 : 150} />;
  }

  const stats = data?.stats || data?.totals || { sentCount: 0, clickCount: 0 };
  const clickRate = stats.sentCount > 0 
    ? ((stats.clickCount / stats.sentCount) * 100).toFixed(1) 
    : '0';

  if (compact) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Emails Sent (30 days)">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">📧</Typography>
            <Typography variant="body2">{stats.sentCount}</Typography>
          </Stack>
        </Tooltip>
        <Tooltip title="Link Clicks">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">👆</Typography>
            <Typography variant="body2">{stats.clickCount}</Typography>
          </Stack>
        </Tooltip>
        <Tooltip title="Click Rate">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">📈</Typography>
            <Typography variant="body2">{clickRate}%</Typography>
          </Stack>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Email Analytics (30 days)</Typography>
        <Stack direction="row" spacing={4} flexWrap="wrap">
          <Box>
            <Typography variant="h4" color="primary">{stats.sentCount}</Typography>
            <Typography variant="body2" color="text.secondary">Emails Sent</Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="success.main">{stats.clickCount}</Typography>
            <Typography variant="body2" color="text.secondary">Link Clicks</Typography>
          </Box>
          <Box>
            <Typography variant="h4">{clickRate}%</Typography>
            <Typography variant="body2" color="text.secondary">Click Rate</Typography>
          </Box>
          <Box>
            <Typography variant="h4">{stats.uniqueClickers || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Coaches Engaged</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
