import type { SxProps, Theme } from '@mui/material/styles';

export const dashboardTablePaperSx: SxProps<Theme> = {
  borderRadius: 2.5,
  border: '1px solid #eaecf0',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
  backgroundColor: '#fff',
  overflow: 'hidden',
};

export const dashboardTableSx: SxProps<Theme> = {
  '& .MuiTableCell-head': {
    backgroundColor: '#f9fafb',
    color: '#475467',
    fontWeight: 600,
    borderBottom: '1px solid #eaecf0',
  },
  '& .MuiTableCell-body': {
    color: '#101828',
    borderBottom: '1px solid #f2f4f7',
  },
  '& .MuiTableCell-root': {
    padding: { xs: '8px 12px', sm: '12px 16px' },
    fontSize: { xs: 13, sm: 14 },
  },
  '& .MuiTableRow-root:nth-of-type(even)': {
    backgroundColor: '#fcfcfd',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f8fafc',
  },
};

// Responsive table container - allows horizontal scrolling on mobile
export const responsiveTableContainerSx: SxProps<Theme> = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  '&::-webkit-scrollbar': {
    height: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: 3,
    '&:hover': {
      backgroundColor: '#a1a1a1',
    },
  },
};

// Mobile card styles for table rows converted to cards
export const mobileCardSx: SxProps<Theme> = {
  p: 2,
  mb: 1.5,
  borderRadius: 2,
  border: '1px solid #eaecf0',
  backgroundColor: '#fff',
  '&:hover': {
    backgroundColor: '#f8fafc',
    boxShadow: '0 2px 4px rgba(16, 24, 40, 0.08)',
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
  borderRadius: 2.5,
  border: '1px solid #eaecf0',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
  backgroundColor: '#fff',
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
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #eaecf0',
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
    color: '#475467',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #f2f4f7',
    color: '#101828',
    fontSize: 14,
    paddingLeft: 0,
    paddingRight: 0,
  },
  '& .MuiDataGrid-row': {
    width: '100%',
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: '#fcfcfd',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#f8fafc',
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid #eaecf0',
  },
};
