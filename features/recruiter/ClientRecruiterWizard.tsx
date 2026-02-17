'use client';
import React from 'react';
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generateIntro } from '@/services/aiRecruiter';
import { useSession } from '@/features/auth/session';
import { getClient, setClientGmailTokens, getClientGmailTokens } from '@/services/clients';
import { CoachList } from '@/services/lists';
import { listAssignments } from '@/services/listAssignments';
import { hasMailed, markMailed } from '@/services/mailStatus';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

const STEPS = ['Select List', 'Select Coach', 'Compose & Send'];

export function ClientRecruiterWizard() {
  const { session, loading } = useSession();
  const clientId = session?.clientId || '';
  const agencyEmail = session?.agencyEmail || session?.email || '';

  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [sendMessage, setSendMessage] = React.useState<string | null>(null);

  // Client profile
  const [clientProfile, setClientProfile] = React.useState<any>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const missingProfileFields = React.useMemo(() => {
    const missing: string[] = [];
    const email = String(clientProfile?.email || '').trim();
    if (!email || email.toLowerCase() === 'admin@example.com') missing.push('Email');
    if (!clientProfile?.firstName) missing.push('First Name');
    if (!clientProfile?.lastName) missing.push('Last Name');
    if (!clientProfile?.phone) missing.push('Phone');
    if (!clientProfile?.sport) missing.push('Sport');
    if (!clientProfile?.username) {
      missing.push('Profile Username');
      missing.push('Profile URL');
    }
    const hasAccessCode = Boolean(clientProfile?.accessCodeHash || clientProfile?.accessCode || clientProfile?.authEnabled);
    if (!hasAccessCode) missing.push('Access Code');
    const hasPhoto = Boolean(clientProfile?.radar?.profileImage || clientProfile?.profileImageUrl || clientProfile?.photoUrl);
    if (!hasPhoto) missing.push('Add Photo');
    return missing;
  }, [clientProfile]);
  const profileIncomplete = missingProfileFields.length > 0;

  // Lists (assigned by agency)
  const [lists, setLists] = React.useState<CoachList[]>([]);
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedList, setSelectedList] = React.useState<CoachList | null>(null);

  // Single coach selection (only one allowed)
  const [selectedCoachId, setSelectedCoachId] = React.useState<string>('');
  const selectedCoach = React.useMemo(() => {
    if (!selectedList || !selectedCoachId) return null;
    return (selectedList.items || []).find((it, idx) => {
      const rowId = String(
        it.id || `List::${it.school || ''}::${it.email || ''}::${(it.firstName || '')}-${(it.lastName || '')}::${it.title || ''}::${idx}`
      );
      return rowId === selectedCoachId;
    }) || null;
  }, [selectedList, selectedCoachId]);

  // Email content (editable)
  const [emailHtml, setEmailHtml] = React.useState<string>('');
  const [isEditing, setIsEditing] = React.useState(false);

  // Email sections
  const [enabledSections, setEnabledSections] = React.useState<Record<string, boolean>>({
    accomplishments: true,
    motivation: true,
    academic: true,
    athletic: true,
    highlights: true,
    contact: true,
    coach: true,
    references: true,
    profilePicture: false,
    radarPage: true,
  });

  // Gmail connection
  const [gmailConnecting, setGmailConnecting] = React.useState(false);
  const [gmailConnected, setGmailConnected] = React.useState(false);
  const popupRef = React.useRef<Window | null>(null);

  // Loading states
  const [aiLoading, setAiLoading] = React.useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = React.useState(false);

  // Contact info derived from client profile
  const contact = React.useMemo(() => {
    const radar = clientProfile?.radar ?? {};
    return {
      email: clientProfile?.email ?? '',
      phone: clientProfile?.phone ?? '',
      firstName: clientProfile?.firstName ?? '',
      lastName: clientProfile?.lastName ?? '',
      username: clientProfile?.username ?? '',
      sport: clientProfile?.sport ?? '',
      school: radar.school ?? '',
      accomplishments: radar.accomplishments ?? [],
      motivationalQuotes: radar.motivationalQuotes ?? (radar.athleteAdvice ? [radar.athleteAdvice] : []),
      gpa: radar.gpa ?? '',
      preferredAreaOfStudy: radar.preferredAreaOfStudy ?? '',
      athleteMetricsTitleOne: radar.athleteMetricsTitleOne ?? '',
      athleteMetricsValueOne: radar.athleteMetricsValueOne ?? '',
      athleteMetricsTitleTwo: radar.athleteMetricsTitleTwo ?? '',
      athleteMetricsValueTwo: radar.athleteMetricsValueTwo ?? '',
      athleteMetricsTitleThree: radar.athleteMetricsTitleThree ?? '',
      athleteMetricsValueThree: radar.athleteMetricsValueThree ?? '',
      athleteMetricsTitleFour: radar.athleteMetricsTitleFour ?? '',
      athleteMetricsValueFour: radar.athleteMetricsValueFour ?? '',
      youtubeHighlightUrl: radar.youtubeHighlightUrl ?? '',
      hudlLink: radar.hudlLink ?? '',
      instagramProfileUrl: radar.instagramProfileUrl ?? '',
      newsArticleLinks: radar.newsArticleLinks ?? [],
      headCoachName: radar.headCoachName ?? '',
      headCoachEmail: radar.headCoachEmail ?? '',
      headCoachPhone: radar.headCoachPhone ?? '',
      referenceOneName: radar.referenceOneName ?? '',
      referenceOneEmail: radar.referenceOneEmail ?? '',
      referenceOnePhone: radar.referenceOnePhone ?? '',
      referenceTwoName: radar.referenceTwoName ?? '',
      referenceTwoEmail: radar.referenceTwoEmail ?? '',
      referenceTwoPhone: radar.referenceTwoPhone ?? '',
      profileImage: radar.profileImage ?? '',
    };
  }, [clientProfile]);

  // Load client profile and lists
  React.useEffect(() => {
    if (!clientId) return;
    setLoadingProfile(true);
    Promise.all([
      getClient(clientId),
      listAssignments({ clientId, includeLists: true }),
    ])
      .then(([profile, assignmentData]) => {
        setClientProfile(profile);
        const listsFromAssignments = (assignmentData?.lists || []) as CoachList[];
        setLists(listsFromAssignments);
      })
      .catch((e) => setError(e?.message || 'Failed to load data'))
      .finally(() => setLoadingProfile(false));
  }, [clientId]);

  // Check Gmail connection status
  React.useEffect(() => {
    if (!clientId) return;
    const statusUrl = `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(clientId)}`;
    fetch(statusUrl, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setGmailConnected(Boolean(d?.connected)))
      .catch(() => setGmailConnected(false));
  }, [clientId]);

  // Listen for OAuth popup messages
  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof window === 'undefined') return;
      // Allow messages from both the frontend origin and the API origin
      // (OAuth callback page is served from the API domain in production)
      const apiOrigin = API_BASE_URL ? new URL(API_BASE_URL).origin : '';
      const allowedOrigins = [window.location.origin, apiOrigin].filter(Boolean);
      if (!allowedOrigins.includes(e.origin)) return;
      if (e.data?.type === 'google-oauth-success') {
        setGmailConnecting(false);
        setGmailConnected(true);
        try { popupRef.current?.close(); } catch {}
        // Fetch and store tokens
        (async () => {
          try {
            const r = await fetch(`${API_BASE_URL}/google/tokens?clientId=${encodeURIComponent(clientId)}`);
            const j = await r.json();
            if (j?.ok && j?.tokens) {
              setClientGmailTokens(clientId, j.tokens);
            }
          } catch {}
        })();
      }
      if (e.data?.type === 'google-oauth-error') {
        setGmailConnecting(false);
        setError('Gmail connection failed. Please try again.');
        try { popupRef.current?.close(); } catch {}
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [clientId]);

  function toggleSection(k: string, v: boolean) {
    setEnabledSections((p) => ({ ...p, [k]: v }));
  }

  function buildEmailPreview(): string {
    const coachName = selectedCoach?.lastName || 'Coach';
    const enabledIds = Object.keys(enabledSections).filter((k) => enabledSections[k]);
    let emailContent = '';
    const generatedIntro = `${contact.firstName || ''} ${contact.lastName || ''} - ${contact.school || ''}`.trim();
    emailContent += `<p>Hello Coach ${coachName},</p><p>${generatedIntro}</p>`;
    
    if (enabledIds.includes('accomplishments')) {
      const valid = (contact.accomplishments || []).filter((item: string) => item && item.trim() !== '' && item !== 'undefined');
      if (valid.length) {
        emailContent += `<p><strong>Accomplishments:</strong></p><ul>${valid.map((item: string) => `<li>${item.trim()}</li>`).join('')}</ul>\n`;
      }
    }
    if (enabledIds.includes('motivation') && contact.motivationalQuotes?.[0]) {
      emailContent += `<p><strong>Why I'm Ready For The Next Level:</strong></p><p>"${contact.motivationalQuotes[0]}"</p>\n`;
    }
    if (enabledIds.includes('academic') && (contact.gpa || contact.preferredAreaOfStudy)) {
      emailContent += `<p><strong>Academic Information:</strong></p><ul>${[
        contact.gpa ? `<li>GPA: ${contact.gpa}</li>` : '',
        contact.preferredAreaOfStudy ? `<li>Preferred Area of Study: ${contact.preferredAreaOfStudy}</li>` : ''
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('athletic')) {
      const metrics = [
        { title: contact.athleteMetricsTitleOne, value: contact.athleteMetricsValueOne },
        { title: contact.athleteMetricsTitleTwo, value: contact.athleteMetricsValueTwo },
        { title: contact.athleteMetricsTitleThree, value: contact.athleteMetricsValueThree },
        { title: contact.athleteMetricsTitleFour, value: contact.athleteMetricsValueFour },
      ].filter((m) => m.title && m.value);
      if (metrics.length) {
        emailContent += `<p><strong>Athletic Metrics:</strong></p><ul>${metrics.map((m) => `<li>${m.title}: ${m.value}</li>`).join('')}</ul>\n`;
      }
    }
    if (enabledIds.includes('highlights')) {
      const highlights = [
        contact.youtubeHighlightUrl ? { type: 'YouTube Highlight', url: `https://www.youtube.com/watch?v=${contact.youtubeHighlightUrl}` } : null,
        contact.hudlLink ? { type: 'Hudl Profile', url: `https://www.hudl.com/profile/${contact.hudlLink}` } : null,
        contact.instagramProfileUrl ? { type: 'Instagram', url: `https://www.instagram.com/${contact.instagramProfileUrl}` } : null,
      ].filter(Boolean) as Array<{ type: string; url: string }>;
      if (highlights.length) {
        emailContent += `<p><strong>View My Highlights:</strong></p><ul>${highlights.map((h) => `<li><a href="${h.url}" target="_blank">${h.type}</a></li>`).join('')}</ul>\n`;
      }
    }
    if (enabledIds.includes('contact') && (contact.email || contact.phone)) {
      emailContent += `<p><strong>Contact Info:</strong></p><ul>${[
        contact.email ? `<li>Email: <a href="mailto:${contact.email}">${contact.email}</a></li>` : '',
        contact.phone ? `<li>Phone: <a href="tel:${contact.phone}">${contact.phone}</a></li>` : ''
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('references') && (contact.referenceOneName || contact.referenceTwoName)) {
      emailContent += `<p><strong>References:</strong></p><ul>${[
        contact.referenceOneName ? `<li>${contact.referenceOneName}${contact.referenceOnePhone ? ` - ${contact.referenceOnePhone}` : ''}${contact.referenceOneEmail ? ` - ${contact.referenceOneEmail}` : ''}</li>` : '',
        contact.referenceTwoName ? `<li>${contact.referenceTwoName}${contact.referenceTwoPhone ? ` - ${contact.referenceTwoPhone}` : ''}${contact.referenceTwoEmail ? ` - ${contact.referenceTwoEmail}` : ''}</li>` : '',
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('profilePicture') && contact.profileImage) {
      emailContent += `<p><img src="${contact.profileImage}" alt="Profile Picture" width="250px" style="max-width: 250px; height: auto;"></p>`;
    }
    emailContent += `<p>Thank you for your time!</p><p>${contact.firstName || ''} ${contact.lastName || ''} - ${contact.school || ''}</p>`;
    if (enabledIds.includes('radarPage') && contact.username) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.myrecruiteragency.com';
      emailContent += `\nFollow My Radar Page: <a href="${baseUrl}/athlete/${contact.username}" target="_blank">HERE</a>`;
    }
    return emailContent;
  }

  async function handleGenerateAI() {
    try {
      setAiLoading(true);
      setError(null);
      const coachLast = selectedCoach?.lastName || 'Coach';
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      const collegeName = selectedCoach?.school || selectedList?.name || 'the university';
      const sport = contact.sport || '';

      const parts: string[] = [];
      if (enabledSections.accomplishments && contact.accomplishments?.length) parts.push('notable accomplishments');
      if (enabledSections.academic && (contact.gpa || contact.preferredAreaOfStudy)) parts.push('academic information');
      if (enabledSections.athletic) parts.push('athletic metrics');
      if (enabledSections.highlights) parts.push('highlights');

      const greetings = ['Hey', 'Hello', 'Hi'];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      const coachMessage = `Write a brief, engaging introduction for ${fullName}, a ${sport} athlete. Mention: ${parts.join(', ') || 'basic profile details'}.`;

      const intro = await generateIntro({
        sport,
        collegeName,
        coachMessage,
        tone: 'Casual and conversational, like a confident high school athlete',
        qualities: ['Passionate', 'Hardworking', 'Determined'],
        additionalInsights: `
Student full name: ${fullName}. Target school: ${collegeName}.

CRITICAL INSTRUCTIONS:
1. Write ONLY a brief introductory paragraph (2-4 sentences max).
2. DO NOT include any greeting (no "Hey", "Hello", "Dear" - the system adds that).
3. DO NOT include any closing, sign-off, or signature.
4. DO NOT include placeholders like [StudentName] - use actual names.
5. Keep it casual, genuine, and enthusiastic.
`.trim(),
      });

      let introFixed = String(intro)
        .replace(/\[StudentName\]/gi, fullName)
        .replace(/^(Hey|Hello|Hi|Dear|Greetings)[^,]*,?\s*/i, '')
        .replace(/(Best regards|Sincerely|Thank you|Thanks)[\s\S]*/i, '')
        .trim();

      const base = buildEmailPreview();
      const stripped = base.replace(/^<p>Hello Coach[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>/, '');
      const rest = stripped || base;
      const improved = `<p>${randomGreeting} Coach ${coachLast},</p><p>${introFixed}</p>${rest}`;
      setEmailHtml(improved);
    } catch (e: any) {
      setError(e?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleConnectGmail() {
    try {
      setGmailConnecting(true);
      const oauthUrl = `${API_BASE_URL}/google/oauth/url?clientId=${encodeURIComponent(clientId)}`;
      const res = await fetch(oauthUrl, { credentials: 'include' });
      const data = await res.json();
      if (!data?.url) throw new Error('Failed to start Gmail connection');
      const w = 500, h = 700;
      const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 100;
      const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 100;
      popupRef.current = window.open(
        data.url,
        'an-google-oauth',
        `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
      );
      if (!popupRef.current) throw new Error('Popup blocked. Allow popups and retry.');
    } catch (e: any) {
      setGmailConnecting(false);
      setError(e?.message || 'Failed to connect Gmail');
    }
  }

  async function handleCreateDraft() {
    try {
      if (!window.confirm('Send this email now?')) {
        return;
      }
      setIsCreatingDraft(true);
      setSendMessage(null);
      setError(null);

      if (!selectedCoach?.email) {
        setError('Selected coach has no email address');
        return;
      }

      const subject = `Intro: ${contact.firstName || ''} ${contact.lastName || ''} → ${selectedCoach.school || selectedList?.name || ''}`.trim();
      const html = emailHtml || buildEmailPreview();
      const savedTokens = getClientGmailTokens(clientId);

      const sendUrl = API_BASE_URL ? `${API_BASE_URL}/gmail/send` : '/api/gmail/send';
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          recipients: [selectedCoach.email],
          subject,
          html,
          tokens: savedTokens || undefined,
          agencyEmail: agencyEmail || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Send failed');
      }
      try {
        markMailed(clientId, [selectedCoach.email]);
      } catch {}
      setSendMessage('Email sent successfully!');
    } catch (e: any) {
      setError(e?.message || 'Failed to send email');
    } finally {
      setIsCreatingDraft(false);
    }
  }

  const canNext =
    !profileIncomplete &&
    ((activeStep === 0 && Boolean(selectedListId)) ||
      (activeStep === 1 && Boolean(selectedCoachId)) ||
      activeStep === 2);

  const handleNext = () => {
    if (activeStep === 1 && !emailHtml) {
      // Auto-generate initial email when moving to compose step
      setEmailHtml(buildEmailPreview());
    }
    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
    }
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  if (loading || loadingProfile) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={32} />
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  if (!session || session.role !== 'client') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Please log in as a client to use this feature.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {missingProfileFields.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Complete your profile to use the Recruiter Wizard.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Missing: {missingProfileFields.join(', ')}
          </Typography>
        </Alert>
      )}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {sendMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSendMessage(null)}>
          {sendMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        {/* Step 0: Select List */}
        {activeStep === 0 && (
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Select a List
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose from lists assigned by your agency to find coaches to contact.
            </Typography>
            {lists.length === 0 ? (
              <Typography color="text.secondary">
                No lists available. Please ask your agency to assign you a list.
              </Typography>
            ) : (
              <TextField
                size="small"
                select
                label="Select List"
                value={selectedListId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedListId(id);
                  const list = lists.find((l) => l.id === id) || null;
                  setSelectedList(list);
                  setSelectedCoachId('');
                }}
                fullWidth
              >
                <MenuItem value="">(Select a list)</MenuItem>
                {lists.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name} ({(l.items || []).length} coaches)
                  </MenuItem>
                ))}
              </TextField>
            )}
            {selectedList && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                <Typography variant="subtitle2">List Preview:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(selectedList.items || []).slice(0, 5).map((it) => 
                    `${it.firstName || ''} ${it.lastName || ''} (${it.school || 'Unknown'})`.trim()
                  ).join(', ')}
                  {(selectedList.items || []).length > 5 && ` and ${(selectedList.items || []).length - 5} more...`}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Step 1: Select Single Coach */}
        {activeStep === 1 && selectedList && (
          <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h6" gutterBottom>
              Select One Coach
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose one coach to send your introduction email to.
            </Typography>
            <RadioGroup
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                {(selectedList.items || []).map((it, idx) => {
                  const rowId = String(
                    it.id || `List::${it.school || ''}::${it.email || ''}::${(it.firstName || '')}-${(it.lastName || '')}::${it.title || ''}::${idx}`
                  );
                  const mailed = hasMailed(clientId, it.email || '');
                  const labelName = `${it.firstName || ''} ${it.lastName || ''}`.trim() || it.email || 'Unknown';
                  return (
                    <FormControlLabel
                      key={rowId}
                      value={rowId}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2">
                            {labelName}
                            {it.title ? ` — ${it.title}` : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {it.school || ''} {it.email ? `• ${it.email}` : ''} {mailed ? '• Already contacted' : ''}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        border: '1px solid #E0E0E0',
                        borderRadius: 0,
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                        p: 1,
                        m: 0,
                        '&:hover': { bgcolor: '#F5F5F5' },
                      }}
                    />
                  );
                })}
              </Box>
            </RadioGroup>
          </Box>
        )}

        {/* Step 2: Compose & Send */}
        {activeStep === 2 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Recipient info */}
              {selectedCoach && (
                <Card variant="outlined">
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="subtitle2">Sending to:</Typography>
                    <Typography>
                      {selectedCoach.firstName || ''} {selectedCoach.lastName || ''} — {selectedCoach.title || 'Coach'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCoach.school || ''} • {selectedCoach.email || 'No email'}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Email Preview/Editor */}
              <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', p: 2, bgcolor: '#F5F5F5' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Email Preview</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={isEditing ? 'contained' : 'outlined'}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Done Editing' : 'Edit'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigator.clipboard.writeText(emailHtml || buildEmailPreview())}
                    >
                      Copy
                    </Button>
                  </Stack>
                </Box>
                
                {isEditing ? (
                  <TextField
                    multiline
                    fullWidth
                    minRows={10}
                    maxRows={20}
                    value={emailHtml || buildEmailPreview()}
                    onChange={(e) => setEmailHtml(e.target.value)}
                    sx={{ bgcolor: '#fff' }}
                    helperText="Edit the HTML content directly. Use <p>, <ul>, <li>, <a>, etc."
                  />
                ) : (
                  <Box
                    sx={{ bgcolor: '#fff', p: 2, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', minHeight: 200 }}
                    dangerouslySetInnerHTML={{ __html: emailHtml || buildEmailPreview() }}
                  />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={handleGenerateAI}
                    disabled={profileIncomplete || aiLoading || !selectedCoach}
                    startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                      bgcolor: '#0A0A0A',
                      color: '#CCFF00',
                      '&:hover': { bgcolor: '#111' },
                    }}
                  >
                    {aiLoading ? 'Generating…' : 'Generate AI Introduction'}
                  </Button>
                </Box>
              </Box>

              {/* Gmail Actions */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                {!gmailConnected && (
                  <Button
                    variant="contained"
                    onClick={handleConnectGmail}
                    disabled={profileIncomplete || gmailConnecting}
                    startIcon={gmailConnecting ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', '&:hover': { bgcolor: '#B8E600' } }}
                  >
                    {gmailConnecting ? 'Connecting…' : 'Connect Gmail'}
                  </Button>
                )}
                {gmailConnected && (
                  <Typography variant="body2" sx={{ bgcolor: '#CCFF0020', px: 1.5, py: 0.75, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                    ✓ Gmail Connected
                  </Typography>
                )}
                {gmailConnected && (
                  <Button
                    variant="contained"
                    onClick={handleCreateDraft}
                    disabled={profileIncomplete || !selectedCoach?.email || isCreatingDraft}
                    startIcon={isCreatingDraft ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', '&:hover': { bgcolor: '#B8E600' } }}
                  >
                    {isCreatingDraft ? 'Sending…' : 'Send Email'}
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Email Sections */}
            <Accordion defaultExpanded sx={{ height: 'fit-content' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Email Sections</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(enabledSections).map(([sectionKey, enabled]) => (
                  <FormControlLabel
                    key={sectionKey}
                    control={
                      <Switch
                        checked={enabled}
                        onChange={(e) => {
                          toggleSection(sectionKey, e.target.checked);
                          // Regenerate preview when sections change
                          if (!isEditing) {
                            setEmailHtml(buildEmailPreview());
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ textTransform: 'capitalize' }}>{sectionKey}</Typography>}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep < STEPS.length - 1 && (
          <Button variant="contained" onClick={handleNext} disabled={!canNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}

