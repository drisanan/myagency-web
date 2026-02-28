'use client';
import React from 'react';
import { Alert, Box, Button, Step, StepLabel, Stepper, TextField, Typography, Card, CardContent, Checkbox, FormControlLabel, MenuItem, Stack, Accordion, AccordionSummary, AccordionDetails, Switch, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dynamic from 'next/dynamic';
import { generateIntro, cleanupEmail } from '@/services/aiRecruiter';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import { useSession } from '@/features/auth/session';
import { listClientsByAgencyEmail, setClientGmailTokens, getClientGmailTokens, refreshGmailToken, refreshAgentGmailToken } from '@/services/clients';
import { listAgents, Agent } from '@/services/agents';
import { getDivisions, getStates } from '@/services/recruiterMeta';
import { listUniversities, getUniversityDetails, DIVISION_API_MAPPING, SUPPORTED_SPORTS } from '@/services/recruiter';
import { UniversityLogo } from '@/components/UniversityLogo';
import { EmailTemplate, listTemplates, saveTemplate, toTemplateHtml, applyTemplate } from '@/services/templates';
import { listLists, CoachList } from '@/services/lists';
import { hasMailed, markMailed } from '@/services/mailStatus';
import { listPrompts, PromptRecord } from '@/services/prompts';
import { wrapLinksWithTracking, recordEmailSends, createOpenPixelUrl } from '@/services/emailTracking';
import { normalizeYouTubeUrl, normalizeHudlUrl, normalizeInstagramUrl, normalizeGenericUrl } from '@/services/urlNormalize';
import { createCampaign } from '@/services/campaigns';

type ClientRow = { id: string; email: string; firstName?: string; lastName?: string; sport?: string };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

export function RecruiterWizard() {
  const { session, loading } = useSession();
  
  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  const [activeStep, setActiveStep] = React.useState(0);

  // Step 1 - sender type and selection
  const [senderType, setSenderType] = React.useState<'client' | 'agent'>('client');
  const [clients, setClients] = React.useState<ClientRow[]>([]);
  const [clientId, setClientId] = React.useState<string>('');
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>('');
  const [agentEmailBody, setAgentEmailBody] = React.useState<string>('');
  const [ccAgentIds, setCcAgentIds] = React.useState<Record<string, boolean>>({});

  // Step 2 - division/state/schools
  const [divisions, setDivisions] = React.useState<string[]>([]);
  const [division, setDivision] = React.useState<string>('');
  const [states, setStates] = React.useState<Array<{ code: string; name: string }>>([]);
  const [state, setState] = React.useState<string>('');
  const [selectedSport, setSelectedSport] = React.useState<string>('');
  const [schools, setSchools] = React.useState<Array<{ name: string; logo?: string }>>([]);
  const [schoolsLoading, setSchoolsLoading] = React.useState(false);
  const [schoolSearch, setSchoolSearch] = React.useState('');
  const [lists, setLists] = React.useState<CoachList[]>([]);
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedList, setSelectedList] = React.useState<CoachList | null>(null);
  const [listMode, setListMode] = React.useState(false);

  // Step 3 - school details and coach selection
  const [selectedSchoolName, setSelectedSchoolName] = React.useState<string>('');
  const [schoolDetails, setSchoolDetails] = React.useState<any>(null);
  const [selectedCoachIds, setSelectedCoachIds] = React.useState<Record<string, boolean>>({});

  const [error, setError] = React.useState<string | null>(null);
  const [sendMessage, setSendMessage] = React.useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = React.useState('');

  // Step 4 - sections and granular selections for email building
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
  const [selectedFields, setSelectedFields] = React.useState<Record<string, Record<string, boolean>>>({});
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);
  const [templateName, setTemplateName] = React.useState('');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('');
  const [gmailConnecting, setGmailConnecting] = React.useState(false);
  const [gmailConnected, setGmailConnected] = React.useState(false);
  const [gmailExpired, setGmailExpired] = React.useState(false);
  const [gmailCanRefresh, setGmailCanRefresh] = React.useState(false);
  const [gmailRefreshing, setGmailRefreshing] = React.useState(false);
  const [gmailAccountEmail, setGmailAccountEmail] = React.useState<string>('');
  const popupRef = React.useRef<Window | null>(null);
  const [prompts, setPrompts] = React.useState<PromptRecord[]>([]);
  const [selectedPromptId, setSelectedPromptId] = React.useState<string>('');

  // Agent Gmail state (separate from client Gmail)
  const [agentGmailConnecting, setAgentGmailConnecting] = React.useState(false);
  const [agentGmailConnected, setAgentGmailConnected] = React.useState(false);
  const [agentGmailExpired, setAgentGmailExpired] = React.useState(false);
  const [agentGmailCanRefresh, setAgentGmailCanRefresh] = React.useState(false);
  const [agentGmailRefreshing, setAgentGmailRefreshing] = React.useState(false);
  const [agentGmailAccountEmail, setAgentGmailAccountEmail] = React.useState<string>('');
  const agentQuillContainerRef = React.useRef<HTMLDivElement>(null);
  const [cleanupLoading, setCleanupLoading] = React.useState(false);

  const currentClient = React.useMemo(() => clients.find(c => c.id === clientId) || null, [clients, clientId]);
  const currentAgent = React.useMemo(() => agents.find(a => a.id === selectedAgentId) || null, [agents, selectedAgentId]);

  // Role-based agent visibility:
  // - Agents can only see themselves
  // - Agency owners see all agents PLUS themselves
  // - Clients cannot access agent mode
  const visibleAgents = React.useMemo(() => {
    if (session?.role === 'agent' && session?.agentId) {
      return agents.filter(a => a.id === session.agentId);
    }
    // Agency owners: include themselves at the top of the list
    if (session?.role === 'agency' && session?.agencyId) {
      const selfEntry: Agent = {
        id: `agency-owner-${session.agencyId}`,
        firstName: session.firstName || 'Agency',
        lastName: session.lastName || 'Owner',
        email: session.agencyEmail || session.email || '',
        role: 'Agency Owner',
      };
      return [selfEntry, ...agents];
    }
    return agents;
  }, [agents, session?.role, session?.agentId, session?.agencyId, session?.firstName, session?.lastName, session?.agencyEmail, session?.email]);

  // Only agency owners and agents can use agent mode; clients cannot
  const canUseAgentMode = session?.role === 'agency' || session?.role === 'agent';

  // Get list of agents available for CC (all agents except the selected sender)
  const ccableAgents = React.useMemo(() => {
    return agents.filter(a => a.id !== selectedAgentId && a.email);
  }, [agents, selectedAgentId]);

  // Get CC email addresses from selected agents
  const ccEmails = React.useMemo(() => {
    return ccableAgents
      .filter(a => ccAgentIds[a.id])
      .map(a => a.email)
      .filter(Boolean) as string[];
  }, [ccableAgents, ccAgentIds]);

  const contact = React.useMemo(() => {
    const radar = (currentClient as any)?.radar ?? {};
    const metricsFromArray = Array.isArray(radar.metrics)
      ? radar.metrics.filter((m: any) => m?.title && m?.value)
      : [];
    const metricsFromFlat = [
      { title: radar.athleteMetricsTitleOne, value: radar.athleteMetricsValueOne },
      { title: radar.athleteMetricsTitleTwo, value: radar.athleteMetricsValueTwo },
      { title: radar.athleteMetricsTitleThree, value: radar.athleteMetricsValueThree },
      { title: radar.athleteMetricsTitleFour, value: radar.athleteMetricsValueFour },
    ].filter(m => m.title && m.value);
    const athleteMetrics = metricsFromArray.length ? metricsFromArray : metricsFromFlat;
    return {
      email: currentClient?.email ?? '',
      phone: (currentClient as any)?.phone ?? '',
      firstName: currentClient?.firstName ?? '',
      lastName: currentClient?.lastName ?? '',
      username: (currentClient as any)?.username ?? '',
      school: radar.school ?? '',
      accomplishments: radar.accomplishments ?? [],
      motivationalQuotes: radar.motivationalQuotes ?? (radar.athleteAdvice ? [radar.athleteAdvice] : []),
      gpa: radar.gpa ?? '',
      preferredAreaOfStudy: radar.preferredAreaOfStudy ?? '',
      athleteMetrics,
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
  }, [currentClient]);
  const selectedCoaches = React.useMemo(() => {
    const map = selectedCoachIds || {};
    if (listMode && selectedList) {
      const items = selectedList.items || [];
      return items
        .map((it, idx) => {
          const id = String(
            it.id || `List::${(it.school || '')}::${it.email || ''}::${(it.firstName || '')}-${(it.lastName || '')}::${it.title || ''}::${idx}`
          );
        
          return { id, firstName: it.firstName || '', lastName: it.lastName || '', email: it.email || '', title: it.title || '', school: it.school || '' } as any;
        })
        .filter((c: any) => map[c.id]);
    }
    const all = (schoolDetails?.coaches ?? []) as any[];
    return all.filter((c) => map[c.id]);
  }, [selectedCoachIds, schoolDetails, listMode, selectedList]);
  const universityName = schoolDetails?.schoolInfo?.School || schoolDetails?.name || '';
  const visibleSchools = React.useMemo(() => {
    const term = schoolSearch.trim().toLowerCase();
    if (!term) return schools;
    return schools.filter((s) => s.name.toLowerCase().includes(term));
  }, [schools, schoolSearch]);
  const selectedRecipients = React.useMemo(
    () => (selectedCoaches || []).map((c: any) => c.email || c.Email || '').filter(Boolean),
    [selectedCoaches],
  );
  const resolvedCollegeName =
    universityName ||
    selectedCoaches[0]?.school ||
    selectedList?.name ||
    schoolDetails?.schoolInfo?.School ||
    schoolDetails?.name ||
    '{{university_name}}';

  function personalizedHtmlForCoach(html: string, coach: any) {
    const coachLast = coach?.lastName || coach?.LastName || 'Coach';
    const re = /(Hello|Hey|Hi|Dear)\s+Coach\s+[^,<]*,/ig;
    return html.replace(re, (_match, greeting) => `${greeting} Coach ${coachLast},`);
  }

  function applyIntroTokens(html: string, coach: any, universityLabel: string) {
    const coachFirst = coach?.firstName || coach?.FirstName || '';
    const coachLast = coach?.lastName || coach?.LastName || '';
    const coachFull = `${coachFirst} ${coachLast}`.trim() || 'Coach';
    const universityNameSafe = universityLabel || '';
    return html
      .replaceAll('{{coach_full_name}}', coachFull)
      .replaceAll('{{coach_first_name}}', coachFirst)
      .replaceAll('{{coach_last_name}}', coachLast)
      .replaceAll('{{university_name}}', universityNameSafe);
  }

  function convertToLiquidTags(html: string): string {
    let out = html;
    const coachLast = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || '';
    if (coachLast) {
      out = out.replaceAll(`Coach ${coachLast}`, 'Coach {{coach_last_name}}');
    }
    const uniName = resolvedCollegeName || '';
    if (uniName) {
      out = out.replaceAll(uniName, '{{university_name}}');
    }
    return out;
  }

  function sanitizeAiIntro(raw: string): string {
    return raw
      .replace(/<[^>]*>/g, '')
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .replace(/^(Hey|Hello|Hi|Dear|Good\s+\w+|Greetings)[,!]?\s*(Coach\s+[\w'-]+(?:\s+[\w'-]+)?[,.:!]?\s*)?/i, '')
      .replace(/(Best regards|Sincerely|Thank you|Thanks|Warm regards|Kind regards|Respectfully)[\s\S]*/i, '')
      .trim();
  }

  function buildSubjectLine(
    athleteName: string,
    gradYear: string,
    positionOrSport: string,
    index: number,
  ) {
    const safeAthlete = athleteName.trim() || 'Athlete';
    const parts = [safeAthlete, gradYear, positionOrSport].filter(Boolean).join(' ').trim();
    const base = parts || safeAthlete;
    const variants = [
      `${base} Introduction`,
      `${base} Intro`,
      `${base} Recruiting Intro`,
      `${base} Profile`,
      `${base} Highlights`,
    ];
    return variants[index % variants.length];
  }

  function toggleSection(k: string, v: boolean) {
    setEnabledSections((p) => ({ ...p, [k]: v }));
  }
  function setField(section: string, fieldKey: string, checked: boolean) {
    setSelectedFields((p) => ({ ...p, [section]: { ...(p[section] ?? {}), [fieldKey]: checked } }));
  }
  function buildGreeting(style?: string): string {
    const greetings = ['Hey', 'Hello', 'Hi'];
    const g = style || greetings[Math.floor(Math.random() * greetings.length)];
    return `<p>${g} Coach {{coach_last_name}},</p>`;
  }

  function buildGenericIntro(): string {
    const athleteFullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    const sportLabel = currentClient?.sport || 'student';
    const schoolClause = contact.school ? ` at ${contact.school}` : '';
    return `<p>My name is ${athleteFullName} and I am a ${sportLabel} athlete${schoolClause}. I am reaching out to express my interest in your program at {{university_name}}.</p>`;
  }

  function buildEmailBody(): string {
    const enabledIds = Object.keys(enabledSections).filter((k) => enabledSections[k]);
    let emailContent = '';
    if (enabledIds.includes('accomplishments')) {
      const valid = (contact.accomplishments || []).filter((item: string) => item && item.trim() !== '' && item !== 'undefined' && item !== 'null');
      if (valid.length) {
        emailContent += `<p><strong>Accomplishments:</strong></p><ul>${valid.map((item: string, i: number) => {
          const prefix = valid.length > 1 ? `${i + 1}. ` : '';
          return `<li>${prefix}${item.trim()}</li>`;
        }).join('')}</ul>\n\n`;
      }
    }
    if (enabledIds.includes('motivation') && (contact as any).motivationalQuotes?.[0]) {
      const first = (contact as any).motivationalQuotes[0];
      emailContent += `<p><strong>Why I'm Ready For The Next Level:</strong></p><p>"${first}"</p>\n\n`;
    }
    if (enabledIds.includes('academic') && (contact.gpa || (contact as any).preferredAreaOfStudy)) {
      emailContent += `<p><strong>Academic Information:</strong></p><ul>${[
        contact.gpa ? `<li>GPA: ${contact.gpa}</li>` : '',
        (contact as any).preferredAreaOfStudy ? `<li>Preferred Area of Study: ${(contact as any).preferredAreaOfStudy}</li>` : ''
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('athletic') && contact.athleteMetrics.length > 0) {
      emailContent += `<p><strong>Athletic Metrics:</strong></p><ul>${contact.athleteMetrics.map((m: { title: string; value: string }, i: number) => {
        const prefix = contact.athleteMetrics.length > 1 ? `${i + 1}. ` : '';
        return `<li>${prefix}${m.title}: ${m.value}</li>`;
      }).join('')}</ul>\n`;
    }
    if (enabledIds.includes('highlights')) {
      const highlights = [
        contact.youtubeHighlightUrl ? { type: 'YouTube Highlight', url: normalizeYouTubeUrl(contact.youtubeHighlightUrl) } : null,
        contact.hudlLink ? { type: 'Hudl Profile', url: normalizeHudlUrl(contact.hudlLink) } : null,
        contact.instagramProfileUrl ? { type: 'Instagram', url: normalizeInstagramUrl(contact.instagramProfileUrl) } : null,
        ...(((contact as any).newsArticleLinks || []).map((url: string) => ({ type: 'Article', url: normalizeGenericUrl(url) })) || [])
      ].filter(Boolean) as Array<{ type: string; url: string }>;
      if (highlights.length) {
        emailContent += `<p><strong>View My Highlights:</strong></p><ul>${highlights.map((h, i) => {
          const prefix = highlights.length > 1 ? `${i + 1}. ` : '';
          return `<li>${prefix}<a href="${h.url}" target="_blank">${h.type}</a></li>`;
        }).join('')}</ul>\n`;
      } else {
        emailContent += `<p><strong>View My Highlights:</strong></p><p>No highlights available.</p>\n`;
      }
    }
    if (enabledIds.includes('contact') && (contact.email || contact.phone)) {
      emailContent += `<p><strong>Contact Info:</strong></p><ul>${[
        contact.email ? `<li>Email: <a href="mailto:${contact.email}">${contact.email}</a></li>` : '',
        contact.phone ? `<li>Phone: <a href="tel:${contact.phone}">${contact.phone}</a></li>` : ''
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('coach') && ((contact as any).headCoachName || (contact as any).headCoachEmail || (contact as any).headCoachPhone)) {
      emailContent += `<p><strong>Head Coach Info:</strong></p><ul>${[
        (contact as any).headCoachName ? `<li>Name: ${(contact as any).headCoachName}</li>` : '',
        (contact as any).headCoachEmail ? `<li>Email: <a href="mailto:${(contact as any).headCoachEmail}">${(contact as any).headCoachEmail}</a></li>` : '',
        (contact as any).headCoachPhone ? `<li>Phone: <a href="tel:${(contact as any).headCoachPhone}">${(contact as any).headCoachPhone}</a></li>` : ''
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('references') && ((contact as any).referenceOneName || (contact as any).referenceTwoName)) {
      emailContent += `<p><strong>References:</strong></p><ul>${[
        (contact as any).referenceOneName ? `<li>${(contact as any).referenceOneName}<br>${(contact as any).referenceOnePhone ? `Phone: <a href="tel:${(contact as any).referenceOnePhone}">${(contact as any).referenceOnePhone}</a>` : ''} <br>${(contact as any).referenceOneEmail ? `Email: <a href="mailto:${(contact as any).referenceOneEmail}">${(contact as any).referenceOneEmail}</a>` : ''}</li>` : '',
        (contact as any).referenceTwoName ? `<li>${(contact as any).referenceTwoName}<br>${(contact as any).referenceTwoPhone ? `Phone: <a href="tel:${(contact as any).referenceTwoPhone}">${(contact as any).referenceTwoPhone}</a>` : ''} <br>${(contact as any).referenceTwoEmail ? `Email: <a href="mailto:${(contact as any).referenceTwoEmail}">${(contact as any).referenceTwoEmail}</a>` : ''}</li>` : '',
      ].filter(Boolean).join('')}</ul>\n`;
    }
    if (enabledIds.includes('profilePicture') && (contact as any).profileImage) {
      emailContent += `<p><img src="${(contact as any).profileImage}" alt="Profile Picture" width="250px" height="250px" style="max-width: 250px; height: auto; display: block;"></p>`;
    }
    emailContent += `<p>Thank you for your time!</p><p>${contact.firstName || ''} ${contact.lastName || ''} - ${contact.school || ''}</p>`;
    if (enabledIds.includes('radarPage') && contact.username) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.myrecruiteragency.com';
      emailContent += `\nFollow My Radar Page: <a href="${baseUrl}/athlete/${contact.username}" target="_blank">HERE</a>`;
    }
    return emailContent;
  }

  function buildEmailPreview(): string {
    return buildGreeting('Hello') + buildGenericIntro() + buildEmailBody();
  }

  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof window === 'undefined') return;
      // Allow messages from both the frontend origin and the API origin
      // (OAuth callback page is served from the API domain in production)
      const apiOrigin = API_BASE_URL ? new URL(API_BASE_URL).origin : '';
      const allowedOrigins = [window.location.origin, apiOrigin].filter(Boolean);
      if (!allowedOrigins.includes(e.origin)) return;
      if (e.data?.type === 'google-oauth-success') {
        const returnedAgentId = e.data?.agentId;
        const id = e.data?.clientId || currentClient?.id || clientId || '';

        if (returnedAgentId) {
          // Agent OAuth flow completed
          console.info('[gmail-ui:agent-oauth-success]', { agentId: returnedAgentId });
          setAgentGmailConnecting(false);
          setAgentGmailConnected(true);
          setAgentGmailExpired(false);
          setError(null);
          try { popupRef.current?.close(); } catch {}
          (async () => {
            try {
              const statusUrl = `${API_BASE_URL}/google/status?agentId=${encodeURIComponent(returnedAgentId)}`;
              const statusRes = await fetch(statusUrl, { credentials: 'include' });
              const statusData = await statusRes.json();
              if (statusData?.email) setAgentGmailAccountEmail(statusData.email);
            } catch { /* ignore */ }
          })();
        } else {
          // Client OAuth flow completed
          console.info('[gmail-ui:oauth-success]', { clientId: id });
          setGmailConnecting(false);
          setGmailConnected(Boolean(id));
          setGmailExpired(false);
          setError(null);
          try { popupRef.current?.close(); } catch {}
          (async () => {
            try {
              if (!id) return;
              const statusUrl = `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(id)}`;
              const statusRes = await fetch(statusUrl, { credentials: 'include' });
              const statusData = await statusRes.json();
              if (statusData?.email) setGmailAccountEmail(statusData.email);

              const r = await fetch(`${API_BASE_URL}/google/tokens?clientId=${encodeURIComponent(id)}`, { credentials: 'include' });
              const j = await r.json();
              console.info('[gmail-ui:tokens:fetched]', {
                clientId: id,
                ok: j?.ok,
                exists: Boolean(j?.tokens),
                hasAccess: Boolean(j?.tokens?.access_token),
                hasRefresh: Boolean(j?.tokens?.refresh_token),
              });
              if (j?.ok && j?.tokens) {
                setClientGmailTokens(id, j.tokens);
                console.info('[gmail-ui:tokens:stored]', { clientId: id });
              }
            } catch { /* ignore */ }
          })();
        }
      }
      if (e.data?.type === 'google-oauth-error') {
        setGmailConnecting(false);
        setAgentGmailConnecting(false);
        try { popupRef.current?.close(); } catch {}
        setError('Gmail connection failed. Please try again.');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    if (!currentClient?.id) { setGmailConnected(false); setGmailExpired(false); setGmailCanRefresh(false); setGmailAccountEmail(''); return; }
    if (typeof window === 'undefined' || typeof fetch === 'undefined') { setGmailConnected(false); return; }
    const statusUrl = `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(currentClient.id)}`;
    fetch(statusUrl, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const connected = Boolean(d?.connected);
        const expired = Boolean(d?.expired) || (connected && !d?.canRefresh);
        setGmailConnected(connected && !expired);
        setGmailExpired(expired);
        setGmailCanRefresh(Boolean(d?.canRefresh));
        setGmailAccountEmail(d?.email || '');
      })
      .catch(() => { setGmailConnected(false); setGmailExpired(false); setGmailCanRefresh(false); setGmailAccountEmail(''); });
  }, [currentClient?.id]);

  async function handleConnectGmail() {
    try {
      if (!currentClient?.id) {
        setError('Select a client first');
        return;
      }
      setGmailConnecting(true);
      const oauthUrl = `${API_BASE_URL}/google/oauth/url?clientId=${encodeURIComponent(currentClient.id)}`;
      const res = await fetch(oauthUrl, { credentials: 'include' });
      const data = await res.json();
      if (!data?.url) throw new Error('Failed to start Gmail connection flow');
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
      setError(e?.message || 'Failed to start Gmail connection');
    }
  }

  // Agent Gmail status check
  React.useEffect(() => {
    if (!selectedAgentId || senderType !== 'agent') {
      setAgentGmailConnected(false);
      setAgentGmailExpired(false);
      setAgentGmailCanRefresh(false);
      setAgentGmailAccountEmail('');
      return;
    }
    if (typeof window === 'undefined' || typeof fetch === 'undefined') { setAgentGmailConnected(false); return; }
    const statusUrl = `${API_BASE_URL}/google/status?agentId=${encodeURIComponent(selectedAgentId)}`;
    fetch(statusUrl, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const connected = Boolean(d?.connected);
        const expired = Boolean(d?.expired) || (connected && !d?.canRefresh);
        setAgentGmailConnected(connected && !expired);
        setAgentGmailExpired(expired);
        setAgentGmailCanRefresh(Boolean(d?.canRefresh));
        setAgentGmailAccountEmail(d?.email || '');
      })
      .catch(() => { setAgentGmailConnected(false); setAgentGmailExpired(false); setAgentGmailCanRefresh(false); setAgentGmailAccountEmail(''); });
  }, [selectedAgentId, senderType]);

  async function handleRefreshGmail() {
    if (!currentClient?.id) return;
    setGmailRefreshing(true);
    try {
      const result = await refreshGmailToken(currentClient.id);
      if (result?.ok) {
        const statusUrl = `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(currentClient.id)}`;
        const r = await fetch(statusUrl, { credentials: 'include' });
        const d = await r.json();
        setGmailConnected(Boolean(d?.connected) && !Boolean(d?.expired));
        setGmailExpired(Boolean(d?.expired));
        setGmailCanRefresh(Boolean(d?.canRefresh));
        setGmailAccountEmail(d?.email || '');
      } else {
        setGmailCanRefresh(false);
      }
    } catch {
      setGmailCanRefresh(false);
    } finally {
      setGmailRefreshing(false);
    }
  }

  async function handleAgentRefreshGmail() {
    if (!selectedAgentId) return;
    setAgentGmailRefreshing(true);
    try {
      const result = await refreshAgentGmailToken(selectedAgentId);
      if (result?.ok) {
        const statusUrl = `${API_BASE_URL}/google/status?agentId=${encodeURIComponent(selectedAgentId)}`;
        const r = await fetch(statusUrl, { credentials: 'include' });
        const d = await r.json();
        setAgentGmailConnected(Boolean(d?.connected) && !Boolean(d?.expired));
        setAgentGmailExpired(Boolean(d?.expired));
        setAgentGmailCanRefresh(Boolean(d?.canRefresh));
        setAgentGmailAccountEmail(d?.email || '');
      } else {
        setAgentGmailCanRefresh(false);
      }
    } catch {
      setAgentGmailCanRefresh(false);
    } finally {
      setAgentGmailRefreshing(false);
    }
  }

  async function handleAgentConnectGmail() {
    try {
      if (!selectedAgentId) {
        setError('Select an agent first');
        return;
      }
      setAgentGmailConnecting(true);
      const oauthUrl = `${API_BASE_URL}/google/oauth/url?agentId=${encodeURIComponent(selectedAgentId)}`;
      const res = await fetch(oauthUrl, { credentials: 'include' });
      const data = await res.json();
      if (!data?.url) throw new Error('Failed to start Gmail connection flow');
      const w = 500, h = 700;
      const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 100;
      const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 100;
      popupRef.current = window.open(
        data.url,
        'an-google-oauth-agent',
        `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
      );
      if (!popupRef.current) throw new Error('Popup blocked. Allow popups and retry.');
    } catch (e: any) {
      setAgentGmailConnecting(false);
      setError(e?.message || 'Failed to start Gmail connection');
    }
  }

  async function handleCleanupEmail() {
    if (!agentEmailBody.trim()) return;
    try {
      setCleanupLoading(true);
      setError(null);
      const cleaned = await cleanupEmail(agentEmailBody);
      if (cleaned) setAgentEmailBody(cleaned);
    } catch (e: any) {
      setError(e?.message || 'Email cleanup failed');
    } finally {
      setCleanupLoading(false);
    }
  }

  async function handleSendEmails() {
    try {
      setSendMessage(null);
      setIsSendingEmails(true);
      const id = currentClient?.id || '';
      if (!id) {
        setError('Select a client first');
        return;
      }
      console.info('[gmail-ui:send:start]', { clientId: id });
      // Ensure server has tokens for this client; rehydrate from client record if not
      try {
        const statusUrl = `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(id)}`;
        const statusRes = await fetch(statusUrl);
        const status = await statusRes.json();
        console.info('[gmail-ui:status]', { clientId: id, connected: Boolean(status?.connected) });
        if (!status?.connected) {
          const saved = getClientGmailTokens(id);
           console.info('[gmail-ui:rehydrate:attempt]', {
             clientId: id,
             hasSavedTokens: Boolean(saved),
             hasAccess: Boolean(saved?.access_token),
             hasRefresh: Boolean(saved?.refresh_token),
           });
          if (saved) {
            const tokensUrl = `${API_BASE_URL}/google/tokens`;
            await fetch(tokensUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId: id, tokens: saved }),
            });
            setGmailConnected(true);
            console.info('[gmail-ui:rehydrate:result]', { clientId: id, ok: true });
          }
        }
      } catch { /* ignore */ }
      const to = selectedRecipients;
      if (!to.length) {
        setError('Select at least one coach with an email');
        return;
      }
      const athleteName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      const gradYear = String((currentClient as any)?.radar?.graduationYear || (currentClient as any)?.graduationYear || '').trim();
      const positionOrSport = String((currentClient as any)?.radar?.position || (currentClient as any)?.position || '').trim();
      const subjectBase = buildSubjectLine(athleteName, gradYear, positionOrSport, 0);
      const html = aiHtml || buildEmailPreview();
      const savedTokens = getClientGmailTokens(id);
      const campaignName = resolvedCollegeName || selectedList?.name || universityName || 'Coach Outreach';
      const recipientMeta = selectedCoaches.map((c: any) => ({
        email: c.email || c.Email || '',
        name: `${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim(),
        university: c.school || c.School || universityName || selectedList?.name || '',
      })).filter((r) => r.email);

      const effectiveSubject = subjectLine || subjectBase;

      if (scheduleEnabled) {
        const scheduleTs = new Date(scheduledAt).getTime();
        if (!scheduleTs || Number.isNaN(scheduleTs) || scheduleTs <= Date.now()) {
          throw new Error('Select a valid future date/time to schedule this campaign.');
        }
        await createCampaign({
          clientId: id,
          subject: effectiveSubject,
          html,
          recipients: recipientMeta,
          senderClientId: id,
          campaignName,
          scheduledAt: scheduleTs,
          personalizedMessage: followupMessage || undefined,
          status: 'scheduled',
        });
        const msg = `Scheduled for ${new Date(scheduleTs).toLocaleString()}`;
        setSendMessage(msg);
        setConfirmModalMessage(msg);
        setConfirmModalOpen(true);
        return;
      }

      const campaign = await createCampaign({
        clientId: id,
        subject: effectiveSubject,
        html,
        recipients: recipientMeta,
        senderClientId: id,
        campaignName,
        personalizedMessage: followupMessage || undefined,
        status: 'sent',
      });
      const campaignId = campaign?.id;

      // Track recipients for recording sends
      const sentRecipients: Array<{ email: string; name?: string; university?: string }> = [];

      // Send one email per recipient to avoid a single email with multiple TOs
      for (const recipient of to) {
        const coach = selectedCoaches.find((c: any) => (c.email || c.Email) === recipient) || {};
        const coachName = `${coach.firstName || coach.FirstName || ''} ${coach.lastName || coach.LastName || ''}`.trim();
        const coachUniversity = coach.school || coach.School || universityName || selectedList?.name || resolvedCollegeName || '';
        let personalizedHtml = applyIntroTokens(html, coach, coachUniversity);
        personalizedHtml = personalizedHtmlForCoach(personalizedHtml, coach);
        const subject = subjectLine || buildSubjectLine(athleteName, gradYear, positionOrSport, sentRecipients.length);
        
        // Wrap links with tracking URLs for analytics
        if (session?.agencyId) {
          personalizedHtml = wrapLinksWithTracking(personalizedHtml, {
            agencyId: session.agencyId,
            clientId: id,
            athleteEmail: contact.email || '',
            recipientEmail: recipient,
            university: coachUniversity,
            campaignId,
          });
        }

        if (session?.agencyId && campaignId) {
          const pixel = createOpenPixelUrl({
            agencyId: session.agencyId,
            clientId: id,
            athleteEmail: contact.email || '',
            recipientEmail: recipient,
            university: coachUniversity,
            campaignId,
          });
          personalizedHtml = `${personalizedHtml}<img src="${pixel}" alt="" width="1" height="1" style="display:none;" />`;
        }
        
        const sendUrl = API_BASE_URL ? `${API_BASE_URL}/gmail/send` : '/api/gmail/send';
        const res = await fetch(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
              clientId: id, 
              recipients: [recipient],
              cc: ccEmails.length > 0 ? ccEmails : undefined,
              subject, 
              html: personalizedHtml, 
              tokens: savedTokens || undefined, 
              agencyEmail: userEmail || ''
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || 'Send failed');
        }
        
        sentRecipients.push({
          email: recipient,
          name: coachName,
          university: coachUniversity,
        });
        
        if (data.openUrl) {
          window.open(data.openUrl, '_blank');
        }
        try {
          if (currentClient?.id && recipient) {
            markMailed(currentClient.id, [recipient]);
          }
        } catch {}
      }
      
      // Record the sends for analytics (fire and forget - don't block UI)
      if (sentRecipients.length > 0) {
        recordEmailSends({
          clientId: id,
          clientEmail: contact.email || '',
          recipients: sentRecipients,
          subject: effectiveSubject,
          campaignId,
        }).catch(err => console.error('[RecruiterWizard] Failed to record sends', err));
      }

      
      const msg = `Sent to ${to.length} recipient${to.length === 1 ? '' : 's'}`;
      setSendMessage(msg);
      setConfirmModalMessage(msg);
      setConfirmModalOpen(true);
    } catch (e: any) {
      console.error(e);
      const msg = (e?.message || 'Failed to send email').toLowerCase();
      const isTokenError = msg.includes('revoked') || msg.includes('expired') || msg.includes('reconnect')
        || msg.includes('invalid_grant') || msg.includes('invalid credentials') || msg.includes('not connected');
      if (isTokenError) {
        setGmailConnected(false);
        setGmailExpired(true);
        setError('Gmail credentials expired or were revoked. Please reconnect Gmail and try again.');
      } else {
        setError(e?.message || 'Failed to send email');
      }
    } finally {
      setIsSendingEmails(false);
    }
  }

  async function handleAgentSendEmails() {
    try {
      setSendMessage(null);
      setIsSendingEmails(true);
      setError(null);

      if (!selectedAgentId) { setError('Select an agent first'); return; }

      const to = selectedRecipients;
      if (!to.length) { setError('Select at least one coach with an email'); return; }

      const agentName = `${currentAgent?.firstName || ''} ${currentAgent?.lastName || ''}`.trim();
      const subject = subjectLine || `${agentName} — Athlete Recruiting`;

      const sentRecipients: Array<{ email: string; name?: string; university?: string }> = [];

      for (const recipient of to) {
        const coach = selectedCoaches.find((c: any) => (c.email || c.Email) === recipient) || {} as any;
        const coachUniversity = coach.school || coach.School || universityName || selectedList?.name || resolvedCollegeName || '';
        let personalizedHtml = applyIntroTokens(aiHtml || agentEmailBody, coach, coachUniversity);

        if (session?.agencyId) {
          personalizedHtml = wrapLinksWithTracking(personalizedHtml, {
            agencyId: session.agencyId,
            clientId: selectedAgentId,
            athleteEmail: currentAgent?.email || '',
            recipientEmail: recipient,
            university: coachUniversity,
          });
        }

        const sendUrl = API_BASE_URL ? `${API_BASE_URL}/gmail/send` : '/api/gmail/send';
        const res = await fetch(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            agentId: selectedAgentId,
            recipients: [recipient],
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            subject,
            html: personalizedHtml,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || 'Send failed');
        }

        sentRecipients.push({
          email: recipient,
          name: `${coach.firstName || coach.FirstName || ''} ${coach.lastName || coach.LastName || ''}`.trim(),
          university: coachUniversity,
        });
      }

      const msg = `Sent to ${to.length} recipient${to.length === 1 ? '' : 's'}`;
      setSendMessage(msg);
      setConfirmModalMessage(msg);
      setConfirmModalOpen(true);
    } catch (e: any) {
      console.error(e);
      const msg = (e?.message || 'Failed to send email').toLowerCase();
      const isTokenError = msg.includes('revoked') || msg.includes('expired') || msg.includes('reconnect')
        || msg.includes('invalid_grant') || msg.includes('invalid credentials') || msg.includes('not connected');
      if (isTokenError) {
        setAgentGmailConnected(false);
        setAgentGmailExpired(true);
        setError('Gmail credentials expired or were revoked. Please reconnect Gmail and try again.');
      } else {
        setError(e?.message || 'Failed to send email');
      }
    } finally {
      setIsSendingEmails(false);
    }
  }

  // AI improvement flow for intro sentence
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiHtml, setAiHtml] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSendingEmails, setIsSendingEmails] = React.useState(false);
  const [isEditingPreview, setIsEditingPreview] = React.useState(false);
  const [subjectLine, setSubjectLine] = React.useState('');
  const [scheduleEnabled, setScheduleEnabled] = React.useState(false);
  const [scheduledAt, setScheduledAt] = React.useState('');
  const [followupMessage, setFollowupMessage] = React.useState('');

  // Delayed busy indicator to avoid flicker on sub-1s actions
  const useDelayedBusy = (flag: boolean, delayMs = 1000) => {
    const [busy, setBusy] = React.useState(false);
    React.useEffect(() => {
      let t: ReturnType<typeof setTimeout> | undefined;
      if (flag) {
        t = setTimeout(() => setBusy(true), delayMs);
      } else {
        setBusy(false);
      }
      return () => {
        if (t) clearTimeout(t);
      };
    }, [flag, delayMs]);
    return busy;
  };

  const improvingBusy = useDelayedBusy(aiLoading);
  const generatingBusy = useDelayedBusy(isGenerating);
  const gmailConnectingBusy = useDelayedBusy(gmailConnecting);
  const sendingBusy = useDelayedBusy(isSendingEmails);
  const agentGmailConnectingBusy = useDelayedBusy(agentGmailConnecting);
  const cleanupBusy = useDelayedBusy(cleanupLoading);

  const agentEmailWordCount = React.useMemo(() => {
    if (!agentEmailBody) return 0;
    const text = agentEmailBody.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }, [agentEmailBody]);

  const DYNAMIC_TAGS = [
    { label: 'Coach First Name', tag: '{{coach_first_name}}' },
    { label: 'Coach Last Name', tag: '{{coach_last_name}}' },
    { label: 'Coach Full Name', tag: '{{coach_full_name}}' },
    { label: 'University Name', tag: '{{university_name}}' },
  ];

  function insertTagAtCursor(tag: string) {
    const container = agentQuillContainerRef.current;
    if (!container) return;
    const qlContainer = container.querySelector('.ql-container');
    const quill = (qlContainer as any)?.__quill;
    if (!quill) return;
    quill.focus();
    const range = quill.getSelection(true);
    if (range) {
      quill.insertText(range.index, tag);
      quill.setSelection(range.index + tag.length, 0);
    } else {
      const len = quill.getLength();
      quill.insertText(len - 1, tag);
      quill.setSelection(len - 1 + tag.length, 0);
    }
  }

  async function handleImproveWithAI() {
    try {
      setAiLoading(true);
      setError(null);
      const sport = currentClient?.sport || '';
      const collegeName = resolvedCollegeName;
      if (!collegeName) {
        setError('Select a university or list before improving the intro.');
        setAiLoading(false);
        return;
      }
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      const parts: string[] = [];
      if (enabledSections.accomplishments && (contact as any).accomplishments?.length) parts.push('notable accomplishments');
      if (enabledSections.academic && (contact.gpa || (contact as any).preferredAreaOfStudy)) parts.push('key academic details');
      if (enabledSections.athletic) parts.push('athletic metrics and performance');
      if (enabledSections.highlights) parts.push('highlight links for review');
      const coachMessage = `Write a brief, engaging introduction for ${fullName}, a ${sport} athlete. Mention: ${parts.join(', ') || 'basic profile details'}.`;

      const intro = await generateIntro({
        sport,
        collegeName,
        coachMessage,
        tone: 'Casual and conversational, like a confident high school athlete',
        qualities: ['Passionate', 'Hardworking', 'Determined'],
        additionalInsights: `Student full name: ${fullName}. Target school: ${collegeName}.`,
      });

      const introClean = sanitizeAiIntro(String(intro).replace(/\[StudentName\]/gi, fullName));
      const greeting = buildGreeting('Hello');
      const body = buildEmailBody();
      const improved = convertToLiquidTags(`${greeting}<p>${introClean}</p>${body}`);
      setAiHtml(improved);
      // Pre-populate subject line if not already set by user
      if (!subjectLine) {
        const athleteName = fullName;
        const gradYear = String((currentClient as any)?.radar?.graduationYear || (currentClient as any)?.graduationYear || '').trim();
        const positionOrSport = String((currentClient as any)?.radar?.position || (currentClient as any)?.position || '').trim();
        setSubjectLine(buildSubjectLine(athleteName, gradYear, positionOrSport, 0));
      }
    } catch (e: any) {
      setError(e?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  }

  async function generateFullEmailHtml(): Promise<string> {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    const sport = (currentClient as any)?.sport || '';
    const collegeName = resolvedCollegeName;
    if (!collegeName) {
      throw new Error('Select a university or list before generating the email.');
    }

    const parts: string[] = [];
    if (enabledSections.accomplishments && (contact as any).accomplishments?.length) parts.push('notable accomplishments');
    if (enabledSections.academic && (contact.gpa || (contact as any).preferredAreaOfStudy)) parts.push('academic information');
    if (enabledSections.athletic) parts.push('athletic metrics');
    if (enabledSections.highlights) parts.push('highlights');

    const coachMessage = `Write a brief, engaging introduction for ${fullName}, a ${sport} athlete. Mention: ${parts.join(', ') || 'basic profile details'}.`;

    const intro = await generateIntro({
      sport,
      collegeName,
      coachMessage,
      tone: 'Casual and conversational, like a confident high school athlete',
      qualities: ['Passionate', 'Hardworking', 'Determined'],
      additionalInsights: `Student full name: ${fullName}. Target school: ${collegeName}.`,
    });

    const introClean = sanitizeAiIntro(String(intro).replace(/\[StudentName\]/gi, fullName));
    const greeting = buildGreeting();
    const body = buildEmailBody();
    const raw = `${greeting}<p>${introClean}</p>${body}`;
    return convertToLiquidTags(raw);
  }

  // FIX: Load Initial Data using safe userEmail
  React.useEffect(() => {
    if (!userEmail) return;
    
    // Load Clients
    listClientsByAgencyEmail(userEmail).then(setClients);
    
    // Load Agents
    listAgents().then(setAgents).catch(() => setAgents([]));
    
    // Load Meta
    getDivisions().then(setDivisions);
    
    // Load Lists (agency-created only; exclude client interest lists)
    listLists(userEmail)
      .then((ls) => setLists((ls || []).filter((l) => l.type !== 'CLIENT_INTEREST')))
      .catch(() => setLists([]));

    // Load Prompts
    listPrompts({ agencyEmail: userEmail, clientId }).then(setPrompts).catch(() => setPrompts([]));
  }, [userEmail]); // Dependencies correct now

  // Reload prompts when client changes to surface client-specific templates
  React.useEffect(() => {
    if (!userEmail) return;
    listPrompts({ agencyEmail: userEmail, clientId }).then(setPrompts).catch(() => setPrompts([]));
  }, [userEmail, clientId]);

  // Reload lists when client changes to ensure we keep only agency-created lists
  React.useEffect(() => {
    if (!userEmail) return;
    listLists(userEmail)
      .then((ls) => setLists((ls || []).filter((l) => l.type !== 'CLIENT_INTEREST')))
      .catch(() => setLists([]));
  }, [userEmail, clientId]);

  // Auto-select self when logged in as agent
  React.useEffect(() => {
    if (session?.role === 'agent' && session?.agentId && agents.length > 0) {
      const selfAgent = agents.find(a => a.id === session.agentId);
      if (selfAgent && !selectedAgentId) {
        setSelectedAgentId(session.agentId);
        setSenderType('agent');
      }
    }
  }, [session?.role, session?.agentId, agents, selectedAgentId]);

  React.useEffect(() => {
    if (!division) {
      setStates([]);
      setState('');
      setSchools([]);
      return;
    }
    getStates(division).then(setStates);
    setState('');
    setSchools([]);
  }, [division]);

  const resolvedSport = React.useMemo(() => {
    if (senderType === 'agent') return selectedSport;
    const client = clientId ? clients.find(c => c.id === clientId) : undefined;
    return client?.sport || '';
  }, [senderType, selectedSport, clientId, clients]);

  React.useEffect(() => {
    if (division && state && resolvedSport) {
      setSchoolsLoading(true);
      const divisionSlug = DIVISION_API_MAPPING[division] || division;
      listUniversities({ sport: resolvedSport, division: divisionSlug, state })
        .then(setSchools)
        .catch((e) => { setSchools([]); setError(e?.message || 'Failed to load universities'); })
        .finally(() => setSchoolsLoading(false));
    } else {
      setSchools([]);
      setSchoolsLoading(false);
    }
  }, [division, state, resolvedSport]);

  React.useEffect(() => {
    if (!selectedSchoolName) {
      setSchoolDetails(null);
      setSelectedCoachIds({});
      return;
    }
    if (!resolvedSport || !division || !state) { setSchoolDetails(null); return; }
    const divisionSlug = DIVISION_API_MAPPING[division] || division;
    getUniversityDetails({ sport: resolvedSport, division: divisionSlug, state, school: selectedSchoolName })
      .then((u) => { setSchoolDetails(u); setSelectedCoachIds({}); })
      .catch((e) => { setSchoolDetails(null); setSelectedCoachIds({}); setError(e?.message || 'Failed to load university'); });
  }, [selectedSchoolName, resolvedSport, division, state]);
  React.useEffect(() => { setError(null); }, [division, state, selectedSchoolName, clientId]);

  // FIX: Use userEmail for templates
  React.useEffect(() => {
    if (!userEmail) return;
    setTemplates(listTemplates({ agencyEmail: userEmail, clientId }));
  }, [userEmail, clientId]);

  const isLast = activeStep === 3;
  // Agent mode: only requires agent + recipients selected
  // Client mode: existing logic unchanged
  const canNextStep0 = senderType === 'agent' ? Boolean(selectedAgentId) : Boolean(clientId);
  const canNext =
    (activeStep === 0 && canNextStep0) ||
    (activeStep === 1 && (Boolean(selectedListId) || (Boolean(division) && Boolean(state) && schools.length > 0))) ||
    (activeStep === 2 && (listMode ? selectedCoaches.length > 0 : Boolean(selectedSchoolName))) ||
    (activeStep === 3);

  const handleNext = async () => {
    if (isLast) {
      if (!selectedCoaches.length) {
        setError('Select at least one coach recipient before generating.');
        return;
      }

      if (senderType === 'agent') {
        if (!agentEmailBody.trim() || agentEmailBody.replace(/<[^>]*>/g, '').trim().length < 10) {
          setError('Write your email in the composer above before generating.');
          return;
        }
        try {
          setIsGenerating(true);
          setError(null);
          const polished = await cleanupEmail(agentEmailBody);
          setAiHtml(polished || agentEmailBody);
          if (!subjectLine) {
            const agentName = `${currentAgent?.firstName || ''} ${currentAgent?.lastName || ''}`.trim() || 'Agent';
            setSubjectLine(`${agentName} — Coach Outreach`);
          }
        } catch (e: any) {
          setError(e?.message || 'Failed to generate email');
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      if (!resolvedCollegeName && !listMode) {
        setError('Select a university or coach list before generating the email.');
        return;
      }
      try {
        setIsGenerating(true);
        setError(null);
        const html = await generateFullEmailHtml();
        setAiHtml(html);
        if (!subjectLine) {
          const athleteName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
          const gradYear = String((currentClient as any)?.radar?.graduationYear || (currentClient as any)?.graduationYear || '').trim();
          const positionOrSport = String((currentClient as any)?.radar?.position || (currentClient as any)?.position || '').trim();
          setSubjectLine(buildSubjectLine(athleteName, gradYear, positionOrSport, 0));
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to generate email');
      } finally {
        setIsGenerating(false);
      }
      return;
    }
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const toggleCoach = (id: string) => {
    setSelectedCoachIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  function currentEmailContext() {
    const studentFirstName = contact.firstName || '';
    const studentLastName = contact.lastName || '';
    const studentFullName = `${studentFirstName} ${studentLastName}`.trim();
    const uName = universityName || (schoolDetails?.schoolInfo?.School || schoolDetails?.name || '');
    return { studentFirstName, studentLastName, studentFullName, universityName: uName };
  }

  function handleSaveTemplate() {
    if (!userEmail) return;
    const html = (aiHtml || buildEmailPreview());
    const ctx = currentEmailContext();
    const placeholderHtml = toTemplateHtml(html, ctx);
    const rec = saveTemplate({
      agencyEmail: userEmail,
      clientId,
      name: templateName || `Template ${new Date().toLocaleString()}`,
      html: placeholderHtml,
      enabledSections
    });
    setTemplates([rec, ...templates]);
    setTemplateName('');
  }

  function handleApplyTemplate(id: string) {
    const t = (templates as unknown as EmailTemplate[]).find(x => (x as EmailTemplate).id === id) as EmailTemplate | undefined;
    if (!t) return;
    const html = applyTemplate(t.html, currentEmailContext());
    setAiHtml(html);
    if (t.enabledSections) setEnabledSections(t.enabledSections);
    setSelectedTemplateId(id);
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={32} />
        <Typography>Loading Wizard…</Typography>
      </Box>
    );
  }

  if (!userEmail) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">Please log in to use the Recruiting Wizard.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stepper data-tour="wizard-stepper" activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {['Select Client', 'Universities', 'Details & Coaches', 'Compose & Send'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mb: 2 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 700 }}>
            {/* Sender Type Toggle */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Send as:</Typography>
              <Button
                variant={senderType === 'client' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => { setSenderType('client'); setSelectedAgentId(''); setSelectedSport(''); }}
                sx={senderType === 'client' ? { bgcolor: '#0A0A0A', color: '#CCFF00' } : {}}
              >
                Client
              </Button>
              {/* Only show Agent option for agency owners and agents - not clients */}
              {canUseAgentMode && (
                <Button
                  variant={senderType === 'agent' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => { setSenderType('agent'); setClientId(''); setSelectedSport(''); }}
                  sx={senderType === 'agent' ? { bgcolor: '#0A0A0A', color: '#CCFF00' } : {}}
                  data-testid="agent-mode-btn"
                >
                  Agent
                </Button>
              )}
            </Box>

            {/* Client Selection (existing) */}
            {senderType === 'client' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  size="small"
                  select
                  label="Client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  data-tour="client-selector"
                  inputProps={{ 'data-testid': 'recruiter-client-select' }}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.email} {c.firstName ? `- ${c.firstName} ${c.lastName}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}

            {/* Agent Selection - filtered by role */}
            {senderType === 'agent' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  size="small"
                  select
                  label="Agent"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  inputProps={{ 'data-testid': 'recruiter-agent-select' }}
                  helperText={
                    visibleAgents.length === 0 
                      ? 'No agents available.' 
                      : session?.role === 'agent' 
                        ? 'Sending as yourself' 
                        : ''
                  }
                >
                  {visibleAgents.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.email} {a.firstName ? `- ${a.firstName} ${a.lastName}` : ''} {a.role ? `(${a.role})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
          </Box>
        )}
        {activeStep === 1 && (
          <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {senderType === 'agent'
                ? 'Select Sport, Division, and State — or pick a saved List.'
                : 'Choose Division + State, or pick a saved List.'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: senderType === 'agent' ? '1fr 1fr 1fr' : '1fr 1fr' }, gap: 2 }}>
              {senderType === 'agent' && (
                <TextField
                  size="small"
                  select
                  label="Sport"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  disabled={Boolean(selectedListId)}
                  inputProps={{ 'data-testid': 'recruiter-sport' }}
                >
                  {SUPPORTED_SPORTS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                size="small"
                select
                label="Division"
                value={division}
                onChange={(e) => { setDivision(e.target.value); setSelectedListId(''); setListMode(false); setSelectedCoachIds({}); }}
                disabled={Boolean(selectedListId)}
                inputProps={{ 'data-testid': 'recruiter-division' }}
              >
                {divisions.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                select
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={!division || Boolean(selectedListId)}
                inputProps={{ 'data-testid': 'recruiter-state' }}
              >
                {states.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                size="small"
                select
                label="List"
                value={selectedListId}
                helperText="Picking a list skips the filters above and uses that list's coaches."
                onChange={(e) => {
                  const id = String(e.target.value);
                  setSelectedListId(id);
                  const l = lists.find((x) => x.id === id) || null;
                  setSelectedList(l);
                  if (l) {
                    setListMode(true);
                    setDivision('');
                    setState('');
                    setSchools([]);
                    const mapping: Record<string, boolean> = {};
                    (l.items || []).forEach((it, idx) => {
                      const rowId = String(
                        it.id || `List::${(it.school || '')}::${(it.email || '')}::${(it.firstName || '')}-${(it.lastName || '')}::${it.title || ''}::${idx}`
                      );
                      mapping[rowId] = true;
                    });
                    setSelectedCoachIds(mapping);
                    setSelectedSchoolName('');
                    setSchoolDetails(null);
                    setActiveStep(2);
                  } else {
                    setListMode(false);
                    setSelectedCoachIds({});
                  }
                }}
                sx={{ minWidth: 280 }}
              >
                <MenuItem value="">(Select a list)</MenuItem>
                {lists.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {schoolsLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 4, justifyContent: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Loading universities…</Typography>
              </Box>
            )}

            {!schoolsLoading && schools.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {schools.length} {schools.length === 1 ? 'University' : 'Universities'}
                  </Typography>
                  <TextField
                    size="small"
                    label="Search"
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    placeholder="Filter by name…"
                    sx={{ maxWidth: 260 }}
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  {visibleSchools.map((u) => (
                    <Card
                      key={u.name}
                      onClick={() => setSelectedSchoolName(u.name)}
                      sx={{
                        cursor: 'pointer',
                        outline: selectedSchoolName === u.name ? '2px solid #CCFF00' : 'none',
                        transition: 'outline 0.15s, box-shadow 0.15s',
                        '&:hover': { boxShadow: 4 },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 2 }}>
                        <Box sx={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UniversityLogo src={u.logo} alt={`${u.name} logo`} />
                        </Box>
                        <Typography variant="body2" align="center">{u.name}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
        {activeStep === 2 && listMode && selectedList && (
          <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="h6" gutterBottom>
              {selectedList.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button size="small" variant="outlined" onClick={() => {
                const mapping: Record<string, boolean> = {};
                (selectedList.items || []).forEach((it, idx) => {
                  const rowId = String(
                    it.id || `List::${(it.school || '')}::${(it.email || '')}::${(it.firstName || '')}-${(it.lastName || '')}::${it.title || ''}::${idx}`
                  );
                  mapping[rowId] = true;
                });
                setSelectedCoachIds(mapping);
              }}>Select All</Button>
              <Button size="small" onClick={() => setSelectedCoachIds({})}>Deselect All</Button>
            </Stack>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">List Coaches</Typography>
              </AccordionSummary>
              <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
              {(selectedList.items || []).map((it, idx) => {
                const rowId = String(
                  it.id || `List::${(it.school || '')}::${(it.email || '')}::${(it.firstName || '')}-${(it.lastName || '')}::${it.title || ''}::${idx}`
                );
                const mailed = currentClient?.id && it.email ? hasMailed(currentClient.id, it.email) : false;
                const labelName = `${(it.firstName || '')} ${(it.lastName || '')}`.trim() || (it.email || '');
                return (
                  <FormControlLabel
                    key={rowId}
                    control={<Checkbox checked={Boolean(selectedCoachIds[rowId])} onChange={() => setSelectedCoachIds((p) => ({ ...p, [rowId]: !p[rowId] }))} />}
                    label={`${labelName}${it.title ? ` — ${it.title}` : ''}${it.email ? ` (${it.email})` : ''}${mailed ? ' — Mailed' : ''}`}
                  />
                );
              })}
            </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        {activeStep === 2 && !listMode && schoolDetails && (
          <Box sx={{ maxWidth: 1000 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              {schoolDetails?.schoolInfo?.LogoURL && (
                <Box sx={{ width: 44, flexShrink: 0 }}>
                  <UniversityLogo src={schoolDetails.schoolInfo.LogoURL} alt={`${schoolDetails?.schoolInfo?.School || ''} logo`} size={40} />
                </Box>
              )}
              <Typography variant="h6">
                {schoolDetails?.schoolInfo?.School || schoolDetails?.name || '—'}
              </Typography>
            </Box>
            <Accordion defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>School Overview</Typography>
              </AccordionSummary>
              <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Location: {schoolDetails?.schoolInfo?.City || '—'}, {schoolDetails?.schoolInfo?.State || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Division: {schoolDetails?.division || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conference: {schoolDetails?.schoolInfo?.Conference || schoolDetails?.conference || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {schoolDetails?.schoolInfo?.PrivatePublic || schoolDetails?.privatePublic || '—'}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">GPA</Typography>
                <Typography>{schoolDetails?.schoolInfo?.AverageGPA || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">SAT Math</Typography>
                <Typography>{schoolDetails?.schoolInfo?.SATMath || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">SAT Reading</Typography>
                <Typography>{schoolDetails?.schoolInfo?.SATReading || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">ACT</Typography>
                <Typography>{schoolDetails?.schoolInfo?.ACTComposite || '—'}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Acceptance Rate</Typography>
                <Typography>{schoolDetails?.schoolInfo?.AcceptanceRate || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Yearly Cost</Typography>
                <Typography>{schoolDetails?.schoolInfo?.YearlyCost || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">US News Ranking</Typography>
                <Typography>{schoolDetails?.schoolInfo?.USNewsRanking ? `#${schoolDetails.schoolInfo.USNewsRanking}` : '—'}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {schoolDetails?.schoolInfo?.MajorsOfferedLink && (
                <Button size="small" variant="outlined" onClick={() => window.open(schoolDetails.schoolInfo.MajorsOfferedLink, '_blank')}>
                  View Majors
                </Button>
              )}
              {schoolDetails?.schoolInfo?.Questionnaire && (
                <Button size="small" variant="outlined" onClick={() => window.open(schoolDetails.schoolInfo.Questionnaire, '_blank')}>
                  Recruiting Questionnaire
                </Button>
              )}
              {schoolDetails?.schoolInfo?.LandingPage && (
                <Button size="small" variant="outlined" onClick={() => window.open(schoolDetails.schoolInfo.LandingPage, '_blank')}>
                  Team Website
                </Button>
              )}
              {schoolDetails?.schoolInfo?.SchoolTwitter && schoolDetails.schoolInfo.SchoolTwitter !== '-' && (
                <Button size="small" variant="text" onClick={() => window.open(schoolDetails.schoolInfo.SchoolTwitter, '_blank')}>
                  Twitter
                </Button>
              )}
              {schoolDetails?.schoolInfo?.SchoolInstagram && schoolDetails.schoolInfo.SchoolInstagram !== '-' && (
                <Button size="small" variant="text" onClick={() => window.open(schoolDetails.schoolInfo.SchoolInstagram, '_blank')}>
                  Instagram
                </Button>
              )}
            </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Coaches</Typography>
              </AccordionSummary>
              <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
              {(schoolDetails.coaches ?? []).map((c: any) => {
                const id = c.id;
                const first = c.firstName || c.FirstName || '';
                const last = c.lastName || c.LastName || '';
                const title = c.title || c.Position || '';
                const email = c.email || c.Email;
                return (
                  <FormControlLabel
                    key={id}
                    control={<Checkbox checked={Boolean(selectedCoachIds[id])} onChange={() => setSelectedCoachIds((p) => ({ ...p, [id]: !p[id] }))} />}
                    label={`${first} ${last} — ${title}${email ? ` (${email})` : ''}`}
                  />
                );
              })}
            </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        {activeStep === 3 && senderType === 'agent' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Sending as Agent: <strong>{currentAgent?.firstName} {currentAgent?.lastName}</strong>
                {agentGmailAccountEmail ? ` (${agentGmailAccountEmail})` : ` (${currentAgent?.email})`}
              </Typography>
            </Box>

            {/* Recipients Display */}
            {selectedCoaches.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Recipients ({selectedCoaches.length})</Typography>
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                  {selectedCoaches.map((c: any, i: number) => (
                    <Card key={`${c.id || i}`} sx={{ minWidth: 200, flexShrink: 0 }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2">
                          {`${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim() || (c.email || '')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{c.title || ''}</Typography>
                        <Typography variant="body2" color="text.secondary">{c.email || ''}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* CC Team Members Selection for Agent Mode */}
            {ccableAgents.length > 0 && (
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', p: 2, bgcolor: '#F5F5F5' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>CC Team Members (optional)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ccableAgents.map((agent) => (
                    <FormControlLabel
                      key={agent.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={Boolean(ccAgentIds[agent.id])}
                          onChange={() => setCcAgentIds(prev => ({ ...prev, [agent.id]: !prev[agent.id] }))}
                        />
                      }
                      label={`${agent.firstName || ''} ${agent.lastName || ''} (${agent.email})`}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    />
                  ))}
                </Box>
                {ccEmails.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Will CC: {ccEmails.join(', ')}
                  </Typography>
                )}
              </Box>
            )}

            {/* Dynamic Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Insert tag:</Typography>
              {DYNAMIC_TAGS.map((dt) => (
                <Chip
                  key={dt.tag}
                  label={dt.label}
                  size="small"
                  onClick={() => insertTagAtCursor(dt.tag)}
                  sx={{ cursor: 'pointer', bgcolor: '#0A0A0A', color: '#CCFF00', '&:hover': { bgcolor: '#1A1A1A' }, fontFamily: 'monospace', fontSize: '0.75rem' }}
                />
              ))}
            </Box>

            {/* Freeform Email Composer for Agent */}
            <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', p: 2, bgcolor: '#F5F5F5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Compose Email</Typography>
                <Typography variant="caption" color="text.secondary">{agentEmailWordCount} word{agentEmailWordCount !== 1 ? 's' : ''}</Typography>
              </Box>
              <Box
                ref={agentQuillContainerRef}
                sx={{ 
                  bgcolor: '#fff', 
                  borderRadius: 0,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  '& .ql-container': { minHeight: 300, fontSize: '14px', fontFamily: 'inherit' },
                  '& .ql-editor': { minHeight: 300 },
                  '& .ql-toolbar': { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
                }}
              >
                <ReactQuill
                  theme="snow"
                  value={agentEmailBody}
                  onChange={(content: string) => setAgentEmailBody(content)}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  placeholder="Write your email to the university coaches..."
                />
              </Box>
            </Box>

            {/* Agent Actions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <Button
                variant="contained"
                disabled={agentEmailWordCount < 15 || cleanupLoading}
                onClick={handleCleanupEmail}
                startIcon={cleanupBusy ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', fontWeight: 700, '&:hover': { bgcolor: '#B8E600' }, '&.Mui-disabled': { bgcolor: '#2A2A2A', color: '#555', fontWeight: 400 } }}
              >
                {cleanupBusy ? 'Cleaning up...' : 'Clean up Email'}
              </Button>

              {agentGmailExpired && agentGmailCanRefresh && (
                <Button
                  variant="contained"
                  onClick={handleAgentRefreshGmail}
                  disabled={agentGmailRefreshing}
                  startIcon={agentGmailRefreshing ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{ bgcolor: '#FFB800', color: '#0A0A0A', '&:hover': { bgcolor: '#E6A600' } }}
                >
                  {agentGmailRefreshing ? 'Refreshing...' : 'Refresh Gmail'}
                </Button>
              )}
              {((!agentGmailConnected && !agentGmailExpired) || (agentGmailExpired && !agentGmailCanRefresh)) && (
                <Button
                  variant="contained"
                  onClick={handleAgentConnectGmail}
                  disabled={agentGmailConnecting}
                  startIcon={agentGmailConnectingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', '&:hover': { bgcolor: '#B8E600' } }}
                >
                  {agentGmailConnectingBusy ? 'Connecting...' : 'Connect Gmail'}
                </Button>
              )}
              {agentGmailConnected && !agentGmailExpired && (
                <Button
                  variant="contained"
                  disabled={!selectedCoaches.length || !agentEmailBody.trim() || isSendingEmails}
                  onClick={handleAgentSendEmails}
                  startIcon={sendingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', '&:hover': { bgcolor: '#B8E600' } }}
                >
                  {sendingBusy ? 'Sending...' : `Send to ${selectedCoaches.length} Recipient${selectedCoaches.length !== 1 ? 's' : ''}`}
                </Button>
              )}
            </Stack>

            {agentGmailExpired && (
              <Typography variant="body2" color="warning.main" sx={{ fontStyle: 'italic' }}>
                {agentGmailCanRefresh ? 'Gmail credentials expired — please refresh.' : 'Gmail credentials expired — please connect Gmail.'}
              </Typography>
            )}
            {sendMessage && (
              <Typography variant="body2" color="success.main" data-testid="send-confirmation">
                {sendMessage}
              </Typography>
            )}
          </Box>
        )}
        {activeStep === 3 && senderType === 'client' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {prompts.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    select
                    label="Saved Prompts"
                    value={selectedPromptId}
                    onChange={(e) => {
                      const id = String(e.target.value);
                      setSelectedPromptId(id);
                      const p = prompts.find((x) => x.id === id);
                      if (p?.text) {
                        const merged = `${buildGreeting('Hello')}<p>${p.text}</p>${buildEmailBody()}`;
                        setAiHtml(merged);
                      }
                    }}
                  >
                    <MenuItem value="">(Select a prompt)</MenuItem>
                    {prompts.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
              {listMode && (
            <Box>
                  <Typography variant="h6" gutterBottom>Recipients</Typography>
                <TextField
                  size="small"
                    placeholder="Search recipients"
                    fullWidth
                    onChange={(e) => {
                      const term = e.target.value.toLowerCase();
                      setSelectedCoachIds((prev) => {
                        const next: Record<string, boolean> = {};
                        selectedCoaches.forEach((c: any) => {
                          const match =
                            (c.firstName || '').toLowerCase().includes(term) ||
                            (c.lastName || '').toLowerCase().includes(term) ||
                            (c.email || '').toLowerCase().includes(term) ||
                            (c.title || '').toLowerCase().includes(term);
                          next[c.id] = match && prev[c.id];
                        });
                        return { ...prev, ...next };
                      });
                    }}
                    sx={{ mb: 1 }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      overflowX: 'auto',
                      pb: 1,
                    }}
                  >
                    {selectedCoaches.map((c: any, i: number) => (
                      <Card key={`${c.id || i}`} sx={{ minWidth: 220, flexShrink: 0 }}>
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2">
                            {`${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim() || (c.email || '')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {c.title || ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {c.email || ''}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}

              {/* CC Team Members Selection */}
              {ccableAgents.length > 0 && (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', p: 2, bgcolor: '#F5F5F5' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>CC Team Members (optional)</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ccableAgents.map((agent) => (
                      <FormControlLabel
                        key={agent.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={Boolean(ccAgentIds[agent.id])}
                            onChange={() => setCcAgentIds(prev => ({ ...prev, [agent.id]: !prev[agent.id] }))}
                          />
                        }
                        label={`${agent.firstName || ''} ${agent.lastName || ''} (${agent.email})`}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      />
                    ))}
                  </Box>
                  {ccEmails.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Will CC: {ccEmails.join(', ')}
                    </Typography>
                  )}
                </Box>
              )}

              <TextField
                size="small"
                label="Subject Line"
                fullWidth
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                placeholder="e.g., John Smith 2027 WR Introduction"
                helperText={subjectLine ? '' : 'Auto-generated when you click Generate, or type your own'}
              />

              <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', p: 2, bgcolor: '#F5F5F5' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Preview</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={isEditingPreview ? 'contained' : 'outlined'}
                      onClick={() => setIsEditingPreview(!isEditingPreview)}
                      sx={isEditingPreview ? { bgcolor: '#CCFF00', color: '#0A0A0A' } : {}}
                    >
                      {isEditingPreview ? 'Done Editing' : 'Edit'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigator.clipboard.writeText(aiHtml || buildEmailPreview())}
                      sx={{ bgcolor: '#0A0A0A', color: '#CCFF00', '&:hover': { bgcolor: '#1A1A1A' } }}
                    >
                      Copy Rich Text
                    </Button>
                  </Stack>
                </Box>
                {isEditingPreview ? (
                  <Box sx={{ 
                    bgcolor: '#fff', 
                    borderRadius: 0,
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                    '& .ql-container': { 
                      minHeight: 200,
                      fontSize: '14px',
                      fontFamily: 'inherit',
                    },
                    '& .ql-editor': { 
                      minHeight: 200,
                    },
                    '& .ql-toolbar': {
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    },
                  }}>
                    <ReactQuill
                      theme="snow"
                      value={aiHtml || buildEmailPreview()}
                      onChange={(content: string) => setAiHtml(content)}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ]
                      }}
                      placeholder="Compose your email..."
                    />
                  </Box>
                ) : (
                  <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', minHeight: 200 }}>
                    <div dangerouslySetInnerHTML={{ __html: aiHtml || buildEmailPreview() }} />
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={handleImproveWithAI}
                    sx={{
                      bgcolor: '#0A0A0A',
                      color: '#CCFF00',
                      '&:hover': { bgcolor: '#1A1A1A' },
                      '&.Mui-disabled': { bgcolor: '#0A0A0A', color: '#CCFF00', opacity: 1 },
                    }}
                    disabled={aiLoading || !selectedCoaches.length || (!universityName && !listMode)}
                    startIcon={improvingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {improvingBusy ? 'Improving…' : 'Improve Introduction'}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} />}
                  label="Schedule this campaign"
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, mt: 1 }}>
                  <TextField
                    label="Send at"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    disabled={!scheduleEnabled}
                  />
                  <TextField
                    label="Agent message for 48-hour follow-up"
                    value={followupMessage}
                    onChange={(e) => setFollowupMessage(e.target.value)}
                    size="small"
                    placeholder="Add a short personalized note to the athlete"
                  />
                </Box>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                {gmailExpired && gmailCanRefresh && (
                  <Button
                    variant="contained"
                    onClick={handleRefreshGmail}
                    disabled={gmailRefreshing}
                    startIcon={gmailRefreshing ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ bgcolor: '#FFB800', color: '#0A0A0A', '&:hover': { bgcolor: '#E6A600' } }}
                  >
                    {gmailRefreshing ? 'Refreshing…' : 'Refresh Gmail'}
                  </Button>
                )}
                {((!gmailConnected && !gmailExpired) || (gmailExpired && !gmailCanRefresh)) && (
                  <Button
                    variant="contained"
                    onClick={handleConnectGmail}
                    sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', '&:hover': { bgcolor: '#B8E600' } }}
                    disabled={gmailConnecting}
                    startIcon={gmailConnectingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {gmailConnectingBusy ? 'Connecting…' : 'Connect Gmail'}
                  </Button>
                )}
                {gmailConnected && !gmailExpired && (
                  <Typography variant="body2" sx={{ bgcolor: '#CCFF0020', px: 1.5, py: 0.75, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                    Mailing from: {gmailAccountEmail || currentClient?.email || 'Connected Gmail'}
                  </Typography>
                )}
                {gmailConnected && !gmailExpired && gmailAccountEmail && currentClient?.email && gmailAccountEmail.toLowerCase() !== currentClient.email.toLowerCase() && (
                  <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                    ⚠ Connected Google account ({gmailAccountEmail}) does not match {currentClient.email}. Emails will send from {gmailAccountEmail}.
                  </Typography>
                )}
                {gmailExpired && (
                  <Typography variant="body2" color="warning.main" sx={{ fontStyle: 'italic' }}>
                    {gmailCanRefresh ? 'Gmail credentials expired — please refresh.' : 'Gmail credentials expired — please connect Gmail.'}
                  </Typography>
                )}

                {gmailConnected && !gmailExpired ? (
                <Button
                  variant="contained"
                  onClick={handleSendEmails}
                  disabled={!selectedRecipients.length || isSendingEmails || scheduleEnabled}
                  startIcon={sendingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{
                    ml: { sm: 'auto' },
                    bgcolor: '#CCFF00',
                    color: '#0A0A0A',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#B8E600' },
                    '&.Mui-disabled': { bgcolor: '#CCFF00', color: '#0A0A0A', opacity: 0.6 },
                  }}
                  data-testid="send-emails-btn"
                >
                  {sendingBusy
                    ? `Sending to ${selectedRecipients.length}…`
                    : `Send Email${selectedRecipients.length > 1 ? 's' : ''} (${selectedRecipients.length})`}
                </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {gmailExpired && gmailCanRefresh ? 'Refresh Gmail above to send emails' : 'Connect Gmail above to send emails'}
                  </Typography>
                )}
                {sendMessage && (
                  <Typography variant="body2" color="success.main" sx={{ ml: 1 }} data-testid="send-confirmation">
                    {sendMessage}
                  </Typography>
                )}
              </Stack>
              </Box>

            <Accordion defaultExpanded sx={{ height: 'fit-content' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Email Sections</Typography>
              </AccordionSummary>
              <AccordionDetails>
              {Object.entries(enabledSections).map(([sectionKey, enabled]) => (
                <Accordion
                  key={sectionKey}
                  expanded={enabled}
                  onChange={(_, exp) => toggleSection(sectionKey, exp)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Switch checked={enabled} onChange={(e) => toggleSection(sectionKey, e.target.checked)} />
                      <Typography sx={{ textTransform: 'capitalize' }}>{sectionKey}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {!enabled ? (
                      <Typography variant="body2" color="text.secondary">Section disabled</Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                        {sectionKey === 'accomplishments' && ((contact as any).accomplishments || []).map((item: string, i: number) => (
                          <FormControlLabel
                            key={`acc-${i}`}
                            control={<Checkbox checked={Boolean(selectedFields.accomplishments?.[`acc-${i}`])} onChange={(e) => setField('accomplishments', `acc-${i}`, e.target.checked)} />}
                            label={item}
                          />
                        ))}
                        {sectionKey === 'athletic' && contact.athleteMetrics
                        .map((m: { title: string; value: string }, i: number) => ({ k: `m${i}`, label: `${m.title}: ${m.value}` }))
                        .map((m) => (
                          <FormControlLabel
                            key={m.k}
                            control={<Checkbox checked={Boolean(selectedFields.athletic?.[m.k])} onChange={(e) => setField('athletic', m.k, e.target.checked)} />}
                            label={m.label}
                          />
                        ))}
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
      {error && activeStep === 3 && (
        <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {!(isLast && senderType === 'agent') && (
          <Button variant="contained" onClick={handleNext} disabled={!canNext || (isLast && isGenerating)}>
            {isLast ? (isGenerating ? 'Generating…' : 'Generate') : 'Next'}
          </Button>
        )}
      </Box>

      {/* ── Email Sent Confirmation Modal ── */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            bgcolor: '#0A0A0A',
            color: '#fff',
            textAlign: 'center',
            py: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pb: 0 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#CCFF00' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            Email{confirmModalMessage.includes('Scheduled') ? ' Scheduled' : 's Sent'}!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {confirmModalMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setConfirmModalOpen(false)}
            sx={{
              bgcolor: '#CCFF00',
              color: '#0A0A0A',
              fontWeight: 700,
              px: 4,
              '&:hover': { bgcolor: '#B8E600' },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}