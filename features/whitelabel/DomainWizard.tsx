'use client';

/**
 * Phase 6 white-label onboarding wizard (5 steps).
 *
 *   1. Template   — pick one of the 3 published landing templates
 *   2. Domain     — enter a hostname and POST /domains (requests ACM cert)
 *   3. DNS setup  — show the CNAME + ACM validation record customer must add
 *   4. Verify     — poll GET /domains/{hostname} until ACM ISSUED + alias live
 *   5. Live       — success state with link to status board
 *
 * All user input is validated against the shared `normalizeHostname` /
 * `validateLandingConfig` helpers, so the wizard cannot produce a record the
 * backend rejects.
 */

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  LANDING_TEMPLATE_METADATA,
  type TemplateId,
} from '@/features/whitelabel/templates';
import { normalizeHostname, HostnameNormalizeError } from '@/services/domains';
import {
  attachDomain,
  checkDomain,
  type CheckDomainResponse,
} from '@/services/domainsClient';
import type { DomainRecord } from '@/services/domains';

const STEPS = ['Template', 'Domain', 'DNS setup', 'Verify', 'Live'] as const;

// Codes emitted by `infra/src/handlers/domains.ts`. Keep these in sync with
// the `code` strings in that handler so customers always see the same
// message regardless of the underlying API error wording.
const ATTACH_ERROR_MESSAGES: Record<string, string> = {
  ERR_ACM_REQUEST:
    'We could not request an SSL certificate for this domain. Our team has been notified — try again shortly, or contact support if it persists.',
  ERR_HOST_CLAIMED:
    'This hostname is already attached to another agency. Choose a different subdomain.',
  ERR_PILOT_RESERVED:
    'That hostname is reserved for our pilot program and cannot be attached from here.',
  ERR_HOSTNAME:
    'That hostname does not look valid. Use a subdomain like app.youragency.com.',
  ERR_RATE_LIMITED:
    'You have attached a lot of domains recently. Please wait a few minutes before trying again.',
  ERR_EDGE_ATTACH:
    'We could not attach your domain to our content delivery network. Try checking again in a minute.',
  ERR_EDGE_DETACH:
    'We could not detach your domain from our content delivery network. Try again shortly.',
};

type ApiErrorShape = Error & { code?: string; status?: number };

function messageForAttachError(err: unknown): string {
  const apiErr = err as ApiErrorShape | undefined;
  if (apiErr?.code && ATTACH_ERROR_MESSAGES[apiErr.code]) {
    return ATTACH_ERROR_MESSAGES[apiErr.code];
  }
  if (apiErr instanceof Error && apiErr.message) return apiErr.message;
  return 'Attach failed. Please try again.';
}

type WizardState = {
  step: number;
  templateId: TemplateId | null;
  hostname: string;
  hostnameError: string | null;
  domain: DomainRecord | null;
  check: CheckDomainResponse | null;
  busy: boolean;
  error: string | null;
};

function nextStatusForCheck(res: CheckDomainResponse): number {
  const status = res.domain.status;
  if (status === 'ACTIVE') return 4;
  if (status === 'VALIDATING' || status === 'PROVISIONING') return 3;
  if (status === 'PENDING_DNS') return 2;
  if (status === 'FAILED') return 2;
  return 2;
}

export function DomainWizard() {
  const [state, setState] = React.useState<WizardState>({
    step: 0,
    templateId: null,
    hostname: '',
    hostnameError: null,
    domain: null,
    check: null,
    busy: false,
    error: null,
  });

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  // Step 2 -> 3: attach
  async function submitHostname() {
    try {
      update({ busy: true, error: null, hostnameError: null });
      const normalized = normalizeHostname(state.hostname);
      const res = await attachDomain(normalized);
      update({ domain: res.domain, step: 2, busy: false });
    } catch (err) {
      if (err instanceof HostnameNormalizeError) {
        update({ busy: false, hostnameError: err.message });
        return;
      }
      update({
        busy: false,
        error: messageForAttachError(err),
      });
    }
  }

  // Step 3/4 polling
  React.useEffect(() => {
    if (state.step !== 3 || !state.domain) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const res = await checkDomain(state.domain!.hostname);
        if (cancelled) return;
        const nextStep = nextStatusForCheck(res);
        update({ check: res, step: nextStep });
        if (!cancelled && nextStep < 4) {
          timer = setTimeout(poll, 10_000);
        }
      } catch (err) {
        if (!cancelled) {
          update({ error: messageForAttachError(err) });
        }
      }
    }
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // Polling only needs to restart when the step or the target hostname
    // changes; reading state.domain.hostname inside the closure is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.domain?.hostname]);

  async function refreshCheck() {
    if (!state.domain) return;
    try {
      update({ busy: true, error: null });
      const res = await checkDomain(state.domain.hostname);
      update({ check: res, step: nextStatusForCheck(res), busy: false });
    } catch (err) {
      update({
        busy: false,
        error: messageForAttachError(err),
      });
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Stepper activeStep={state.step} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {state.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      ) : null}

      {state.step === 0 ? (
        <Stack spacing={2}>
          <Typography variant="h6">Pick a landing template</Typography>
          <Stack spacing={2}>
            {LANDING_TEMPLATE_METADATA.map((t) => (
              <Paper
                key={t.id}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderColor: state.templateId === t.id ? 'primary.main' : 'divider',
                }}
                onClick={() => update({ templateId: t.id })}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip label={state.templateId === t.id ? 'Selected' : 'Preview'} size="small" />
                  <Box>
                    <Typography variant="subtitle1">{t.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Box>
            <Button
              variant="contained"
              disabled={!state.templateId}
              onClick={() => update({ step: 1 })}
            >
              Continue
            </Button>
          </Box>
        </Stack>
      ) : null}

      {state.step === 1 ? (
        <Stack spacing={2}>
          <Typography variant="h6">Enter your domain</Typography>
          <Typography variant="body2" color="text.secondary">
            Use a subdomain you control — for example <code>app.youragency.com</code>. Apex
            domains are not supported yet.
          </Typography>
          <TextField
            label="Custom domain"
            value={state.hostname}
            onChange={(e) => update({ hostname: e.target.value, hostnameError: null })}
            error={!!state.hostnameError}
            helperText={state.hostnameError || ' '}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => update({ step: 0 })}>
              Back
            </Button>
            <Button
              variant="contained"
              disabled={state.busy || !state.hostname.trim()}
              onClick={submitHostname}
            >
              {state.busy ? <CircularProgress size={18} /> : 'Attach domain'}
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {(state.step === 2 || state.step === 3) && state.domain ? (
        <Stack spacing={2}>
          <Typography variant="h6">
            Add DNS records for {state.domain.hostname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In your DNS provider, add the following records. We poll automatically and will
            advance when propagation completes. This usually takes 5–30 minutes.
          </Typography>
          <DnsRecordBlock
            label="Traffic CNAME"
            record={{
              name: state.domain.hostname,
              value: state.domain.trafficTarget || '(assigned after cert issuance)',
              type: 'CNAME',
            }}
          />
          {state.domain.manualCertRequired ? (
            <Alert severity="info">
              SSL certificate will be provisioned for you by our team once your DNS records
              propagate. No validation record is required on your side.
            </Alert>
          ) : state.check?.cert?.validationRecord ? (
            <DnsRecordBlock
              label="Certificate validation CNAME"
              record={{
                ...state.check.cert.validationRecord,
                type: 'CNAME',
              }}
            />
          ) : (
            <Alert severity="info">
              Certificate validation record is being generated by AWS. Refresh in ~60s.
            </Alert>
          )}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              disabled={state.busy}
              onClick={refreshCheck}
              startIcon={state.busy ? <CircularProgress size={16} /> : undefined}
            >
              Check again
            </Button>
            {state.check?.dnsCheck ? (
              <Chip
                label={state.check.dnsCheck.matches ? 'DNS OK' : 'DNS pending'}
                color={state.check.dnsCheck.matches ? 'success' : 'warning'}
                size="small"
              />
            ) : null}
            {state.check?.cert?.status ? (
              <Chip
                label={`Cert: ${state.check.cert.status}`}
                size="small"
                color={state.check.cert.status === 'ISSUED' ? 'success' : 'default'}
              />
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      {state.step === 4 && state.domain ? (
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5">{state.domain.hostname} is live</Typography>
          <Typography variant="body2" color="text.secondary">
            Your white-label landing is live on this domain. Visit it to confirm the look and
            feel.
          </Typography>
          <Button
            component="a"
            href={`https://${state.domain.hostname}`}
            target="_blank"
            rel="noreferrer"
            variant="contained"
          >
            Open your domain
          </Button>
        </Stack>
      ) : null}
    </Paper>
  );
}

function DnsRecordBlock({
  label,
  record,
}: {
  label: string;
  record: { name: string; value: string; type: 'CNAME' };
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mt: 1 }}>
        <Box>
          <strong>Type:</strong> {record.type}
        </Box>
        <Box sx={{ wordBreak: 'break-all' }}>
          <strong>Name:</strong> {record.name}
        </Box>
        <Box sx={{ wordBreak: 'break-all' }}>
          <strong>Value:</strong> {record.value}
        </Box>
      </Box>
    </Paper>
  );
}
