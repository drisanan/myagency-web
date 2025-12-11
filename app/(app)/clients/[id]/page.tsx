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
import { IoChevronDownOutline } from 'react-icons/io5';
import { useParams, useRouter } from 'next/navigation';
import { getClient } from '@/services/clients';
import { getMailEntries } from '@/services/mailStatus';
import { NotesPanel } from '@/features/notes/NotesPanel';
import { TasksPanel } from '@/features/tasks/TasksPanel';
import { useSearchParams } from 'next/navigation';

type MailEntry = ReturnType<typeof getMailEntries>[number] & {
  id?: string;
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
};

export default function ClientProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [tab, setTab] = React.useState(0);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [client, setClient] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const c = await getClient(id);
      if (mounted) setClient(c);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const mails: MailEntry[] = React.useMemo(() => {
    if (!client?.id) return [];
    return (getMailEntries() as MailEntry[]).filter((m) => m.clientId === client.id);
  }, [client?.id]);

  React.useEffect(() => {
    const t = searchParams?.get('tab');
    if (t === 'notes') setTab(1);
  }, [searchParams]);

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
    <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Avatar src={photo} alt={name} sx={{ width: 56, height: 56 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>{name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{sport}</Typography>
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
            sx={{ color: '#f04438' }}
          >
            Delete account
          </MenuItem>
        </Menu>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Emails" />
        <Tab label="Notes" data-testid="notes-tab" />
        <Tab label="Tasks" data-testid="tasks-tab" />
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
          <TasksPanel athleteId={client.id} />
        </Box>
      )}
    </Box>
  );
}
