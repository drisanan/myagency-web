'use client';
import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Stack, Typography, Box } from '@mui/material';
import { Commit, filterCommits } from '@/services/commits';
import { dashboardTablePaperSx, dashboardTableSx } from '@/components/tableStyles';

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

  const filtered = filterCommits(rows, { position, university });

  return (
    <Paper variant="outlined" sx={{ p: 0, ...dashboardTablePaperSx }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">{title}</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              data-testid={`${dataTestId}-filter-position`}
            />
            <TextField
              size="small"
              label="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              data-testid={`${dataTestId}-filter-university`}
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
        <Table size="small" stickyHeader data-testid={dataTestId} sx={dashboardTableSx}>
          <TableHead>
            <TableRow>
              {showRank && <TableCell>Rank</TableCell>}
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Logo</TableCell>
              {!showRank && <TableCell>Commit Date</TableCell>}
              <TableCell>Source</TableCell>
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
                {!showRank && <TableCell>{c.commitDate || '-'}</TableCell>}
                <TableCell>{c.source || '-'}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={showRank ? 5 : 5} align="center">
                  No commits match the filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}


