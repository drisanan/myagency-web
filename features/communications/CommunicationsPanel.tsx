'use client';
import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Badge,
} from '@mui/material';
import { FaEnvelope, FaPaperPlane, FaReply, FaInbox, FaUser, FaUserTie } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listCommunications, 
  sendCommunication, 
  markAsRead,
  listThreads,
  Communication,
  CommunicationThread,
  CommunicationType,
} from '@/services/communications';

type Props = {
  athleteId?: string;
  coachEmail?: string;
  defaultType?: CommunicationType;
  isAthlete?: boolean; // If true, show athlete-specific options
};

const typeLabels: Record<CommunicationType, { label: string; icon: React.ReactNode }> = {
  agent_to_athlete: { label: 'To Athlete', icon: <FaUser /> },
  athlete_to_agent: { label: 'From Athlete', icon: <FaUserTie /> },
  agent_to_coach: { label: 'To Coach', icon: <FaUserTie /> },
  coach_to_athlete: { label: 'Coach → Athlete', icon: <FaUser /> },
  athlete_to_coach: { label: 'Athlete → Coach', icon: <FaUserTie /> },
};

export function CommunicationsPanel({ athleteId, coachEmail, defaultType, isAthlete = false }: Props) {
  const queryClient = useQueryClient();
  const [tab, setTab] = React.useState(0);
  const [selectedThread, setSelectedThread] = React.useState<string | null>(null);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Determine default type based on whether it's an athlete or agent using the panel
  const getDefaultType = (): CommunicationType => {
    if (defaultType) return defaultType;
    return isAthlete ? 'athlete_to_agent' : 'agent_to_athlete';
  };
  
  const [form, setForm] = React.useState({
    type: getDefaultType(),
    toEmail: '',
    toName: '',
    subject: '',
    body: '',
    threadId: '',
  });

  const threadsQuery = useQuery({
    queryKey: ['communicationThreads', athleteId],
    queryFn: () => listThreads(athleteId),
    staleTime: 30000,
  });

  const messagesQuery = useQuery({
    queryKey: ['communications', selectedThread],
    queryFn: () => listCommunications({ threadId: selectedThread || undefined }),
    enabled: !!selectedThread,
    staleTime: 10000,
  });

  const sendMutation = useMutation({
    mutationFn: sendCommunication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communicationThreads'] });
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      setComposeOpen(false);
      setForm(f => ({ ...f, subject: '', body: '', threadId: '' }));
      setSnackbar({ open: true, message: 'Message sent', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communicationThreads'] });
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });

  const handleSend = async () => {
    if (!form.toEmail.trim() || !form.body.trim()) return;
    
    await sendMutation.mutateAsync({
      type: form.type,
      toEmail: form.toEmail,
      toName: form.toName || undefined,
      athleteId,
      coachEmail,
      subject: form.subject || undefined,
      body: form.body,
      threadId: form.threadId || undefined,
    });
  };

  const handleReply = (thread: CommunicationThread) => {
    const lastMessage = messagesQuery.data?.find(m => m.threadId === thread.threadId);
    // Determine reply type based on who is replying
    const replyType: CommunicationType = isAthlete ? 'athlete_to_agent' : 'agent_to_athlete';
    setForm({
      type: replyType,
      toEmail: lastMessage?.fromEmail || '',
      toName: '',
      subject: `Re: ${thread.subject}`,
      body: '',
      threadId: thread.threadId,
    });
    setComposeOpen(true);
  };

  const selectThread = async (threadId: string) => {
    setSelectedThread(threadId);
    // Mark messages as read
    const messages = await listCommunications({ threadId });
    for (const msg of messages.filter(m => !m.isRead)) {
      markReadMutation.mutate(msg.id);
    }
  };

  const threads = threadsQuery.data || [];
  const messages = messagesQuery.data || [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaEnvelope /> Communications
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setComposeOpen(true)} 
          startIcon={<FaPaperPlane />}
          data-testid="compose-btn"
        >
          Compose
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Threads" icon={<FaInbox />} iconPosition="start" />
        <Tab label="All Messages" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Thread List */}
          <Paper variant="outlined" sx={{ width: 350, maxHeight: 500, overflow: 'auto' }}>
            {threadsQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : threads.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">No conversations yet.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {threads.map((thread) => (
                  <ListItemButton
                    key={thread.threadId}
                    selected={selectedThread === thread.threadId}
                    onClick={() => selectThread(thread.threadId)}
                    data-testid="thread-item"
                  >
                    <ListItemAvatar>
                      <Badge badgeContent={thread.unreadCount} color="error">
                        <Avatar>{thread.subject?.[0] || '?'}</Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={thread.subject}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" noWrap>
                            {thread.lastMessage.body}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(thread.updatedAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{ noWrap: true, fontWeight: thread.unreadCount ? 700 : 400 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>

          {/* Message View */}
          <Paper variant="outlined" sx={{ flex: 1, maxHeight: 500, overflow: 'auto', p: 2 }}>
            {!selectedThread ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography color="text.secondary">Select a conversation</Typography>
              </Box>
            ) : messagesQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: msg.type.startsWith('agent_') ? 'primary.50' : 'grey.100',
                      alignSelf: msg.type.startsWith('agent_') ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                    data-testid="message-item"
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={typeLabels[msg.type]?.label || msg.type}
                        icon={typeLabels[msg.type]?.icon as any}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                    {msg.subject && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {msg.subject}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.body}
                    </Typography>
                  </Box>
                ))}
                
                {selectedThread && (
                  <Button
                    variant="outlined"
                    startIcon={<FaReply />}
                    onClick={() => {
                      const thread = threads.find(t => t.threadId === selectedThread);
                      if (thread) handleReply(thread);
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Reply
                  </Button>
                )}
              </Stack>
            )}
          </Paper>
        </Box>
      )}

      {tab === 1 && (
        <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
          {/* All messages view - simplified */}
          <List>
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ListItem>
                  <ListItemText
                    primary={msg.subject || '(No subject)'}
                    secondary={
                      <>
                        {msg.fromEmail} → {msg.toEmail}
                        <br />
                        {msg.body.slice(0, 100)}...
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Message</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            size="small"
            select
            label="Type"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value as CommunicationType }))}
            SelectProps={{ native: true }}
            data-testid="msg-type"
          >
            {isAthlete ? (
              <>
                <option value="athlete_to_agent">To My Agent</option>
                <option value="athlete_to_coach">To Coach</option>
              </>
            ) : (
              <>
                <option value="agent_to_athlete">To Athlete</option>
                <option value="agent_to_coach">To Coach</option>
              </>
            )}
          </TextField>
          <TextField
            size="small"
            label="To (Email)"
            value={form.toEmail}
            onChange={(e) => setForm(f => ({ ...f, toEmail: e.target.value }))}
            required
            data-testid="msg-to"
          />
          <TextField
            size="small"
            label="To (Name)"
            value={form.toName}
            onChange={(e) => setForm(f => ({ ...f, toName: e.target.value }))}
            data-testid="msg-to-name"
          />
          <TextField
            size="small"
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
            data-testid="msg-subject"
          />
          <TextField
            size="small"
            label="Message"
            value={form.body}
            onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
            multiline
            minRows={4}
            required
            data-testid="msg-body"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSend}
            disabled={sendMutation.isPending}
            startIcon={sendMutation.isPending ? <CircularProgress size={16} /> : <FaPaperPlane />}
            data-testid="send-msg-btn"
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
