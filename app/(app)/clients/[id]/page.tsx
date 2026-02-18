'use client';

import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
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
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/services/clients';
import { getMailEntries } from '@/services/mailStatus';
import { NotesPanel } from '@/features/notes/NotesPanel';
import { TasksPanel } from '@/features/tasks/TasksPanel';
import { CoachNotesPanel } from '@/features/coachNotes';
import { TaskTemplatesPanel } from '@/features/taskTemplates';
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

type MailEntry = {
  id?: string;
  clientId?: string;
  email?: string;
  to?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  university?: string;
  position?: string;
  subject?: string;
  body?: string;
  html?: string;
  sentAt?: number;
  date?: number;
  mailedAt?: number;
};

function EmailMetricsSection({ clientId }: { clientId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['emailMetrics', clientId],
    queryFn: () => fetchEmailMetrics({ clientId, days: 30 }),
    enabled: Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });

  const stats = data?.stats || { sentCount: 0, clickCount: 0, uniqueClickers: 0 };
  const clickRate = stats.sentCount > 0 
    ? Math.round((stats.clickCount / stats.sentCount) * 100) 
    : 0;

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
        title="Link Clicks"
        value={stats.clickCount}
        icon={<IoHandLeftOutline size={20} />}
        footer={
          <>
            <IoTrendingUpOutline color="#CCFF00" size={18} />
            <Typography variant="body2" sx={{ color: '#FFFFFF60' }}>
              Coach engagement
            </Typography>
          </>
        }
      />
      <MetricCard
        title="Click Rate"
        value={`${clickRate}%`}
        icon={<IoTrendingUpOutline size={20} />}
        footer={
          <Typography variant="body2" sx={{ color: '#FFFFFF60' }}>
            {stats.clickCount} / {stats.sentCount} emails
          </Typography>
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

export default function ClientProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const { session, loading } = useSession();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [tab, setTab] = React.useState(0);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
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

  const mails: MailEntry[] = React.useMemo(() => {
    if (!client?.id) return [];
    return (getMailEntries() as MailEntry[]).filter((m) => m.clientId === client.id);
  }, [client?.id]);

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
        <Tab label="Account" data-testid="account-tab" />
      </Tabs>

      {tab === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label="Sent" color="primary" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {mails.length} sent
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {mails.map((m) => {
                const key = m.id || `${m.email || m.to || ''}-${m.subject || ''}-${(m as any).mailedAt || m.sentAt || m.date || ''}`;
                const isOpen = expandedId === key;
                const sent = m.sentAt || m.date || (m as any).mailedAt || Date.now();
                return (
                  <React.Fragment key={key}>
                    <ListItem
                      secondaryAction={
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(sent).toLocaleDateString()} {new Date(sent).toLocaleTimeString()}
                          </Typography>
                          <Button size="small" onClick={() => setExpandedId(isOpen ? null : key)}>
                            {isOpen ? 'Hide' : 'View'}
                          </Button>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle2">
                              {(m.recipientFirstName || 'First') + ' ' + (m.recipientLastName || 'Last')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {m.university || 'University'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {m.position || 'Position'}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {m.subject || '(No subject)'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ px: 3, pb: 2 }}>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {m.body || m.html || '(No content)'}
                        </Typography>
                      </Box>
                    </Collapse>
                    <Divider />
                  </React.Fragment>
                );
              })}
              {mails.length === 0 && (
                <Box sx={{ px: 3, py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No sent emails yet.
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
        <Box sx={{ mt: 2 }}>
          <AccountStatusPanel client={client as any} />
        </Box>
      )}
    </Box>
  );
}