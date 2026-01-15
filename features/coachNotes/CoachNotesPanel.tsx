'use client';
import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { FaEdit, FaTrash, FaUniversity, FaPlus } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCoachNotes, createCoachNote, updateCoachNote, deleteCoachNote, CoachNote } from '@/services/coachNotes';

type Props = {
  coachEmail?: string;
  university?: string;
  athleteId?: string;
  showAddButton?: boolean;
};

const noteTypes = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

export function CoachNotesPanel({ coachEmail, university, athleteId, showAddButton = true }: Props) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CoachNote | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [form, setForm] = React.useState({
    coachEmail: '',
    coachName: '',
    university: '',
    title: '',
    body: '',
    type: 'other' as 'call' | 'email' | 'meeting' | 'other',
  });

  const query = useQuery({
    queryKey: ['coachNotes', { coachEmail, university, athleteId }],
    queryFn: () => listCoachNotes({ coachEmail, university, athleteId }),
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createCoachNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachNotes'] });
      setDialogOpen(false);
      setSnackbar({ open: true, message: 'Note created successfully', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CoachNote> }) => updateCoachNote(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachNotes'] });
      setDialogOpen(false);
      setSnackbar({ open: true, message: 'Note updated successfully', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoachNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachNotes'] });
      setSnackbar({ open: true, message: 'Note deleted', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      coachEmail: coachEmail || '',
      coachName: '',
      university: university || '',
      title: '',
      body: '',
      type: 'other',
    });
    setDialogOpen(true);
  };

  const openEdit = (note: CoachNote) => {
    setEditing(note);
    setForm({
      coachEmail: note.coachEmail,
      coachName: note.coachName || '',
      university: note.university || '',
      title: note.title || '',
      body: note.body,
      type: (note.type || 'other') as any,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.coachEmail.trim() || !form.body.trim()) return;
    
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        patch: {
          coachName: form.coachName,
          university: form.university,
          title: form.title,
          body: form.body,
          type: form.type,
        },
      });
    } else {
      await createMutation.mutateAsync({
        coachEmail: form.coachEmail,
        coachName: form.coachName,
        university: form.university,
        athleteId,
        title: form.title,
        body: form.body,
        type: form.type,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const notes = query.data || [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaUniversity /> Coach Notes
        </Typography>
        {showAddButton && (
          <Button 
            variant="contained" 
            onClick={openAdd} 
            startIcon={<FaPlus />}
            data-testid="add-coach-note-btn"
          >
            Add Note
          </Button>
        )}
      </Stack>

      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Typography color="text.secondary">No notes yet.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {notes.map((note) => (
            <Paper
              key={note.id}
              variant="outlined"
              sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'flex-start' }}
              data-testid="coach-note-item"
            >
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip 
                    size="small" 
                    label={noteTypes.find(t => t.value === note.type)?.label || 'Other'} 
                    color="primary"
                    variant="outlined"
                  />
                  {note.university && (
                    <Chip size="small" label={note.university} />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {new Date(note.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {note.coachName || note.coachEmail}
                  </Typography>
                  {note.title && (
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {note.title}
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {note.body}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={0.5}>
                <IconButton 
                  size="small" 
                  onClick={() => openEdit(note)}
                  aria-label="Edit note"
                  data-testid="edit-coach-note-btn"
                >
                  <FaEdit />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(note.id)}
                  aria-label="Delete note"
                  data-testid="delete-coach-note-btn"
                >
                  <FaTrash />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Note' : 'Add Coach Note'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            size="small"
            label="Coach Email"
            value={form.coachEmail}
            onChange={(e) => setForm(f => ({ ...f, coachEmail: e.target.value }))}
            required
            disabled={!!editing}
            data-testid="coach-note-email"
          />
          <TextField
            size="small"
            label="Coach Name"
            value={form.coachName}
            onChange={(e) => setForm(f => ({ ...f, coachName: e.target.value }))}
            data-testid="coach-note-name"
          />
          <TextField
            size="small"
            label="University/School"
            value={form.university}
            onChange={(e) => setForm(f => ({ ...f, university: e.target.value }))}
            data-testid="coach-note-university"
          />
          <TextField
            size="small"
            select
            label="Type"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
            data-testid="coach-note-type"
          >
            {noteTypes.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Subject"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            data-testid="coach-note-title"
          />
          <TextField
            size="small"
            label="Note"
            value={form.body}
            onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
            multiline
            minRows={3}
            required
            data-testid="coach-note-body"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="save-coach-note-btn"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : editing ? 'Save Changes' : 'Add Note'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
