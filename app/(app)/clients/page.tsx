'use client';
import React from 'react';
import { ClientsList } from '@/features/clients/ClientsList';
import { Typography, Button, Stack, TextField } from '@mui/material';
import Link from 'next/link';
import { useSession } from '@/features/auth/session';
import { upsertClient } from '@/services/clients';
import { useQueryClient } from '@tanstack/react-query';

export default function ClientsPage() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [inviteUrl, setInviteUrl] = React.useState<string>('');
  const [issuing, setIssuing] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  React.useEffect(() => {
    (async () => {
      if (!session?.email) return;
      try {
        const res = await fetch(`/api/forms/submissions?agencyEmail=${encodeURIComponent(session.email)}`);
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
          await fetch('/api/forms/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
      setIssuing(true);
      const res = await fetch('/api/forms/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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


