'use client';

/**
 * Status board for every custom domain owned by the current agency.
 *
 * Reads from `GET /domains` (new list endpoint, Phase 6b) and lets the operator
 * kick a re-check (`GET /domains/{hostname}`) or remove a domain
 * (`DELETE /domains/{hostname}`). This is deliberately a thin view over the
 * backend record so ops can see the same status the lifecycle handler reports.
 */

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type { DomainRecord, DomainStatus } from '@/services/domains';
import { checkDomain, listDomains, removeDomain } from '@/services/domainsClient';
import { DomainDiagnosticsDrawer } from './DomainDiagnosticsDrawer';

const STATUS_COLOR: Record<DomainStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  PENDING_DNS: 'warning',
  VALIDATING: 'info',
  PROVISIONING: 'info',
  ACTIVE: 'success',
  FAILED: 'error',
  REMOVED: 'default',
};

export function DomainStatusBoard() {
  const [domains, setDomains] = React.useState<DomainRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyHost, setBusyHost] = React.useState<string | null>(null);
  const [diagDomain, setDiagDomain] = React.useState<DomainRecord | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDomains();
      setDomains(res.domains);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onRecheck(hostname: string) {
    setBusyHost(hostname);
    try {
      await checkDomain(hostname);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setBusyHost(null);
    }
  }

  async function onRemove(hostname: string) {
    if (!confirm(`Remove ${hostname}? This will detach the alias and delete the certificate.`)) {
      return;
    }
    setBusyHost(hostname);
    try {
      await removeDomain(hostname);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setBusyHost(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (domains.length === 0) {
    return (
      <Alert severity="info">
        No custom domains attached yet. Use the wizard above to connect one.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">{domains.length} domain(s)</Typography>
        <Button size="small" onClick={load} disabled={!!busyHost}>
          Refresh
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hostname</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Attached</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {domains.map((d) => (
            <TableRow key={d.hostname} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {d.hostname}
                </Typography>
                {d.lastError ? (
                  <Typography variant="caption" color="error">
                    {d.lastError}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={d.status}
                  color={STATUS_COLOR[d.status] || 'default'}
                />
              </TableCell>
              <TableCell>
                {d.attachedAt ? new Date(d.attachedAt).toLocaleDateString() : '—'}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Re-check">
                  <span>
                    <IconButton
                      size="small"
                      disabled={busyHost === d.hostname}
                      onClick={() => onRecheck(d.hostname)}
                    >
                      {busyHost === d.hostname ? (
                        <CircularProgress size={14} />
                      ) : (
                        <span aria-hidden>↻</span>
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                {d.status === 'ACTIVE' ? (
                  <Button
                    size="small"
                    component="a"
                    href={`https://${d.hostname}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </Button>
                ) : null}
                <Button size="small" onClick={() => setDiagDomain(d)}>
                  Diagnose
                </Button>
                <Button
                  size="small"
                  color="error"
                  disabled={busyHost === d.hostname}
                  onClick={() => onRemove(d.hostname)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DomainDiagnosticsDrawer
        open={!!diagDomain}
        domain={diagDomain}
        onClose={() => setDiagDomain(null)}
      />
    </Stack>
  );
}
