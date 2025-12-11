'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { register, getSessions } from '@/features/weightroom/service';

export function RegistrantFlow() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sessions, setSessions] = React.useState<Array<{ id: string; title: string }> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onRegister = async () => {
    setError(null);
    try {
      setLoading(true);
      await register({ name, email });
      const list = await getSessions();
      setSessions(list);
    } catch (e) {
      setError('Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 480 }}>
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" onClick={onRegister} disabled={loading || !name || !email}>
        Register
      </Button>
      {sessions && (
        <List>
          {sessions.map((s) => (
            <ListItem key={s.id}>
              <ListItemText primary={s.title} />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
}


