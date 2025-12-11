'use client';
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useRecruiterSearch } from '@/features/recruiter/useRecruiterSearch';

type Athlete = { id: string; name: string };
type Props = { onSelect?: (athlete: Athlete) => void };

export function RecruiterSearchList({ onSelect }: Props) {
  const { data, isLoading, isError } = useRecruiterSearch();

  if (isLoading) return <CircularProgress role="progressbar" />;
  if (isError) return <Alert severity="error">Failed to load athletes</Alert>;
  const rows = data ?? [];

  return (
    <TableContainer component={Paper}>
      <Table aria-label="recruiter athletes">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              role="row"
              hover
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onClick={() => onSelect?.(row)}
              aria-label={row.name}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


