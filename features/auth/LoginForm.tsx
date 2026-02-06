'use client';
import React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { validateEmail } from '@/features/auth/validators';
import { colors, gradients } from '@/theme/colors';

type Credentials = { email: string; phone: string; accessCode: string };
type Props = {
  onSubmit: (creds: Credentials) => Promise<void> | void;
  darkMode?: boolean;
};

export function LoginForm({ onSubmit, darkMode }: Props) {
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

  const darkFieldSx = darkMode ? {
    '& .MuiOutlinedInput-root': {
      color: colors.white,
      '& fieldset': { borderColor: '#FFFFFF30' },
      '&:hover fieldset': { borderColor: '#FFFFFF50' },
      '&.Mui-focused fieldset': { borderColor: colors.lime },
    },
    '& .MuiInputLabel-root': { color: '#FFFFFF80' },
    '& .MuiInputLabel-root.Mui-focused': { color: colors.lime },
    '& .MuiFormHelperText-root': { color: colors.error },
  } : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
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
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
          sx={darkFieldSx}
        />
        <TextField
          label="Phone"
          type="tel"
          autoComplete="off"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={Boolean(errors.phone)}
          helperText={errors.phone}
          sx={darkFieldSx}
        />
        <TextField
          label="Access Code"
          type="password"
          autoComplete="new-password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value.replace(/\D+/g, ''))}
          error={Boolean(errors.accessCode)}
          helperText={errors.accessCode}
          sx={darkFieldSx}
        />
        <MuiButton
          type="submit"
          variant="contained"
          disabled={submitting}
          data-testid="login-submit"
          startIcon={submitting ? <CircularProgress size={18} data-testid="login-spinner" sx={{ color: colors.black }} /> : null}
          sx={{
            background: gradients.limeButton,
            color: colors.black,
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: '1.2rem',
            letterSpacing: '0.08em',
            py: 1.5,
            borderRadius: 0,
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            boxShadow: `0 4px 20px ${colors.lime}30`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, #D4FF1A 0%, #CCFF00 100%)`,
              boxShadow: `0 6px 28px ${colors.lime}50`,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </MuiButton>
      </Stack>
    </form>
  );
}
