'use client';

import React from 'react';
import { Box, Button, TextField, Typography, MenuItem, Stack, Divider, Paper, Chip } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { listClientsByAgencyEmail } from '@/services/clients';
import { listPrompts, savePrompt, deletePrompt, PromptRecord } from '@/services/prompts';
import { generateIntro } from '@/services/aiRecruiter';
import { getAgencyByEmail } from '@/services/agencies';
import { useTour } from '@/features/tour/TourProvider';
import { promptsSteps } from '@/features/tour/promptsSteps';

type ClientRow = { id: string; email: string; firstName?: string; lastName?: string; sport?: string };

export default function PromptPlaygroundPage() {
  const { session } = useSession();
  const { startTour } = useTour();
  const [clients, setClients] = React.useState<ClientRow[]>([]);

  React.useEffect(() => {
    if (session) startTour('prompts', promptsSteps);
  }, [session, startTour]);
  const [clientId, setClientId] = React.useState('');
  const [prompt, setPrompt] = React.useState<string>('');
  const [templates, setTemplates] = React.useState<PromptRecord[]>([]);
  const [templateName, setTemplateName] = React.useState('');
  const [runName, setRunName] = React.useState('');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('');
  const [response, setResponse] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [agencyName, setAgencyName] = React.useState<string>('');

  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  const currentClient = React.useMemo(
    () => clients.find(c => c.id === clientId) || null,
    [clients, clientId]
  );

  React.useEffect(() => {
    if (!userEmail) return;

    // Load Clients
    listClientsByAgencyEmail(userEmail).then(setClients);
    
    // Load agency name for use as collegeName in prompts
    getAgencyByEmail(userEmail).then(a => setAgencyName(a?.name || ''));
  }, [userEmail]); // FIX: Dependency is now the correct email variable

  React.useEffect(() => {
    if (!userEmail) return;
    
    listPrompts({ agencyEmail: userEmail, clientId })
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, [userEmail, clientId]);

  async function handleRun() {
    try {
      setLoading(true);
      setError(null);
      setResponse('');
      const firstName = currentClient?.firstName || '';
      const lastName = currentClient?.lastName || '';
      const sport = currentClient?.sport || '';
      const fullName = `${firstName} ${lastName}`.trim();

      const intro = await generateIntro({
        sport,
        collegeName: agencyName || '',
        coachMessage: prompt || 'Write a concise, friendly intro email.',
        tone: 'A highschool kid who loves sports',
        qualities: ['Passionate', 'Hardworking', 'Determined'],
        additionalInsights: `Student full name: ${fullName}. FirstName: ${firstName}. LastName: ${lastName}. Sport: ${sport}. Use the student’s actual name; no placeholders.`,
      });

      setResponse(String(intro));
    } catch (e: any) {
      setError(e?.message || 'Failed to run prompt');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!userEmail || !response) return;
    const name = templateName || `Prompt ${new Date().toLocaleString()}`;
    // Save the AI-generated response, not the user's input prompt
    const rec = await savePrompt({ agencyEmail: userEmail, clientId, name, text: response });
    setTemplates([rec, ...templates]);
    setTemplateName('');
  }

  function handleApplyTemplate(id: string) {
    const t = templates.find(x => x.id === id);
    if (!t) return;
    setPrompt(t.text);
    setSelectedTemplateId(id);
  }

  function handleDeleteTemplate(id: string) {
    deletePrompt(id);
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId('');
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: '#dcdfe4' }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5">AI Prompt Playground (Playground)</Typography>
        <Typography variant="body2" color="text.secondary">
          This area is used for testing, generating, and saving your prompts for athletes. You can name prompts (e.g., “John Doe – introduction”) and reuse them when generating that athlete’s introduction email.
        </Typography>
        {error && (
          <Typography color="error">{error}</Typography>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="Athlete"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            SelectProps={{ MenuProps: { disablePortal: true } }}
          >
            <MenuItem value="">(Select a client)</MenuItem>
            {clients.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.email} {c.firstName ? `- ${c.firstName} ${c.lastName}` : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Saved Prompts"
            value={selectedTemplateId}
            onChange={(e) => handleApplyTemplate(String(e.target.value))}
            SelectProps={{ MenuProps: { disablePortal: true } }}
            data-tour="prompts-list"
          >
            <MenuItem value="">(Select a prompt)</MenuItem>
            {templates.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Prompt"
          multiline
          minRows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Write a warm, concise introduction that highlights the athlete’s drive and recent accomplishments..."
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              label="Run name"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <Button variant="contained" onClick={handleRun} disabled={loading || !clientId}>
              {loading ? 'Running…' : 'Run'}
            </Button>
          </Stack>
        </Stack>

        </Box>
      </Paper>

      <Box sx={{ p: 2, borderRadius: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Response</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          The response is where you determine if what’s being generated satisfies your needs.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, minHeight: 160, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {response || '—'}
        </Paper>
        <Box
          sx={{
            pt: 1.5,
            mt: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'flex-end'
          }}
        >
          <TextField
            size="small"
            label="Prompt name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ width: 220 }}
          />
          <Button data-tour="create-prompt-btn" variant="outlined" onClick={handleSave} disabled={!userEmail || !response}>Save Prompt</Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => { if (selectedTemplateId) handleDeleteTemplate(selectedTemplateId); }}
            disabled={!selectedTemplateId}
          >
            Delete Prompt
          </Button>
          <Button
            variant="text"
            onClick={() => navigator.clipboard.writeText(response || '')}
            disabled={!response}
          >
            Copy Response
          </Button>
        </Box>
      </Box>
    </Box>
  );
}