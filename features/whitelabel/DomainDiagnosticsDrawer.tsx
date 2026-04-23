'use client';

/**
 * Diagnostics drawer for a single domain.
 *
 * Pulls three signals side-by-side so an operator can answer "why is this
 * domain stuck?" without leaving the settings page:
 *
 *   1. The raw DOMAIN# record (status, certArn, validation record, lastError)
 *   2. The live check() response (ACM status + per-resolver DNS answers)
 *   3. The recent AUDIT# events for this hostname
 */

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { DomainRecord } from '@/services/domains';
import {
  checkDomain,
  fetchAuditEvents,
  type AuditEvent,
  type CheckDomainResponse,
} from '@/services/domainsClient';

export function DomainDiagnosticsDrawer({
  open,
  domain,
  onClose,
}: {
  open: boolean;
  domain: DomainRecord | null;
  onClose: () => void;
}) {
  const [check, setCheck] = React.useState<CheckDomainResponse | null>(null);
  const [events, setEvents] = React.useState<AuditEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!domain) return;
    setLoading(true);
    setError(null);
    try {
      const [c, a] = await Promise.all([
        checkDomain(domain.hostname),
        fetchAuditEvents('domains', domain.hostname),
      ]);
      setCheck(c);
      setEvents(a.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagnostics');
    } finally {
      setLoading(false);
    }
  }, [domain]);

  React.useEffect(() => {
    if (open && domain) {
      load();
    } else {
      setCheck(null);
      setEvents([]);
    }
  }, [open, domain, load]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{domain?.hostname || 'Diagnostics'}</Typography>
          <IconButton onClick={onClose} aria-label="Close">
            ×
          </IconButton>
        </Box>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {loading ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : null}

        {domain && !loading ? (
          <Stack spacing={3} divider={<Divider />}>
            <Section title="Record">
              <Stack spacing={1}>
                <Row label="Status" value={<Chip size="small" label={domain.status} />} />
                <Row label="Cert ARN" value={domain.certArn || '—'} />
                <Row label="Traffic target" value={domain.trafficTarget || '—'} />
                {domain.lastError ? (
                  <Alert severity="warning">{domain.lastError}</Alert>
                ) : null}
                {domain.validationRecord ? (
                  <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    <div>CNAME {domain.validationRecord.name}</div>
                    <div>→ {domain.validationRecord.value}</div>
                  </Box>
                ) : null}
              </Stack>
            </Section>

            <Section title="Live check">
              {check ? (
                <Stack spacing={1}>
                  <Row
                    label="ACM status"
                    value={check.cert?.status || '—'}
                  />
                  <Row
                    label="DNS match"
                    value={
                      check.dnsCheck ? (
                        <Chip
                          size="small"
                          label={check.dnsCheck.matches ? 'yes' : 'no'}
                          color={check.dnsCheck.matches ? 'success' : 'warning'}
                        />
                      ) : (
                        '—'
                      )
                    }
                  />
                  {check.dnsCheck ? (
                    <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {check.dnsCheck.perResolver.map((r) => (
                        <div key={r.resolver}>
                          [{r.resolver}] {r.error || r.records.join(', ') || '(empty)'}
                        </div>
                      ))}
                    </Box>
                  ) : null}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No check data yet.
                </Typography>
              )}
              <Button size="small" onClick={load} sx={{ mt: 1 }}>
                Re-run check
              </Button>
            </Section>

            <Section title={`Audit log (${events.length})`}>
              {events.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No events yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {events.map((e) => (
                    <Box key={e.id} sx={{ fontSize: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(e.timestamp).toLocaleString()}
                      </Typography>
                      <Box sx={{ fontFamily: 'monospace' }}>
                        {e.action}
                        {e.details?.status ? ` · ${String(e.details.status)}` : ''}
                        {e.details?.errorCode ? ` · ${String(e.details.errorCode)}` : ''}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Section>
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ fontSize: 13 }}>{value}</Box>
    </Box>
  );
}
