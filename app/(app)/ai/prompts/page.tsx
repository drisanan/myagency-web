'use client';

import React from 'react';
import { Box, Button, TextField, Typography, MenuItem, Stack, Divider, Paper, Chip, CircularProgress, Skeleton } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { listClientsByAgencyEmail, getClient } from '@/services/clients';
import { listPrompts, savePrompt, deletePrompt, PromptRecord, getPromptMetrics, type PromptMetrics } from '@/services/prompts';
import { generateIntro } from '@/services/aiRecruiter';
import { useTour } from '@/features/tour/TourProvider';
import { promptsSteps } from '@/features/tour/promptsSteps';
import { MetricCard } from '@/app/(app)/dashboard/MetricCard';
import { IoSparklesOutline, IoCheckmarkCircleOutline, IoTrashOutline } from 'react-icons/io5';

type ClientRow = { id: string; email: string; firstName?: string; lastName?: string; sport?: string };
type IntroTemplate = { id: string; name: string; text: string };
const INTRO_TOKENS = [
  '{{coach_full_name}}',
  '{{coach_first_name}}',
  '{{coach_last_name}}',
  '{{university_name}}',
  '{{athlete_full_name}}',
  '{{athlete_first_name}}',
  '{{athlete_last_name}}',
];

const INTRO_TEMPLATES: IntroTemplate[] = [
  {
    id: 'intro-brief',
    name: 'Brief Introduction',
    text: [
      'Write a concise introduction email from {{athlete_full_name}} to Coach {{coach_last_name}} at {{university_name}}.',
      'Mention the athlete’s sport, one recent accomplishment, and one measurable metric.',
      'Keep it to 2–4 sentences with a confident, respectful tone.',
    ].join(' '),
  },
  {
    id: 'intro-academic',
    name: 'Academic + Athletic Balance',
    text: [
      'Draft a short intro from {{athlete_full_name}} to Coach {{coach_full_name}} at {{university_name}}.',
      'Highlight one academic strength and one athletic strength.',
      'Invite the coach to view the athlete’s profile or highlights without sounding pushy.',
    ].join(' '),
  },
  {
    id: 'intro-recruiting',
    name: 'Recruiting Interest',
    text: [
      '{{athlete_full_name}} is reaching out to express interest in {{university_name}}.',
      'Write a warm intro to Coach {{coach_last_name}} that includes position, measurable metrics, and a short statement of fit.',
      'Keep it concise and coach-friendly.',
    ].join(' '),
  },
];

function ensureTokens(text: string) {
  const hasToken = INTRO_TOKENS.some((token) => text.includes(token));
  if (hasToken) return text;
  return `${text} I'm excited about {{university_name}} and the opportunity to learn from Coach {{coach_last_name}}.`;
}

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
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('');
  const [response, setResponse] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{ clientId?: string; prompt?: string; templateName?: string }>({});
  const [metrics, setMetrics] = React.useState<PromptMetrics>({ generated: 0, used: 0, deleted: 0 });
  const [metricsLoading, setMetricsLoading] = React.useState(false);
  const [selectedTemplatePreset, setSelectedTemplatePreset] = React.useState('');
  const [clientProfile, setClientProfile] = React.useState<any | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const promptRef = React.useRef<HTMLTextAreaElement | null>(null);

  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  const currentClient = React.useMemo(
    () => clients.find(c => c.id === clientId) || null,
    [clients, clientId]
  );
  const athleteFullName = `${currentClient?.firstName || ''} ${currentClient?.lastName || ''}`.trim();

  React.useEffect(() => {
    if (!userEmail) return;

    // Load Clients
    listClientsByAgencyEmail(userEmail).then(setClients);
    
  }, [userEmail]); // FIX: Dependency is now the correct email variable

  const refreshMetrics = React.useCallback(async () => {
    if (!userEmail) return;
    try {
      setMetricsLoading(true);
      const data = await getPromptMetrics({ agencyEmail: userEmail });
      setMetrics(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load metrics');
    } finally {
      setMetricsLoading(false);
    }
  }, [userEmail]);

  React.useEffect(() => {
    if (!userEmail) return;
    
    listPrompts({ agencyEmail: userEmail, clientId })
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, [userEmail, clientId]);

  React.useEffect(() => {
    if (!clientId) {
      setClientProfile(null);
      return;
    }
    setProfileLoading(true);
    getClient(clientId)
      .then((profile) => setClientProfile(profile))
      .catch(() => setClientProfile(null))
      .finally(() => setProfileLoading(false));
  }, [clientId]);

  React.useEffect(() => {
    if (!athleteFullName || templateName.trim()) return;
    setTemplateName(`${athleteFullName} – introduction`);
  }, [athleteFullName, templateName]);

  React.useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  async function handleRun() {
    try {
      const nextErrors: { clientId?: string; prompt?: string; templateName?: string } = {};
      if (!clientId) nextErrors.clientId = 'Required';
      if (!prompt.trim()) nextErrors.prompt = 'Required';
      if (!templateName.trim()) nextErrors.templateName = 'Required';
      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setLoading(true);
      setError(null);
      setResponse('');
      const firstName = currentClient?.firstName || '';
      const lastName = currentClient?.lastName || '';
      const sport = currentClient?.sport || '';
      const fullName = `${firstName} ${lastName}`.trim();
      // Randomize greeting style
      const greetings = ['Hey Coach', 'Hello Coach', 'Hi Coach', 'Coach'];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      const profileSummary = buildJarvisProfileSummary(clientProfile);
      const intro = await generateIntro({
        sport,
        collegeName: 'Selected University',
        coachMessage: prompt || 'Write a concise, friendly introduction.',
        tone: 'Casual and conversational, like a confident high school athlete',
        qualities: ['Passionate', 'Hardworking', 'Determined'],
        additionalInsights: `
Purpose: Write an introduction email FROM the athlete TO the college coach at the target university. This is NOT to an agency.
Athlete: ${fullName} (${sport || 'Sport not provided'})
Coach placeholder: {{coach_full_name}} (or {{coach_last_name}})
University placeholder: {{university_name}}
Profile summary: ${profileSummary}

CRITICAL INSTRUCTIONS:
1. Start with "${randomGreeting} {{coach_last_name}}," - NEVER use "Dear", "Greetings", or overly formal openings.
2. Write ONLY a brief greeting and ONE introductory paragraph (2-4 sentences max).
3. DO NOT include a middle section, bullet points, sign-off, or closing.
4. Use the provided placeholders ({{coach_last_name}}, {{university_name}}) if specific values are not available in the prompt.
5. Keep it casual, genuine, and enthusiastic - like a real high school athlete would write.
6. End the paragraph naturally without any closing remarks or signature.
`.trim(),
      });

      setResponse(ensureTokens(String(intro)));
      refreshMetrics();
    } catch (e: any) {
      setError(e?.message || 'Failed to run prompt');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!userEmail || !response || saving) return;
    try {
      setSaving(true);
      const name = templateName || `Prompt ${new Date().toLocaleString()}`;
      // Save the AI-generated response, not the user's input prompt
      const rec = await savePrompt({ agencyEmail: userEmail, clientId, name, text: response });
      setTemplates([rec, ...templates]);
      setTemplateName('');
      setPrompt('');
      setResponse('');
      setSelectedTemplateId('');
      setClientId('');
      setFieldErrors({});
      refreshMetrics();
    } catch (e: any) {
      setError(e?.message || 'Failed to save intro');
    } finally {
      setSaving(false);
    }
  }

  function handleApplyTemplate(id: string) {
    const t = templates.find(x => x.id === id);
    if (!t) return;
    setPrompt(t.text);
    setSelectedTemplateId(id);
    if (!templateName.trim()) setTemplateName(t.name);
  }

  function handleApplyPreset(id: string) {
    const preset = INTRO_TEMPLATES.find((t) => t.id === id);
    if (!preset) return;
    setPrompt(preset.text);
    setSelectedTemplatePreset(id);
    if (!templateName.trim()) {
      const baseName = athleteFullName || 'Introduction';
      setTemplateName(`${baseName} – ${preset.name}`);
    }
  }

  function insertTokenAtCursor(token: string) {
    const el = promptRef.current;
    if (!el) {
      setPrompt((prev) => `${prev}${prev ? ' ' : ''}${token}`);
      return;
    }
    const start = el.selectionStart ?? prompt.length;
    const end = el.selectionEnd ?? prompt.length;
    const next = `${prompt.slice(0, start)}${token}${prompt.slice(end)}`;
    setPrompt(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function buildJarvisProfileSummary(profile: any) {
    if (!profile) return 'No profile details available.';
    const radar = profile.radar ?? {};
    const accomplishments = Array.isArray(radar.accomplishments)
      ? radar.accomplishments.filter((item: string) => item && item.trim() !== '')
      : [];
    const metrics = [
      { title: radar.athleteMetricsTitleOne, value: radar.athleteMetricsValueOne },
      { title: radar.athleteMetricsTitleTwo, value: radar.athleteMetricsValueTwo },
      { title: radar.athleteMetricsTitleThree, value: radar.athleteMetricsValueThree },
      { title: radar.athleteMetricsTitleFour, value: radar.athleteMetricsValueFour },
    ].filter((m) => m.title && m.value);
    const highlights = [
      radar.youtubeHighlightUrl ? `YouTube: ${radar.youtubeHighlightUrl}` : '',
      radar.hudlLink ? `Hudl: ${radar.hudlLink}` : '',
      radar.instagramProfileUrl ? `Instagram: ${radar.instagramProfileUrl}` : '',
    ].filter(Boolean);

    return [
      profile.firstName || profile.lastName ? `Name: ${(profile.firstName || '')} ${(profile.lastName || '')}`.trim() : '',
      profile.sport ? `Sport: ${profile.sport}` : '',
      radar.school ? `School: ${radar.school}` : '',
      radar.gpa ? `GPA: ${radar.gpa}` : '',
      radar.preferredAreaOfStudy ? `Preferred Study: ${radar.preferredAreaOfStudy}` : '',
      accomplishments.length ? `Accomplishments: ${accomplishments.join('; ')}` : '',
      metrics.length ? `Metrics: ${metrics.map((m) => `${m.title}: ${m.value}`).join('; ')}` : '',
      highlights.length ? `Highlights: ${highlights.join('; ')}` : '',
    ].filter(Boolean).join(' | ') || 'No profile details available.';
  }

  async function handleDeleteTemplate(id: string) {
    if (!id || deleting) return;
    try {
      setDeleting(true);
      await deletePrompt(id);
      setTemplates(templates.filter(t => t.id !== id));
      if (selectedTemplateId === id) setSelectedTemplateId('');
      refreshMetrics();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete prompt');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <MetricCard
          title="Total Introductions Generated"
          value={metricsLoading ? '—' : metrics.generated}
          icon={<IoSparklesOutline size={20} />}
        />
        <MetricCard
          title="Total Introductions Used"
          value={metricsLoading ? '—' : metrics.used}
          icon={<IoCheckmarkCircleOutline size={20} />}
        />
        <MetricCard
          title="Total Intros Deleted"
          value={metricsLoading ? '—' : metrics.deleted}
          icon={<IoTrashOutline size={20} />}
        />
      </Box>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: '#dcdfe4' }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5">Introduction Generator</Typography>
        <Typography variant="body2" color="text.secondary">
          This area is used for testing, generating, and saving your email introductions for athletes. You can name introductions (e.g., “John Doe – introduction”) and reuse them when generating that athlete’s email.
        </Typography>
        {error && (
          <Typography color="error">{error}</Typography>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              select
              label="Athlete"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              SelectProps={{ MenuProps: { disablePortal: true } }}
              error={Boolean(fieldErrors.clientId)}
              helperText={fieldErrors.clientId}
            >
              <MenuItem value="">(Select a client)</MenuItem>
              {clients.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.email} {c.firstName ? `- ${c.firstName} ${c.lastName}` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Introduction Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              error={Boolean(fieldErrors.templateName)}
              helperText={fieldErrors.templateName}
            />
            <Stack spacing={1}>
              <Typography variant="subtitle1">Introduction Templates</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {INTRO_TEMPLATES.map((t) => (
                  <Button
                    key={t.id}
                    variant={selectedTemplatePreset === t.id ? 'contained' : 'outlined'}
                    onClick={() => handleApplyPreset(t.id)}
                    size="small"
                  >
                    {t.name}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                Dynamic fields:
              </Typography>
              {INTRO_TOKENS.map((token) => (
                <Chip
                  key={token}
                  label={token}
                  size="small"
                  onClick={() => insertTokenAtCursor(token)}
                />
              ))}
            </Stack>
            <TextField
              label="Introduction"
              multiline
              minRows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Write a warm, concise introduction that highlights the athlete’s drive and recent accomplishments..."
              error={Boolean(fieldErrors.prompt)}
              helperText={fieldErrors.prompt}
              inputRef={promptRef}
            />
          </Stack>

          <Box sx={{ borderLeft: { xs: 'none', lg: '1px solid #eaecf0' }, pl: { xs: 0, lg: 2 } }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Saved Prompts</Typography>
            <TextField
              size="small"
              select
              label="Select One"
              value={selectedTemplateId}
              onChange={(e) => handleApplyTemplate(String(e.target.value))}
              SelectProps={{ MenuProps: { disablePortal: true } }}
              data-tour="prompts-list"
              fullWidth
            >
              <MenuItem value="">(Select One)</MenuItem>
              {templates.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </TextField>
            {profileLoading && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Loading athlete profile…
              </Typography>
            )}
          </Box>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              onClick={handleRun}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {loading ? 'Generating…' : 'Generate Introduction'}
            </Button>
          </Stack>
        </Stack>

        </Box>
      </Paper>

      {(loading || response) && (
        <Box sx={{ p: 2, borderRadius: 2.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Response</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            The response is where you determine if what’s being generated satisfies your needs.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 160, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="rounded" height={48} />
              </Stack>
            ) : (
              response || '—'
            )}
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
            <Button
              data-tour="create-prompt-btn"
              variant="outlined"
              onClick={handleSave}
              disabled={!userEmail || !response || saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Save Intro
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => { if (selectedTemplateId) handleDeleteTemplate(selectedTemplateId); }}
              disabled={!selectedTemplateId || deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
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
      )}
    </Box>
  );
}