'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSession } from '@/features/auth/session';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

function buildTheme(secondaryColor: string) {
  return createTheme({
    palette: {
      primary: { main: secondaryColor, contrastText: colors.actionText },
      secondary: { main: '#5D4AFB' },
    },
    typography,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          containedPrimary: {
            backgroundColor: secondaryColor,
            color: colors.actionText,
            '&:hover': { backgroundColor: adjustBrightness(secondaryColor, -10) },
          },
          outlinedPrimary: {
            borderColor: secondaryColor,
            color: secondaryColor,
            '&:hover': { 
              borderColor: adjustBrightness(secondaryColor, -10), 
              backgroundColor: `${secondaryColor}14` // 8% opacity
            },
          },
          textPrimary: {
            color: secondaryColor,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: secondaryColor,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { color: secondaryColor },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { 
              backgroundColor: `${secondaryColor}1F`, // 12% opacity
              color: colors.actionText 
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: secondaryColor,
            color: colors.actionText,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          colorPrimary: {
            color: secondaryColor,
          },
        },
      },
    },
  });
}

// Adjust hex color brightness by percentage
function adjustBrightness(hex: string, percent: number): string {
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
  
  const secondaryColor = session?.agencySettings?.secondaryColor || colors.actionBg;
  
  const theme = React.useMemo(() => buildTheme(secondaryColor), [secondaryColor]);
  
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

