'use client';
import React from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography, CircularProgress } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { upsertClient } from '@/services/clients';
import { MenuItem, TextField } from '@mui/material';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';
import { useRouter } from 'next/navigation';

type RadarDraft = Record<string, any>;

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
      <TextField label="Preferred Position" value={value.preferredPosition ?? ''} onChange={(e)=>onChange('preferredPosition', e.target.value)} />
      <TextField label="Height" value={value.athleteheight ?? ''} onChange={(e)=>onChange('athleteheight', e.target.value)} />
      <TextField label="Weight (lb)" value={value.athleteWeight ?? ''} onChange={(e)=>onChange('athleteWeight', e.target.value)} />
      <TextField label="School / Team / Club" value={value.school ?? ''} onChange={(e)=>onChange('school', e.target.value)} />
      <TextField label="ACT" value={value.act ?? ''} onChange={(e)=>onChange('act', e.target.value)} />
      <TextField label="SAT" value={value.sat ?? ''} onChange={(e)=>onChange('sat', e.target.value)} />
      <TextField label="Graduation Year" value={value.graduationYear ?? ''} onChange={(e)=>onChange('graduationYear', e.target.value)} />
      <TextField label="GPA" value={value.gpa ?? ''} onChange={(e)=>onChange('gpa', e.target.value)} />
      <TextField label="Short Description" value={value.description ?? ''} onChange={(e)=>onChange('description', e.target.value)} multiline rows={3} sx={{ gridColumn: '1 / -1' }} />
    </Box>
  );
}

function SocialStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField label="Instagram Handle" value={value.instagramProfileUrl ?? ''} onChange={(e)=>onChange('instagramProfileUrl', e.target.value)} />
      <TextField label="TikTok Handle" value={value.tiktokProfileUrl ?? ''} onChange={(e)=>onChange('tiktokProfileUrl', e.target.value)} />
      <TextField label="Twitter Handle" value={value.twitterUrl ?? ''} onChange={(e)=>onChange('twitterUrl', e.target.value)} />
      <TextField label="Facebook Handle" value={value.facebookUrl ?? ''} onChange={(e)=>onChange('facebookUrl', e.target.value)} />
    </Box>
  );
}

function ContentLinksStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField label="YouTube Highlight URL" value={value.youtubeHighlightUrl ?? ''} onChange={(e)=>onChange('youtubeHighlightUrl', e.target.value)} />
      <TextField label="Spotify Song URL" value={value.spotifySong ?? ''} onChange={(e)=>onChange('spotifySong', e.target.value)} />
      <TextField label="Hudl Link" value={value.hudlLink ?? ''} onChange={(e)=>onChange('hudlLink', e.target.value)} />
      <TextField label="Jungo Link" value={value.jungoLink ?? ''} onChange={(e)=>onChange('jungoLink', e.target.value)} />
      <TextField label="Additional Stats Link" value={value.additionalStatsLink ?? ''} onChange={(e)=>onChange('additionalStatsLink', e.target.value)} />
    </Box>
  );
}

function EventsMetricsStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField label="Event Name" value={value.eventName ?? ''} onChange={(e)=>onChange('eventName', e.target.value)} />
      <TextField label="Metric 1 (Title)" value={value.athleteMetricsTitleOne ?? ''} onChange={(e)=>onChange('athleteMetricsTitleOne', e.target.value)} />
      <TextField label="Metric 1 (Value)" value={value.athleteMetricsValueOne ?? ''} onChange={(e)=>onChange('athleteMetricsValueOne', e.target.value)} />
      <TextField label="Metric 2 (Title)" value={value.athleteMetricsTitleTwo ?? ''} onChange={(e)=>onChange('athleteMetricsTitleTwo', e.target.value)} />
      <TextField label="Metric 2 (Value)" value={value.athleteMetricsValueTwo ?? ''} onChange={(e)=>onChange('athleteMetricsValueTwo', e.target.value)} />
    </Box>
  );
}

function MotivationStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField label="Favorite Motivational Quote" value={value.myMotivator ?? ''} onChange={(e)=>onChange('myMotivator', e.target.value)} />
      <TextField label="Advice" value={value.athleteAdvice ?? ''} onChange={(e)=>onChange('athleteAdvice', e.target.value)} />
      <TextField label="Reference 1 Name" value={value.referenceOneName ?? ''} onChange={(e)=>onChange('referenceOneName', e.target.value)} />
      <TextField label="Reference 1 Email" value={value.referenceOneEmail ?? ''} onChange={(e)=>onChange('referenceOneEmail', e.target.value)} />
      <TextField label="Reference 1 Phone" value={value.referenceOnePhone ?? ''} onChange={(e)=>onChange('referenceOnePhone', e.target.value)} />
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
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...value,
        photoUrl: reader.result as string,
        profileImageUrl: reader.result as string,
        photoFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };
  const handleSportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sport = e.target.value;
    onChange({
      ...value,
      sport,
    });
  };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 700 }}>
      <TextField label="Athlete Email" value={value.email ?? ''} onChange={(e)=>onChange({ ...value, email: e.target.value })} error={Boolean(errors?.email)} helperText={errors?.email || ''} />
      <TextField label="Athlete Password" type="password" value={value.password ?? ''} onChange={(e)=>onChange({ ...value, password: e.target.value })} />
      <TextField label="First name" value={value.firstName ?? ''} onChange={(e)=>onChange({ ...value, firstName: e.target.value })} error={Boolean(errors?.firstName)} helperText={errors?.firstName || ''} />
      <TextField label="Last name" value={value.lastName ?? ''} onChange={(e)=>onChange({ ...value, lastName: e.target.value })} error={Boolean(errors?.lastName)} helperText={errors?.lastName || ''} />
      <TextField label="Profile Image URL" value={value.photoUrl ?? value.profileImageUrl ?? ''} onChange={(e)=>onChange({ ...value, photoUrl: e.target.value, profileImageUrl: e.target.value })} />
      <Button variant="outlined" component="label" sx={{ height: 56, textTransform: 'none' }}>
        {value.photoFileName ? `Uploaded: ${value.photoFileName}` : 'Upload Profile Image'}
        <input type="file" accept="image/*" hidden onChange={handlePhotoFile} data-testid="photo-upload" />
      </Button>
      <TextField
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

export function ClientWizard({ initialClient, mode = 'create', onSaved }: ClientWizardProps) {
  const { session } = useSession();
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [basic, setBasic] = React.useState<Record<string, any>>(initialClient ? { ...initialClient, password: '' } : {});
  const [radar, setRadar] = React.useState<RadarDraft>(initialClient?.radar ?? {});
  const isLast = activeStep === steps.length - 1;
  const [errors, setErrors] = React.useState<{ email?: string; firstName?: string; lastName?: string; sport?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  React.useEffect(() => {
    if (!initialClient) return;
    setBasic((prev) => {
      if (!prev.id || prev.id !== initialClient.id || Object.keys(prev).length === 0) {
        return { ...initialClient, password: '' };
      }
      return prev;
    });
    setRadar((prev) => (!prev || Object.keys(prev || {}).length === 0 ? initialClient.radar ?? {} : prev));
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
      }
      const payload: Record<string, any> = {
        ...basic,
        radar,
        agencyEmail: initialClient?.agencyEmail ?? session?.email,
        id: initialClient?.id,
      };
      if (!payload.password) {
        delete payload.password;
      }
      setSubmitting(true);
      setSubmitError('');
      try {
        await upsertClient(payload);
        onSaved?.();
        router.push('/clients');
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
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mb: 2 }}>
        {submitError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {submitError}
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 900 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Athlete</Typography>
                <Typography>Email: {basic.email || '-'}</Typography>
                <Typography>Name: {[basic.firstName, basic.lastName].filter(Boolean).join(' ') || '-'}</Typography>
                <Typography>Sport: {basic.sport ? formatSportLabel(basic.sport) : '-'}</Typography>
              </Box>
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
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2" color="text.secondary">About</Typography>
                <Typography>{radar.description || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Social</Typography>
                <Typography>Instagram: {radar.instagramProfileUrl || '-'}</Typography>
                <Typography>TikTok: {radar.tiktokProfileUrl || '-'}</Typography>
                <Typography>Twitter: {radar.twitterUrl || '-'}</Typography>
                <Typography>Facebook: {radar.facebookUrl || '-'}</Typography>
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
                <Typography variant="subtitle2" color="text.secondary">Events & Metrics</Typography>
                <Typography>Event: {radar.eventName || '-'}</Typography>
                <Typography>Metric 1: {radar.athleteMetricsTitleOne || '-'} {radar.athleteMetricsValueOne ? `- ${radar.athleteMetricsValueOne}` : ''}</Typography>
                <Typography>Metric 2: {radar.athleteMetricsTitleTwo || '-'} {radar.athleteMetricsValueTwo ? `- ${radar.athleteMetricsValueTwo}` : ''}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Motivation & References</Typography>
                <Typography>Favorite Motivational Quote: {radar.myMotivator || '-'}</Typography>
                <Typography>Advice: {radar.athleteAdvice || '-'}</Typography>
                <Typography>Reference 1: {radar.referenceOneName || '-'}</Typography>
                <Typography>Ref 1 Email: {radar.referenceOneEmail || '-'}</Typography>
                <Typography>Ref 1 Phone: {radar.referenceOnePhone || '-'}</Typography>
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


