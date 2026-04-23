# CloudFront Edge Stack Ownership Runbook (Phase 5)

Status: Phase 5 scaffold. This runbook answers the user's original gap
("deployment ownership is muddy") and locks down who owns CloudFront, ACM,
and Route 53 for custom-domain automation.

Linked docs: `docs/02-solutions-architect/whitelabel-audit.md`,
`docs/02-solutions-architect/whitelabel-pilot-runbook.md`,
`.cursor/plans/whitelabel_landing_domains_*.plan.md`.

## 1. Ownership matrix

| Concern                          | Owner                                           | Stack                                 |
| -------------------------------- | ----------------------------------------------- | ------------------------------------- |
| Next.js frontend hosting         | Amplify                                         | `amplify.yml` + Amplify console       |
| Public API (Lambda + HTTP API)   | Serverless Framework — app service              | `serverless.yml` (root)               |
| CloudFront distribution(s)       | **Serverless Framework — edge service**         | `infra/edge/serverless-edge.yml`      |
| ACM certs (us-east-1, per host)  | Edge service handlers (`acmCerts` Lambda)       | DDB-backed lifecycle, see Phase 5b    |
| Route 53 hosted zones (our own)  | Route 53 (manual for now)                       | —                                     |
| Customer-managed DNS             | Customer (guided by wizard in Phase 6)          | Their registrar                       |
| DOMAIN# records (source of truth)| Edge handlers write, main API read              | `agency-narrative-crm` table          |
| CloudFront viewer-request logic  | Edge service — `HostRouterFunction`             | Updated in-place by attach handler    |

The main application stack (`serverless.yml`) does **not** reference or
mutate CloudFront / ACM resources. The edge stack does not reference
Lambdas in the main stack. This separation keeps rollbacks scoped: you can
redeploy the app without touching cert state, and vice versa.

## 2. Why a separate stack?

1. **Blast-radius containment.** The edge stack holds production-traffic
   routing for every attached custom domain. A bad deploy to the app stack
   must never be able to drop that.
2. **Region pin.** CloudFront and ACM for CloudFront must live in
   `us-east-1`. The app stack today runs in `us-west-1`. Keeping the edge
   stack in its own YAML makes the region pin explicit and local.
3. **Permission minimization.** The edge stack's IAM role carries
   `acm:*` / `cloudfront:*` / `route53:ChangeResourceRecordSets`. These
   should not be attached to every Lambda in the app stack.
4. **Different cadence.** Edge changes are rare and high-risk; app changes
   are frequent. Different deploy cadences and review gates.

## 3. Distribution strategy: shared vs per-tenant

We start with **one shared CloudFront distribution** with all customer
aliases attached and a viewer-request function that maps `Host` →
`x-tenant-host` header. Rationale:

- CloudFront has hard account quotas on distributions (default 200). A
  shared distribution scales to hundreds of tenants without quota work.
- Per-tenant distributions would create N ACM certs, N deployments, N sets
  of logs — operationally expensive for v1.
- All tenants share the same TLS termination point, meaning we have one
  pane of glass for WAF, rate limits, and invalidations.

We explicitly accept two trade-offs:

1. **Cert rotation blast radius.** A single SAN cert covers many tenants
   (up to 100 SANs per ACM cert). Renewal affects all of them. Mitigation:
   ACM auto-renews; we monitor `CertificateExpirationDate` and alert 30d
   out.
2. **Shared cache key space.** Different tenants must not see each other's
   cached responses. Mitigation: include `Host` in the CloudFront cache
   key (already default for origin-facing cache key when forwarding host).

When we cross ~80 tenants or adopt per-tenant WAF rules, we graduate to
**one distribution per tenant**. The `acmCerts` handler is designed so
that the pivot point is the handler, not the wizard: customers do not
need to know which distribution shape is in use.

## 4. Deploy workflow

### First-time deploy

```bash
cd infra/edge
AWS_REGION=us-east-1 STAGE=prd \
  EDGE_DEPLOYMENT_BUCKET=an-edge-deploy-prd \
  EDGE_LOG_BUCKET=an-edge-logs-prd \
  npx serverless deploy --config serverless-edge.yml
```

Outputs (via `sls info`):

- `EdgeLogBucketName` — S3 bucket for access logs.
- `HostRouterFunctionArn` — ARN of the viewer-request function; consumed
  by the `acmCerts` handler when associating with the shared distribution.

### Routine redeploy

Only deploy the edge stack when:

- The viewer-request function logic changes (template update).
- IAM is tightened or expanded.
- Log retention policy changes.

Attach/detach of customer hosts does **NOT** require a stack redeploy —
those are SDK calls made by the `acmCerts` handler.

### Rollback

```bash
cd infra/edge
STAGE=prd npx serverless rollback --config serverless-edge.yml --timestamp <prev>
```

If CloudFront distribution state is corrupted (e.g. partial-failure
during a customer attach), operators run:

```bash
node scripts/edge-repair.mjs --distribution <DIST_ID>
```

(Phase 5b delivers this script.)

## 5. Failure modes + recovery

| Failure                                                 | Recovery                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| ACM issuance stuck in `PENDING_VALIDATION` >72h         | `domains-check` handler marks DOMAIN# row `FAILED_CERT`, surfaces in wizard. Operator inspects Route 53 / customer DNS. |
| CloudFront `UpdateDistribution` returns `InProgress`    | Attach handler is idempotent; retries on a backoff, DOMAIN# row stays `PENDING`. |
| Attach succeeds, alias live, but SAN rollback needed    | `domains-remove` handler detaches alias first, then deletes cert. Single-direction state machine; see Phase 5b. |
| Customer DNS stops pointing at us                       | `domains-check` cron detects, flips DOMAIN# to `STALE_DNS`. Landing renders a maintenance page (Phase 7). |
| IAM permission drift                                    | Edge stack redeploy re-asserts IAM policy. Run smoke test from Section 7. |

## 6. Secret / credential handling

- No customer keys are stored in this stack. ACM cert private keys never
  leave AWS.
- The handlers that call `acm:*` / `cloudfront:*` assume the edge stack's
  execution role via STS from the app stack (future: cross-account support).
  In v1 both stacks are in the same account and the app stack's
  `acmCerts` Lambda is deployed in `us-east-1` with an explicit role.

## 7. Operator smoke test (post-deploy)

1. `npx serverless info --config infra/edge/serverless-edge.yml` — verify
   both outputs populate.
2. `aws cloudfront list-functions --stage LIVE | jq '.FunctionList.Items[].Name'`
   — must include `an-edge-host-router-prd`.
3. `aws s3 ls s3://an-edge-logs-prd/` — bucket exists, no 403.
4. Attach a canary host via the Phase 5 `domains-attach` handler and
   visit it — must render a valid TLS handshake and a branded landing.
5. Remove the canary host — DOMAIN# row cleared, cert deletion scheduled.

## 8. What is explicitly NOT in Phase 5a

- ACM cert issuance handler — Phase 5b (`acmCerts`).
- `domains-attach`, `domains-check`, `domains-remove` handlers — Phase 5b.
- Dynamic CORS driven by DOMAIN# — Phase 5c.
- Wizard UI — Phase 6.

Phase 5a is intentionally scaffold + ownership documentation only, so
that the Phase 5b handlers have a defined stack to write into.
