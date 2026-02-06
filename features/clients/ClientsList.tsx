'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listClientsByAgencyEmail, deleteClient, getGmailStatus, refreshGmailToken } from '@/services/clients';
import { Button, Stack, Box, Typography, Avatar, Paper, Chip, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, useMediaQuery, useTheme, IconButton, Menu, MenuItem } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { useImpersonation } from '@/hooks/useImpersonation';
import { dashboardTablePaperSx, dashboardTableSx, responsiveTableContainerSx, hideOnMobile, mobileCardSx } from '@/components/tableStyles';
import { IoEllipsisVertical } from 'react-icons/io5';

function GmailStatusCell({ clientId }: { clientId: string }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['gmail-status', clientId],
    queryFn: () => getGmailStatus(clientId),
    staleTime: 60_000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGmailToken(clientId);
      queryClient.invalidateQueries({ queryKey: ['gmail-status', clientId] });
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) return <CircularProgress size={16} />;

  if (!status?.connected) {
    return <Chip label="Not Connected" size="small" color="default" />;
  }

  if (status.expired && status.canRefresh) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label="Expired" size="small" sx={{ bgcolor: '#CCFF00', color: '#0A0A0A', fontWeight: 700 }} />
        <Button 
          size="small" 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          {refreshing ? '...' : 'Refresh'}
        </Button>
      </Stack>
    );
  }

  return <Chip label="Connected" size="small" color="success" />;
}

// Mobile action menu component
function MobileActionsMenu({ row, canImpersonate, impersonateClient, onDelete, refetch }: {
  row: any;
  canImpersonate: boolean;
  impersonateClient: (client: any) => void;
  onDelete: (id: string) => Promise<void>;
  refetch: () => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <IoEllipsisVertical />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem component="a" href={`/clients/${row.id}`} onClick={() => setAnchorEl(null)}>View</MenuItem>
        <MenuItem component="a" href={`/clients/${row.id}/edit`} onClick={() => setAnchorEl(null)}>Edit</MenuItem>
        {canImpersonate && (
          <MenuItem onClick={() => { impersonateClient({ id: row.id, email: row.email, firstName: row.firstName, lastName: row.lastName }); setAnchorEl(null); }}>
            Impersonate
          </MenuItem>
        )}
        <MenuItem sx={{ color: 'error.main' }} onClick={async () => { await onDelete(row.id); refetch(); setAnchorEl(null); }}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function ClientsList() {
  const { session } = useSession();
  const { impersonateClient, isImpersonating } = useImpersonation();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // FIX: Check for agencyEmail OR email so it works with your API response
  const agencyEmail = session?.agencyEmail || session?.email || '';
  const canImpersonate = session?.role === 'agency' && !isImpersonating;

  const { data = [], refetch } = useQuery({
    queryKey: ['clients', agencyEmail],
    queryFn: () => agencyEmail ? listClientsByAgencyEmail(agencyEmail) : [],
    enabled: Boolean(agencyEmail), // Now true, so the fetch happens!
  });

  const rows = data as any[];
  const totalRows = rows.length;
  const pagedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Mobile card view
  if (isMobile) {
    return (
      <Paper variant="outlined" sx={{ width: '100%', p: 0, ...dashboardTablePaperSx }}>
        <Box sx={{ maxHeight: 520, overflow: 'auto', p: 1.5 }}>
          {pagedRows.map((row) => {
            const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Unknown';
            const photo = row?.photoUrl || row?.profileImageUrl || '/marketing/an-logo.png';
            return (
              <Box key={row.id} sx={mobileCardSx}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar src={photo} alt={name} sx={{ width: 44, height: 44 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{row.email || '-'}</Typography>
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip label={row.sport || 'No sport'} size="small" variant="outlined" />
                        <GmailStatusCell clientId={row.id} />
                      </Stack>
                    </Box>
                  </Stack>
                  <MobileActionsMenu
                    row={row}
                    canImpersonate={canImpersonate}
                    impersonateClient={impersonateClient}
                    onDelete={async (id: string) => { await deleteClient(id); }}
                    refetch={refetch}
                  />
                </Stack>
              </Box>
            );
          })}
          {rows.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No athletes found.</Typography>
            </Box>
          )}
        </Box>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'center' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 12 },
          }}
        />
      </Paper>
    );
  }

  // Desktop table view
  return (
    <Paper variant="outlined" sx={{ width: '100%', p: 0, ...dashboardTablePaperSx }}>
      <Box sx={{ ...responsiveTableContainerSx, maxHeight: 520 }}>
        <Table size="small" stickyHeader sx={{ ...dashboardTableSx, minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Athlete</TableCell>
              <TableCell sx={hideOnMobile}>Email</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell>Gmail</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.map((row) => {
              const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Unknown';
              const description = row?.description || row?.radar?.description || 'No description provided';
              const photo = row?.photoUrl || row?.profileImageUrl || '/marketing/an-logo.png';
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar
                        src={photo}
                        alt={name}
                        sx={{ width: 40, height: 40, borderRadius: '50%' }}
                      />
                      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }} noWrap>
                          {name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: { sm: 150, md: 200 } }}>
                          {description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={hideOnMobile}>{row.email || '-'}</TableCell>
                  <TableCell>{row.sport || '-'}</TableCell>
                  <TableCell>
                    <GmailStatusCell clientId={row.id} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ '& .MuiButton-root': { minWidth: 'auto', px: 1, fontSize: 12 } }}>
                      <Button size="small" href={`/clients/${row.id}`}>View</Button>
                      <Button size="small" href={`/clients/${row.id}/edit`}>Edit</Button>
                      <Button size="small" color="error" onClick={async () => { await deleteClient(row.id); refetch(); }}>Delete</Button>
                      {canImpersonate && (
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => impersonateClient({
                            id: row.id,
                            email: row.email,
                            firstName: row.firstName,
                            lastName: row.lastName,
                          })}
                        >
                          Impersonate
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No athletes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
        sx={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 1,
        }}
      />
    </Paper>
  );
}
