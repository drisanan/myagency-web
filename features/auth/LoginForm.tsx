'use client';
import React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { validateEmail } from '@/features/auth/validators';

type Credentials = { email: string; phone: string; accessCode: string };
type Props = {
  onSubmit: (creds: Credentials) => Promise<void> | void;
};

export function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [accessCode, setAccessCode] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; phone?: string; accessCode?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { email?: string; phone?: string; accessCode?: string } = {};
    if (!email) nextErrors.email = 'Required';
    else if (!validateEmail(email)) nextErrors.email = 'Invalid email';
    const phoneTrim = phone.trim();
    const accessTrim = accessCode.trim();
    if (!phoneTrim) nextErrors.phone = 'Required';
    else if (!/^\+?\d+$/.test(phoneTrim)) nextErrors.phone = 'Phone must be digits only';
    if (!accessTrim) nextErrors.accessCode = 'Required';
    else if (!/^\d+$/.test(accessTrim)) nextErrors.accessCode = 'Access code must be digits only';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      setSubmitting(true);
      await onSubmit({ email: email.trim(), phone: phoneTrim, accessCode: accessTrim });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        {(errors.email || errors.phone || errors.accessCode) && (
          <Alert severity="error" data-testid="error-list">
            <AlertTitle>There were problems with your submission</AlertTitle>
            <ul style={{ margin: 0, paddingInlineStart: 20 }}>
              {errors.email && <li>Email: {errors.email}</li>}
              {errors.phone && <li>Phone: {errors.phone}</li>}
              {errors.accessCode && <li>Access Code: {errors.accessCode}</li>}
            </ul>
          </Alert>
        )}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <TextField
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={Boolean(errors.phone)}
          helperText={errors.phone}
        />
        <TextField
          label="Access Code"
          type="text"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          error={Boolean(errors.accessCode)}
          helperText={errors.accessCode}
        />
        <MuiButton
          type="submit"
          variant="contained"
          disabled={submitting}
          data-testid="login-submit"
          startIcon={submitting ? <CircularProgress size={18} data-testid="login-spinner" /> : null}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </MuiButton>
      </Stack>
    </form>
  );
}


