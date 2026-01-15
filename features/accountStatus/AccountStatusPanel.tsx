'use client';
import React from 'react';
import {
  Alert,
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
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FaPause, FaPlay, FaBan, FaCheckCircle } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertClient, Client } from '@/services/clients';
import { useSession } from '@/features/auth/session';
import type { ProgramLevelConfig } from '@/features/auth/service';

type Props = {
  client: Client & {
    programLevel?: string;
    accountStatus?: string;
    pausedAt?: string;
    pausedReason?: string;
  };
};

const statusConfig = {
  active: { label: 'Active', color: 'success' as const, icon: <FaCheckCircle /> },
  paused: { label: 'Paused', color: 'warning' as const, icon: <FaPause /> },
  suspended: { label: 'Suspended', color: 'error' as const, icon: <FaBan /> },
};

// Default program levels (used if agency hasn't customized)
const DEFAULT_PROGRAM_LEVELS: ProgramLevelConfig[] = [
  { value: 'bronze', label: 'Bronze', color: '#cd7f32' },
  { value: 'silver', label: 'Silver', color: '#c0c0c0' },
  { value: 'gold', label: 'Gold', color: '#ffd700' },
  { value: 'platinum', label: 'Platinum', color: '#e5e4e2' },
];

// Helper to determine if a hex color is light (needs dark text)
function isColorLight(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function AccountStatusPanel({ client }: Props) {
  const { session } = useSession();
  
  // Use custom program levels from settings, or fall back to defaults
  const programLevels = session?.agencySettings?.programLevels?.length 
    ? session.agencySettings.programLevels 
    : DEFAULT_PROGRAM_LEVELS;
  const queryClient = useQueryClient();
  const [pauseDialogOpen, setPauseDialogOpen] = React.useState(false);
  const [pauseReason, setPauseReason] = React.useState('');
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const currentStatus = (client.accountStatus || 'active') as keyof typeof statusConfig;
  const statusInfo = statusConfig[currentStatus] || statusConfig.active;
  const currentLevel = programLevels.find(p => p.value === client.programLevel);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Client>) => upsertClient({ id: client.id, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', client.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setPauseDialogOpen(false);
      setSnackbar({ open: true, message: 'Account status updated', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const handlePause = async () => {
    await updateMutation.mutateAsync({
      accountStatus: 'paused',
      pausedAt: new Date().toISOString(),
      pausedReason: pauseReason || 'Paused by agent',
    } as any);
  };

  const handleResume = async () => {
    await updateMutation.mutateAsync({
      accountStatus: 'active',
      pausedAt: undefined,
      pausedReason: undefined,
    } as any);
  };

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this account? The athlete will not be able to log in.')) return;
    await updateMutation.mutateAsync({
      accountStatus: 'suspended',
      pausedAt: new Date().toISOString(),
      pausedReason: 'Account suspended',
    } as any);
  };

  const handleSetProgramLevel = async (level: string) => {
    await updateMutation.mutateAsync({
      programLevel: level,
    } as any);
  };

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Account Management</Typography>
          
          {/* Status Section */}
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Account Status
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip 
                  icon={statusInfo.icon as any}
                  label={statusInfo.label}
                  color={statusInfo.color}
                  data-testid="account-status"
                />
                {currentStatus === 'paused' && client.pausedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Paused on {new Date(client.pausedAt).toLocaleDateString()}
                    {client.pausedReason && ` - ${client.pausedReason}`}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Program Level Section */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Program Level
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {programLevels.map(level => {
                  const isSelected = client.programLevel === level.value;
                  // Determine if color is light (needs dark text) based on luminance
                  const isLightColor = isColorLight(level.color);
                  const textColor = isLightColor ? '#000' : '#fff';
                  
                  return (
                    <Chip
                      key={level.value}
                      label={level.label}
                      onClick={() => handleSetProgramLevel(level.value)}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{
                        bgcolor: isSelected ? level.color : 'transparent',
                        borderColor: level.color,
                        color: isSelected ? textColor : 'inherit',
                        '&:hover': {
                          bgcolor: level.color,
                          color: textColor,
                        },
                      }}
                      data-testid={`program-level-${level.value}`}
                    />
                  );
                })}
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {currentStatus === 'active' && (
                <>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<FaPause />}
                    onClick={() => setPauseDialogOpen(true)}
                    disabled={updateMutation.isPending}
                    data-testid="pause-account-btn"
                  >
                    Pause Account
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FaBan />}
                    onClick={handleSuspend}
                    disabled={updateMutation.isPending}
                    data-testid="suspend-account-btn"
                  >
                    Suspend
                  </Button>
                </>
              )}
              {(currentStatus === 'paused' || currentStatus === 'suspended') && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FaPlay />}
                  onClick={handleResume}
                  disabled={updateMutation.isPending}
                  data-testid="resume-account-btn"
                >
                  {updateMutation.isPending ? <CircularProgress size={20} /> : 'Reactivate Account'}
                </Button>
              )}
            </Stack>

            {/* Warning for paused/suspended */}
            {currentStatus !== 'active' && (
              <Alert severity={currentStatus === 'suspended' ? 'error' : 'warning'} sx={{ mt: 2 }}>
                {currentStatus === 'suspended' 
                  ? 'This account is suspended. The athlete cannot log in and their profile is hidden from coaches.'
                  : 'This account is paused. The athlete can still log in but their profile is hidden from coaches.'
                }
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Pause Dialog */}
      <Dialog open={pauseDialogOpen} onClose={() => setPauseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pause Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pausing the account will hide the athlete's profile from coaches. 
            They can still log in to view their information.
          </Typography>
          <TextField
            fullWidth
            label="Reason (optional)"
            value={pauseReason}
            onChange={(e) => setPauseReason(e.target.value)}
            placeholder="e.g., Non-payment, Temporary break, etc."
            data-testid="pause-reason"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPauseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handlePause}
            disabled={updateMutation.isPending}
            data-testid="confirm-pause-btn"
          >
            {updateMutation.isPending ? <CircularProgress size={20} /> : 'Pause Account'}
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
