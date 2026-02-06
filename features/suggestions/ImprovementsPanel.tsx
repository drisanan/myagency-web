'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Collapse,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FaCopy,
  FaCheck,
  FaTimes,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
} from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSuggestions,
  updateSuggestion,
  Suggestion,
  SuggestionStatus,
} from '@/services/suggestions';
import { mobileCardSx, responsiveTableContainerSx, dashboardTableSx } from '@/components/tableStyles';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

const STATUS_COLORS: Record<SuggestionStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  resolved: 'success',
  denied: 'error',
};

const STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending: 'Pending',
  resolved: 'Resolved',
  denied: 'Denied',
};

interface ImprovementsPanelProps {
  /** Compact mode for embedding in other pages */
  compact?: boolean;
}

/**
 * Panel displaying all user suggestions/improvement requests.
 * Allows developers to view details, copy requirements, and update status.
 */
export function ImprovementsPanel({ compact = false }: ImprovementsPanelProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [statusDialog, setStatusDialog] = React.useState<{
    open: boolean;
    suggestion: Suggestion | null;
    newStatus: SuggestionStatus;
    notes: string;
  }>({
    open: false,
    suggestion: null,
    newStatus: 'resolved',
    notes: '',
  });

  // Fetch suggestions
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['suggestions'],
    queryFn: listSuggestions,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: SuggestionStatus; resolutionNotes?: string } }) =>
      updateSuggestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      setStatusDialog({ open: false, suggestion: null, newStatus: 'resolved', notes: '' });
    },
  });

  // Filter suggestions by tab
  const filteredSuggestions = React.useMemo(() => {
    const statusMap: Record<number, SuggestionStatus | 'all'> = {
      0: 'all',
      1: 'pending',
      2: 'resolved',
      3: 'denied',
    };
    const filter = statusMap[selectedTab];
    if (filter === 'all') return suggestions;
    return suggestions.filter((s) => s.status === filter);
  }, [suggestions, selectedTab]);

  // Counts for tabs
  const counts = React.useMemo(() => ({
    all: suggestions.length,
    pending: suggestions.filter((s) => s.status === 'pending').length,
    resolved: suggestions.filter((s) => s.status === 'resolved').length,
    denied: suggestions.filter((s) => s.status === 'denied').length,
  }), [suggestions]);

  const handleCopyRequirements = async (suggestion: Suggestion) => {
    const textToCopy = `## Improvement Request: ${suggestion.id}

**Screen:** ${suggestion.screenPath}
**Area:** ${suggestion.areaSelector}
**Submitted by:** ${suggestion.submittedByName} (${suggestion.submittedByEmail})
**Date:** ${new Date(suggestion.createdAt).toLocaleString()}

### Original Suggestion
${suggestion.originalSuggestion}

### Generated Requirements
${suggestion.requirements}

---
Copy and paste this into the AI terminal to implement.`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(suggestion.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStatusChange = () => {
    if (!statusDialog.suggestion) return;
    updateMutation.mutate({
      id: statusDialog.suggestion.id,
      payload: {
        status: statusDialog.newStatus,
        resolutionNotes: statusDialog.notes || undefined,
      },
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading suggestions..." />;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  return (
    <Box>
      {!compact && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Improvement Requests
          </Typography>
          <Typography color="text.secondary">
            Review user suggestions and track implementation progress
          </Typography>
        </Box>
      )}

      {/* Tabs for filtering */}
      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons={isMobile ? 'auto' : false}
      >
        <Tab label={`All (${counts.all})`} sx={{ minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1, sm: 2 } }} />
        <Tab label={`Pending (${counts.pending})`} sx={{ minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1, sm: 2 } }} />
        <Tab label={`Resolved (${counts.resolved})`} sx={{ minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1, sm: 2 } }} />
        <Tab label={`Denied (${counts.denied})`} sx={{ minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1, sm: 2 } }} />
      </Tabs>

      {filteredSuggestions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No suggestions found
          </Typography>
        </Paper>
      ) : isMobile ? (
        /* Mobile card view */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredSuggestions.map((suggestion) => (
            <Paper key={suggestion.id} sx={{ p: 0, overflow: 'hidden' }}>
              <Box
                sx={{ ...mobileCardSx, mb: 0, cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {suggestion.screenPath}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {suggestion.submittedByName} • {new Date(suggestion.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box mt={0.5}>
                      <Chip
                        label={STATUS_LABELS[suggestion.status]}
                        color={STATUS_COLORS[suggestion.status]}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleCopyRequirements(suggestion); }}
                      color={copiedId === suggestion.id ? 'success' : 'default'}
                    >
                      {copiedId === suggestion.id ? <FaCheck /> : <FaCopy />}
                    </IconButton>
                    <IconButton size="small">
                      {expandedId === suggestion.id ? <FaChevronUp /> : <FaChevronDown />}
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
              <Collapse in={expandedId === suggestion.id}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Original Suggestion</Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'white', mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                      {suggestion.originalSuggestion}
                    </Typography>
                  </Paper>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Requirements</Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'white', maxHeight: 200, overflow: 'auto' }}>
                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', m: 0, fontSize: 11, fontFamily: 'monospace' }}>
                      {suggestion.requirements}
                    </Typography>
                  </Paper>
                  {suggestion.status === 'pending' && (
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        startIcon={<FaCheck />}
                        onClick={() => setStatusDialog({ open: true, suggestion, newStatus: 'resolved', notes: '' })}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<FaTimes />}
                        onClick={() => setStatusDialog({ open: true, suggestion, newStatus: 'denied', notes: '' })}
                      >
                        Deny
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      ) : (
        /* Desktop table view */
        <TableContainer component={Paper} sx={responsiveTableContainerSx}>
          <Table size={compact ? 'small' : 'medium'} sx={dashboardTableSx}>
            <TableHead>
              <TableRow>
                <TableCell width={40}></TableCell>
                <TableCell>Screen</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuggestions.map((suggestion) => (
                <React.Fragment key={suggestion.id}>
                  <TableRow
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedId === suggestion.id ? <FaChevronUp /> : <FaChevronDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {suggestion.screenPath}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {suggestion.areaSelector}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{suggestion.submittedByName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {suggestion.submittedByEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[suggestion.status]}
                        color={STATUS_COLORS[suggestion.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={copiedId === suggestion.id ? 'Copied!' : 'Copy Requirements'}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRequirements(suggestion);
                          }}
                          color={copiedId === suggestion.id ? 'success' : 'default'}
                        >
                          {copiedId === suggestion.id ? <FaCheck /> : <FaCopy />}
                        </IconButton>
                      </Tooltip>
                      {suggestion.status === 'pending' && (
                        <>
                          <Tooltip title="Mark Resolved">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusDialog({
                                  open: true,
                                  suggestion,
                                  newStatus: 'resolved',
                                  notes: '',
                                });
                              }}
                            >
                              <FaCheck />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Denied">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusDialog({
                                  open: true,
                                  suggestion,
                                  newStatus: 'denied',
                                  notes: '',
                                });
                              }}
                            >
                              <FaTimes />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded details row */}
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                      <Collapse in={expandedId === suggestion.id}>
                        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                            {/* Original Suggestion */}
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Original Suggestion
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {suggestion.originalSuggestion}
                                </Typography>
                              </Paper>
                              {suggestion.areaContext && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Area Context: {suggestion.areaContext}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Generated Requirements */}
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  Generated Requirements
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={copiedId === suggestion.id ? <FaCheck /> : <FaCopy />}
                                  onClick={() => handleCopyRequirements(suggestion)}
                                >
                                  {copiedId === suggestion.id ? 'Copied!' : 'Copy All'}
                                </Button>
                              </Box>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  bgcolor: 'white',
                                  maxHeight: 300,
                                  overflow: 'auto',
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                }}
                              >
                                <Typography
                                  component="pre"
                                  sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    m: 0,
                                    fontSize: 'inherit',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {suggestion.requirements}
                                </Typography>
                              </Paper>
                            </Box>
                          </Box>

                          {/* Resolution notes */}
                          {suggestion.resolutionNotes && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Resolution Notes
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                <Typography variant="body2">{suggestion.resolutionNotes}</Typography>
                              </Paper>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Status change dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ ...statusDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {statusDialog.newStatus === 'resolved' ? 'Mark as Resolved' : 'Mark as Denied'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {statusDialog.newStatus === 'resolved'
              ? 'Add notes about what was implemented (optional). The user will be notified via email.'
              : 'Provide a reason why this suggestion was denied (optional). The user will be notified via email.'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={statusDialog.newStatus === 'resolved' ? 'Implementation Notes' : 'Denial Reason'}
            value={statusDialog.notes}
            onChange={(e) => setStatusDialog({ ...statusDialog, notes: e.target.value })}
            placeholder={
              statusDialog.newStatus === 'resolved'
                ? 'e.g., Added new button to the dashboard as requested...'
                : 'e.g., This feature is out of scope for the current release...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ ...statusDialog, open: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={statusDialog.newStatus === 'resolved' ? 'success' : 'error'}
            onClick={handleStatusChange}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Updating...' : `Mark ${STATUS_LABELS[statusDialog.newStatus]}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
