'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
  Chip,
  Autocomplete,
  Box,
  Alert,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import { listClientsByAgencyEmail } from '@/services/clients';
import { listAgents } from '@/services/agents';
import { colors } from '@/theme/colors';
import {
  buildReportHtml,
  type ReportEmailData,
  type ReportSection,
} from './reportEmailTemplate';

type Props = {
  open: boolean;
  onClose: () => void;
  reportData: ReportEmailData;
};

type RecipientOption = {
  email: string;
  label: string;
  type: 'client' | 'agent' | 'custom';
};

const sectionLabels: Record<ReportSection, string> = {
  kpis: 'KPI Summary',
  emailActivity: 'Email Activity',
  profileViews: 'Profile Views',
  leaderboard: 'Athlete Leaderboard',
};

export function EmailReportDialog({ open, onClose, reportData }: Props) {
  const { session } = useSession();
  const email = session?.agencyEmail || session?.email || '';

  const [recipients, setRecipients] = React.useState<RecipientOption[]>([]);
  const [customEmail, setCustomEmail] = React.useState('');
  const [sections, setSections] = React.useState<ReportSection[]>([
    'kpis',
    'emailActivity',
    'profileViews',
    'leaderboard',
  ]);
  const [subject, setSubject] = React.useState(
    `${reportData.agencyName} — Performance Report`,
  );
  const [tab, setTab] = React.useState(0);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(
    null,
  );

  // Fetch clients and agents for recipient selector
  const clientsQ = useQuery({
    queryKey: ['email-report-clients', email],
    enabled: Boolean(email) && open,
    queryFn: () => listClientsByAgencyEmail(email),
    staleTime: 5 * 60_000,
  });

  const agentsQ = useQuery({
    queryKey: ['email-report-agents'],
    enabled: Boolean(email) && open,
    queryFn: () => listAgents(),
    staleTime: 5 * 60_000,
  });

  // Build recipient options
  const recipientOptions = React.useMemo<RecipientOption[]>(() => {
    const opts: RecipientOption[] = [];
    const clients = Array.isArray(clientsQ.data)
      ? clientsQ.data
      : (clientsQ.data as any)?.clients ?? [];
    for (const c of clients) {
      if (!c?.email) continue;
      opts.push({
        email: c.email,
        label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        type: 'client',
      });
    }
    for (const a of agentsQ.data ?? []) {
      if (!a?.email) continue;
      opts.push({
        email: a.email,
        label: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email,
        type: 'agent',
      });
    }
    return opts;
  }, [clientsQ.data, agentsQ.data]);

  const toggleSection = (s: ReportSection) => {
    setSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const addCustomEmail = () => {
    const trimmed = customEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    if (recipients.some((r) => r.email === trimmed)) return;
    setRecipients((prev) => [
      ...prev,
      { email: trimmed, label: trimmed, type: 'custom' },
    ]);
    setCustomEmail('');
  };

  const previewHtml = React.useMemo(
    () => buildReportHtml(reportData, sections),
    [reportData, sections],
  );

  const handleSend = async () => {
    if (!recipients.length) {
      setResult({ ok: false, message: 'Please add at least one recipient' });
      return;
    }
    if (!sections.length) {
      setResult({ ok: false, message: 'Select at least one report section' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      // Use the Next.js gmail send API route
      const html = buildReportHtml(reportData, sections);
      const toEmails = recipients.map((r) => r.email);

      // We need a clientId that has Gmail tokens. Use the first client ID available,
      // or fall back to the agency email.
      const clients = Array.isArray(clientsQ.data)
        ? clientsQ.data
        : (clientsQ.data as any)?.clients ?? [];
      const senderClientId = clients[0]?.id || session?.clientId || 'agency';

      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: senderClientId,
          to: toEmails,
          subject,
          html,
          agencyEmail: email,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setResult({ ok: true, message: `Report sent to ${toEmails.length} recipient(s)` });
        // Auto-close after success
        setTimeout(() => {
          onClose();
          setResult(null);
        }, 2000);
      } else {
        setResult({ ok: false, message: data.error || 'Failed to send email' });
      }
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || 'Network error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f0f1a',
          color: '#fff',
          borderRadius: 0,
          clipPath:
            'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '0.9rem',
          borderBottom: `1px solid ${colors.lime}20`,
          pb: 1.5,
        }}
      >
        Email Report
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 2,
            '& .MuiTab-root': { color: '#ffffff80', fontSize: '0.8rem', textTransform: 'none' },
            '& .Mui-selected': { color: colors.lime },
            '& .MuiTabs-indicator': { bgcolor: colors.lime },
          }}
        >
          <Tab label="Configure" />
          <Tab label="Preview" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2.5}>
            {/* Subject */}
            <TextField
              label="Subject Line"
              size="small"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#ffffff20' },
                  '&:hover fieldset': { borderColor: '#ffffff40' },
                  '&.Mui-focused fieldset': { borderColor: `${colors.lime}60` },
                },
                '& .MuiInputLabel-root': { color: '#ffffff60' },
              }}
            />

            {/* Recipients */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.7rem',
                  color: colors.lime,
                  mb: 1,
                }}
              >
                Recipients
              </Typography>
              <Autocomplete
                multiple
                options={recipientOptions}
                value={recipients}
                onChange={(_, v) => setRecipients(v)}
                getOptionLabel={(o) => `${o.label} (${o.email})`}
                groupBy={(o) => o.type === 'client' ? 'Athletes' : o.type === 'agent' ? 'Agents' : 'Custom'}
                renderTags={(tags, getTagProps) =>
                  tags.map((tag, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={tag.email}
                      label={tag.label}
                      size="small"
                      sx={{
                        bgcolor: tag.type === 'client' ? `${colors.lime}15` : tag.type === 'agent' ? '#3b82f615' : '#ffffff10',
                        color: tag.type === 'client' ? colors.lime : tag.type === 'agent' ? '#60a5fa' : '#fff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select clients or agents..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: '#ffffff20' },
                      },
                    }}
                  />
                )}
                PaperComponent={(props) => (
                  <Box
                    {...props}
                    sx={{
                      bgcolor: '#1a1a2e',
                      color: '#fff',
                      border: `1px solid ${colors.lime}30`,
                      '& .MuiAutocomplete-groupLabel': {
                        bgcolor: '#12121f',
                        color: colors.lime,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                      },
                    }}
                  />
                )}
              />
              {/* Custom email input */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add custom email..."
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomEmail();
                    }
                  }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      fontSize: '0.85rem',
                      '& fieldset': { borderColor: '#ffffff15' },
                    },
                  }}
                />
                <Button
                  size="small"
                  onClick={addCustomEmail}
                  sx={{
                    bgcolor: `${colors.lime}20`,
                    color: colors.lime,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: `${colors.lime}30` },
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Sections */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.7rem',
                  color: colors.lime,
                  mb: 1,
                }}
              >
                Include Sections
              </Typography>
              <FormGroup row>
                {(Object.entries(sectionLabels) as [ReportSection, string][]).map(
                  ([key, label]) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={sections.includes(key)}
                          onChange={() => toggleSection(key)}
                          sx={{ color: '#ffffff40', '&.Mui-checked': { color: colors.lime } }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '0.85rem', color: '#ffffffcc' }}>
                          {label}
                        </Typography>
                      }
                    />
                  ),
                )}
              </FormGroup>
            </Box>

            {result && (
              <Alert
                severity={result.ok ? 'success' : 'error'}
                sx={{ fontSize: '0.85rem' }}
              >
                {result.message}
              </Alert>
            )}
          </Stack>
        )}

        {tab === 1 && (
          <Box
            sx={{
              border: '1px solid #ffffff15',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              bgcolor: '#0a0a0a',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${colors.lime}10` }}>
        <Button onClick={onClose} sx={{ color: '#ffffff60' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={sending || !recipients.length}
          sx={{
            bgcolor: colors.lime,
            color: colors.black,
            fontWeight: 700,
            borderRadius: 0,
            px: 3,
            clipPath:
              'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            '&:hover': { bgcolor: '#B8E600' },
            '&.Mui-disabled': { bgcolor: '#333', color: '#666' },
          }}
        >
          {sending ? <CircularProgress size={18} sx={{ color: colors.black }} /> : 'Send Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
