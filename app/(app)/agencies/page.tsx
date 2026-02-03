'use client';
import React from 'react';
import { Box, Button, Typography, Paper, useMediaQuery, useTheme, Stack, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import { getAgencies } from '@/services/agencies';
type AgencyRow = { id: string; name: string; email: string; active?: boolean };
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { logImpersonationStart } from '@/services/audit';
import { dashboardDataGridSx, dashboardTablePaperSx, mobileCardSx } from '@/components/tableStyles';
import { IoEllipsisVertical } from 'react-icons/io5';

export default function AgenciesPage() {
  const { session, setSession } = useSession();
  const router = useRouter();
  const [rows, setRows] = React.useState<any[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    if (session?.role !== 'parent') {
      router.push('/dashboard');
      return;
    }
    getAgencies().then(list => {
      setRows(list.map((a: AgencyRow) => ({ id: a.id, name: a.name, email: a.email, active: a.active ?? true })));
    });
  }, [session, router]);

  const handleImpersonate = (row: any) => {
    if (!session) return;
    const parent = session;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('session_impersonation_base', JSON.stringify(parent));
    }
    logImpersonationStart(parent.email, row.email);
    setSession({ role: 'agency', email: row.email, agencyId: row.id, impersonatedBy: { email: parent.email, role: 'parent' } } as any);
    router.push('/dashboard');
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 150 },
    { field: 'active', headerName: 'Active', width: 80 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button size="small" onClick={() => handleImpersonate(params.row)}>Impersonate</Button>
      )
    },
  ];

  // Mobile action menu
  const MobileActionMenu = ({ row }: { row: any }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    return (
      <>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <IoEllipsisVertical />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { handleImpersonate(row); setAnchorEl(null); }}>Impersonate</MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        spacing={1}
        mb={2}
      >
        <Typography variant="h5">Agencies</Typography>
        <Button 
          data-testid="agencies-new" 
          LinkComponent={Link} 
          href="/agencies/new" 
          variant="contained"
          fullWidth={isMobile}
        >
          New Agency
        </Button>
      </Stack>

      {/* Mobile card view */}
      {isMobile ? (
        <Paper sx={{ width: '100%', p: 1.5, ...dashboardTablePaperSx }}>
          {rows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No agencies found.</Typography>
            </Box>
          ) : (
            rows.map((row) => (
              <Box key={row.id} sx={mobileCardSx}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{row.email}</Typography>
                    <Box mt={0.5}>
                      <Chip 
                        label={row.active ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={row.active ? 'success' : 'default'} 
                      />
                    </Box>
                  </Box>
                  <MobileActionMenu row={row} />
                </Stack>
              </Box>
            ))
          )}
        </Paper>
      ) : (
        /* Desktop DataGrid view */
        <Paper sx={{ height: 440, width: '100%', maxWidth: 900, ...dashboardTablePaperSx }}>
          <DataGrid 
            rows={rows} 
            columns={columns} 
            disableRowSelectionOnClick 
            sx={dashboardDataGridSx} 
          />
        </Paper>
      )}
    </Box>
  );
}


