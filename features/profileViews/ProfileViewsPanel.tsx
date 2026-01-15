'use client';
import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { FaEye, FaUniversity, FaUser, FaChartBar } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { getProfileViews, getWeeklyDigest, ProfileView } from '@/services/profileViews';

type Props = {
  clientId: string;
  showDigest?: boolean;
};

export function ProfileViewsPanel({ clientId, showDigest = false }: Props) {
  const [tab, setTab] = React.useState(0);

  const viewsQuery = useQuery({
    queryKey: ['profileViews', clientId],
    queryFn: () => getProfileViews(clientId, { limit: 50 }),
    staleTime: 60000,
  });

  const digestQuery = useQuery({
    queryKey: ['profileViewsDigest', clientId],
    queryFn: () => getWeeklyDigest(clientId),
    enabled: showDigest,
    staleTime: 300000,
  });

  const views = viewsQuery.data?.views || [];
  const stats = viewsQuery.data?.stats;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaEye /> Profile Views
        </Typography>
      </Stack>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">{stats.totalViews}</Typography>
              <Typography variant="body2" color="text.secondary">Total Views</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="secondary">{stats.uniqueViewers}</Typography>
              <Typography variant="body2" color="text.secondary">Unique Coaches</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">{stats.uniqueUniversities}</Typography>
              <Typography variant="body2" color="text.secondary">Universities</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {showDigest && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Recent Views" />
          <Tab label="Weekly Digest" icon={<FaChartBar />} iconPosition="start" />
          <Tab label="Top Schools" icon={<FaUniversity />} iconPosition="start" />
        </Tabs>
      )}

      {(!showDigest || tab === 0) && (
        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
          {viewsQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : views.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">No profile views yet.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {views.map((view) => (
                <ListItem key={view.id} divider data-testid="profile-view-item">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: view.university ? 'primary.main' : 'grey.400' }}>
                      {view.viewerName?.[0] || <FaUser />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {view.viewerName || view.viewerEmail || 'Unknown Viewer'}
                        </Typography>
                        {view.position && (
                          <Chip size="small" label={view.position} variant="outlined" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <>
                        {view.university && (
                          <Typography variant="body2" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FaUniversity size={12} /> {view.university}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(view.viewedAt).toLocaleString()} • via {view.source || 'direct'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {showDigest && tab === 1 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          {digestQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : digestQuery.data ? (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Weekly Summary ({new Date(digestQuery.data.period.start).toLocaleDateString()} - {new Date(digestQuery.data.period.end).toLocaleDateString()})
              </Typography>
              <Stack spacing={1}>
                <Typography>Total Views: <strong>{digestQuery.data.summary.totalViews}</strong></Typography>
                <Typography>Unique Universities: <strong>{digestQuery.data.summary.uniqueUniversities}</strong></Typography>
              </Stack>
            </Box>
          ) : (
            <Typography color="text.secondary">No digest data available.</Typography>
          )}
        </Paper>
      )}

      {showDigest && tab === 2 && stats?.topUniversities && (
        <Paper variant="outlined">
          <List>
            {stats.topUniversities.map((uni, i) => (
              <ListItem key={uni.university} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? '#cd7f32' : 'grey.400' }}>
                    {i + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={uni.university}
                  secondary={`${uni.count} view${uni.count !== 1 ? 's' : ''}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
