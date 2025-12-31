'use client';

import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSession } from '@/features/auth/session';
import { updateProfile } from '@/services/profile';

export function ProfileForm() {
  const { session, refreshSession } = useSession();
  
  // Pre-populate from session
  const [firstName, setFirstName] = React.useState(session?.firstName || '');
  const [lastName, setLastName] = React.useState(session?.lastName || '');
  const [accessCode, setAccessCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Update fields when session loads
  React.useEffect(() => {
    if (session?.firstName) setFirstName(session.firstName);
    if (session?.lastName) setLastName(session.lastName);
  }, [session?.firstName, session?.lastName]);

  const onSave = async () => {
    setError(null);
    setSuccess(null);

    if (accessCode && !/^\d{6}$/.test(accessCode)) {
      setError('Access code must be exactly 6 digits');
      return;
    }

    if (!firstName && !lastName && !accessCode) {
      setError('Please fill in at least one field to update');
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        accessCode: accessCode || undefined,
      });
      
      if (!result.ok) {
        throw new Error(result.error || 'Update failed');
      }
      
      setSuccess('Profile updated successfully');
      setAccessCode(''); // Clear for security
      await refreshSession();
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 480 }}>
      <Typography variant="body2" color="text.secondary">
        Update your personal information. Changes will sync with Go High Level.
      </Typography>
      
      <TextField
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Enter first name"
        fullWidth
      />
      
      <TextField
        label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Enter last name"
        fullWidth
      />
      
      <TextField
        label="Access Code"
        type="password"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Enter new 6-digit code"
        helperText="Leave blank to keep current code"
        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
        fullWidth
      />
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <Button
        variant="contained"
        onClick={onSave}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </Stack>
  );
}

