'use client';
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  Skeleton,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmailDrip,
  deleteEmailDrip,
  EmailDrip,
  enrollInDrip,
  getGmailOauthUrl,
  getGmailStatus,
  listDripEnrollments,
  listEmailDrips,
  unenrollFromDrip,
  updateEmailDrip,
} from '@/services/emailDrips';
import { getClients } from '@/services/clients';

const AGENCY_GMAIL_ID = '__agency__';

type FormState = {
  name: string;
  description: string;
  isActive: boolean;
  senderClientId: string;
  autoEnrollOnSignup: boolean;
  steps: Array<{ id: string; dayOffset: number; subject: string; body: string }>;
};

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  isActive: true,
  senderClientId: AGENCY_GMAIL_ID,
  autoEnrollOnSignup: false,
  steps: [
    { id: 'step-1', dayOffset: 0, subject: 'Welcome!', body: 'Hi there — welcome to the program.' },
  ],
});

export function EmailDripsPanel() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState<EmailDrip | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm());
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [selectedRecipientIds, setSelectedRecipientIds] = React.useState<string[]>([]);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const dripsQuery = useQuery({
    queryKey: ['emailDrips'],
    queryFn: listEmailDrips,
    staleTime: 60_000,
  });

  const clientsQuery = useQuery({
    queryKey: ['clients', 'for-drip-sender'],
    queryFn: getClients,
    staleTime: 60_000,
  });

  const gmailStatusQuery = useQuery({
    queryKey: ['gmail-status', AGENCY_GMAIL_ID],
    queryFn: () => getGmailStatus(AGENCY_GMAIL_ID),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<EmailDrip>) => createEmailDrip(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emailDrips'] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmailDrip> }) => updateEmailDrip(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emailDrips'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmailDrip(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emailDrips'] }),
  });

  const handleSelect = (drip: EmailDrip) => {
    setSelected(drip);
    setErrors({});
    setForm({
      name: drip.name,
      description: drip.description || '',
      isActive: drip.isActive,
      senderClientId: drip.senderClientId || AGENCY_GMAIL_ID,
      autoEnrollOnSignup: drip.triggerEvent === 'signup',
      steps: drip.steps.map((s) => ({
        id: s.id,
        dayOffset: Number(s.dayOffset || 0),
        subject: s.subject,
        body: s.body,
      })),
    });
  };

  const handleReset = () => {
    setSelected(null);
    setForm(emptyForm());
    setErrors({});
    setSelectedRecipientIds([]);
    setSaveError(null);
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.steps.length) nextErrors.steps = 'Add at least one step.';
    form.steps.forEach((s, i) => {
      if (s.dayOffset < 0 || !Number.isFinite(Number(s.dayOffset))) {
        nextErrors[`steps.${i}.dayOffset`] = 'Day offset must be 0 or greater.';
      }
      if (!s.subject.trim()) nextErrors[`steps.${i}.subject`] = 'Subject is required.';
      if (!s.body.trim()) nextErrors[`steps.${i}.body`] = 'Body is required.';
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const payload: Partial<EmailDrip> = {
        name: form.name,
        description: form.description || undefined,
        isActive: form.isActive,
        senderClientId: form.senderClientId || AGENCY_GMAIL_ID,
        triggerEvent: form.autoEnrollOnSignup ? 'signup' : 'manual',
        steps: form.steps.map((s, i) => ({
          id: s.id || `step-${i + 1}`,
          dayOffset: Number(s.dayOffset || 0),
          subject: s.subject,
          body: s.body,
        })),
      };
      let savedDrip: EmailDrip | null = null;
      if (selected?.id) {
        savedDrip = await updateMutation.mutateAsync({ id: selected.id, input: payload });
      } else {
        savedDrip = await createMutation.mutateAsync(payload);
      }
      const dripId = savedDrip?.id || selected?.id;
      if (dripId) {
        const existing = await listDripEnrollments({ dripId });
        const existingIds = new Set(existing.map((e) => e.clientId));
        const desiredIds = new Set(selectedRecipientIds);
        const toEnroll = Array.from(desiredIds).filter((id) => !existingIds.has(id));
        const toUnenroll = Array.from(existingIds).filter((id) => !desiredIds.has(id));
        await Promise.all([
          ...toEnroll.map((clientId) => enrollInDrip(dripId, clientId)),
          ...toUnenroll.map((clientId) => unenrollFromDrip(dripId, clientId)),
        ]);
      }
      handleReset();
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save drip');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this drip?')) return;
    await deleteMutation.mutateAsync(id);
    if (selected?.id === id) handleReset();
  };

  const handleConnectGmail = async () => {
    const data = await getGmailOauthUrl(AGENCY_GMAIL_ID);
    if (!data?.url) throw new Error('Failed to start Gmail connection');
    const w = 520;
    const h = 680;
    const x = window.screenX + (window.outerWidth - w) / 2;
    const y = window.screenY + (window.outerHeight - h) / 2;
    window.open(
      data.url,
      'gmailConnect',
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`,
    );
  };

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event?.data?.type === 'google-oauth-success') {
        gmailStatusQuery.refetch();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gmailStatusQuery]);

  const isConnected = Boolean(gmailStatusQuery.data?.connected);
  const connectedEmail = gmailStatusQuery.data?.email || '';
  const drips = dripsQuery.data || [];
  const clients = clientsQuery.data || [];
  const enrollmentsQuery = useQuery({
    queryKey: ['dripEnrollments', selected?.id],
    queryFn: () => (selected?.id ? listDripEnrollments({ dripId: selected.id }) : Promise.resolve([])),
    enabled: Boolean(selected?.id),
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (!selected?.id) {
      setSelectedRecipientIds([]);
      return;
    }
    if (enrollmentsQuery.data) {
      setSelectedRecipientIds(enrollmentsQuery.data.map((e) => e.clientId));
    }
  }, [selected?.id, enrollmentsQuery.data]);

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Gmail for Drip Sends</Typography>
            <Chip label={isConnected ? 'Connected' : 'Not connected'} color={isConnected ? 'success' : 'warning'} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Connect the agency Gmail account to send automated drip emails.
          </Typography>
          {isConnected && connectedEmail && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Connected as: <strong>{connectedEmail}</strong>
            </Typography>
          )}
          <Button
            variant={isConnected ? 'outlined' : 'contained'}
            sx={{ mt: 2 }}
            onClick={handleConnectGmail}
            disabled={gmailStatusQuery.isLoading}
          >
            {gmailStatusQuery.isLoading ? <CircularProgress size={18} /> : isConnected ? 'Reconnect Gmail' : 'Connect Gmail'}
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">{selected ? 'Edit Drip' : 'Create Drip'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Build a sequence of automated emails and set when each one sends.
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth
                inputProps={{ 'data-testid': 'drip-name-input' }}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
              />
              <TextField
                select
                label="Sender Gmail"
                SelectProps={{ native: true }}
                value={form.senderClientId}
                onChange={(e) => setForm((f) => ({ ...f, senderClientId: e.target.value }))}
              >
                <option value={AGENCY_GMAIL_ID}>Agency Gmail</option>
                {clients.map((c: any) => {
                  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || c.id;
                  return (
                    <option key={c.id} value={c.id}>
                      {`${name} - ${c.email}`}
                    </option>
                  );
                })}
              </TextField>
              <TextField
                select
                label="Status"
                SelectProps={{ native: true }}
                value={form.isActive ? 'active' : 'inactive'}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>

            <Divider />
            <Typography variant="subtitle1">Assign Recipients</Typography>
            <Typography variant="body2" color="text.secondary">
              Assign recipients once, then build the steps for this drip sequence.
            </Typography>
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1.5, maxHeight: 220, overflow: 'auto' }}>
              {clientsQuery.isLoading || enrollmentsQuery.isLoading ? (
                <Stack spacing={1}>
                  {[1, 2, 3].map((k) => (
                    <Skeleton key={k} variant="rounded" height={32} />
                  ))}
                </Stack>
              ) : clients.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No clients available. Create a client first.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {clients.map((c: any) => {
                    const label = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || c.id;
                    const checked = selectedRecipientIds.includes(c.id);
                    return (
                      <FormControlLabel
                        key={c.id}
                        control={
                          <Switch
                            checked={checked}
                            onChange={(e) => {
                              setSelectedRecipientIds((prev) =>
                                e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                              );
                            }}
                          />
                        }
                        label={label}
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.autoEnrollOnSignup}
                  onChange={(e) => setForm((f) => ({ ...f, autoEnrollOnSignup: e.target.checked }))}
                />
              }
              label="Auto-enroll new client signups"
            />
            <Typography variant="body2" color="text.secondary">
              When enabled, new clients are automatically enrolled in this drip on signup.
            </Typography>

              <Divider />
              <Typography variant="subtitle1">Steps</Typography>
              {errors.steps && (
                <Typography variant="body2" color="error">
                  {errors.steps}
                </Typography>
              )}
              {form.steps.map((step, idx) => (
                <Card key={step.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <TextField
                        label="Day Offset"
                        type="number"
                        value={step.dayOffset}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setForm((f) => ({
                            ...f,
                            steps: f.steps.map((s, i) => (i === idx ? { ...s, dayOffset: v } : s)),
                          }));
                        }}
                        error={Boolean(errors[`steps.${idx}.dayOffset`])}
                        helperText={errors[`steps.${idx}.dayOffset`] || 'Days after enrollment to send this step (0 = same day).'}
                      />
                      <TextField
                        label="Subject"
                        value={step.subject}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((f) => ({
                            ...f,
                            steps: f.steps.map((s, i) => (i === idx ? { ...s, subject: v } : s)),
                          }));
                        }}
                        fullWidth
                        error={Boolean(errors[`steps.${idx}.subject`])}
                        helperText={errors[`steps.${idx}.subject`]}
                      />
                      <TextField
                        label="Body (HTML allowed)"
                        value={step.body}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((f) => ({
                            ...f,
                            steps: f.steps.map((s, i) => (i === idx ? { ...s, body: v } : s)),
                          }));
                        }}
                        fullWidth
                        multiline
                        minRows={4}
                        error={Boolean(errors[`steps.${idx}.body`])}
                        helperText={errors[`steps.${idx}.body`]}
                      />
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            steps: f.steps.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        Remove Step
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outlined"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    steps: [
                      ...f.steps,
                      { id: `step-${f.steps.length + 1}`, dayOffset: 1, subject: '', body: '' },
                    ],
                  }))
                }
              >
                Add Step
              </Button>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={handleSave} disabled={saving} data-testid="save-drip-btn">
                  {saving ? <CircularProgress size={18} /> : selected ? 'Update Drip' : 'Create Drip'}
                </Button>
                {selected && (
                  <Button variant="outlined" onClick={handleReset}>
                    Cancel
                  </Button>
                )}
              </Stack>
            {saveError && (
              <Typography variant="body2" color="error">
                {saveError}
              </Typography>
            )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">Existing Drips</Typography>
            {dripsQuery.isLoading ? (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {[1, 2, 3].map((k) => (
                  <Skeleton key={k} variant="rounded" height={72} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {drips.map((drip) => (
                  <Card key={drip.id} variant="outlined" data-testid={`drip-item-${drip.id}`}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1">{drip.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {drip.steps.length} step{drip.steps.length === 1 ? '' : 's'} • {drip.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" onClick={() => handleSelect(drip)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(drip.id)}>
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {drips.length === 0 && (
                  <Typography color="text.secondary">No drips created yet.</Typography>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
