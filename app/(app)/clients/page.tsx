'use client';

import React from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Typography, Button, Stack, TextField, CircularProgress, Box } from '@mui/material';

import { ClientsList } from '@/features/clients/ClientsList';
import { useSession } from '@/features/auth/session';
import { upsertClient } from '@/services/clients';
import { useTour } from '@/features/tour/TourProvider';
import { athletesSteps } from '@/features/tour/athletesSteps';

// FIX: Hardcode the fallback to your actual API domain to prevent localhost issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';

export default function ClientsPage() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();
  const { startTour } = useTour();

  React.useEffect(() => {
    if (!loading && session) startTour('athletes', athletesSteps);
  }, [loading, session, startTour]);
  
  const [inviteUrl, setInviteUrl] = React.useState<string>('');
  const [issuing, setIssuing] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  // 1. Sync Submissions Effect
  React.useEffect(() => {
    let mounted = true;

    const syncSubmissions = async () => {
      // A. Wait for global auth loading to finish
      if (loading) return;

      // B. Verify we actually have a logged-in user
      if (!userEmail) {
        return;
      }

      try {
        // C. Fetch pending submissions
        const res = await fetch(`${API_BASE_URL}/forms/submissions?agencyEmail=${encodeURIComponent(userEmail)}`, {
          credentials: 'include', // Critical: Passes the session cookie
        });

        if (!res.ok) return;

        const data = await res.json();
        const items = (data?.items && Array.isArray(data.items)) ? data.items : [];

        if (items.length === 0) return;

        console.log('[ClientsPage] Found new submissions:', items.length);

        // D. Upsert clients locally
        const idsToConsume: string[] = [];
        for (const s of items) {
          const v = s?.data || {};
          const clientPayload = {
            id: s.id, // Use form ID as client ID or generate new one if preferred
            email: v.email || '',
            phone: v.phone || '',
            firstName: v.firstName || '',
            lastName: v.lastName || '',
            sport: v.sport || '',
            division: v.division || '',
            agencyEmail: userEmail,
            photoUrl: v.profileImageUrl || '',
            radar: v.radar || {},
            // Default password if needed, or handle via invite logic
            password: v.password || undefined, 
          };

          // Upsert to your Client Service
          await upsertClient(clientPayload);
          idsToConsume.push(s.id);
        }

        // E. Mark submissions as consumed so they don't sync again
        if (idsToConsume.length > 0 && mounted) {
          await fetch(`${API_BASE_URL}/forms/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ agencyEmail: userEmail, ids: idsToConsume }),
          });
          
          // Refresh the react-query list to show new clients immediately
          queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
      } catch (err) {
        console.error('[ClientsPage] Sync failed', err);
      }
    };

    syncSubmissions();

    return () => { mounted = false; };
  }, [userEmail, loading, queryClient]); // FIX: Depend on userEmail

  // 2. Loading State
  if (loading) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        <CircularProgress size={24} />
        <Typography>Verifying session…</Typography>
      </Stack>
    );
  }

  // 3. Not Logged In State
  if (!userEmail) {
    return (
      <Stack spacing={2} sx={{ py: 4 }}>
        <Typography>Please log in to view clients.</Typography>
        <Button LinkComponent={Link} href="/login" variant="outlined">Go to Login</Button>
      </Stack>
    );
  }

  // 4. Action Handlers
  async function handleGenerateLink() {
    if (!userEmail) return;

    try {
      setIssuing(true);
      const res = await fetch(`${API_BASE_URL}/forms/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // Backend handles token generation; body might not even be needed if using cookies,
        // but sending agencyEmail is explicit and safe.
        body: JSON.stringify({ agencyEmail: userEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to create link');
      }
      
      // Use the URL returned by the backend
      setInviteUrl(data.url);
    } catch (e: any) {
      console.error('Generate link failed', e);
      setInviteUrl('');
      // Optional: alert(e.message);
    } finally {
      setIssuing(false);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }

  // 5. Render
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Athletes</Typography>
        <Stack direction="row" spacing={1}>
          <Button data-tour="add-athlete-btn" LinkComponent={Link} href="/clients/new" variant="contained">
            New
          </Button>
          <Button variant="outlined" onClick={handleGenerateLink} disabled={issuing}>
            {issuing ? 'Generating…' : 'Generate Form Link'}
          </Button>
        </Stack>
      </Stack>

      {inviteUrl && (
        <Stack data-tour="invite-section" direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <TextField 
            label="Intake Link" 
            value={inviteUrl} 
            fullWidth 
            size="small"
            InputProps={{ readOnly: true }} 
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="text" LinkComponent={Link} href={inviteUrl} target="_blank">
              Open
            </Button>
          </Stack>
        </Stack>
      )}

      <Box data-tour="athletes-list">
        <ClientsList />
      </Box>
    </Stack>
  );
}