'use client';

import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { useSession } from '@/features/auth/session';
import { updateProfile } from '@/services/profile';
import { updateAgencySettings } from '@/services/agencies';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';

export function ProfileForm() {
  const { session, refreshSession } = useSession();
  const sports = getSports();
  
  // Pre-populate from session
  const [firstName, setFirstName] = React.useState(session?.firstName || '');
  const [lastName, setLastName] = React.useState(session?.lastName || '');
  const [accessCode, setAccessCode] = React.useState('');
  const [preferredSport, setPreferredSport] = React.useState(session?.agencySettings?.preferredSport || '');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sportLoading, setSportLoading] = React.useState(false);
  const [sportSuccess, setSportSuccess] = React.useState<string | null>(null);

  // Update fields when session loads
  React.useEffect(() => {
    if (session?.firstName) setFirstName(session.firstName);
    if (session?.lastName) setLastName(session.lastName);
    if (session?.agencySettings?.preferredSport) setPreferredSport(session.agencySettings.preferredSport);
  }, [session?.firstName, session?.lastName, session?.agencySettings?.preferredSport]);

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
        size="small"
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Enter first name"
        fullWidth
      />
      
      <TextField
        size="small"
        label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Enter last name"
        fullWidth
      />
      
      <TextField
        size="small"
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

      {session?.role === 'agency' && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Dashboard Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set your default sport for the recruiting calendar on the dashboard.
          </Typography>
          
          <TextField
            size="small"
            select
            label="Preferred Sport (Calendar)"
            value={preferredSport}
            onChange={(e) => setPreferredSport(e.target.value)}
            helperText="This sport will be selected by default on the dashboard calendar"
            fullWidth
            SelectProps={{ MenuProps: { disablePortal: true } }}
          >
            {sports.map((s) => (
              <MenuItem key={s} value={s}>
                {formatSportLabel(s)}
              </MenuItem>
            ))}
          </TextField>
          
          {sportSuccess && <Alert severity="success">{sportSuccess}</Alert>}
          
          <Button
            variant="outlined"
            onClick={async () => {
              if (!session?.agencyEmail) return;
              setSportLoading(true);
              setSportSuccess(null);
              try {
                await updateAgencySettings(session.agencyEmail, {
                  ...session.agencySettings,
                  preferredSport,
                });
                setSportSuccess('Sport preference saved!');
                await refreshSession();
              } catch (e: any) {
                setError(e?.message || 'Failed to save preference');
              } finally {
                setSportLoading(false);
              }
            }}
            disabled={sportLoading || !preferredSport}
            startIcon={sportLoading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {sportLoading ? 'Saving...' : 'Save Preference'}
          </Button>
        </>
      )}
    </Stack>
  );
}

