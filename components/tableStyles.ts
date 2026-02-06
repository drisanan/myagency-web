import type { SxProps, Theme } from '@mui/material/styles';
import { colors, gradients } from '@/theme/colors';

export const dashboardTablePaperSx: SxProps<Theme> = {
  borderRadius: 0,
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
  border: 'none',
  boxShadow: 'none',
  backgroundColor: colors.white,
  overflow: 'hidden',
  position: 'relative',
  transition: 'box-shadow 0.25s ease, transform 0.2s ease',
  // Dark accent bar on left (inverted MetricCard style)
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
    boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
  },
};

export const dashboardTableSx: SxProps<Theme> = {
  '& .MuiTableCell-head': {
    background: gradients.darkCard,
    color: colors.white,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: '0.75rem',
    borderBottom: 'none',
  },
  '& .MuiTableCell-body': {
    color: colors.black,
    borderBottom: '1px solid #E0E0E0',
  },
  '& .MuiTableCell-root': {
    padding: { xs: '8px 12px', sm: '12px 16px' },
    fontSize: { xs: 13, sm: 14 },
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#CCFF0010',
  },
};

// Responsive table container - allows horizontal scrolling on mobile
export const responsiveTableContainerSx: SxProps<Theme> = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    height: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#0A0A0A40',
    borderRadius: 3,
    '&:hover': {
      backgroundColor: '#0A0A0A60',
    },
  },
};

// Mobile card styles for table rows converted to cards
export const mobileCardSx: SxProps<Theme> = {
  p: 2,
  mb: 1.5,
  borderRadius: 0,
  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
  border: 'none',
  backgroundColor: colors.white,
  position: 'relative',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, transform 0.15s ease',
  // Dark accent bar on left
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
    backgroundColor: '#CCFF0008',
    boxShadow: `0 4px 16px rgba(0,0,0,0.08), 0 0 12px ${colors.lime}06`,
    transform: 'translateY(-1px)',
  },
};

// Hide on mobile helper
export const hideOnMobile: SxProps<Theme> = {
  display: { xs: 'none', md: 'table-cell' },
};

// Show only on mobile helper
export const showOnMobile: SxProps<Theme> = {
  display: { xs: 'block', md: 'none' },
};

// Actions column responsive wrapper
export const responsiveActionsSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.5,
  '& .MuiButton-root': {
    minWidth: { xs: 'auto', sm: 64 },
    px: { xs: 1, sm: 2 },
    fontSize: { xs: 12, sm: 13 },
  },
};

export const dashboardDataGridSx: SxProps<Theme> = {
  borderRadius: 0,
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
  border: 'none',
  boxShadow: 'none',
  backgroundColor: colors.white,
  position: 'relative',
  overflow: 'hidden',
  '& .MuiDataGrid-main': {
    padding: 0,
  },
  '& .MuiDataGrid-virtualScroller': {
    padding: 0,
  },
  '& .MuiDataGrid-virtualScrollerContent': {
    padding: 0,
  },
  '& .MuiDataGrid-virtualScrollerRenderZone': {
    width: '100%',
  },
  '& .MuiDataGrid-columnHeaders': {
    background: gradients.darkCard,
    borderBottom: 'none',
    width: '100%',
  },
  '& .MuiDataGrid-columnHeadersInner': {
    width: '100%',
  },
  '& .MuiDataGrid-columnHeader': {
    paddingLeft: 16,
    paddingRight: 16,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '0.75rem',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #E0E0E0',
    color: colors.black,
    fontSize: 14,
    paddingLeft: 0,
    paddingRight: 0,
  },
  '& .MuiDataGrid-row': {
    width: '100%',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#CCFF0010',
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid #E0E0E0',
  },
};
