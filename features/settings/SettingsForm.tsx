import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { updateProfile } from '@/features/settings/service';

export function SettingsForm() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    if (!name || !email) {
      setError('Required fields missing');
      return;
    }
    try {
      setLoading(true);
      await updateProfile({ name, email });
      setSuccess('Saved');
    } catch (e) {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 480 }}>
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Button variant="contained" onClick={onSave} disabled={loading}>
        Save
      </Button>
    </Stack>
  );
}


