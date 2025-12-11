import { createTheme } from '@mui/material/styles';
import { TenantConfig } from '@/tenancy/types';
import { typography } from '@/theme/typography';
import { colors } from '@/theme/colors';

export function createTenantTheme(tenant: TenantConfig) {
  const theme = createTheme({
    palette: {
      primary: { main: colors.actionBg, contrastText: colors.actionText },
      secondary: { main: tenant.brand.secondary || '#5D4AFB' }
    },
    typography,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8
          },
          containedPrimary: {
            backgroundColor: colors.actionBg,
            color: colors.actionText,
            '&:hover': { backgroundColor: '#99e600' }
          },
          outlinedPrimary: {
            borderColor: colors.actionBg,
            color: colors.actionText,
            '&:hover': { borderColor: '#99e600', backgroundColor: 'rgba(170,251,0,0.08)' }
          },
          textPrimary: {
            color: colors.actionText
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: colors.actionBg
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { color: colors.actionText }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { backgroundColor: 'rgba(170,251,0,0.12)', color: colors.actionText }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: '1.4375em',
            boxSizing: 'border-box',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 8,
            minHeight: 40,
            paddingBlock: 0,
            paddingInline: 12,
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
          },
          input: {
            padding: 0,
          },
          notchedOutline: {
            borderWidth: 1,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: '1.4375em',
          },
          input: {
            padding: 0,
          },
        },
      }
    }
  });
  return theme;
}


