'use client';
import React from 'react';
import { Box, Button, Step, StepLabel, Stepper, TextField, Typography, Card, CardContent, Checkbox, FormControlLabel, MenuItem, Stack, Accordion, AccordionSummary, AccordionDetails, Switch, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generateIntro } from '@/services/aiRecruiter';
import { useSession } from '@/features/auth/session';
import { listClientsByAgencyEmail, setClientGmailTokens, getClientGmailTokens } from '@/services/clients';
import { getDivisions, getStates } from '@/services/recruiterMeta';
import { listUniversities, getUniversityDetails, DIVISION_API_MAPPING } from '@/services/recruiter';
import { EmailTemplate, listTemplates, saveTemplate, toTemplateHtml, applyTemplate } from '@/services/templates';
import { listLists, CoachList } from '@/services/lists';
import { hasMailed, markMailed } from '@/services/mailStatus';
import { listPrompts, PromptRecord } from '@/services/prompts';

type ClientRow = { id: string; email: string; firstName?: string; lastName?: string; sport?: string };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

export function RecruiterWizard() {
  const { session, loading } = useSession();
  
  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  const [activeStep, setActiveStep] = React.useState(0);

  // Step 1 - client selection
  const [clients, setClients] = React.useState<ClientRow[]>([]);
  const [clientId, setClientId] = React.useState<string>('');

  // Step 2 - division/state/schools
  const [divisions, setDivisions] = React.useState<string[]>([]);
  const [division, setDivision] = React.useState<string>('');
  const [states, setStates] = React.useState<Array<{ code: string; name: string }>>([]);
  const [state, setState] = React.useState<string>('');
  const [schools, setSchools] = React.useState<Array<{ name: string }>>([]);
  const [lists, setLists] = React.useState<CoachList[]>([]);
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedList, setSelectedList] = React.useState<CoachList | null>(null);
  const [listMode, setListMode] = React.useState(false);

  // Step 3 - school details and coach selection
  const [selectedSchoolName, setSelectedSchoolName] = React.useState<string>('');
  const [schoolDetails, setSchoolDetails] = React.useState<any>(null);
  const [selectedCoachIds, setSelectedCoachIds] = React.useState<Record<string, boolean>>({});

  // Draft
  const [draft, setDraft] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [sendMessage, setSendMessage] = React.useState<string | null>(null);

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
  const popupRef = React.useRef<Window | null>(null);
  const lastConnectedClientIdRef = React.useRef<string>('');
  const [prompts, setPrompts] = React.useState<PromptRecord[]>([]);
  const [selectedPromptId, setSelectedPromptId] = React.useState<string>('');

  const currentClient = React.useMemo(() => clients.find(c => c.id === clientId) || null, [clients, clientId]);
  const contact = React.useMemo(() => {
    const radar = (currentClient as any)?.radar ?? {};
    return {
      email: currentClient?.email ?? '',
      phone: (currentClient as any)?.phone ?? '',
      firstName: currentClient?.firstName ?? '',
      lastName: currentClient?.lastName ?? '',
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
        
          return { id, firstName: it.firstName || '', lastName: it.lastName || '', email: it.email || '', title: it.title || '' } as any;
        })
        .filter((c: any) => map[c.id]);
    }
    const all = (schoolDetails?.coaches ?? []) as any[];
    return all.filter((c) => map[c.id]);
  }, [selectedCoachIds, schoolDetails, listMode, selectedList]);
  const universityName = schoolDetails?.schoolInfo?.School || schoolDetails?.name || '';
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
    'Selected University';

  function personalizedHtmlForCoach(html: string, coach: any) {
    const coachLast = coach?.lastName || coach?.LastName || 'Coach';
    const re = /Hello Coach [^,<]*,/i;
    if (re.test(html)) {
      return html.replace(re, `Hello Coach ${coachLast},`);
    }
    return `<p>Hello Coach ${coachLast},</p>${html}`;
  }

  function toggleSection(k: string, v: boolean) {
    setEnabledSections((p) => ({ ...p, [k]: v }));
  }
  function setField(section: string, fieldKey: string, checked: boolean) {
    setSelectedFields((p) => ({ ...p, [section]: { ...(p[section] ?? {}), [fieldKey]: checked } }));
  }
  function buildEmailPreview(): string {
    const coachName = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || 'Coach';
    const enabledIds = Object.keys(enabledSections).filter((k) => enabledSections[k]);
    let emailContent = '';
    const generatedIntro = `${contact.firstName || ''} ${contact.lastName || ''} - ${contact.school || ''}`.trim();
    emailContent += `<p>Hello Coach ${coachName || ''},</p><p>${generatedIntro}</p>`;
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
    if (enabledIds.includes('athletic')) {
      const metrics = [
        { title: contact.athleteMetricsTitleOne, value: contact.athleteMetricsValueOne },
        { title: contact.athleteMetricsTitleTwo, value: contact.athleteMetricsValueTwo },
        { title: contact.athleteMetricsTitleThree, value: contact.athleteMetricsValueThree },
        { title: contact.athleteMetricsTitleFour, value: contact.athleteMetricsValueFour },
      ].filter(m => m.title && m.value);
      if (metrics.length) {
        emailContent += `<p><strong>Athletic Metrics:</strong></p><ul>${metrics.map((m, i) => {
          const prefix = metrics.length > 1 ? `${i + 1}. ` : '';
          return `<li>${prefix}${m.title}: ${m.value}</li>`;
        }).join('')}</ul>\n`;
      } else {
        emailContent += `<p><strong>Athletic Metrics:</strong></p><p>No athletic metrics available.</p>\n`;
      }
    }
    if (enabledIds.includes('highlights')) {
      const highlights = [
        contact.youtubeHighlightUrl ? { type: 'YouTube Highlight', url: `https://www.youtube.com/watch?v=${contact.youtubeHighlightUrl}` } : null,
        contact.hudlLink ? { type: 'Hudl Profile', url: `https://www.hudl.com/profile/${contact.hudlLink}` } : null,
        contact.instagramProfileUrl ? { type: 'Instagram', url: `https://www.instagram.com/${contact.instagramProfileUrl}` } : null,
        ...(((contact as any).newsArticleLinks || []).map((url: string) => ({ type: 'Article', url })) || [])
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
    if (enabledIds.includes('radarPage') && contact.email) {
      emailContent += `\nFollow My Radar Page: <a href="https://radar.athletenarrative.com/?username=${encodeURIComponent(contact.email)}" target="_blank">HERE</a>`;
    }
    return emailContent;
  }

  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof window === 'undefined') return;
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'google-oauth-success') {
        const id = e.data?.clientId || currentClient?.id || clientId || '';
        console.info('[gmail-ui:oauth-success]', { clientId: id });
        setGmailConnecting(false);
        setGmailConnected(Boolean(id));
        try { popupRef.current?.close(); } catch {}
        if (id) lastConnectedClientIdRef.current = id;
        // fetch tokens from server memory and persist onto the client record
        (async () => {
          try {
            if (!id) return;
            const r = await fetch(`/api/google/tokens?clientId=${encodeURIComponent(id)}`);
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
      if (e.data?.type === 'google-oauth-error') {
        setGmailConnecting(false);
        try { popupRef.current?.close(); } catch {}
        setError('Gmail connection failed. Please try again.');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    if (!currentClient?.id) { setGmailConnected(false); return; }
    if (typeof window === 'undefined' || typeof fetch === 'undefined') { setGmailConnected(false); return; }
    const statusUrl = API_BASE_URL
      ? `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(currentClient.id)}`
      : `/api/google/status?clientId=${encodeURIComponent(currentClient.id)}`;
    fetch(statusUrl, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setGmailConnected(Boolean(d?.connected)))
      .catch(() => setGmailConnected(false));
  }, [currentClient?.id]);

  async function handleConnectGmail() {
    try {
      if (!currentClient?.id) {
        setError('Select a client first');
        return;
      }
      setGmailConnecting(true);
      const oauthUrl = API_BASE_URL
        ? `${API_BASE_URL}/google/oauth/url?clientId=${encodeURIComponent(currentClient.id)}`
        : `/api/google/oauth/url?clientId=${encodeURIComponent(currentClient.id)}`;
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

  async function handleCreateGmailDraft() {
    try {
      setSendMessage(null);
      setIsCreatingDraft(true);
      const id = currentClient?.id || lastConnectedClientIdRef.current || clientId || '';
      if (!id) {
        setError('Select a client first');
        return;
      }
      console.info('[gmail-ui:draft:start]', { clientId: id });
      // Ensure server has tokens for this client; rehydrate from client record if not
      try {
        const statusUrl = API_BASE_URL
          ? `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(id)}`
          : `/api/google/status?clientId=${encodeURIComponent(id)}`;
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
            const tokensUrl = API_BASE_URL ? `${API_BASE_URL}/google/tokens` : '/api/google/tokens';
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
      const subject = `Intro: ${contact.firstName || ''} ${contact.lastName || ''} → ${universityName || ''}`.trim();
      const html = aiHtml || buildEmailPreview();
      const savedTokens = getClientGmailTokens(id);

      // Send one draft per recipient to avoid a single email with multiple TOs
      for (const recipient of to) {
        const coach = selectedCoaches.find((c: any) => (c.email || c.Email) === recipient) || {};
        const personalizedHtml = personalizedHtmlForCoach(html, coach);
        const draftUrl = API_BASE_URL ? `${API_BASE_URL}/gmail/create-draft` : '/api/gmail/create-draft';
        const res = await fetch(draftUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              clientId: id, 
              to: [recipient], 
              subject, 
              html: personalizedHtml, 
              tokens: savedTokens || undefined, 
              agencyEmail: userEmail || ''  // FIX: Use safe email
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || 'Draft creation failed');
        }
        if (data.openUrl) {
          window.open(data.openUrl, '_blank');
        }
        try {
          if (currentClient?.id && recipient) {
            markMailed(currentClient.id, [recipient]);
          }
        } catch {}
      }
      setSendMessage(`Sent to ${to.length} recipient${to.length === 1 ? '' : 's'}`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to create Gmail draft');
    } finally {
      setIsCreatingDraft(false);
    }
  }

  // AI improvement flow for intro sentence
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiHtml, setAiHtml] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = React.useState(false);

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
  const draftBusy = useDelayedBusy(isCreatingDraft);

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
      const coachLast = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || 'Coach';
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      const parts: string[] = [];
      if (enabledSections.accomplishments && (contact as any).accomplishments?.length) parts.push('notable accomplishments');
      if (enabledSections.academic && (contact.gpa || (contact as any).preferredAreaOfStudy)) parts.push('key academic details');
      if (enabledSections.athletic) parts.push('athletic metrics and performance');
      if (enabledSections.highlights) parts.push('highlight links for review');
      const coachMessage = `This is an introduction email for ${fullName}. The student-athlete is introducing themselves with ${parts.join(', ') || 'basic profile details'}. Please use the student's actual name; do not use placeholders.`;

      const intro = await generateIntro({
        sport,
        collegeName,
        coachMessage,
        tone: 'A highschool kid who loves sports',
        qualities: ['Passionate', 'Hardworking', 'Determined'],
        additionalInsights: `Student full name: ${fullName}. Use this exact name; do not output placeholders like [StudentName].`,
      });

      const introFixed = String(intro).replace(/\[StudentName\]/gi, fullName);
      // Merge AI intro with the rest of the composed email
      const base = buildEmailPreview();
      const stripped = base.replace(/^<p>Hello Coach[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>/, '');
      const rest = stripped || base;
      const improved = `<p>Hello Coach ${coachLast},</p><p>${introFixed}</p>${rest}`;
      setAiHtml(improved);
    } catch (e: any) {
      setError(e?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  }

  async function generateFullEmailHtml(): Promise<string> {
    const coachLast = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || 'Coach';
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

    const coachMessage =
      `This is an introduction email for ${fullName}. The student-athlete is introducing themselves with ${parts.join(', ') || 'basic profile details'}. Please use the student's actual name; do not use placeholders.`;

    const intro = await generateIntro({
      sport,
      collegeName,
      coachMessage,
      tone: 'A highschool kid who loves sports',
      qualities: ['Passionate', 'Hardworking', 'Determined'],
      additionalInsights: `Student full name: ${fullName}. Use this exact name; do not output placeholders like [StudentName].`,
    });
    const introFixed = String(intro).replace(/\[StudentName\]/gi, fullName);

    const base = buildEmailPreview();
    const stripped = base.replace(/^<[^>]*>Hello\s+Coach[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>/i, "");
    const rest = stripped || base;
    return `<p>Hello Coach ${coachLast},</p><p>${introFixed}</p>${rest}`;
  }

  // FIX: Load Initial Data using safe userEmail
  React.useEffect(() => {
    if (!userEmail) return;
    
    // Load Clients
    listClientsByAgencyEmail(userEmail).then(setClients);
    
    // Load Meta
    getDivisions().then(setDivisions);
    
    // Load Lists
    listLists(userEmail).then(setLists).catch(() => setLists([]));

    // Load Prompts
    listPrompts({ agencyEmail: userEmail, clientId }).then(setPrompts).catch(() => setPrompts([]));
  }, [userEmail]); // Dependencies correct now

  // Reload prompts when client changes to surface client-specific templates
  React.useEffect(() => {
    if (!userEmail) return;
    listPrompts({ agencyEmail: userEmail, clientId }).then(setPrompts).catch(() => setPrompts([]));
  }, [userEmail, clientId]);

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

  React.useEffect(() => {
    if (division && state && clientId) {
      const client = clients.find(c => c.id === clientId) || null;
      const sport = client?.sport || '';
      if (!sport) { setSchools([]); return; }
      const divisionSlug = DIVISION_API_MAPPING[division] || division;
      listUniversities({ sport, division: divisionSlug, state })
        .then(setSchools)
        .catch((e) => { setSchools([]); setError(e?.message || 'Failed to load universities'); });
    } else {
      setSchools([]);
    }
  }, [division, state, clientId, clients]);

  React.useEffect(() => {
    if (!selectedSchoolName) {
      setSchoolDetails(null);
      setSelectedCoachIds({});
      return;
    }
    const client = clients.find(c => c.id === clientId) || null;
    const sport = client?.sport || '';
    if (!sport || !division || !state) { setSchoolDetails(null); return; }
    const divisionSlug = DIVISION_API_MAPPING[division] || division;
    getUniversityDetails({ sport, division: divisionSlug, state, school: selectedSchoolName })
      .then((u) => { setSchoolDetails(u); setSelectedCoachIds({}); })
      .catch((e) => { setSchoolDetails(null); setSelectedCoachIds({}); setError(e?.message || 'Failed to load university'); });
  }, [selectedSchoolName, clientId, division, state, clients]);
  React.useEffect(() => { setError(null); }, [division, state, selectedSchoolName, clientId]);

  // FIX: Use userEmail for templates
  React.useEffect(() => {
    if (!userEmail) return;
    setTemplates(listTemplates({ agencyEmail: userEmail, clientId }));
  }, [userEmail, clientId]);

  const isLast = activeStep === 3;
  const canNext =
    (activeStep === 0 && Boolean(clientId)) ||
    (activeStep === 1 && (Boolean(selectedListId) || (Boolean(division) && Boolean(state) && schools.length > 0))) ||
    (activeStep === 2 && (listMode ? selectedCoaches.length > 0 : Boolean(selectedSchoolName))) ||
    (activeStep === 3);

  const handleNext = async () => {
    if (isLast) {
      try {
        setIsGenerating(true);
        setError(null);
        const html = await generateFullEmailHtml();
        setAiHtml(html);
        setDraft(html);
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
    const primaryCoachLastName = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || '';
    const coachList = (selectedCoaches || [])
      .map((c: any) => `${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim())
      .filter(Boolean)
      .join(', ');
    return { studentFirstName, studentLastName, studentFullName, universityName: uName, primaryCoachLastName, coachList };
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
    setDraft(html);
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
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {['Select Client', 'Universities', 'Details & Coaches', 'Draft'].map((label) => (
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
        {prompts.length > 0 && (
          <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Saved Prompts"
              value={selectedPromptId}
              onChange={(e) => {
                const id = String(e.target.value);
                setSelectedPromptId(id);
                const p = prompts.find((x) => x.id === id);
                if (p?.text) {
                  setAiHtml(p.text);
                  setDraft(p.text);
                }
              }}
              SelectProps={{ MenuProps: { disablePortal: true } }}
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
        {activeStep === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 700 }}>
            <TextField
              select
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              SelectProps={{ MenuProps: { disablePortal: true } }}
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
        {activeStep === 1 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 800 }}>
            <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>
              Choose either Division + State or a saved List (not both). Selecting a list will skip Division/State.
            </Typography>
            <TextField
              select
              label="Division"
              value={division}
              onChange={(e) => { setDivision(e.target.value); setSelectedListId(''); setListMode(false); setSelectedCoachIds({}); }}
              disabled={Boolean(selectedListId)}
              SelectProps={{ MenuProps: { disablePortal: true } }}
              inputProps={{ 'data-testid': 'recruiter-division' }}
            >
              {divisions.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={!division || Boolean(selectedListId)}
              SelectProps={{ MenuProps: { disablePortal: true } }}
              inputProps={{ 'data-testid': 'recruiter-state' }}
            >
              {states.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="List"
              value={selectedListId}
              helperText="Picking a list skips Division/State and uses that list’s coaches."
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
              SelectProps={{ MenuProps: { disablePortal: true } }}
            >
              <MenuItem value="">(Select a list)</MenuItem>
              {lists.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </TextField>
            {schools.length > 0 && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Universities
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                {schools.map((u) => (
                  <Card
                    key={u.name}
                    onClick={() => setSelectedSchoolName(u.name)}
                    sx={{
                      width: 260,
                      cursor: 'pointer',
                      outline: selectedSchoolName === u.name ? '2px solid #1976d2' : 'none',
                    }}
                  >
                    <CardContent>
                      <Typography>{u.name}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
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
            <Typography variant="h6" gutterBottom>
              {schoolDetails?.schoolInfo?.School || schoolDetails?.name || '—'}
            </Typography>
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
        {activeStep === 3 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, bgcolor: '#fafafa' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Preview</Typography>
                  <Button
                    onClick={() => navigator.clipboard.writeText(aiHtml || buildEmailPreview())}
                    sx={{ bgcolor: '#000', color: '#b7ff00', '&:hover': { bgcolor: '#111' } }}
                  >
                    Copy Rich Text
                  </Button>
                </Box>
                <div dangerouslySetInnerHTML={{ __html: aiHtml || buildEmailPreview() }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={handleImproveWithAI}
                    sx={{
                      bgcolor: '#000',
                      color: '#b7ff00',
                      '&:hover': { bgcolor: '#111' },
                      '&.Mui-disabled': { bgcolor: '#000', color: '#b7ff00', opacity: 1 },
                    }}
                    disabled={aiLoading || !selectedCoaches.length || (!universityName && !listMode)}
                    startIcon={improvingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {improvingBusy ? 'Improving…' : 'Improve Introduction'}
                  </Button>
                </Box>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                {!gmailConnected && (
                  <Button
                    variant="contained"
                    onClick={handleConnectGmail}
                    sx={{ bgcolor: '#b7ff00', color: '#000', '&:hover': { bgcolor: '#a0e600' } }}
                    disabled={gmailConnecting}
                    startIcon={gmailConnectingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {gmailConnectingBusy ? 'Connecting…' : 'Connect Gmail'}
                  </Button>
                )}
                {gmailConnected && (
                  <Typography variant="body2" sx={{ bgcolor: '#e8fbe0', px: 1.5, py: 0.75, borderRadius: 1 }}>
                    Mailing from: {userEmail || 'Connected Gmail'}
                  </Typography>
                )}

                {gmailConnected && (
                <Button
                  variant="outlined"
                    onClick={handleCreateGmailDraft}
                    disabled={!selectedCoaches.length || isCreatingDraft}
                    startIcon={draftBusy ? <CircularProgress size={16} /> : null}
                    sx={{ ml: { sm: 'auto' } }}
                  >
                    {draftBusy ? 'Creating…' : 'Create Gmail Draft'}
                </Button>
                )}

                <Button
                  variant={gmailConnected ? 'contained' : 'outlined'}
                  onClick={() => setDraft(aiHtml || buildEmailPreview())}
                  disabled={!selectedRecipients.length || isGenerating}
                  startIcon={generatingBusy ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={
                    gmailConnected
                      ? {
                          bgcolor: '#b7ff00',
                          color: '#000',
                          '&:hover': { bgcolor: '#a0e600' },
                          '&.Mui-disabled': { bgcolor: '#b7ff00', color: '#000', opacity: 0.6 },
                        }
                      : {
                          borderColor: '#b7ff00',
                          color: '#000',
                          '&:hover': { borderColor: '#a0e600', bgcolor: 'rgba(183,255,0,0.1)' },
                          '&.Mui-disabled': { borderColor: '#b7ff00', color: '#000', opacity: 0.6 },
                        }
                  }
                >
                  {generatingBusy ? 'Sending…' : 'Send Emails'}
                </Button>
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
                        {sectionKey === 'athletic' && [
                          { k: 'm1', label: `${(contact as any).athleteMetricsTitleOne || ''}: ${(contact as any).athleteMetricsValueOne || ''}`.trim() },
                          { k: 'm2', label: `${(contact as any).athleteMetricsTitleTwo || ''}: ${(contact as any).athleteMetricsValueTwo || ''}`.trim() },
                          { k: 'm3', label: `${(contact as any).athleteMetricsTitleThree || ''}: ${(contact as any).athleteMetricsValueThree || ''}`.trim() },
                          { k: 'm4', label: `${(contact as any).athleteMetricsTitleFour || ''}: ${(contact as any).athleteMetricsValueFour || ''}`.trim() },
                        ]
                        .filter(m => m.label !== ':')
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!canNext || (isLast && isGenerating)}>
          {isLast ? (isGenerating ? 'Generating…' : 'Generate') : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}