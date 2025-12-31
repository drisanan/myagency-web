'use client';

import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSession } from '@/features/auth/session';
import { updateAgencySettings, getAgencySettings } from '@/services/agencies';

export function SettingsForm() {
  const { session, refreshSession } = useSession();
  
  const [primaryColor, setPrimaryColor] = React.useState('#14151E');
  const [secondaryColor, setSecondaryColor] = React.useState('#AAFB00');
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // Load current settings
  React.useEffect(() => {
    if (!session?.agencyEmail) return;
    
    getAgencySettings(session.agencyEmail)
      .then((settings) => {
        if (settings?.primaryColor) setPrimaryColor(settings.primaryColor);
        if (settings?.secondaryColor) setSecondaryColor(settings.secondaryColor);
        if (settings?.logoDataUrl) setLogoPreview(settings.logoDataUrl);
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, [session?.agencyEmail]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 500 * 1024) {
      setError('Logo must be under 500KB');
      return;
    }
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!session?.agencyEmail) return;
    
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      
      // Convert logo to base64 if new file selected
      let logoDataUrl = logoPreview;
      if (logoFile) {
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoFile);
        });
      }
      
      await updateAgencySettings(session.agencyEmail, {
        primaryColor,
        secondaryColor,
        logoDataUrl: logoDataUrl || undefined,
      });
      
      setSuccess('Agency settings updated. Refresh the page to see changes.');
      await refreshSession();
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 480 }}>
      <Typography variant="body2" color="text.secondary">
        Customize your agency's branding. Primary color is used for the sidebar, secondary color for accents.
      </Typography>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>Primary Color (Sidebar)</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{ width: 48, height: 48, border: 'none', cursor: 'pointer', borderRadius: 4 }}
          />
          <TextField
            size="small"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#14151E"
            sx={{ width: 120 }}
          />
          <Box sx={{ width: 60, height: 40, bgcolor: primaryColor, borderRadius: 1, border: '1px solid #ddd' }} />
        </Stack>
      </Box>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>Secondary Color (Accents)</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            style={{ width: 48, height: 48, border: 'none', cursor: 'pointer', borderRadius: 4 }}
          />
          <TextField
            size="small"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            placeholder="#AAFB00"
            sx={{ width: 120 }}
          />
          <Box sx={{ width: 60, height: 40, bgcolor: secondaryColor, borderRadius: 1, border: '1px solid #ddd' }} />
        </Stack>
      </Box>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>Agency Logo</Typography>
        <Stack spacing={2}>
          {logoPreview && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'inline-block' }}>
              <img src={logoPreview} alt="Logo preview" style={{ maxHeight: 60, maxWidth: 200 }} />
            </Box>
          )}
          <Button variant="outlined" component="label">
            {logoPreview ? 'Change Logo' : 'Upload Logo'}
            <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
          </Button>
          <Typography variant="caption" color="text.secondary">
            Recommended: PNG or SVG, max 500KB
          </Typography>
        </Stack>
      </Box>
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <Button
        variant="contained"
        onClick={onSave}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </Stack>
  );
}
