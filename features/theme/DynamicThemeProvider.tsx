'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSession } from '@/features/auth/session';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

// Default color palette - matches SettingsForm defaults
const defaults = {
  primaryColor: '#14151E',
  secondaryColor: '#AAFB00',
  buttonText: '#14151E',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  linkColor: '#3B82F6',
  contentBg: '#F9FAFB',
  cardBg: '#FFFFFF',
  navText: '#999DAA',
  navActiveText: '#14151E',
  navHoverBg: 'rgba(255,255,255,0.08)',
  successColor: '#10B981',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  infoColor: '#3B82F6',
  borderColor: '#E5E7EB',
  dividerColor: '#E5E7EB',
};

type AgencySettings = Partial<typeof defaults> & { logoDataUrl?: string };

function buildTheme(settings: AgencySettings) {
  const s = { ...defaults, ...settings };
  
  return createTheme({
    palette: {
      primary: { 
        main: s.secondaryColor, 
        contrastText: s.buttonText,
      },
      secondary: { 
        main: s.primaryColor,
        contrastText: '#FFFFFF',
      },
      success: {
        main: s.successColor,
        contrastText: '#FFFFFF',
      },
      warning: {
        main: s.warningColor,
        contrastText: '#FFFFFF',
      },
      error: {
        main: s.errorColor,
        contrastText: '#FFFFFF',
      },
      info: {
        main: s.infoColor,
        contrastText: '#FFFFFF',
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
            borderRadius: 8,
          },
          containedPrimary: {
            backgroundColor: s.secondaryColor,
            color: s.buttonText,
            '&:hover': { 
              backgroundColor: adjustBrightness(s.secondaryColor, -10),
            },
          },
          containedSuccess: {
            backgroundColor: s.successColor,
            '&:hover': { backgroundColor: adjustBrightness(s.successColor, -10) },
          },
          containedWarning: {
            backgroundColor: s.warningColor,
            '&:hover': { backgroundColor: adjustBrightness(s.warningColor, -10) },
          },
          containedError: {
            backgroundColor: s.errorColor,
            '&:hover': { backgroundColor: adjustBrightness(s.errorColor, -10) },
          },
          containedInfo: {
            backgroundColor: s.infoColor,
            '&:hover': { backgroundColor: adjustBrightness(s.infoColor, -10) },
          },
          outlinedPrimary: {
            borderColor: s.secondaryColor,
            color: s.secondaryColor,
            '&:hover': { 
              borderColor: adjustBrightness(s.secondaryColor, -10), 
              backgroundColor: `${s.secondaryColor}14`,
            },
          },
          textPrimary: {
            color: s.secondaryColor,
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
          colorPrimary: {
            backgroundColor: s.secondaryColor,
            color: s.buttonText,
          },
          colorSuccess: {
            backgroundColor: s.successColor,
          },
          colorWarning: {
            backgroundColor: s.warningColor,
          },
          colorError: {
            backgroundColor: s.errorColor,
          },
          colorInfo: {
            backgroundColor: s.infoColor,
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
          colorPrimary: {
            backgroundColor: `${s.secondaryColor}33`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: s.secondaryColor,
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
          root: {
            backgroundColor: s.cardBg,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: s.cardBg,
            borderColor: s.borderColor,
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
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: s.secondaryColor,
            },
          },
          notchedOutline: {
            borderColor: s.borderColor,
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
              backgroundColor: s.primaryColor,
              color: '#FFFFFF',
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
            backgroundColor: s.secondaryColor,
            color: s.buttonText,
            '&:hover': {
              backgroundColor: adjustBrightness(s.secondaryColor, -10),
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
    },
  });
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
