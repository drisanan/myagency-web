'use client';

import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { IoChevronDownOutline, IoPaperPlaneOutline, IoHandLeftOutline, IoTrendingUpOutline, IoPeopleOutline } from 'react-icons/io5';
import { FaGoogle } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/services/clients';
import { NotesPanel } from '@/features/notes/NotesPanel';
import { TasksPanel } from '@/features/tasks/TasksPanel';
import { CoachNotesPanel } from '@/features/coachNotes';
import { CommunicationsPanel } from '@/features/communications';
import { ProfileViewsPanel } from '@/features/profileViews';
import { MeetingsPanel } from '@/features/meetings';
import { ActivityReportPanel } from '@/features/activity';
import { AccountStatusPanel } from '@/features/accountStatus';
import { listLists } from '@/services/lists';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { fetchEmailMetrics } from '@/services/emailTracking';
import { MetricCard } from '@/app/(app)/dashboard/MetricCard';
import { issueUpdateForm, listUpdateForms, markUpdateFormsReviewed } from '@/services/updateForms';

type RecentSend = {
  recipientEmail: string;
  recipientName?: string;
  university?: string;
  subject?: string;
  sentAt: number;
};

type RecentOpen = {
  recipientEmail: string;
  university?: string;
  openedAt: number;
};

type RecentClick = {
  recipientEmail: string;
  destination: string;
  linkType?: string;
  clickedAt: number;
};

type UpdateSubmission = {
  id: string;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  size?: Record<string, string>;
  speed?: Record<string, string>;
  academics?: Record<string, string>;
  upcomingEvents?: Array<{ name?: string; date?: string; location?: string }>;
  highlightVideo?: string;
  schoolInterests?: string[];
  notes?: string;
};

function EmailMetricsSection({ clientId }: { clientId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['emailMetrics', clientId],
    queryFn: () => fetchEmailMetrics({ clientId, days: 30 }),
    enabled: Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });

  const stats = data?.stats || { sentCount: 0, openCount: 0, clickCount: 0, uniqueClickers: 0 };

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[1, 2, 3, 4].map((k) => (
          <Box key={k} sx={{ height: 100, bgcolor: '#0A0A0A08', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      <MetricCard
        title="Emails Sent"
        value={stats.sentCount}
        icon={<IoPaperPlaneOutline size={20} />}
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
        title="Email Opens"
        value={stats.openCount || 0}
        icon={<IoTrendingUpOutline size={20} />}
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
        title="Link Clicks"
        value={stats.clickCount}
        icon={<IoHandLeftOutline size={20} />}
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
        title="Coaches Engaged"
        value={stats.uniqueClickers || 0}
        icon={<IoPeopleOutline size={20} />}
        footer={
          <Typography variant="body2" sx={{ color: '#FFFFFF60' }}>
            Unique responders
          </Typography>
        }
      />
    </Box>
  );
}

function ClientUpdateFormsSection({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const [inviteUrl, setInviteUrl] = React.useState('');
  const [issuing, setIssuing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const submissionsQuery = useQuery({
    queryKey: ['client-update-forms', clientId],
    queryFn: () => listUpdateForms(clientId),
    enabled: Boolean(clientId),
    staleTime: 30_000,
  });

  const reviewMutation = useMutation({
    mutationFn: (ids: string[]) => markUpdateFormsReviewed(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-update-forms', clientId] });
    },
  });

  async function handleIssue() {
    try {
      setIssuing(true);
      const data = await issueUpdateForm(clientId);
      setInviteUrl(data.url);
    } finally {
      setIssuing(false);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const submissions = (submissionsQuery.data || []) as UpdateSubmission[];

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
        <Typography variant="subtitle1">Athlete Update Forms</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleIssue} disabled={issuing}>
            {issuing ? 'Generating…' : 'Generate Update Link'}
          </Button>
          {inviteUrl && (
            <Button variant="text" onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          )}
        </Stack>
      </Stack>

      {inviteUrl && (
        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
          {inviteUrl}
        </Typography>
      )}

      {!submissionsQuery.isLoading && submissions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No athlete update submissions yet.
        </Typography>
      )}

      {submissions.map((submission) => (
        <Card key={submission.id} variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2">
                  Submitted {new Date(submission.submittedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {submission.reviewedAt
                    ? `Reviewed by ${submission.reviewedBy || 'agent'} on ${new Date(submission.reviewedAt).toLocaleString()}`
                    : 'Pending review'}
                </Typography>
              </Box>
              {!submission.reviewedAt && (
                <Button
                  variant="contained"
                  onClick={() => reviewMutation.mutate([submission.id])}
                  disabled={reviewMutation.isPending}
                >
                  Mark Reviewed
                </Button>
              )}
            </Stack>

            <Stack spacing={1}>
              {submission.size && Object.keys(submission.size).length > 0 && (
                <Typography variant="body2">Size: {Object.entries(submission.size).map(([key, value]) => `${key}: ${value}`).join(' • ')}</Typography>
              )}
              {submission.speed && Object.keys(submission.speed).length > 0 && (
                <Typography variant="body2">Speed: {Object.entries(submission.speed).map(([key, value]) => `${key}: ${value}`).join(' • ')}</Typography>
              )}
              {submission.academics && Object.keys(submission.academics).length > 0 && (
                <Typography variant="body2">Academics: {Object.entries(submission.academics).map(([key, value]) => `${key}: ${value}`).join(' • ')}</Typography>
              )}
              {(submission.upcomingEvents || []).length > 0 && (
                <Typography variant="body2">
                  Events: {(submission.upcomingEvents || []).map((event) => [event.name, event.date, event.location].filter(Boolean).join(' • ')).join(' | ')}
                </Typography>
              )}
              {submission.highlightVideo && (
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  Highlight Video: {submission.highlightVideo}
                </Typography>
              )}
              {(submission.schoolInterests || []).length > 0 && (
                <Typography variant="body2">
                  School Interests: {(submission.schoolInterests || []).join(', ')}
                </Typography>
              )}
              {submission.notes && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  Notes: {submission.notes}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default function ClientProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const { session, loading } = useSession();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [tab, setTab] = React.useState(0);
  const [client, setClient] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [interestLists, setInterestLists] = React.useState<any[]>([]);
  const [gmailStatus, setGmailStatus] = React.useState<{ connected: boolean; expired: boolean; email?: string }>({ connected: false, expired: false });
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  React.useEffect(() => {
    let mounted = true;
    setError(null);
    
    // 1. Wait for session to load
    if (loading) return; 
    
    // 2. Check using the safe email variable
    if (!userEmail) {
      if (mounted) setError('Please log in to view this client.');
      return;
    }

    if (!id) return;

    (async () => {
      try {
        const c = await getClient(id);
        if (mounted) setClient(c);
      } catch (err) {
        console.error('getClient failed', err);
        if (mounted) setError('Unable to load client. Please ensure you are logged in.');
      }
      try {
        const all = await listLists('');
        const interests = (all || []).filter((l: any) => l.clientId === id && l.type === 'CLIENT_INTEREST');
        if (mounted) setInterestLists(interests);
      } catch (err) {
        console.error('load interests failed', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, userEmail, loading]);

  const { data: metricsData } = useQuery({
    queryKey: ['clientEmails', client?.id],
    queryFn: () => fetchEmailMetrics({ clientId: client!.id, days: 30 }),
    enabled: Boolean(client?.id),
    staleTime: 2 * 60 * 1000,
  });
  const recentSends: RecentSend[] = metricsData?.recentSends || [];
  const recentOpens: RecentOpen[] = metricsData?.recentOpens || [];
  const recentClicks: RecentClick[] = metricsData?.recentClicks || [];
  const engagementTimeline = React.useMemo(() => {
    const sends = recentSends.map((entry) => ({
      type: 'sent' as const,
      timestamp: entry.sentAt,
      title: entry.subject || '(No subject)',
      subtitle: entry.recipientName || entry.recipientEmail,
      detail: entry.university || entry.recipientEmail,
    }));
    const opens = recentOpens.map((entry) => ({
      type: 'open' as const,
      timestamp: entry.openedAt,
      title: 'Email opened',
      subtitle: entry.recipientEmail,
      detail: entry.university || 'Tracking pixel viewed',
    }));
    const clicks = recentClicks.map((entry) => ({
      type: 'click' as const,
      timestamp: entry.clickedAt,
      title: 'Link clicked',
      subtitle: entry.recipientEmail,
      detail: entry.destination,
    }));
    return [...sends, ...opens, ...clicks]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 30);
  }, [recentClicks, recentOpens, recentSends]);

  React.useEffect(() => {
    const t = searchParams?.get('tab');
    if (t === 'notes') setTab(1);
  }, [searchParams]);

  React.useEffect(() => {
    if (!client?.id || !API_BASE_URL) return;
    fetch(`${API_BASE_URL}/google/status?clientId=${encodeURIComponent(client.id)}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const connected = Boolean(d?.connected);
        const expired = Boolean(d?.expired) || (connected && !d?.canRefresh);
        setGmailStatus({ connected: connected && !expired, expired, email: d?.email || undefined });
      })
      .catch(() => setGmailStatus({ connected: false, expired: false }));
  }, [client?.id]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Verifying session…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Athlete not found</Typography>
      </Box>
    );
  }

  const name = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || 'Unknown Athlete';
  const formatSport = (raw?: string) => {
    if (!raw) return 'Unknown sport';
    // Insert space before capital letters for camel-cased sports like MensSwimming -> Mens Swimming
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
  };
  const sport = formatSport(client.sport);
  const photo = client.photoUrl || client.profileImageUrl || '/marketing/an-logo.png';

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Avatar src={photo} alt={name} sx={{ width: 56, height: 56 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>{name}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary" noWrap>{sport}</Typography>
            {gmailStatus.connected && (
              <Chip
                icon={<FaGoogle size={10} />}
                label={gmailStatus.email || 'Gmail Connected'}
                size="small"
                color="success"
                sx={{ fontSize: 11 }}
              />
            )}
            {gmailStatus.expired && (
              <Chip
                icon={<FaGoogle size={10} />}
                label="Gmail Expired"
                size="small"
                color="warning"
                sx={{ fontSize: 11 }}
              />
            )}
          </Stack>
        </Box>
        <Button
          variant="outlined"
          endIcon={<IoChevronDownOutline />}
          onClick={handleMenuOpen}
        >
          Actions
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { handleMenuClose(); router.push(`/clients/${client.id}/edit`); }}>Edit</MenuItem>
          <MenuItem
            onClick={() => { handleMenuClose(); router.push(`/clients/${client.id}/delete`); }}
            sx={{ color: 'error.main' }}
          >
            Delete account
          </MenuItem>
        </Menu>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Email Analytics Summary - Dashboard Style */}
      <EmailMetricsSection clientId={client.id} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Emails" />
        <Tab label="Notes" data-testid="notes-tab" />
        <Tab label="Tasks" data-testid="tasks-tab" />
        <Tab label="Coach Notes" data-testid="coach-notes-tab" />
        <Tab label="Communications" data-testid="comms-tab" />
        <Tab label="Profile Views" data-testid="views-tab" />
        <Tab label="Meetings" data-testid="meetings-tab" />
        <Tab label="Activity" data-testid="activity-tab" />
        <Tab label="Interests" />
        <Tab label="Updates" />
        <Tab label="Account" data-testid="account-tab" />
      </Tabs>

      {tab === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label="Last 30 Days" color="primary" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {engagementTimeline.length} engagement events
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {engagementTimeline.map((item, idx) => {
                const key = `${item.type}-${item.subtitle}-${item.timestamp}-${idx}`;
                return (
                  <React.Fragment key={key}>
                    <ListItem
                      secondaryAction={
                        <Typography variant="body2" color="text.secondary">
                          {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              size="small"
                              label={item.type === 'sent' ? 'Sent' : item.type === 'open' ? 'Opened' : 'Clicked'}
                              color={item.type === 'sent' ? 'primary' : item.type === 'open' ? 'success' : 'default'}
                              variant="outlined"
                            />
                            <Typography variant="subtitle2">
                              {item.subtitle}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary" noWrap>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.detail}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
              {engagementTimeline.length === 0 && (
                <Box sx={{ px: 3, py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No email engagement recorded in the last 30 days.
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      )}
      {tab === 1 && (
        <Box sx={{ mt: 2 }}>
          <NotesPanel athleteId={client.id} />
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ mt: 2 }}>
          <TasksPanel assigneeClientId={client.id} />
        </Box>
      )}
      {tab === 3 && (
        <Box sx={{ mt: 2 }}>
          <CoachNotesPanel athleteId={client.id} />
        </Box>
      )}
      {tab === 4 && (
        <Box sx={{ mt: 2 }}>
          <CommunicationsPanel athleteId={client.id} />
        </Box>
      )}
      {tab === 5 && (
        <Box sx={{ mt: 2 }}>
          <ProfileViewsPanel clientId={client.id} showDigest />
        </Box>
      )}
      {tab === 6 && (
        <Box sx={{ mt: 2 }}>
          <MeetingsPanel clientId={client.id} />
        </Box>
      )}
      {tab === 7 && (
        <Box sx={{ mt: 2 }}>
          <ActivityReportPanel clientId={client.id} />
        </Box>
      )}
      {tab === 8 && (
        <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Interests</Typography>
            {!interestLists.length && <Typography color="text.secondary">No interests yet.</Typography>}
            <List>
              {interestLists.map((l: any) => (
                <ListItem key={l.id} divider>
                  <ListItemText
                    primary={l.name}
                    secondary={
                      <>
                        {(l.items || []).length} universities
                        {(l.items || []).length > 0 && (
                          <Typography variant="body2" component="div" color="text.secondary">
                            {(l.items || [])
                              .map((it: any) => it.school || it.university || it.name || '')
                              .filter(Boolean)
                              .join(', ')}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
      {tab === 9 && (
        <ClientUpdateFormsSection clientId={client.id} />
      )}
      {tab === 10 && (
        <Box sx={{ mt: 2 }}>
          <AccountStatusPanel client={client as any} />
        </Box>
      )}
    </Box>
  );
}