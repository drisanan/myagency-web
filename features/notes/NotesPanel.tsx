'use client';
import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { FaRegStickyNote, FaTrash, FaEdit } from 'react-icons/fa';
import { useNotes } from './useNotes';
import { useSession } from '@/features/auth/session';

type Note = ReturnType<typeof useNotes>['notes'][number];

export function NotesPanel({ athleteId }: { athleteId: string }) {
  const { session } = useSession();
  // Use agencyEmail if available (for agents), otherwise fall back to email (for agency owners)
  const agencyEmail = session?.agencyEmail || session?.email || '';
  const { notes, query, createNote, updateNote, deleteNote, creating, updating, deleting } = useNotes(athleteId, agencyEmail);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Note | null>(null);
  const [form, setForm] = React.useState<{ title?: string; body: string; type?: string }>({ body: '', type: 'other' });
  const [error, setError] = React.useState('');
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const resetForm = () => {
    setForm({ title: '', body: '', type: 'other' });
    setEditing(null);
    setError('');
  };

  const startAdd = () => {
    resetForm();
    setOpen(true);
  };
  const startEdit = (note: Note) => {
    setEditing(note);
    setForm({ title: note.title || '', body: note.body || '', type: note.type || 'other' });
    setError('');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.body?.trim()) {
      setError('Body is required');
      return;
    }
    try {
      if (editing) {
        await updateNote({ id: editing.id, title: form.title, body: form.body, type: form.type as any });
        setSnackbar({ open: true, message: 'Note updated successfully!', severity: 'success' });
      } else {
        await createNote({ title: form.title, body: form.body, type: form.type as any, author: session?.email });
        setSnackbar({ open: true, message: 'Note created successfully!', severity: 'success' });
      }
      setOpen(false);
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
      setSnackbar({ open: true, message: e?.message || 'Failed to save note', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      setSnackbar({ open: true, message: 'Note deleted successfully!', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to delete note', severity: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Notes</Typography>
        <Button variant="contained" onClick={startAdd} data-testid="note-add" startIcon={<FaRegStickyNote />}>
          Add note
        </Button>
      </Stack>

      {query.isLoading ? (
        <Typography>Loading...</Typography>
      ) : notes.length === 0 ? (
        <Typography color="text.secondary">No notes yet.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {notes.map((n) => (
            <Paper
              key={n.id}
              variant="outlined"
              sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}
              data-testid="note-item"
            >
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip size="small" label={n.type || 'other'} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                  {n.title ? (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, ml: 0.5 }} noWrap>
                      {n.title}
                    </Typography>
                  ) : null}
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {n.body}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <IconButton aria-label="Edit note" onClick={() => startEdit(n)} data-testid="note-edit">
                  <FaEdit />
                </IconButton>
                <IconButton aria-label="Delete note" onClick={() => handleDelete(n.id)} data-testid="note-delete">
                  <FaTrash />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { minWidth: { xs: '80vw', md: '50vw' }, minHeight: { xs: '20vh', md: '22vh' } },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/marketing/an-logo.png"
              alt="Logo"
              sx={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <Typography variant="h6">{editing ? 'Edit note' : 'Add note'}</Typography>
          </Box>
          <IconButton aria-label="Close" onClick={() => setOpen(false)}>
            ×
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Subject"
            value={form.title || ''}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            data-testid="note-title"
          />
          <TextField
            label="Type"
            select
            value={form.type || 'other'}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            data-testid="note-type"
          >
            {['recruiting', 'account', 'advice', 'event', 'other'].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Note"
            multiline
            minRows={3}
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            error={Boolean(error)}
            helperText={error}
            data-testid="note-body"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={creating || updating}
            data-testid="note-save"
            startIcon={(creating || updating) ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {creating || updating ? 'Saving...' : editing ? 'Save changes' : 'Add note'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


