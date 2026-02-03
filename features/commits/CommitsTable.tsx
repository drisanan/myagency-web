'use client';
import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Stack, Typography, Box, useMediaQuery, useTheme, Chip } from '@mui/material';
import { Commit, filterCommits } from '@/services/commits';
import { dashboardTablePaperSx, dashboardTableSx, responsiveTableContainerSx, mobileCardSx, hideOnMobile } from '@/components/tableStyles';

export function CommitsTable({
  title,
  rows,
  showRank,
  dataTestId,
}: {
  title: string;
  rows: Commit[];
  showRank?: boolean;
  dataTestId: string;
}) {
  const [position, setPosition] = React.useState('');
  const [university, setUniversity] = React.useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filtered = filterCommits(rows, { position, university });

  return (
    <Paper variant="outlined" sx={{ p: 0, ...dashboardTablePaperSx }}>
      <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 2, pb: 1.5 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
        >
          <Typography variant="subtitle1">{title}</Typography>
          <Stack direction="row" spacing={1} sx={{ '& .MuiTextField-root': { minWidth: { xs: 0, sm: 120 } } }}>
            <TextField
              size="small"
              label="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              data-testid={`${dataTestId}-filter-position`}
              fullWidth={isMobile}
            />
            <TextField
              size="small"
              label="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              data-testid={`${dataTestId}-filter-university`}
              fullWidth={isMobile}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Mobile card view */}
      {isMobile ? (
        <Box sx={{ maxHeight: 420, overflow: 'auto', p: 1.5, pt: 0 }}>
          {filtered.map((c) => (
            <Box key={c.id} sx={mobileCardSx}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {c.logo && (
                  <Box component="img" src={c.logo} alt={c.university || 'logo'} sx={{ width: 36, height: 36, objectFit: 'contain' }} />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {showRank && c.rank && (
                      <Chip label={`#${c.rank}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{c.name}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {c.position} • {c.university}
                  </Typography>
                  {!showRank && c.commitDate && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {c.commitDate}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No commits match the filters.</Typography>
            </Box>
          )}
        </Box>
      ) : (
        /* Desktop table view */
        <Box sx={{ ...responsiveTableContainerSx, maxHeight: 420 }}>
          <Table size="small" stickyHeader data-testid={dataTestId} sx={{ ...dashboardTableSx, minWidth: 600 }}>
            <TableHead>
              <TableRow>
                {showRank && <TableCell>Rank</TableCell>}
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>University</TableCell>
                <TableCell>Logo</TableCell>
                {!showRank && <TableCell sx={hideOnMobile}>Commit Date</TableCell>}
                <TableCell sx={hideOnMobile}>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  {showRank && <TableCell>{c.rank ?? '-'}</TableCell>}
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.position || '-'}</TableCell>
                  <TableCell>{c.university || '-'}</TableCell>
                  <TableCell>
                    {c.logo ? (
                      <Box component="img" src={c.logo} alt={c.university || 'logo'} sx={{ width: 28, height: 28, objectFit: 'contain' }} />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  {!showRank && <TableCell sx={hideOnMobile}>{c.commitDate || '-'}</TableCell>}
                  <TableCell sx={hideOnMobile}>{c.source || '-'}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showRank ? 6 : 7} align="center">
                    No commits match the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}


