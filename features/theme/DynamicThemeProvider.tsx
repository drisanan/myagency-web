'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSession } from '@/features/auth/session';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

// Default color palette — 3-color sporty system (black / lime / white)
const defaults = {
  primaryColor: colors.black,
  secondaryColor: colors.lime,
  buttonText: colors.black,
  textPrimary: colors.black,
  textSecondary: '#0A0A0A99',
  linkColor: colors.lime,
  contentBg: colors.contentBg,
  cardBg: colors.white,
  navText: '#FFFFFF80',
  navActiveText: colors.black,
  navHoverBg: 'rgba(255,255,255,0.08)',
  successColor: colors.lime,
  warningColor: colors.warning,
  errorColor: colors.error,
  infoColor: colors.lime,
  borderColor: '#E0E0E0',
  dividerColor: '#E0E0E0',
};

type AgencySettings = Partial<typeof defaults> & { logoDataUrl?: string };

function normalizeHex(value: string): string {
  if (!value || value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.startsWith('color')) return value;
  if (/^[0-9a-fA-F]{3,8}$/.test(value)) return `#${value}`;
  return value;
}

function normalizeColors<T extends Record<string, string>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out) as Array<keyof T>) {
    if (typeof out[key] === 'string' && (key as string).toLowerCase().includes('color') || key === 'buttonText') {
      (out as any)[key] = normalizeHex(out[key] as string);
    }
  }
  return out;
}

function buildTheme(settings: AgencySettings) {
  const s = normalizeColors({ ...defaults, ...settings });
  
  return createTheme({
    palette: {
      primary: { 
        main: s.secondaryColor, 
        contrastText: s.buttonText,
      },
      secondary: { 
        main: s.primaryColor,
        contrastText: contrastText(s.primaryColor),
      },
      success: {
        main: s.successColor,
        contrastText: contrastText(s.successColor),
      },
      warning: {
        main: s.warningColor,
        contrastText: contrastText(s.warningColor),
      },
      error: {
        main: s.errorColor,
        contrastText: contrastText(s.errorColor),
      },
      info: {
        main: s.infoColor,
        contrastText: contrastText(s.infoColor),
      },
      text: {
        primary: s.textPrimary,
        secondary: s.textSecondary,
      },
      background: {
        default: s.contentBg,
        paper: s.cardBg,
      },
      divider: s.dividerColor,
    },
    typography,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            position: 'relative' as const,
            // Nike angular clip-path — sliced corner
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          sizeSmall: {
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          },
          sizeLarge: {
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
            fontSize: '1rem',
            padding: '12px 28px',
          },
          // ── Brand bg / contrast text (default)
          containedPrimary: {
            background: `linear-gradient(135deg, ${s.secondaryColor} 0%, ${adjustBrightness(s.secondaryColor, -10)} 60%, ${adjustBrightness(s.secondaryColor, -20)} 100%)`,
            color: s.buttonText,
            boxShadow: 'none',
            '&:hover': {
              background: `linear-gradient(135deg, ${adjustBrightness(s.secondaryColor, 8)} 0%, ${adjustBrightness(s.secondaryColor, -5)} 100%)`,
              boxShadow: `0 4px 20px ${s.secondaryColor}40`,
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          // ── Background bg / brand text (invert)
          containedSecondary: {
            background: s.primaryColor,
            color: s.secondaryColor,
            boxShadow: 'none',
            '&:hover': {
              background: adjustBrightness(s.primaryColor, 10),
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transform: 'translateY(-1px)',
            },
          },
          // All semantic variants → background bg / brand text
          containedSuccess: {
            background: s.primaryColor,
            color: s.secondaryColor,
            '&:hover': { background: adjustBrightness(s.primaryColor, 10), transform: 'translateY(-1px)' },
          },
          containedWarning: {
            background: s.primaryColor,
            color: s.secondaryColor,
            '&:hover': { background: adjustBrightness(s.primaryColor, 10), transform: 'translateY(-1px)' },
          },
          containedError: {
            background: s.primaryColor,
            color: s.secondaryColor,
            '&:hover': { background: adjustBrightness(s.primaryColor, 10), transform: 'translateY(-1px)' },
          },
          containedInfo: {
            background: s.primaryColor,
            color: s.secondaryColor,
            '&:hover': { background: adjustBrightness(s.primaryColor, 10), transform: 'translateY(-1px)' },
          },
          // ── Outlined → primary border / primary text
          outlinedPrimary: {
            borderColor: s.textPrimary,
            color: s.textPrimary,
            borderWidth: 2,
            '&:hover': {
              borderColor: s.textPrimary,
              backgroundColor: `${s.textPrimary}0A`,
              borderWidth: 2,
            },
          },
          outlinedSecondary: {
            borderColor: s.secondaryColor,
            color: s.secondaryColor,
            borderWidth: 2,
            '&:hover': {
              borderColor: s.secondaryColor,
              backgroundColor: `${s.secondaryColor}14`,
              borderWidth: 2,
            },
          },
          // ── Text
          textPrimary: {
            color: s.textPrimary,
            clipPath: 'none',
          },
          textSecondary: {
            color: s.textPrimary,
            clipPath: 'none',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: s.secondaryColor,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            '&.Mui-selected': { color: s.secondaryColor },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { 
              backgroundColor: `${s.secondaryColor}1F`,
              color: s.navActiveText,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            fontWeight: 600,
            letterSpacing: '0.03em',
          },
          colorPrimary: {
            background: `linear-gradient(135deg, ${s.secondaryColor} 0%, ${adjustBrightness(s.secondaryColor, -15)} 100%)`,
            color: s.buttonText,
          },
          colorSuccess: {
            background: `linear-gradient(135deg, ${s.successColor} 0%, ${adjustBrightness(s.successColor, -15)} 100%)`,
          },
          colorWarning: {
            background: `linear-gradient(135deg, ${s.warningColor} 0%, ${adjustBrightness(s.warningColor, -15)} 100%)`,
          },
          colorError: {
            background: `linear-gradient(135deg, ${s.errorColor} 0%, ${adjustBrightness(s.errorColor, -15)} 100%)`,
          },
          colorInfo: {
            background: `linear-gradient(135deg, ${s.infoColor} 0%, ${adjustBrightness(s.infoColor, -15)} 100%)`,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          colorPrimary: {
            color: s.secondaryColor,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
          colorPrimary: {
            backgroundColor: `${s.secondaryColor}33`,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(135deg, ${s.secondaryColor} 0%, ${adjustBrightness(s.secondaryColor, -10)} 60%, ${adjustBrightness(s.secondaryColor, -20)} 100%)`,
              borderRadius: 0,
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: s.linkColor,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ ownerState }: { ownerState: any }) => {
            // Popup Papers (Menu, Popover, Select dropdown) use elevation >= 8.
            // Layout Papers use elevation 0-1 or variant="outlined".
            // Only apply angular clipPath + accent bar to layout Papers.
            const isPopup = ownerState.variant !== 'outlined' && (ownerState.elevation ?? 0) >= 8;

            return {
              backgroundColor: s.cardBg,
              borderRadius: 0,
              position: 'relative' as const,
              transition: 'box-shadow 0.25s ease, transform 0.2s ease',
              '&:hover': {
                boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${s.secondaryColor}06`,
              },
              ...(isPopup
                ? {
                    // Popup Paper: no clipPath, scrollable, no accent bar
                    clipPath: 'none',
                    overflow: 'auto',
                  }
                : {
                    // Layout Paper: angular clip-path + accent bar
                    clipPath:
                      'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: '3px',
                      background: `linear-gradient(180deg, ${s.primaryColor} 0%, ${s.primaryColor}40 100%)`,
                      zIndex: 1,
                    },
                  }),
            };
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: s.cardBg,
            borderColor: s.borderColor,
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            position: 'relative',
            transition: 'box-shadow 0.25s ease, transform 0.2s ease',
            // Dark accent bar on left
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '3px',
              background: `linear-gradient(180deg, ${s.primaryColor} 0%, ${s.primaryColor}40 100%)`,
              zIndex: 1,
            },
            // Subtle glow in top-right corner (inverted MetricCard style)
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '50%',
              height: '60%',
              background: `radial-gradient(ellipse, ${s.secondaryColor}06 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
            '&:hover': {
              boxShadow: `0 6px 28px rgba(0,0,0,0.08), 0 0 20px ${s.secondaryColor}08`,
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: s.dividerColor,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: s.secondaryColor,
            },
          },
          notchedOutline: {
            borderColor: s.borderColor,
            borderRadius: 0,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': {
              color: s.secondaryColor,
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            '&.Mui-checked': {
              color: s.secondaryColor,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            '&.Mui-checked': {
              color: s.secondaryColor,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: s.secondaryColor,
              '& + .MuiSwitch-track': {
                backgroundColor: s.secondaryColor,
              },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          },
          standardSuccess: {
            backgroundColor: `${s.successColor}1A`,
            color: s.successColor,
            '& .MuiAlert-icon': { color: s.successColor },
          },
          standardWarning: {
            backgroundColor: `${s.warningColor}1A`,
            color: s.warningColor,
            '& .MuiAlert-icon': { color: s.warningColor },
          },
          standardError: {
            backgroundColor: `${s.errorColor}1A`,
            color: s.errorColor,
            '& .MuiAlert-icon': { color: s.errorColor },
          },
          standardInfo: {
            backgroundColor: `${s.infoColor}1A`,
            color: s.infoColor,
            '& .MuiAlert-icon': { color: s.infoColor },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              background: `linear-gradient(135deg, ${s.primaryColor} 0%, ${adjustBrightness(s.primaryColor, 5)} 50%, ${s.primaryColor} 100%)`,
              color: contrastText(s.primaryColor),
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.75rem',
            },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            '&.Mui-active': {
              color: s.secondaryColor,
            },
            '&.Mui-completed': {
              color: s.successColor,
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          primary: {
            background: `linear-gradient(135deg, ${s.secondaryColor} 0%, ${adjustBrightness(s.secondaryColor, -10)} 60%, ${adjustBrightness(s.secondaryColor, -20)} 100%)`,
            color: s.buttonText,
            boxShadow: `0 4px 16px ${s.secondaryColor}30`,
            '&:hover': {
              background: `linear-gradient(135deg, ${adjustBrightness(s.secondaryColor, 5)} 0%, ${adjustBrightness(s.secondaryColor, -10)} 100%)`,
              boxShadow: `0 6px 24px ${s.secondaryColor}50`,
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: s.secondaryColor,
            color: s.buttonText,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            '&.Mui-selected': {
              backgroundColor: `${s.secondaryColor}33`,
              color: s.secondaryColor,
              '&:hover': {
                backgroundColor: `${s.secondaryColor}4D`,
              },
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            clipPath: 'none',
            overflow: 'auto',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            clipPath: 'none',
            overflow: 'auto',
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: '0 !important',
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            '&::before': { display: 'none' },
          },
        },
      },
    },
  });
}

// Determine if a hex color is dark (needs light text on top)
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

// Adjust hex color brightness by percentage
function adjustBrightness(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(2.55 * percent)));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

type Props = {
  children: React.ReactNode;
};

export function DynamicThemeProvider({ children }: Props) {
  const { session } = useSession();
  
  const agencySettings = session?.agencySettings || {};
  
  const theme = React.useMemo(() => buildTheme(agencySettings), [
    agencySettings?.primaryColor,
    agencySettings?.secondaryColor,
    agencySettings?.buttonText,
    agencySettings?.textPrimary,
    agencySettings?.textSecondary,
    agencySettings?.linkColor,
    agencySettings?.contentBg,
    agencySettings?.cardBg,
    agencySettings?.successColor,
    agencySettings?.warningColor,
    agencySettings?.errorColor,
    agencySettings?.infoColor,
    agencySettings?.borderColor,
    agencySettings?.dividerColor,
  ]);
  
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
