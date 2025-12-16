'use client';
import React from 'react';
import { ClientsList } from '@/features/clients/ClientsList';
import { Typography, Button, Stack, TextField } from '@mui/material';
import Link from 'next/link';
import { useSession } from '@/features/auth/session';
import { upsertClient } from '@/services/clients';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
const resolvedApiBase = API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');

export default function ClientsPage() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [inviteUrl, setInviteUrl] = React.useState<string>('');
  const [issuing, setIssuing] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  React.useEffect(() => {
    (async () => {
      if (!session?.email) return;
      if (!resolvedApiBase) {
        console.error('[clients:forms:error]', { error: 'API_BASE_URL missing' });
        return;
      }
      try {
        const res = await fetch(`${resolvedApiBase}/forms/submissions?agencyEmail=${encodeURIComponent(session.email)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!data?.ok) return;
        const items = Array.isArray(data.items) ? data.items : [];
        const idsToConsume: string[] = [];
        for (const s of items) {
          const v = s?.data || {};
          const client = {
            id: s.id,
            email: v.email || '',
            phone: v.phone || '',
            password: v.password || '',
            firstName: v.firstName || '',
            lastName: v.lastName || '',
            sport: v.sport || '',
            division: v.division || '',
            agencyEmail: session.email,
            photoUrl: v.profileImageUrl || '',
            radar: v.radar || {},
          };
          await upsertClient(client as any);
          idsToConsume.push(s.id);
        }
        if (idsToConsume.length) {
          await fetch(`${resolvedApiBase}/forms/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ agencyEmail: session.email, ids: idsToConsume }),
          });
          queryClient.invalidateQueries({ queryKey: ['clients', session.email] });
        }
      } catch {}
    })();
  }, [session?.email]);
  async function handleGenerateLink() {
    try {
      if (!session?.email) return;
      if (!resolvedApiBase) throw new Error('API_BASE_URL is not configured');
      setIssuing(true);
      const res = await fetch(`${resolvedApiBase}/forms/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agencyEmail: session.email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to create link');
      setInviteUrl(data.url);
    } catch {
      setInviteUrl('');
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
    } catch {}
  }
  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Athletes</Typography>
        <Stack direction="row" spacing={1}>
          <Button LinkComponent={Link} href="/clients/new" variant="contained">New</Button>
          <Button variant="outlined" onClick={handleGenerateLink} disabled={issuing}>
            {issuing ? 'Generating…' : 'Generate Form Link'}
          </Button>
        </Stack>
      </Stack>
      {inviteUrl ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
          <TextField label="Intake Link" value={inviteUrl} fullWidth InputProps={{ readOnly: true }} />
          <Button variant="outlined" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</Button>
          <Button variant="text" LinkComponent={Link} href={inviteUrl} target="_blank">Open</Button>
        </Stack>
      ) : null}
      <ClientsList />
    </Stack>
  );
}


