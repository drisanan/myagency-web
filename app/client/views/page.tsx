'use client';
import React from 'react';
import { Box, Typography, Card, CardContent, Paper, Chip, Stack, Avatar, List, ListItem, ListItemAvatar, ListItemText, CircularProgress } from '@mui/material';
import { FaEye, FaUniversity, FaUser } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { getProfileViews, getWeeklyDigest } from '@/services/profileViews';

export default function ClientProfileViewsPage() {
  const { session } = useSession();
  const clientId = session?.clientId || '';

  const viewsQuery = useQuery({
    queryKey: ['profileViews', clientId],
    queryFn: () => getProfileViews(clientId, { limit: 50 }),
    enabled: Boolean(clientId),
    staleTime: 60000,
  });

  const digestQuery = useQuery({
    queryKey: ['profileViewsDigest', clientId],
    queryFn: () => getWeeklyDigest(clientId),
    enabled: Boolean(clientId),
    staleTime: 300000,
  });

  const views = viewsQuery.data?.views || [];
  const stats = viewsQuery.data?.stats;

  if (viewsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FaEye /> Who's Viewing Your Profile
      </Typography>

      {/* Stats Summary */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
          <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">{stats.totalViews}</Typography>
              <Typography variant="body1" color="text.secondary">Total Profile Views</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">{stats.uniqueViewers}</Typography>
              <Typography variant="body1" color="text.secondary">Coaches Interested</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ bgcolor: 'info.50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">{stats.uniqueUniversities}</Typography>
              <Typography variant="body1" color="text.secondary">Different Schools</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Top Universities */}
      {stats?.topUniversities && stats.topUniversities.length > 0 && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaUniversity /> Top Schools Showing Interest
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {stats.topUniversities.slice(0, 10).map((uni, i) => (
                <Chip
                  key={uni.university}
                  avatar={<Avatar sx={{ bgcolor: i < 3 ? 'warning.main' : 'grey.400' }}>{i + 1}</Avatar>}
                  label={`${uni.university} (${uni.count})`}
                  variant="outlined"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Recent Views List */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Profile Views
          </Typography>
          
          {views.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">
                No profile views yet. Keep working on your profile and reaching out to coaches!
              </Typography>
            </Paper>
          ) : (
            <List>
              {views.map((view) => (
                <ListItem key={view.id} divider data-testid="profile-view-item">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: view.university ? 'primary.main' : 'grey.400' }}>
                      {view.viewerName?.[0]?.toUpperCase() || <FaUser />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {view.viewerName || 'A Coach'}
                        </Typography>
                        {view.position && (
                          <Chip size="small" label={view.position} variant="outlined" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        {view.university && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FaUniversity size={12} /> {view.university}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Viewed {new Date(view.viewedAt).toLocaleDateString()} at {new Date(view.viewedAt).toLocaleTimeString()}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Weekly Digest */}
      {digestQuery.data && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              📊 This Week's Activity
            </Typography>
            <Typography variant="body1">
              You had <strong>{digestQuery.data.summary.totalViews}</strong> profile views this week 
              from <strong>{digestQuery.data.summary.uniqueUniversities}</strong> different schools!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
