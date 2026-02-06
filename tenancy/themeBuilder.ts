import { createTheme } from '@mui/material/styles';
import { TenantConfig } from '@/tenancy/types';
import { typography } from '@/theme/typography';
import { colors, gradients } from '@/theme/colors';

export function createTenantTheme(tenant: TenantConfig) {
  const theme = createTheme({
    palette: {
      primary: { main: colors.actionBg, contrastText: colors.actionText },
      secondary: { main: tenant.brand.secondary || colors.black },
      background: {
        default: colors.contentBg,
        paper: colors.white,
      },
      divider: '#E0E0E0',
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
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          sizeSmall: {
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          },
          // Lime bg / black text
          containedPrimary: {
            background: gradients.limeButton,
            color: colors.black,
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #D4FF1A 0%, #B8E600 100%)',
              boxShadow: `0 4px 20px ${colors.lime}40`,
              transform: 'translateY(-1px)',
            },
          },
          // Black bg / lime text (invert)
          containedSecondary: {
            background: colors.black,
            color: colors.lime,
            boxShadow: 'none',
            '&:hover': { background: '#1A1A1A', transform: 'translateY(-1px)' },
          },
          outlinedPrimary: {
            borderColor: colors.black,
            borderWidth: 2,
            color: colors.black,
            '&:hover': { borderColor: colors.black, backgroundColor: `${colors.black}0A`, borderWidth: 2 }
          },
          textPrimary: {
            color: colors.black,
            clipPath: 'none',
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
            borderRadius: 0,
            '&.Mui-selected': { color: colors.actionText }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { backgroundColor: `${colors.lime}1F`, color: colors.actionText }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 0.25s ease, transform 0.2s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '3px',
              background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
              zIndex: 1,
            },
            '&:hover': {
              boxShadow: `0 4px 20px rgba(0,0,0,0.08)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 0.25s ease, transform 0.2s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '3px',
              background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '50%',
              height: '60%',
              background: `radial-gradient(ellipse, ${colors.lime}06 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
            '&:hover': {
              boxShadow: '0 6px 28px rgba(0,0,0,0.08)',
              transform: 'translateY(-1px)',
            },
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
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
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
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontFamily: typography.fontFamily,
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: '1.4375em',
            boxSizing: 'border-box',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
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
            borderRadius: 0,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: typography.fontFamily,
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: '1.4375em',
          },
          input: {
            padding: 0,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              background: gradients.darkCard,
              color: colors.white,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.75rem',
            },
          },
        },
      },
    }
  });
  return theme;
}
