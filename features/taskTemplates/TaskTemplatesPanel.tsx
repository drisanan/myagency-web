'use client';
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import { FaEdit, FaTrash, FaPlus, FaTasks, FaPlay, FaMinus } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listTaskTemplates, 
  createTaskTemplate, 
  updateTaskTemplate, 
  deleteTaskTemplate, 
  applyTaskTemplate,
  TaskTemplate,
  TaskTemplateItem,
  ProgramLevel,
} from '@/services/taskTemplates';

const programLevels: { value: ProgramLevel; label: string; color: string }[] = [
  { value: 'bronze', label: 'Bronze', color: '#cd7f32' },
  { value: 'silver', label: 'Silver', color: '#c0c0c0' },
  { value: 'gold', label: 'Gold', color: '#ffd700' },
  { value: 'platinum', label: 'Platinum', color: '#e5e4e2' },
];

type Props = {
  onApply?: (templateId: string, clientId: string) => void;
  clientIdForApply?: string;
};

export function TaskTemplatesPanel({ onApply, clientIdForApply }: Props) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskTemplate | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [form, setForm] = React.useState<{
    name: string;
    description: string;
    programLevel: ProgramLevel | '';
    tasks: TaskTemplateItem[];
  }>({
    name: '',
    description: '',
    programLevel: '',
    tasks: [{ title: '', description: '', daysFromAssignment: 0 }],
  });

  const query = useQuery({
    queryKey: ['taskTemplates'],
    queryFn: () => listTaskTemplates(),
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
      setDialogOpen(false);
      setSnackbar({ open: true, message: 'Template created successfully', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TaskTemplate> }) => updateTaskTemplate(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
      setDialogOpen(false);
      setSnackbar({ open: true, message: 'Template updated successfully', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
      setSnackbar({ open: true, message: 'Template deleted', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const applyMutation = useMutation({
    mutationFn: ({ templateId, clientId }: { templateId: string; clientId: string }) => 
      applyTaskTemplate(templateId, clientId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSnackbar({ open: true, message: data.message, severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      programLevel: '',
      tasks: [{ title: '', description: '', daysFromAssignment: 0 }],
    });
    setDialogOpen(true);
  };

  const openEdit = (template: TaskTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      description: template.description || '',
      programLevel: template.programLevel || '',
      tasks: template.tasks.length > 0 ? template.tasks : [{ title: '', description: '', daysFromAssignment: 0 }],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const validTasks = form.tasks.filter(t => t.title.trim());
    if (validTasks.length === 0) return;
    
    const payload = {
      name: form.name,
      description: form.description || undefined,
      programLevel: form.programLevel || undefined,
      tasks: validTasks,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await createMutation.mutateAsync(payload as any);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleApply = async (templateId: string) => {
    if (!clientIdForApply) {
      setSnackbar({ open: true, message: 'No client selected', severity: 'error' });
      return;
    }
    await applyMutation.mutateAsync({ templateId, clientId: clientIdForApply });
    onApply?.(templateId, clientIdForApply);
  };

  const addTaskRow = () => {
    setForm(f => ({
      ...f,
      tasks: [...f.tasks, { title: '', description: '', daysFromAssignment: 0 }],
    }));
  };

  const removeTaskRow = (index: number) => {
    setForm(f => ({
      ...f,
      tasks: f.tasks.filter((_, i) => i !== index),
    }));
  };

  const updateTaskRow = (index: number, field: keyof TaskTemplateItem, value: any) => {
    setForm(f => ({
      ...f,
      tasks: f.tasks.map((t, i) => i === index ? { ...t, [field]: value } : t),
    }));
  };

  const templates = query.data || [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaTasks /> Task Templates
        </Typography>
        <Button 
          variant="contained" 
          onClick={openAdd} 
          startIcon={<FaPlus />}
          data-testid="add-template-btn"
        >
          New Template
        </Button>
      </Stack>

      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Typography color="text.secondary">No templates yet. Create one to get started.</Typography>
      ) : (
        <Stack spacing={2}>
          {templates.map((template) => {
            const level = programLevels.find(p => p.value === template.programLevel);
            return (
              <Card key={template.id} variant="outlined" data-testid="template-item">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="h6">{template.name}</Typography>
                        {level && (
                          <Chip 
                            size="small" 
                            label={level.label} 
                            sx={{ bgcolor: level.color, color: level.value === 'gold' ? '#000' : '#fff' }}
                          />
                        )}
                      </Stack>
                      {template.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {template.description}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''}
                      </Typography>
                      <List dense disablePadding sx={{ mt: 1 }}>
                        {template.tasks.slice(0, 3).map((task, i) => (
                          <ListItem key={i} sx={{ py: 0 }}>
                            <ListItemText 
                              primary={task.title}
                              secondary={task.daysFromAssignment ? `Due in ${task.daysFromAssignment} days` : 'No due date'}
                            />
                          </ListItem>
                        ))}
                        {template.tasks.length > 3 && (
                          <ListItem sx={{ py: 0 }}>
                            <ListItemText 
                              secondary={`+${template.tasks.length - 3} more`}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {clientIdForApply && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FaPlay />}
                          onClick={() => handleApply(template.id)}
                          disabled={applyMutation.isPending}
                          data-testid="apply-template-btn"
                        >
                          Apply
                        </Button>
                      )}
                      <IconButton size="small" onClick={() => openEdit(template)}>
                        <FaEdit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(template.id)}>
                        <FaTrash />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit Template' : 'Create Task Template'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            size="small"
            label="Template Name"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            required
            data-testid="template-name"
          />
          <TextField
            size="small"
            label="Description"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            multiline
            minRows={2}
            data-testid="template-description"
          />
          <TextField
            size="small"
            select
            label="Auto-assign for Program Level"
            value={form.programLevel}
            onChange={(e) => setForm(f => ({ ...f, programLevel: e.target.value as ProgramLevel | '' }))}
            data-testid="template-level"
          >
            <MenuItem value="">None (Manual only)</MenuItem>
            {programLevels.map(p => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </TextField>

          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tasks</Typography>
          
          {form.tasks.map((task, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={1}>
                    <TextField
                      size="small"
                      label="Task Title"
                      value={task.title}
                      onChange={(e) => updateTaskRow(index, 'title', e.target.value)}
                      required
                      fullWidth
                      data-testid={`task-title-${index}`}
                    />
                    <TextField
                      size="small"
                      label="Description"
                      value={task.description || ''}
                      onChange={(e) => updateTaskRow(index, 'description', e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Days from assignment (0 = same day)"
                      value={task.daysFromAssignment ?? 0}
                      onChange={(e) => updateTaskRow(index, 'daysFromAssignment', parseInt(e.target.value) || 0)}
                      sx={{ maxWidth: 250 }}
                    />
                  </Stack>
                </Box>
                {form.tasks.length > 1 && (
                  <IconButton 
                    size="small" 
                    onClick={() => removeTaskRow(index)}
                    sx={{ mt: 0.5 }}
                  >
                    <FaMinus />
                  </IconButton>
                )}
              </Stack>
            </Paper>
          ))}
          
          <Button 
            variant="outlined" 
            startIcon={<FaPlus />} 
            onClick={addTaskRow}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Task
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="save-template-btn"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : editing ? 'Save Changes' : 'Create Template'}
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
