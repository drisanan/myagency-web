'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listClientsByAgencyEmail, deleteClient, getGmailStatus, refreshGmailToken } from '@/services/clients';
import { Button, Stack, Box, Typography, Avatar, Paper, Chip, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, TablePagination } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { useImpersonation } from '@/hooks/useImpersonation';
import { dashboardTablePaperSx, dashboardTableSx } from '@/components/tableStyles';

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
        <Chip label="Expired" size="small" color="warning" />
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

export function ClientsList() {
  const { session } = useSession();
  const { impersonateClient, isImpersonating } = useImpersonation();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
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
  return (
    <Paper variant="outlined" sx={{ height: 520, width: '100%', p: 0, ...dashboardTablePaperSx }}>
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        <Table size="small" stickyHeader sx={dashboardTableSx}>
          <TableHead>
            <TableRow>
              <TableCell>Athlete</TableCell>
              <TableCell>Email</TableCell>
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
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.email || '-'}</TableCell>
                  <TableCell>{row.sport || '-'}</TableCell>
                  <TableCell>
                    <GmailStatusCell clientId={row.id} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderTop: '1px solid #eaecf0',
            boxShadow: '0 -6px 12px rgba(16, 24, 40, 0.08)',
            zIndex: 1,
          }}
        />
      </Box>
    </Paper>
  );
}
