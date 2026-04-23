'use client';

/**
 * Phase 4 custom-host handoff consumer.
 *
 * Arrives here after the canonical auth surface (app.myrecruiteragency.com)
 * redirected the browser back to the custom host with a single-use handoff
 * token. This page POSTs the token to /auth/session so the custom host gets
 * its own `an_session` cookie, then redirects to the requested path.
 *
 * See docs/02-solutions-architect/whitelabel-audit.md §4 and the /auth/handoff
 * backend handler in infra/src/handlers/auth-handoff.ts.
 */

import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { postSession } from '@/features/auth/service';

function isSafeReturnTo(returnTo: string | null): string {
  if (!returnTo) return '/';
  if (!returnTo.startsWith('/')) return '/';
  if (returnTo.startsWith('//')) return '/';
  return returnTo;
}

export default function HandoffConsumerPage() {
  const [status, setStatus] = useState<'working' | 'error' | 'done'>('working');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token') || '';
        const returnTo = isSafeReturnTo(params.get('return_to'));

        if (!token) {
          throw new Error('Missing handoff token');
        }

        await postSession(token);
        if (cancelled) return;
        setStatus('done');
        window.location.replace(returnTo);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Sign-in failed';
        setError(message);
        setStatus('error');
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 420, textAlign: 'center' }}>
        {status === 'working' ? (
          <>
            <CircularProgress />
            <Typography variant="h6">Signing you in…</Typography>
            <Typography variant="body2" color="text.secondary">
              Establishing a secure session on this site.
            </Typography>
          </>
        ) : null}

        {status === 'done' ? (
          <Typography variant="h6">Redirecting…</Typography>
        ) : null}

        {status === 'error' ? (
          <>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button component="a" href="/" variant="contained">
              Back to home
            </Button>
          </>
        ) : null}
      </Stack>
    </Box>
  );
}
