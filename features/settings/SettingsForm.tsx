'use client';

import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import { useSession } from '@/features/auth/session';
import { updateAgencySettings, getAgencySettings } from '@/services/agencies';

// Default color palette
const defaults = {
  // Core
  primaryColor: '#14151E',
  secondaryColor: '#AAFB00',
  buttonText: '#14151E',
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  linkColor: '#3B82F6',
  // Backgrounds
  contentBg: '#F9FAFB',
  cardBg: '#FFFFFF',
  // Navigation
  navText: '#999DAA',
  navActiveText: '#14151E',
  navHoverBg: 'rgba(255,255,255,0.08)',
  // Status Colors
  successColor: '#10B981',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  infoColor: '#3B82F6',
  // Borders
  borderColor: '#E5E7EB',
  dividerColor: '#E5E7EB',
};

type ColorKey = keyof typeof defaults;

function ColorPicker({ 
  label, 
  value, 
  onChange, 
  defaultValue 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  defaultValue: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <input
          type="color"
          value={value || defaultValue}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4, padding: 0 }}
        />
        <TextField
          size="small"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultValue}
          sx={{ width: 100 }}
          inputProps={{ style: { fontSize: 12 } }}
        />
        <Box 
          sx={{ 
            width: 36, 
            height: 36, 
            bgcolor: value || defaultValue, 
            borderRadius: 1, 
            border: '1px solid #ddd',
            flexShrink: 0,
          }} 
        />
        {value && value !== defaultValue && (
          <Button 
            size="small" 
            onClick={() => onChange('')}
            sx={{ minWidth: 'auto', fontSize: 11 }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export function SettingsForm() {
  const { session, refreshSession } = useSession();
  
  const [colors, setColors] = React.useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const updateColor = (key: ColorKey, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  // Load current settings
  React.useEffect(() => {
    if (!session?.agencyEmail) return;
    
    getAgencySettings(session.agencyEmail)
      .then((settings) => {
        if (settings) {
          const loaded: Record<string, string> = {};
          Object.keys(defaults).forEach(key => {
            if (settings[key]) loaded[key] = settings[key];
          });
          setColors(loaded);
          if (settings.logoDataUrl) setLogoPreview(settings.logoDataUrl);
        }
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
      
      let logoDataUrl = logoPreview;
      if (logoFile) {
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoFile);
        });
      }
      
      await updateAgencySettings(session.agencyEmail, {
        ...colors,
        logoDataUrl: logoDataUrl || undefined,
      });
      
      setSuccess('Settings saved! Changes will apply immediately.');
      await refreshSession();
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetAllColors = () => {
    setColors({});
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>White-Label Branding</Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your agency's appearance. These settings apply to your portal and your clients' portals.
        </Typography>
      </Box>

      {/* Logo Section */}
      <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Agency Logo</Typography>
        <Stack spacing={2}>
          {logoPreview && (
            <Box sx={{ p: 2, bgcolor: colors.primaryColor || defaults.primaryColor, borderRadius: 1, display: 'inline-block', maxWidth: 'fit-content' }}>
              <img src={logoPreview} alt="Logo preview" style={{ maxHeight: 48, maxWidth: 200 }} />
            </Box>
          )}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="outlined" component="label" size="small">
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
              <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
            </Button>
            {logoPreview && (
              <Button size="small" color="error" onClick={() => { setLogoPreview(null); setLogoFile(null); }}>
                Remove
              </Button>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            PNG or SVG recommended, max 500KB. Will appear on sidebar and client portals.
          </Typography>
        </Stack>
      </Box>

      {/* Core Colors */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Core Colors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ColorPicker 
              label="Primary Color (Sidebar / Header)" 
              value={colors.primaryColor || ''} 
              onChange={(v) => updateColor('primaryColor', v)}
              defaultValue={defaults.primaryColor}
            />
            <ColorPicker 
              label="Secondary Color (Buttons / Accents)" 
              value={colors.secondaryColor || ''} 
              onChange={(v) => updateColor('secondaryColor', v)}
              defaultValue={defaults.secondaryColor}
            />
            <ColorPicker 
              label="Button Text Color" 
              value={colors.buttonText || ''} 
              onChange={(v) => updateColor('buttonText', v)}
              defaultValue={defaults.buttonText}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Text Colors */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Text Colors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ColorPicker 
              label="Primary Text" 
              value={colors.textPrimary || ''} 
              onChange={(v) => updateColor('textPrimary', v)}
              defaultValue={defaults.textPrimary}
            />
            <ColorPicker 
              label="Secondary Text (Muted)" 
              value={colors.textSecondary || ''} 
              onChange={(v) => updateColor('textSecondary', v)}
              defaultValue={defaults.textSecondary}
            />
            <ColorPicker 
              label="Link Color" 
              value={colors.linkColor || ''} 
              onChange={(v) => updateColor('linkColor', v)}
              defaultValue={defaults.linkColor}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Background Colors */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Background Colors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ColorPicker 
              label="Content Background" 
              value={colors.contentBg || ''} 
              onChange={(v) => updateColor('contentBg', v)}
              defaultValue={defaults.contentBg}
            />
            <ColorPicker 
              label="Card / Panel Background" 
              value={colors.cardBg || ''} 
              onChange={(v) => updateColor('cardBg', v)}
              defaultValue={defaults.cardBg}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Navigation Colors */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Navigation Colors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ColorPicker 
              label="Nav Item Text" 
              value={colors.navText || ''} 
              onChange={(v) => updateColor('navText', v)}
              defaultValue={defaults.navText}
            />
            <ColorPicker 
              label="Nav Active Item Text" 
              value={colors.navActiveText || ''} 
              onChange={(v) => updateColor('navActiveText', v)}
              defaultValue={defaults.navActiveText}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Status Colors */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Status Colors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ColorPicker 
              label="Success (Green)" 
              value={colors.successColor || ''} 
              onChange={(v) => updateColor('successColor', v)}
              defaultValue={defaults.successColor}
            />
            <ColorPicker 
              label="Warning (Orange)" 
              value={colors.warningColor || ''} 
              onChange={(v) => updateColor('warningColor', v)}
              defaultValue={defaults.warningColor}
            />
            <ColorPicker 
              label="Error (Red)" 
              value={colors.errorColor || ''} 
              onChange={(v) => updateColor('errorColor', v)}
              defaultValue={defaults.errorColor}
            />
            <ColorPicker 
              label="Info (Blue)" 
              value={colors.infoColor || ''} 
              onChange={(v) => updateColor('infoColor', v)}
              defaultValue={defaults.infoColor}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Borders */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Borders & Dividers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ColorPicker 
              label="Border Color" 
              value={colors.borderColor || ''} 
              onChange={(v) => updateColor('borderColor', v)}
              defaultValue={defaults.borderColor}
            />
            <ColorPicker 
              label="Divider Color" 
              value={colors.dividerColor || ''} 
              onChange={(v) => updateColor('dividerColor', v)}
              defaultValue={defaults.dividerColor}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outlined" onClick={resetAllColors} disabled={loading}>
          Reset to Defaults
        </Button>
      </Stack>

      {/* Live Preview */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Live Preview</Typography>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            border: `1px solid ${colors.borderColor || defaults.borderColor}`,
            bgcolor: colors.contentBg || defaults.contentBg,
          }}
        >
          <Stack spacing={2}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: colors.primaryColor || defaults.primaryColor, 
                borderRadius: 1,
                color: '#fff',
              }}
            >
              <Typography variant="body2">Sidebar / Header Preview</Typography>
            </Box>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: colors.cardBg || defaults.cardBg, 
                borderRadius: 1,
                border: `1px solid ${colors.borderColor || defaults.borderColor}`,
              }}
            >
              <Typography sx={{ color: colors.textPrimary || defaults.textPrimary }}>
                Primary Text Example
              </Typography>
              <Typography sx={{ color: colors.textSecondary || defaults.textSecondary }}>
                Secondary text example
              </Typography>
              <Typography 
                component="a" 
                href="#" 
                sx={{ color: colors.linkColor || defaults.linkColor, textDecoration: 'underline' }}
              >
                Link example
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button 
                variant="contained" 
                size="small"
                sx={{ 
                  bgcolor: colors.secondaryColor || defaults.secondaryColor,
                  color: colors.buttonText || defaults.buttonText,
                  '&:hover': { bgcolor: colors.secondaryColor || defaults.secondaryColor },
                }}
              >
                Action Button
      </Button>
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.successColor || defaults.successColor, borderRadius: 1, color: '#fff', fontSize: 12 }}>
                Success
              </Box>
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.warningColor || defaults.warningColor, borderRadius: 1, color: '#fff', fontSize: 12 }}>
                Warning
              </Box>
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.errorColor || defaults.errorColor, borderRadius: 1, color: '#fff', fontSize: 12 }}>
                Error
              </Box>
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.infoColor || defaults.infoColor, borderRadius: 1, color: '#fff', fontSize: 12 }}>
                Info
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
