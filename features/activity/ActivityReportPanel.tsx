'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { 
  FaChartLine, 
  FaSignInAlt, 
  FaUserEdit, 
  FaCheckSquare, 
  FaEnvelope, 
  FaEye, 
  FaList, 
  FaCalendarCheck, 
  FaFileAlt 
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { getActivityReport, listActivities, Activity, ActivityType } from '@/services/activity';

type Props = {
  clientId?: string;
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
  login: <FaSignInAlt />,
  profile_update: <FaUserEdit />,
  task_completed: <FaCheckSquare />,
  email_sent: <FaEnvelope />,
  email_opened: <FaEnvelope />,
  profile_viewed_by_coach: <FaEye />,
  list_created: <FaList />,
  meeting_requested: <FaCalendarCheck />,
  form_submitted: <FaFileAlt />,
};

const activityLabels: Record<ActivityType, string> = {
  login: 'Login',
  profile_update: 'Profile Update',
  task_completed: 'Task Completed',
  email_sent: 'Email Sent',
  email_opened: 'Email Opened',
  profile_viewed_by_coach: 'Profile Viewed',
  list_created: 'List Created',
  meeting_requested: 'Meeting Requested',
  form_submitted: 'Form Submitted',
};

export function ActivityReportPanel({ clientId }: Props) {
  const [tab, setTab] = React.useState(0);

  const reportQuery = useQuery({
    queryKey: ['activityReport', clientId],
    queryFn: () => getActivityReport(clientId),
    staleTime: 60000,
  });

  const activitiesQuery = useQuery({
    queryKey: ['activities', clientId],
    queryFn: () => listActivities({ clientId, limit: 50 }),
    staleTime: 30000,
  });

  const report = reportQuery.data;
  const activities = activitiesQuery.data || [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaChartLine /> Activity Report
        </Typography>
      </Stack>

      {/* Summary Stats */}
      {report && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">{report.period.day.count}</Typography>
              <Typography variant="body2" color="text.secondary">Today</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="secondary">{report.period.week.count}</Typography>
              <Typography variant="body2" color="text.secondary">This Week</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">{report.period.month.count}</Typography>
              <Typography variant="body2" color="text.secondary">This Month</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">{report.coachActivity.count}</Typography>
              <Typography variant="body2" color="text.secondary">Coach Interactions</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Recent Activity" />
        <Tab label="Coach Activity" />
        <Tab label="Athlete Activity" />
        <Tab label="By Type" />
      </Tabs>

      {reportQuery.isLoading || activitiesQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && (
            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List disablePadding>
                {activities.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No activity recorded yet." />
                  </ListItem>
                ) : (
                  activities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem data-testid="activity-item">
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {activityIcons[activity.activityType] || <FaChartLine />}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">{activity.description}</Typography>
                              <Chip 
                                size="small" 
                                label={activityLabels[activity.activityType] || activity.activityType}
                                variant="outlined"
                              />
                            </Stack>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary">
                                {activity.actorEmail} • {new Date(activity.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          )}

          {tab === 1 && report && (
            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Coach Interactions ({report.coachActivity.count} total)
                </Typography>
                <List disablePadding>
                  {report.coachActivity.recent.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No coach activity yet." />
                    </ListItem>
                  ) : (
                    report.coachActivity.recent.map((activity) => (
                      <ListItem key={activity.id} divider>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <FaEye />
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.createdAt).toLocaleString()}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            </Paper>
          )}

          {tab === 2 && report && (
            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Athlete Activity ({report.athleteActivity.count} total)
                </Typography>
                <List disablePadding>
                  {report.athleteActivity.recent.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No athlete activity yet." />
                    </ListItem>
                  ) : (
                    report.athleteActivity.recent.map((activity) => (
                      <ListItem key={activity.id} divider>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {activityIcons[activity.activityType]}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.createdAt).toLocaleString()}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            </Paper>
          )}

          {tab === 3 && report && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Activity Breakdown
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {Object.entries(report.byType).map(([type, count]) => (
                  <Card key={type} variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                      <Box sx={{ fontSize: 24, color: 'primary.main' }}>
                        {activityIcons[type as ActivityType]}
                      </Box>
                      <Box>
                        <Typography variant="h6">{count}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activityLabels[type as ActivityType] || type}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
