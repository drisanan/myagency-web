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
    padding: '12px 16px',
    fontSize: 14,
  },
  '& .MuiTableRow-root:nth-of-type(even)': {
    backgroundColor: '#fcfcfd',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f8fafc',
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
