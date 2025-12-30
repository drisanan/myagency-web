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

export function SettingsForm() {
  const { session, refreshSession } = useSession();
  
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [accessCode, setAccessCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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
      setFirstName('');
      setLastName('');
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
        Update your profile information below. Changes will sync with Go High Level.
      </Typography>
      
      <TextField
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Enter new first name"
        fullWidth
      />
      
      <TextField
        label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Enter new last name"
        fullWidth
      />
      
      <TextField
        label="Access Code"
        type="password"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Enter new 6-digit code"
        helperText="6-digit numeric code used for login"
        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
        fullWidth
      />
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <Button
        variant="contained"
        onClick={onSave}
        disabled={loading || (!firstName && !lastName && !accessCode)}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </Stack>
  );
}
