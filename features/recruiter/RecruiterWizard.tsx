'use client';
import React from 'react';
import { Box, Button, Step, StepLabel, Stepper, TextField, Typography, Card, CardContent, Checkbox, FormControlLabel, MenuItem, Stack, Accordion, AccordionSummary, AccordionDetails, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generateIntro } from '@/services/aiRecruiter';
import { useSession } from '@/features/auth/session';
import { listClientsByAgencyEmail, setClientGmailTokens, getClientGmailTokens } from '@/services/clients';
import { getDivisions, getStates } from '@/services/recruiterMeta';
import { listUniversities, getUniversityDetails, DIVISION_API_MAPPING } from '@/services/recruiter';
import { EmailTemplate, listTemplates, saveTemplate, toTemplateHtml, applyTemplate } from '@/services/templates';
import { listLists, CoachList } from '@/services/lists';
import { hasMailed, markMailed } from '@/services/mailStatus';

type ClientRow = { id: string; email: string; firstName?: string; lastName?: string; sport?: string };

export function RecruiterWizard() {
  const { session } = useSession();
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
    fetch(`/api/google/status?clientId=${encodeURIComponent(currentClient.id)}`)
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
      const res = await fetch(`/api/google/oauth/url?clientId=${encodeURIComponent(currentClient.id)}`);
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
      const id = currentClient?.id || lastConnectedClientIdRef.current || clientId || '';
      if (!id) {
        setError('Select a client first');
        return;
      }
      console.info('[gmail-ui:draft:start]', { clientId: id });
      // Ensure server has tokens for this client; rehydrate from client record if not
      try {
        const statusRes = await fetch(`/api/google/status?clientId=${encodeURIComponent(id)}`);
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
            await fetch('/api/google/tokens', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId: id, tokens: saved }),
            });
            setGmailConnected(true);
            console.info('[gmail-ui:rehydrate:result]', { clientId: id, ok: true });
          }
        }
      } catch { /* ignore */ }
      const to = selectedCoaches.map((c: any) => c.email || c.Email).filter(Boolean);
      if (!to.length) {
        setError('Select at least one coach with an email');
        return;
      }
      const subject = `Intro: ${contact.firstName || ''} ${contact.lastName || ''} → ${universityName || ''}`.trim();
      const html = aiHtml || buildEmailPreview();
      const savedTokens = getClientGmailTokens(id);
      const res = await fetch('/api/gmail/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, to, subject, html, tokens: savedTokens || undefined, agencyEmail: session?.email || '' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Draft creation failed');
      }
      if (data.openUrl) {
        window.open(data.openUrl, '_blank');
      }
      try {
        if (currentClient?.id) {
          const emailsToMark = selectedCoaches.map((c: any) => c.email).filter(Boolean);
          markMailed(currentClient.id, emailsToMark);
        }
      } catch {}
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to create Gmail draft');
    }
  }

  // AI improvement flow for intro sentence
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiHtml, setAiHtml] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  async function handleImproveWithAI() {
    try {
      setAiLoading(true);
      setError(null);
      const sport = currentClient?.sport || '';
      const collegeName = universityName || '';
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
    const collegeName = universityName || '';

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

  React.useEffect(() => {
    if (!session) return;
    if (session.role !== 'agency') return;
    listClientsByAgencyEmail(session.email).then(setClients);
    getDivisions().then(setDivisions);
    // load saved lists for this agency
    setLists(listLists(session.email));
  }, [session]);

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
  React.useEffect(() => {
    if (!session?.email) return;
    setTemplates(listTemplates({ agencyEmail: session.email, clientId }));
  }, [session, clientId]);

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
    if (!session?.email) return;
    const html = (aiHtml || buildEmailPreview());
    const ctx = currentEmailContext();
    const placeholderHtml = toTemplateHtml(html, ctx);
    const rec = saveTemplate({
      agencyEmail: session.email,
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
            <TextField
              select
              label="Division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
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
              disabled={!division}
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
              onChange={(e) => {
                const id = String(e.target.value);
                setSelectedListId(id);
                const l = lists.find((x) => x.id === id) || null;
                setSelectedList(l);
                if (l) {
                  setListMode(true);
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
          </Box>
        )}
        {activeStep === 2 && !listMode && schoolDetails && (
          <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="h6" gutterBottom>
              {schoolDetails?.schoolInfo?.School || schoolDetails?.name || '—'}
            </Typography>
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

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Coaches
            </Typography>
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
          </Box>
        )}
        {activeStep === 3 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>Selected Targets</Typography>
              <Typography variant="body2">
                {listMode && selectedList ? (
                  <>List: {selectedList.name}</>
                ) : (
                  <>University: {universityName || '—'}</>
                )}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                {`Coaches: ${selectedCoaches.length ? selectedCoaches.map((c: any) => {
                  const nm = `${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim();
                  return nm || (c.email || '');
                }).join(', ') : '—'}`}
              </Typography>
              <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                <TextField
                  label="Template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={handleSaveTemplate}
                  disabled={!(aiHtml || buildEmailPreview()) || !session?.email}
                >
                  Save as Template
                </Button>
                <TextField
                  select
                  label="Templates"
                  value={selectedTemplateId}
                  onChange={(e) => handleApplyTemplate(String(e.target.value))}
                  size="small"
                >
                  <MenuItem value="">(Select a template)</MenuItem>
                  {templates.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Typography variant="h6" gutterBottom>Email Sections</Typography>
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
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, minHeight: 200, bgcolor: '#fafafa' }}>
                <div dangerouslySetInnerHTML={{ __html: aiHtml || buildEmailPreview() }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button onClick={() => navigator.clipboard.writeText(aiHtml || buildEmailPreview())}>Copy HTML</Button>
                <Button
                  onClick={async () => {
                    const html = (aiHtml || buildEmailPreview());
                    try {
                      // Prefer rich-text copy when supported
                      // @ts-ignore ClipboardItem may not be present in TS lib depending on environment
                      if (navigator.clipboard && typeof navigator.clipboard.write === 'function' && typeof window !== 'undefined' && (window as any).ClipboardItem) {
                        const htmlBlob = new Blob([html], { type: 'text/html' });
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html;
                        const text = (tmp.textContent || '').toString();
                        const textBlob = new Blob([text], { type: 'text/plain' });
                        // @ts-ignore
                        await navigator.clipboard.write([
                          new (window as any).ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
                        ]);
                      } else {
                        // Fallback to plain text if rich copy is unavailable
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html;
                        await navigator.clipboard.writeText(tmp.textContent || '');
                      }
                    } catch (e) {
                      console.error('Clipboard copy failed', e);
                    }
                  }}
                >
                  Copy Rich Text
                </Button>
                <Button variant="outlined" onClick={handleConnectGmail}>
                  {gmailConnected ? 'Gmail Connected' : (gmailConnecting ? 'Connecting…' : 'Connect Gmail')}
                </Button>
                <Button variant="outlined" onClick={handleCreateGmailDraft} disabled={!selectedCoaches.length || !gmailConnected}>
                  Create Gmail Draft
                </Button>
                <Button variant="contained" onClick={() => setDraft(aiHtml || buildEmailPreview())}>Lock In</Button>
                <Button
                  variant="outlined"
                  onClick={handleImproveWithAI}
                  disabled={aiHtml ? false : (aiHtml ? false : (aiLoading || !selectedCoaches.length || !universityName))}
                >
                  {aiHtml ? 'Improve…' : 'Improve with AI'}
                </Button>
              </Box>
            </Box>
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


