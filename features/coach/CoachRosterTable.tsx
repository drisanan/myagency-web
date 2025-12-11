'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRoster, addNote } from '@/features/coach/service';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export function CoachRosterTable() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['coach', 'roster'], queryFn: getRoster });
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  if (isLoading) return <CircularProgress role="progressbar" />;
  if (isError) return <Alert severity="error">Failed to load roster</Alert>;
  const rows = data ?? [];

  const handleAddNote = async () => {
    if (!selectedId || !note) return;
    await addNote({ athleteId: selectedId, text: note });
    setOpen(false);
    setNote('');
    setSelectedId(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="coach roster">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} role="row" aria-label={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedId(row.id);
                      setOpen(true);
                    }}
                  >
                    Add Note
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


