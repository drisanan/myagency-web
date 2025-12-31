'use client';
import React from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography, CircularProgress, Stack, StepButton } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { upsertClient } from '@/services/clients';
import { MenuItem, TextField } from '@mui/material';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';
import { useRouter } from 'next/navigation';

type EventItem = { name: string; startTime?: string };
type MetricItem = { title: string; value: string };
type ReferenceItem = { name: string; email?: string; phone?: string };
type RadarDraft = {
  events?: EventItem[];
  metrics?: MetricItem[];
  references?: ReferenceItem[];
} & Record<string, any>;

const steps = [
  'Basic Info',
  'Personal Info',
  'Social Media',
  'Content Links',
  'Events & Metrics',
  'Motivation & References',
  'Review',
];

function PersonalInfoStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="Preferred Position" value={value.preferredPosition ?? ''} onChange={(e)=>onChange('preferredPosition', e.target.value)} />
      <TextField size="small" label="Height" value={value.athleteheight ?? ''} onChange={(e)=>onChange('athleteheight', e.target.value)} />
      <TextField size="small" label="Weight (lb)" value={value.athleteWeight ?? ''} onChange={(e)=>onChange('athleteWeight', e.target.value)} />
      <TextField size="small" label="School / Team / Club" value={value.school ?? ''} onChange={(e)=>onChange('school', e.target.value)} />
      <TextField size="small" label="ACT" value={value.act ?? ''} onChange={(e)=>onChange('act', e.target.value)} />
      <TextField size="small" label="SAT" value={value.sat ?? ''} onChange={(e)=>onChange('sat', e.target.value)} />
      <TextField size="small" label="Graduation Year" value={value.graduationYear ?? ''} onChange={(e)=>onChange('graduationYear', e.target.value)} />
      <TextField size="small" label="GPA" value={value.gpa ?? ''} onChange={(e)=>onChange('gpa', e.target.value)} />
      <TextField size="small" label="Short Description" value={value.description ?? ''} onChange={(e)=>onChange('description', e.target.value)} multiline rows={3} sx={{ gridColumn: '1 / -1' }} />
    </Box>
  );
}

function SocialStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="Instagram Handle" value={value.instagramProfileUrl ?? ''} onChange={(e)=>onChange('instagramProfileUrl', e.target.value)} />
      <TextField size="small" label="TikTok Handle" value={value.tiktokProfileUrl ?? ''} onChange={(e)=>onChange('tiktokProfileUrl', e.target.value)} />
      <TextField size="small" label="Twitter Handle" value={value.twitterUrl ?? ''} onChange={(e)=>onChange('twitterUrl', e.target.value)} />
      <TextField size="small" label="Facebook Handle" value={value.facebookUrl ?? ''} onChange={(e)=>onChange('facebookUrl', e.target.value)} />
    </Box>
  );
}

function ContentLinksStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="YouTube Highlight URL" value={value.youtubeHighlightUrl ?? ''} onChange={(e)=>onChange('youtubeHighlightUrl', e.target.value)} />
      <TextField size="small" label="Spotify Song URL" value={value.spotifySong ?? ''} onChange={(e)=>onChange('spotifySong', e.target.value)} />
      <TextField size="small" label="Hudl Link" value={value.hudlLink ?? ''} onChange={(e)=>onChange('hudlLink', e.target.value)} />
      <TextField size="small" label="Jungo Link" value={value.jungoLink ?? ''} onChange={(e)=>onChange('jungoLink', e.target.value)} />
      <TextField size="small" label="Additional Stats Link" value={value.additionalStatsLink ?? ''} onChange={(e)=>onChange('additionalStatsLink', e.target.value)} />
    </Box>
  );
}

function EventsMetricsStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  const events = value.events ?? [];
  const metrics = value.metrics ?? [];

  const updateEvents = (items: EventItem[]) => onChange('events', items);
  const updateMetrics = (items: MetricItem[]) => onChange('metrics', items);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1">Events</Typography>
          <Button size="small" data-testid="add-event" onClick={() => updateEvents([...events, { name: '', startTime: '' }])}>+ Add Event</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {events.length === 0 && <Typography variant="body2" color="text.secondary">No events added</Typography>}
          {events.map((ev, idx) => (
            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1 }}>
              <TextField size="small" label="Event Name" value={ev.name} onChange={(e)=>updateEvents(events.map((v,i)=>i===idx?{...v,name:e.target.value}:v))} />
              <TextField
                size="small"
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={ev.startTime ?? ''}
                onChange={(e)=>updateEvents(events.map((v,i)=>i===idx?{...v,startTime:e.target.value}:v))}
              />
              <Button color="error" onClick={()=>updateEvents(events.filter((_,i)=>i!==idx))}>Remove</Button>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1">Metrics</Typography>
          <Button size="small" data-testid="add-metric" onClick={() => updateMetrics([...metrics, { title: '', value: '' }])}>+ Add Metric</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {metrics.length === 0 && <Typography variant="body2" color="text.secondary">No metrics added</Typography>}
          {metrics.map((m, idx) => (
            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1 }}>
              <TextField size="small" label="Metric Title" value={m.title} onChange={(e)=>updateMetrics(metrics.map((v,i)=>i===idx?{...v,title:e.target.value}:v))} />
              <TextField size="small" label="Metric Value" value={m.value} onChange={(e)=>updateMetrics(metrics.map((v,i)=>i===idx?{...v,value:e.target.value}:v))} />
              <Button color="error" onClick={()=>updateMetrics(metrics.filter((_,i)=>i!==idx))}>Remove</Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function MotivationStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  const references = value.references ?? [];
  const updateReferences = (items: ReferenceItem[]) => onChange('references', items);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="Favorite Motivational Quote" value={value.myMotivator ?? ''} onChange={(e)=>onChange('myMotivator', e.target.value)} />
      <TextField size="small" label="Advice" value={value.athleteAdvice ?? ''} onChange={(e)=>onChange('athleteAdvice', e.target.value)} />
      </Box>
      <TextField
        size="small"
        label="What makes you different from everyone else as a person?"
        value={value.differenceMaker ?? ''}
        onChange={(e)=>onChange('differenceMaker', e.target.value)}
        multiline
        rows={3}
      />

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1">References</Typography>
          <Button size="small" data-testid="add-reference" onClick={() => updateReferences([...references, { name: '', email: '', phone: '' }])}>+ Add Reference</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {references.length === 0 && <Typography variant="body2" color="text.secondary">No references added</Typography>}
          {references.map((ref, idx) => (
            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr) auto' }, gap: 1 }}>
              <TextField size="small" label="Name" value={ref.name} onChange={(e)=>updateReferences(references.map((v,i)=>i===idx?{...v,name:e.target.value}:v))} />
              <TextField size="small" label="Email" value={ref.email} onChange={(e)=>updateReferences(references.map((v,i)=>i===idx?{...v,email:e.target.value}:v))} />
              <TextField size="small" label="Phone" value={ref.phone} onChange={(e)=>updateReferences(references.map((v,i)=>i===idx?{...v,phone:e.target.value}:v))} />
              <Button color="error" onClick={()=>updateReferences(references.filter((_,i)=>i!==idx))}>Remove</Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function BasicInfoStep({
  value,
  onChange,
  errors,
}: {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
  errors?: { email?: string; firstName?: string; lastName?: string; sport?: string };
}) {
  const sports = getSports();
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_IMAGE_BYTES = 1_000_000; // 1MB cap for profile images
    if (file.size > MAX_IMAGE_BYTES) {
      setPhotoError('Image must be 1MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...value,
        photoUrl: reader.result as string,
        profileImageUrl: reader.result as string,
        photoFileName: file.name,
      });
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };
  const triggerFile = () => fileInputRef.current?.click();
  const handleSportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sport = e.target.value;
    onChange({
      ...value,
      sport,
    });
  };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 700 }}>
      <TextField
        size="small"
        label="Athlete Email"
        value={value.email ?? ''}
        onChange={(e)=>onChange({ ...value, email: e.target.value })}
        error={Boolean(errors?.email)}
        helperText={errors?.email || ''}
        inputProps={{ 'data-testid': 'athlete-email' }}
      />
      <TextField
        size="small"
        label="Access Code"
        type="number"
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
        value={value.accessCode ?? ''}
        onChange={(e)=>onChange({ ...value, accessCode: e.target.value.slice(0, 6).replace(/\D/g, '') })}
        helperText="6-digit numeric code"
      />
      <TextField size="small" label="First name" value={value.firstName ?? ''} onChange={(e)=>onChange({ ...value, firstName: e.target.value })} error={Boolean(errors?.firstName)} helperText={errors?.firstName || ''} />
      <TextField size="small" label="Last name" value={value.lastName ?? ''} onChange={(e)=>onChange({ ...value, lastName: e.target.value })} error={Boolean(errors?.lastName)} helperText={errors?.lastName || ''} />
      <TextField
        size="small"
        label="Phone"
        value={value.phone ?? ''}
        onChange={(e)=>onChange({ ...value, phone: e.target.value })}
        inputProps={{ inputMode: 'tel' }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          onClick={triggerFile}
          sx={{
            width: 96,
            height: 96,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fafafa',
            flexShrink: 0,
          }}
          data-testid="photo-preview"
        >
          {value.photoUrl || value.profileImageUrl ? (
            <Box component="img" src={value.photoUrl || value.profileImageUrl} alt="Profile" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Typography variant="caption" color="text.secondary">Add Photo</Typography>
          )}
        </Box>
        <Stack spacing={0.5}>
          <Button variant="outlined" onClick={triggerFile} sx={{ textTransform: 'none' }}>
            {value.photoFileName ? `Uploaded: ${value.photoFileName}` : 'Upload / Replace'}
          </Button>
          <Button variant="text" size="small" onClick={()=>setShowUrlInput((s)=>!s)} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            {showUrlInput ? 'Hide URL input' : 'Set via URL'}
      </Button>
        </Stack>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoFile} data-testid="photo-upload" />
      </Box>
      {photoError && (
        <Typography variant="caption" color="error">
          {photoError}
        </Typography>
      )}
      {showUrlInput && (
        <TextField
          size="small"
          label="Profile Image URL"
          value={value.photoUrl ?? value.profileImageUrl ?? ''}
          onChange={(e)=>onChange({ ...value, photoUrl: e.target.value, profileImageUrl: e.target.value })}
        />
      )}
      <TextField
        size="small"
        select
        label="Sport"
        value={value.sport ?? ''}
        onChange={handleSportChange}
        SelectProps={{ MenuProps: { disablePortal: true } }}
        error={Boolean(errors?.sport)}
        helperText={errors?.sport || ''}
      >
        {sports.map((s) => (
          <MenuItem key={s} value={s}>
            {formatSportLabel(s)}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

type ClientWizardProps = {
  initialClient?: any;
  mode?: 'create' | 'edit';
  onSaved?: () => void;
};

export function ClientWizard({
  initialClient,
  mode = 'create',
  onSaved,
  publicMode = false,
  publicSubmit,
  overrideAgencyEmail,
  onSubmitSuccess,
}: ClientWizardProps & {
  publicMode?: boolean;
  publicSubmit?: (payload: Record<string, any>) => Promise<void>;
  overrideAgencyEmail?: string;
  onSubmitSuccess?: () => void;
}) {
  const { session } = useSession();
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [basic, setBasic] = React.useState<Record<string, any>>(initialClient ? { ...initialClient, password: '' } : {});
  const [radar, setRadar] = React.useState<RadarDraft>({
    events: initialClient?.radar?.events ?? [],
    metrics: initialClient?.radar?.metrics ?? [],
    references: initialClient?.radar?.references ?? [],
    ...(initialClient?.radar ?? {}),
  });
  const isLast = activeStep === steps.length - 1;
  const [errors, setErrors] = React.useState<{ email?: string; firstName?: string; lastName?: string; sport?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState('');

  React.useEffect(() => {
    if (!initialClient) return;
    setBasic((prev) => {
      if (!prev.id || prev.id !== initialClient.id || Object.keys(prev).length === 0) {
        return { ...initialClient, password: '' };
      }
      return prev;
    });
    setRadar((prev) => {
      const base = !prev || Object.keys(prev || {}).length === 0 ? initialClient.radar ?? {} : prev;
      return {
        events: base.events ?? [],
        metrics: base.metrics ?? [],
        references: base.references ?? [],
        ...base,
      };
    });
  }, [initialClient?.id]);

  const validateBasic = React.useCallback((value: Record<string, any>) => {
    const next: { email?: string; firstName?: string; lastName?: string; sport?: string } = {};
    if (!value.email?.trim()) next.email = 'Email is required';
    if (!value.firstName?.trim()) next.firstName = 'First name is required';
    if (!value.lastName?.trim()) next.lastName = 'Last name is required';
    if (!value.sport?.trim()) next.sport = 'Sport is required';
    return next;
  }, []);

  const handleNext = async () => {
    // Block advancement from the Basic Info step if required fields are missing.
    if (activeStep === 0) {
      const validation = validateBasic(basic);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setSubmitError('Please fill all required fields.');
        return;
      } else {
        setErrors({});
        setSubmitError('');
      }
    }

    if (isLast) {
      const validation = validateBasic(basic);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setSubmitError('Please fill all required fields.');
        setActiveStep(0);
        return;
      } else {
        setErrors({});
        setSubmitError('');
        setSubmitSuccess('');
      }
      const payload: Record<string, any> = {
        ...basic,
        radar,
        agencyEmail: overrideAgencyEmail ?? initialClient?.agencyEmail ?? session?.email,
        id: initialClient?.id,
      };
      if (!payload.password) {
        delete payload.password;
      }
      setSubmitting(true);
      setSubmitError('');
      try {
        if (publicMode && publicSubmit) {
          await publicSubmit(payload);
        } else {
          await upsertClient(payload);
        }
        onSaved?.();
        onSubmitSuccess?.();
        if (publicMode) {
          setSubmitSuccess('Submitted!');
        } else {
          router.push('/clients');
        }
        return;
      } catch (e: any) {
        setSubmitError(e?.message || 'Failed to save client');
      } finally {
        setSubmitting(false);
      }
    }
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s)=> Math.max(0, s - 1));

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label, idx) => (
          <Step key={label}>
            {mode === 'edit' ? (
              <StepButton onClick={() => setActiveStep(idx)}>{label}</StepButton>
            ) : (
            <StepLabel>{label}</StepLabel>
            )}
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mb: 2 }}>
        {submitError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {submitError}
          </Typography>
        )}
        {!submitError && submitSuccess && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {submitSuccess}
          </Typography>
        )}
        {activeStep === 0 && (
          <BasicInfoStep
            value={basic}
            onChange={(v) => {
              setBasic(v);
              if (Object.keys(errors).length) {
                setErrors((prev) => ({
                  email: v.email ? undefined : prev.email,
                  firstName: v.firstName ? undefined : prev.firstName,
                  lastName: v.lastName ? undefined : prev.lastName,
                  sport: v.sport ? undefined : prev.sport,
                }));
              }
            }}
            errors={errors}
          />
        )}
        {activeStep === 1 && (
          <PersonalInfoStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 2 && (
          <SocialStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 3 && (
          <ContentLinksStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 4 && (
          <EventsMetricsStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 5 && (
          <MotivationStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 6 && (
          <Box>
            <Typography variant="h6" gutterBottom>Review</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3, alignItems: 'start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    flexShrink: 0,
                  }}
                >
                  {basic.photoUrl || basic.profileImageUrl ? (
                    <Box component="img" src={basic.photoUrl || basic.profileImageUrl} alt="Profile" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Photo</Box>
                  )}
                </Box>
                <Typography variant="h6">{[basic.firstName, basic.lastName].filter(Boolean).join(' ') || 'Athlete'}</Typography>
                <Typography variant="body2" color="text.secondary">{basic.email || 'No email'}</Typography>
                <Typography variant="body2" color="text.secondary">{basic.sport ? formatSportLabel(basic.sport) : 'No sport'}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Personal</Typography>
                <Typography>Preferred Position: {radar.preferredPosition || '-'}</Typography>
                <Typography>Height: {radar.athleteheight || '-'}</Typography>
                <Typography>Weight: {radar.athleteWeight || '-'}</Typography>
                <Typography>School / Team / Club: {radar.school || '-'}</Typography>
                <Typography>GPA: {radar.gpa || '-'}</Typography>
                <Typography>ACT: {radar.act || '-'}</Typography>
                <Typography>SAT: {radar.sat || '-'}</Typography>
                <Typography>Graduation Year: {radar.graduationYear || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Social</Typography>
                <Typography>Instagram: {radar.instagramProfileUrl || '-'}</Typography>
                <Typography>TikTok: {radar.tiktokProfileUrl || '-'}</Typography>
                <Typography>Twitter: {radar.twitterUrl || '-'}</Typography>
                <Typography>Facebook: {radar.facebookUrl || '-'}</Typography>
              </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="text.secondary">About</Typography>
                  <Typography>{radar.description || '-'}</Typography>
                </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Content</Typography>
                <Typography>YouTube Highlight: {radar.youtubeHighlightUrl || '-'}</Typography>
                <Typography>Spotify Song: {radar.spotifySong || '-'}</Typography>
                <Typography>Hudl: {radar.hudlLink || '-'}</Typography>
                <Typography>Jungo: {radar.jungoLink || '-'}</Typography>
                <Typography>Additional Stats: {radar.additionalStatsLink || '-'}</Typography>
              </Box>
              <Box>
                  <Typography variant="subtitle2" color="text.secondary">Events</Typography>
                  {(radar.events ?? []).length
                    ? (radar.events ?? []).map((ev: EventItem, i: number) => (
                        <Typography key={i}>{ev.name || 'Untitled'}{ev.startTime ? ` — ${ev.startTime}` : ''}</Typography>
                      ))
                    : <Typography color="text.secondary">No events</Typography>}
              </Box>
              <Box>
                  <Typography variant="subtitle2" color="text.secondary">Metrics</Typography>
                  {(radar.metrics ?? []).length
                    ? (radar.metrics ?? []).map((m: MetricItem, i: number) => (
                        <Typography key={i}>{m.title || 'Metric'}{m.value ? ` — ${m.value}` : ''}</Typography>
                      ))
                    : <Typography color="text.secondary">No metrics</Typography>}
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2" color="text.secondary">Motivation & References</Typography>
                <Typography>Favorite Motivational Quote: {radar.myMotivator || '-'}</Typography>
                <Typography>Advice: {radar.athleteAdvice || '-'}</Typography>
                  {(radar.references ?? []).length
                    ? (radar.references ?? []).map((r: ReferenceItem, i: number) => (
                        <Typography key={i}>
                          {r.name || 'Reference'}
                          {r.email ? ` • ${r.email}` : ''}
                          {r.phone ? ` • ${r.phone}` : ''}
                        </Typography>
                      ))
                    : <Typography color="text.secondary">No references</Typography>}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting
            ? 'Saving…'
            : isLast
              ? mode === 'edit'
                ? 'Save Changes'
                : 'Create Client'
              : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}


