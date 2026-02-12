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
import { SubscriptionQuota } from '@/features/settings/SubscriptionQuota';
import { colors as themeColors } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';

// Default 3-color system
const defaults = {
  primaryColor: themeColors.black,
  secondaryColor: themeColors.lime,
  buttonText: themeColors.black,
  textPrimary: themeColors.black,
  textSecondary: '#0A0A0A99',
  linkColor: themeColors.lime,
  contentBg: themeColors.contentBg,
  cardBg: themeColors.white,
  headerBg: themeColors.headerBg,
  navText: '#FFFFFF80',
  navActiveText: themeColors.black,
  navHoverBg: 'rgba(255,255,255,0.08)',
  successColor: themeColors.lime,
  warningColor: themeColors.warning,
  errorColor: themeColors.error,
  infoColor: themeColors.lime,
  borderColor: '#E0E0E0',
  dividerColor: '#E0E0E0',
};

type ColorKey = keyof typeof defaults;

// Helper to determine if a hex color is dark (needs light text)
function isDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function contrastText(hex: string): string {
  return isDark(hex) ? '#FFFFFF' : '#0A0A0A';
}

// Derive all other values from 3 inputs
function deriveColors(brand: string, background: string, base: string) {
  const textPrimary = isDark(background) ? '#FFFFFF' : '#0A0A0A';
  return {
    primaryColor: background,
    secondaryColor: brand,
    buttonText: contrastText(brand),
    textPrimary,
    textSecondary: `${textPrimary}99`,
    linkColor: brand,
    contentBg: isDark(base) ? '#1A1A1A' : '#F5F5F5',
    cardBg: base,
    headerBg: background,
    navText: `${textPrimary}80`,
    navActiveText: contrastText(brand),
    successColor: brand,
    warningColor: '#FFB800',
    errorColor: '#FF3B3B',
    infoColor: brand,
    borderColor: isDark(base) ? '#FFFFFF20' : '#E0E0E0',
    dividerColor: isDark(base) ? '#FFFFFF20' : '#E0E0E0',
  };
}

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
          style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 0, padding: 0 }}
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
            borderRadius: 0, 
            clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
            border: '1px solid #E0E0E0',
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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function SettingsForm() {
  const { session, refreshSession } = useSession();
  const agencyEmail = session?.agencyEmail || session?.email;
  
  const [colors, setColors] = React.useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  
  // Simplified 3-picker values
  const [brandColor, setBrandColor] = React.useState(defaults.secondaryColor);
  const [bgColor, setBgColor] = React.useState(defaults.primaryColor);
  const [baseColor, setBaseColor] = React.useState(defaults.cardBg);
  
  // Agency slug state
  const [agencySlug, setAgencySlug] = React.useState('');
  const [slugError, setSlugError] = React.useState<string | null>(null);
  const [slugSuccess, setSlugSuccess] = React.useState<string | null>(null);
  const [savingSlug, setSavingSlug] = React.useState(false);
  
  // Program levels state
  type ProgramLevel = { value: string; label: string; color: string };
  const defaultProgramLevels: ProgramLevel[] = [
    { value: 'bronze', label: 'Bronze', color: '#cd7f32' },
    { value: 'silver', label: 'Silver', color: '#c0c0c0' },
    { value: 'gold', label: 'Gold', color: '#ffd700' },
    { value: 'platinum', label: 'Platinum', color: '#e5e4e2' },
  ];
  const [programLevels, setProgramLevels] = React.useState<ProgramLevel[]>(defaultProgramLevels);

  // When the 3 simplified pickers change, derive all values
  const handleBrandChange = (v: string) => {
    setBrandColor(v);
    const derived = deriveColors(v, bgColor, baseColor);
    setColors(derived);
  };
  const handleBgChange = (v: string) => {
    setBgColor(v);
    const derived = deriveColors(brandColor, v, baseColor);
    setColors(derived);
  };
  const handleBaseChange = (v: string) => {
    setBaseColor(v);
    const derived = deriveColors(brandColor, bgColor, v);
    setColors(derived);
  };

  const updateColor = (key: ColorKey, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };
  
  const saveSlug = async () => {
    if (!agencySlug.trim()) return;
    setSavingSlug(true);
    setSlugError(null);
    setSlugSuccess(null);
    
    try {
      const res = await fetch(`${API_BASE}/agencies/slug`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug: agencySlug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSlugSuccess(`Agency name set to "${data.slug}". Agents can now use this to log in!`);
    } catch (e: any) {
      setSlugError(e?.message || 'Failed to save agency name');
    } finally {
      setSavingSlug(false);
    }
  };

  // Load current settings
  React.useEffect(() => {
    if (!agencyEmail) return;
    
    getAgencySettings(agencyEmail)
      .then((settings) => {
        if (settings) {
          const loaded: Record<string, string> = {};
          Object.keys(defaults).forEach(key => {
            if (settings[key]) loaded[key] = settings[key];
          });
          setColors(loaded);
          // Sync the 3 simple pickers
          if (settings.secondaryColor) setBrandColor(settings.secondaryColor);
          if (settings.primaryColor) setBgColor(settings.primaryColor);
          if (settings.cardBg) setBaseColor(settings.cardBg);
          if (settings.logoDataUrl) setLogoPreview(settings.logoDataUrl);
          if (settings.slug) setAgencySlug(settings.slug);
          if (settings.programLevels?.length) {
            setProgramLevels(settings.programLevels);
          }
        }
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, [agencyEmail]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 16 * 1024 * 1024) {
      setError('Logo must be under 16MB');
      return;
    }
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!agencyEmail) return;
    
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
      
      await updateAgencySettings(agencyEmail, {
        ...colors,
        logoDataUrl: logoDataUrl || undefined,
        programLevels: programLevels,
      });
      
      await refreshSession();
      setSuccess('Settings saved successfully!');
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetAllColors = () => {
    setColors({});
    setBrandColor(defaults.secondaryColor);
    setBgColor(defaults.primaryColor);
    setBaseColor(defaults.cardBg);
  };

  if (initialLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <Stack spacing={3}>
      {/* Subscription Status */}
      <Box>
        <Typography variant="h6" gutterBottom>Subscription</Typography>
        <SubscriptionQuota showUpgradeButton />
      </Box>

      <Divider />

      {/* Agency Name / Slug Section */}
      <Box>
        <Typography variant="h6" gutterBottom>Agency Name (for Agent Login)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set a friendly name for your agency. Agents will use this instead of the UUID to log in.
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            label="Agency Name"
            value={agencySlug}
            onChange={(e) => setAgencySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="e.g., myrecruiteragency"
            size="small"
            helperText="Letters, numbers, and hyphens only (3-50 chars)"
            sx={{ minWidth: 280 }}
          />
          <Button
            variant="contained"
            onClick={saveSlug}
            disabled={savingSlug || !agencySlug.trim() || agencySlug.length < 3}
          >
            {savingSlug ? 'Saving...' : 'Save Name'}
          </Button>
        </Stack>
        
        {slugError && <Alert severity="error" sx={{ mt: 1 }}>{slugError}</Alert>}
        {slugSuccess && <Alert severity="success" sx={{ mt: 1 }}>{slugSuccess}</Alert>}
        
        {session?.agencyId && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Fallback ID (can also be used): <code style={{ background: '#0A0A0A08', padding: '2px 6px', borderRadius: 0 }}>{session.agencyId}</code>
          </Typography>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>White-Label Branding</Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your agency's appearance with 3 simple colors. All other colors are auto-derived.
        </Typography>
      </Box>

      {/* Logo Section */}
      <Box sx={{ p: 2, bgcolor: '#0A0A0A08', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Agency Logo</Typography>
        <Stack spacing={2}>
          {logoPreview && (
            <Box sx={{ p: 2, bgcolor: colors.primaryColor || defaults.primaryColor, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', display: 'inline-block', maxWidth: 'fit-content' }}>
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

      {/* Simplified 3-color pickers */}
      <Box sx={{ p: 2, borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))', border: '1px solid #E0E0E0' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Brand Colors</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pick 3 colors. Everything else is automatically calculated.
        </Typography>
        <Stack spacing={2.5}>
          <ColorPicker 
            label="Brand Color (Buttons, Accents, Active States)" 
            value={brandColor} 
            onChange={handleBrandChange}
            defaultValue={defaults.secondaryColor}
          />
          <ColorPicker 
            label="Background Color (Sidebar, Header)" 
            value={bgColor} 
            onChange={handleBgChange}
            defaultValue={defaults.primaryColor}
          />
          <ColorPicker 
            label="Base Color (Cards, Content Panels)" 
            value={baseColor} 
            onChange={handleBaseChange}
            defaultValue={defaults.cardBg}
          />
        </Stack>
      </Box>

      {/* Advanced Color Overrides */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Advanced Color Overrides</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Override individually-derived values if needed. Most users won't need this.
          </Typography>
          <Stack spacing={2}>
            <ColorPicker label="Text Primary" value={colors.textPrimary || ''} onChange={(v) => updateColor('textPrimary', v)} defaultValue={defaults.textPrimary} />
            <ColorPicker label="Text Secondary" value={colors.textSecondary || ''} onChange={(v) => updateColor('textSecondary', v)} defaultValue={defaults.textSecondary} />
            <ColorPicker label="Link Color" value={colors.linkColor || ''} onChange={(v) => updateColor('linkColor', v)} defaultValue={defaults.linkColor} />
            <ColorPicker label="Content Background" value={colors.contentBg || ''} onChange={(v) => updateColor('contentBg', v)} defaultValue={defaults.contentBg} />
            <ColorPicker label="Header Background" value={colors.headerBg || ''} onChange={(v) => updateColor('headerBg', v)} defaultValue={defaults.headerBg} />
            <ColorPicker label="Nav Text" value={colors.navText || ''} onChange={(v) => updateColor('navText', v)} defaultValue={defaults.navText} />
            <ColorPicker label="Nav Active Text" value={colors.navActiveText || ''} onChange={(v) => updateColor('navActiveText', v)} defaultValue={defaults.navActiveText} />
            <ColorPicker label="Success Color" value={colors.successColor || ''} onChange={(v) => updateColor('successColor', v)} defaultValue={defaults.successColor} />
            <ColorPicker label="Warning Color" value={colors.warningColor || ''} onChange={(v) => updateColor('warningColor', v)} defaultValue={defaults.warningColor} />
            <ColorPicker label="Error Color" value={colors.errorColor || ''} onChange={(v) => updateColor('errorColor', v)} defaultValue={defaults.errorColor} />
            <ColorPicker label="Info Color" value={colors.infoColor || ''} onChange={(v) => updateColor('infoColor', v)} defaultValue={defaults.infoColor} />
            <ColorPicker label="Border Color" value={colors.borderColor || ''} onChange={(v) => updateColor('borderColor', v)} defaultValue={defaults.borderColor} />
            <ColorPicker label="Divider Color" value={colors.dividerColor || ''} onChange={(v) => updateColor('dividerColor', v)} defaultValue={defaults.dividerColor} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Program Levels */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Program Levels</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customize the service tier names and colors for your athletes. These appear when managing athlete accounts.
          </Typography>
          <Stack spacing={2}>
            {programLevels.map((level, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label={`Level ${index + 1} Name`}
                  value={level.label}
                  onChange={(e) => {
                    const updated = [...programLevels];
                    updated[index] = { ...level, label: e.target.value };
                    setProgramLevels(updated);
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Key"
                  value={level.value}
                  onChange={(e) => {
                    const updated = [...programLevels];
                    updated[index] = { ...level, value: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') };
                    setProgramLevels(updated);
                  }}
                  sx={{ width: 100 }}
                  helperText="Internal ID"
                />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Color
                  </Typography>
                  <input
                    type="color"
                    value={level.color}
                    onChange={(e) => {
                      const updated = [...programLevels];
                      updated[index] = { ...level, color: e.target.value };
                      setProgramLevels(updated);
                    }}
                    style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 0 }}
                  />
                </Box>
                {programLevels.length > 1 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setProgramLevels(prev => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            ))}
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProgramLevels(prev => [...prev, { value: `tier${prev.length + 1}`, label: `Tier ${prev.length + 1}`, color: '#0A0A0A60' }])}
              >
                Add Level
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => setProgramLevels(defaultProgramLevels)}
              >
                Reset to Defaults
              </Button>
            </Stack>
          </Stack>
          
          {/* Preview */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#0A0A0A08', borderRadius: 0, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Preview:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {programLevels.map(level => (
                <Box
                  key={level.value}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    bgcolor: level.color,
                    color: isDark(level.color) ? '#fff' : '#000',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {level.label}
                </Box>
              ))}
            </Stack>
          </Box>
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
            borderRadius: 0, 
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            border: `1px solid ${colors.borderColor || defaults.borderColor}`,
            bgcolor: colors.contentBg || defaults.contentBg,
          }}
        >
          <Stack spacing={2}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: colors.primaryColor || defaults.primaryColor, 
                borderRadius: 0,
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                color: contrastText(colors.primaryColor || defaults.primaryColor),
              }}
            >
              <Typography variant="body2">Sidebar / Header Preview</Typography>
            </Box>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: colors.cardBg || defaults.cardBg, 
                borderRadius: 0,
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
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
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.successColor || defaults.successColor, borderRadius: 1, color: contrastText(colors.successColor || defaults.successColor), fontSize: 12 }}>
                Success
              </Box>
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.warningColor || defaults.warningColor, borderRadius: 1, color: '#fff', fontSize: 12 }}>
                Warning
              </Box>
              <Box sx={{ px: 1, py: 0.5, bgcolor: colors.errorColor || defaults.errorColor, borderRadius: 1, color: '#fff', fontSize: 12 }}>
                Error
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
