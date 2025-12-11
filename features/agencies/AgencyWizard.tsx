'use client';
import React from 'react';
import { Box, Button, Step, StepLabel, Stepper, TextField, Typography, Switch, FormControlLabel, AppBar, Toolbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { upsertAgency } from '@/services/agencies';
import { useRouter } from 'next/navigation';

const steps = ['Basic Info', 'Owner Info', 'System Settings', 'Review'];

function BasicInfoStep({ value, onChange }: { value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 700 }}>
      <TextField inputProps={{ 'data-testid': 'agency-email' }} label="Agency Email" value={value.email ?? ''} onChange={(e)=>set('email', e.target.value)} />
      <TextField inputProps={{ 'data-testid': 'agency-password' }} label="Agency Password" type="password" value={value.password ?? ''} onChange={(e)=>set('password', e.target.value)} />
      <TextField inputProps={{ 'data-testid': 'agency-name' }} label="Agency Name" value={value.name ?? ''} onChange={(e)=>set('name', e.target.value)} sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }} />
    </Box>
  );
}

function OwnerInfoStep({ value, onChange }: { value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const ownerName = [value.ownerFirstName, value.ownerLastName].filter(Boolean).join(' ');
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 700 }}>
      <TextField inputProps={{ 'data-testid': 'owner-first' }} label="Owner first name" value={value.ownerFirstName ?? ''} onChange={(e)=>set('ownerFirstName', e.target.value)} />
      <TextField inputProps={{ 'data-testid': 'owner-last' }} label="Owner last name" value={value.ownerLastName ?? ''} onChange={(e)=>set('ownerLastName', e.target.value)} />
      <TextField inputProps={{ 'data-testid': 'owner-email' }} label="Owner email" value={value.ownerEmail ?? ''} onChange={(e)=>set('ownerEmail', e.target.value)} />
      <TextField inputProps={{ 'data-testid': 'owner-phone' }} label="Owner phone number" value={value.ownerPhone ?? ''} onChange={(e)=>set('ownerPhone', e.target.value)} />
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography variant="body2" color="text.secondary">Owner name: {ownerName || '-'}</Typography>
      </Box>
    </Box>
  );
}

function SystemSettingsStep({ value, onChange }: { value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const [previewTheme] = React.useState(() =>
    createTheme({
      palette: {
        primary: { main: value.settings?.primaryColor || '#1976d2' },
        secondary: { main: value.settings?.secondaryColor || '#9c27b0' },
      },
    })
  );
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: value.settings?.primaryColor || '#1976d2' },
          secondary: { main: value.settings?.secondaryColor || '#9c27b0' },
        },
      }),
    [value.settings?.primaryColor, value.settings?.secondaryColor]
  );
  const handleLogo = (file?: File | null) => {
    if (!file) {
      set('settings', { ...(value.settings ?? {}), logoDataUrl: '' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('settings', { ...(value.settings ?? {}), logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 800 }}>
      <ThemeProvider theme={theme}>
        <AppBar position="static" color="primary" data-testid="theme-preview-appbar">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>Back Office Preview</Typography>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="primary" sx={{ ml: 1 }}>Primary</Button>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography variant="body2" data-testid="theme-color-preview">
          Current color: {value.settings?.primaryColor || '#1976d2'}
        </Typography>
        <Typography variant="body2" data-testid="theme-secondary-color-preview">
          Current secondary color: {value.settings?.secondaryColor || '#9c27b0'}
        </Typography>
      </Box>
      <TextField
        label="Agency color"
        type="color"
        value={value.settings?.primaryColor || '#1976d2'}
        onChange={(e)=> set('settings', { ...(value.settings ?? {}), primaryColor: e.target.value })}
        sx={{ width: 200 }}
      />
      <TextField
        label="Secondary color"
        type="color"
        value={value.settings?.secondaryColor || '#9c27b0'}
        onChange={(e)=> set('settings', { ...(value.settings ?? {}), secondaryColor: e.target.value })}
        sx={{ width: 200 }}
      />
      <Box>
        <Button variant="outlined" component="label">
          Upload Agency Logo
          <input type="file" hidden accept="image/*" onChange={(e)=>handleLogo(e.target.files?.[0] ?? null)} />
        </Button>
        {value.settings?.logoDataUrl && (
          <Box sx={{ mt: 1 }}>
            <img src={value.settings.logoDataUrl} alt="Logo preview" style={{ maxHeight: 64 }} />
          </Box>
        )}
      </Box>
      <FormControlLabel
        control={<Switch checked={Boolean(value.active ?? true)} onChange={(e)=>onChange({ ...value, active: e.target.checked })} />}
        label="Active"
      />
    </Box>
  );
}

export function AgencyWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [form, setForm] = React.useState<Record<string, any>>({ settings: { primaryColor: '#1976d2' } });
  const isLast = activeStep === steps.length - 1;

  const handleNext = async () => {
    if (isLast) {
      const { id } = await upsertAgency(form as any);
      router.push('/agencies');
      return;
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
        {activeStep === 0 && <BasicInfoStep value={form} onChange={setForm} />}
        {activeStep === 1 && <OwnerInfoStep value={form} onChange={setForm} />}
        {activeStep === 2 && <SystemSettingsStep value={form} onChange={setForm} />}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Review</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 800 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Agency</Typography>
                <Typography>Name: {form.name || '-'}</Typography>
                <Typography>Email: {form.email || '-'}</Typography>
                <Typography>Active: {String(form.active ?? true)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Owner</Typography>
                <Typography>First: {form.ownerFirstName || '-'}</Typography>
                <Typography>Last: {form.ownerLastName || '-'}</Typography>
                <Typography>Email: {form.ownerEmail || '-'}</Typography>
                <Typography>Phone: {form.ownerPhone || '-'}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2" color="text.secondary">Brand</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '4px', bgcolor: form.settings?.primaryColor || '#1976d2', border: '1px solid #ccc' }} />
                    <Typography>Primary: {form.settings?.primaryColor || '#1976d2'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '4px', bgcolor: form.settings?.secondaryColor || '#9c27b0', border: '1px solid #ccc' }} />
                    <Typography>Secondary: {form.settings?.secondaryColor || '#9c27b0'}</Typography>
                  </Box>
                </Box>
                {form.settings?.logoDataUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ mb: 1 }}>Logo preview:</Typography>
                    <img src={form.settings.logoDataUrl} alt="Logo preview" style={{ maxHeight: 64 }} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        <Button data-testid="agency-save" variant="contained" onClick={handleNext}>{isLast ? 'Create Agency' : 'Next'}</Button>
      </Box>
    </Box>
  );
}


