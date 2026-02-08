'use client';

import React from 'react';
import { Box, Typography, Avatar, Stack, Chip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { dashboardDataGridSx } from '@/components/tableStyles';
import { colors, gradients } from '@/theme/colors';
import { IoTrophyOutline } from 'react-icons/io5';

export type LeaderboardRow = {
  id: string;
  rank: number;
  name: string;
  emailsSent: number;
  profileViews: number;
  tasksCompleted: number;
  lastActive: string; // relative string like "2h ago"
  engagementScore: number;
};

const columns: GridColDef<LeaderboardRow>[] = [
  {
    field: 'rank',
    headerName: '#',
    width: 56,
    sortable: false,
    renderCell: (params: GridRenderCellParams<LeaderboardRow>) => {
      const isTop = params.value <= 5;
      return (
        <Box
          sx={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 13,
            color: isTop ? colors.black : '#0A0A0A80',
            bgcolor: isTop ? colors.lime : '#F0F0F0',
            clipPath:
              'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
          }}
        >
          {params.value}
        </Box>
      );
    },
  },
  {
    field: 'name',
    headerName: 'Athlete',
    flex: 1,
    minWidth: 160,
    sortable: false,
    renderCell: (params: GridRenderCellParams<LeaderboardRow>) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            width: 30,
            height: 30,
            bgcolor: colors.black,
            color: colors.lime,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {(params.value as string)?.charAt(0)?.toUpperCase() || '?'}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'emailsSent',
    headerName: 'Emails',
    width: 90,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'profileViews',
    headerName: 'Views',
    width: 80,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'tasksCompleted',
    headerName: 'Tasks',
    width: 80,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'lastActive',
    headerName: 'Last Active',
    width: 110,
    sortable: false,
    renderCell: (params: GridRenderCellParams<LeaderboardRow>) => (
      <Typography variant="caption" sx={{ color: '#0A0A0A80' }}>
        {params.value}
      </Typography>
    ),
  },
];

export function ClientLeaderboard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Box
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        bgcolor: colors.white,
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 0.25s ease',
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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: gradients.darkCard,
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IoTrophyOutline color={colors.lime} size={18} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.8rem',
            color: colors.white,
          }}
        >
          Athlete Leaderboard
        </Typography>
        <Chip
          label={`${rows.length} athletes`}
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: `${colors.lime}20`,
            color: colors.lime,
            fontWeight: 700,
            fontSize: 11,
            height: 22,
          }}
        />
      </Box>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableColumnMenu
        disableRowSelectionOnClick
        hideFooter={rows.length <= 10}
        pageSizeOptions={[10]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        getRowClassName={(params) =>
          params.row.rank <= 5 ? 'top-ranked' : ''
        }
        sx={{
          ...dashboardDataGridSx as Record<string, unknown>,
          border: 'none',
          // Override columnHeaders since we have our own header
          '& .MuiDataGrid-columnHeaders': {
            background: '#FAFAFA',
            borderBottom: '1px solid #E0E0E0',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: '#0A0A0A99',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.7rem',
          },
          '& .top-ranked': {
            bgcolor: `${colors.lime}06`,
          },
          '& .top-ranked:hover': {
            bgcolor: `${colors.lime}12`,
          },
        }}
      />
    </Box>
  );
}
