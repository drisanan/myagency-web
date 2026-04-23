# Progress Log

## 2026-04-23 — Whitelabel hotfix (DEF-001: ACM gating + wizard error UX)

### Defect

Production verification found that `POST /domains` returned **502 Bad
Gateway** whenever an agency tried to attach a custom domain. Root cause:
the `athlete-narrative-api-prod-domains` Lambda has no `acm:*`,
`cloudfront:*`, or `route53:*` IAM grants, so `requestCertificateForHost`
inside `handleAttach` threw `AccessDenied` and the handler returned the
generic `ERR_ACM_REQUEST` 502. The wizard compounded the failure by
showing the catch-all string "An unknown error occurred" rather than the
backend's `error`/`code`.

### Fix

Shipped in commit `1caa2f7` (_fix(whitelabel): gate ACM behind
ACM_ENABLED + friendly wizard errors_).

1. **ACM gating.** New `ACM_ENABLED` env flag, defaulted empty in
   `serverless.yml`. `infra/src/handlers/domains.ts` now treats
   `process.env.ACM_ENABLED === 'true'` as the single switch for every
   `acm:*` / `cloudfront:*` SDK call across attach / check / remove:
   - attach: when disabled, skip `requestCertificateForHost`, persist
     `manualCertRequired: true` on the `DOMAIN#` record, still return 201
     with status `PENDING_DNS`;
   - check: when `manualCertRequired` or ACM disabled, skip
     `describeCertificateValidation` + alias attach, still probe DNS via
     `checkCnameMatches` so the wizard and status board can render
     progress;
   - remove: when `manualCertRequired` or ACM disabled, skip the
     CloudFront detach and `deleteCertificateArn` calls.
   The flag lets us ship the domain wizard end-to-end in pilot mode
   without widening the Lambda's IAM surface; operators issue the
   certificate out-of-band (Amplify wildcard or the edge stack) and can
   flip the flag to `true` once the edge distribution + IAM grants land.
2. **DomainRecord schema.** `services/domains.ts` gained
   `manualCertRequired?: boolean`. `infra/src/lib/domains.ts` plumbs it
   through `createDomainRecord` and `updateDomainStatus` so the DDB
   `DOMAIN#` item carries the flag.
3. **Wizard error mapping.**
   `features/whitelabel/DomainWizard.tsx` maps `ERR_ACM_REQUEST`,
   `ERR_HOST_CLAIMED`, `ERR_PILOT_RESERVED`, `ERR_HOSTNAME`,
   `ERR_RATE_LIMITED`, `ERR_EDGE_ATTACH`, `ERR_EDGE_DETACH` to
   customer-facing copy, and falls back to the server-provided
   `response.error` before using the generic "Attach failed" string. The
   DNS-setup step now shows a "manual cert" info Alert when the record
   has `manualCertRequired: true`.
4. **Test coverage.**
   `infra/src/handlers/__tests__/domains.test.ts` has three new tests
   for the ACM-off paths (attach skips ACM + persists
   `manualCertRequired`; check skips describe; remove skips detach +
   delete). All 13 tests pass.

### Deploy

- Serverless backend: `npm run infra:deploy` (profile `myagency`,
  region `us-west-1`) — stack `athlete-narrative-api-prod` updated, the
  `domains` Lambda redeployed with `ACM_ENABLED=''`.
- Frontend: Amplify app `d2yp6hyv6u0efd` (region `us-east-2`, branch
  `master`) auto-built commit `1caa2f7` as job **274** — **SUCCEED**
  (2 min, 14:47 → 14:52 MDT).
- Edge stack: unchanged (still scaffolding only).

### Verification (production)

Walked the wizard on `https://www.myrecruiteragency.com/settings/domains`
via the `drisanjames@gmail.com` agency session:

- ✅ Attach `test-def001-verify.example.com` → `POST /domains` returned
  **201**, wizard advanced to DNS setup, the "SSL certificate will be
  provisioned for you by our team once your DNS records propagate." info
  Alert rendered (manualCertRequired path live).
- ✅ Attach `pilotx.myrecruiteragency.com` → backend returned
  `ERR_PILOT_RESERVED` and the wizard rendered the new friendly copy
  ("reserved for our pilot program and cannot be attached from here.").
- ✅ Status board lists the attached host with a `PENDING_DNS` badge
  (DOMAIN# record persisted, no 502).
- ✅ No console errors, no regressions on adjacent settings pages.

DEF-001 closed. The known edge limitation still stands — flipping
`ACM_ENABLED=true` remains blocked on (a) provisioning the shared
CloudFront distribution + wiring `EDGE_DISTRIBUTION_ID` /
`EDGE_TRAFFIC_TARGET`, and (b) attaching `acm:*`, `cloudfront:*`, and
`route53:*` grants to the `domains` Lambda role.

## 2026-04-23 — Whitelabel production deploy

### Summary

Shipped the full white-label consolidation + custom-domain landing pipeline
(Phases 0–7 of the rewritten whitelabel plan). Backend API, CloudFront edge
scaffold, and Amplify-hosted frontend all deployed successfully. Domain
attach flow will reach `cert ISSUED` and pause until the shared CloudFront
distribution is provisioned — this is intentional (see _Known limitation_
below).

### Commits

- `59f31f5` — _Whitelabel: custom-domain landing pages + platform
  consolidation_ (170 files, +8305 / −36592). Purges coverage artifacts and
  a committed Google OAuth client-secret JSON as part of Phase 1 hygiene.
- `85cd997` — _Whitelabel: fix serverless configs for first-time prod
  deploy._ Drops the comma-separated default for `CANONICAL_HOSTS` (collides
  with Serverless Framework's variable-source fallback separator) and lets
  the edge stack auto-manage its deployment bucket.

Both committed with `--no-verify` per explicit request: the repo pre-commit
hook runs `npm run lint --max-warnings=0` against a baseline of ~911
pre-existing errors (commit `453ef46` already removed lint from the Amplify
build for the same reason).

### Deploy outputs

#### Backend API — `athlete-narrative-api-prod` (AWS Lambda + HTTP API)

- Region: `us-west-1`
- Stack: `athlete-narrative-api-prod`
- API base: `https://api.myrecruiteragency.com` → `d-6edo3guq16.execute-api.us-west-1.amazonaws.com`
- New functions:
  - `athlete-narrative-api-prod-authHandoff` → `ANY /auth/handoff`
  - `athlete-narrative-api-prod-domains` → `ANY /domains`, `ANY /domains/{hostname}`
  - `athlete-narrative-api-prod-audit` → `ANY /audit`

#### Edge stack — `an-edge-prd` (CloudFront + ACM scaffolding)

- Region: `us-east-1` (required for CloudFront / ACM for CloudFront)
- Stack: `an-edge-prd`
- Outputs:
  - `EdgeLogBucketName` = `an-edge-logs-prd`
  - `HostRouterFunctionArn` = `arn:aws:cloudfront::440047266716:function/an-edge-host-router-prd`
  - `ServerlessDeploymentBucketName` = `serverless-framework-deployments-us-east-1-16a6fe8a-014e`

#### Frontend — AWS Amplify `myagency-web-prd` (app id `d2yp6hyv6u0efd`)

- Region: `us-east-2`
- Branch: `master` (auto-build enabled)
- Production domains: `myrecruiteragency.com`, `www.myrecruiteragency.com`
- Amplify jobs triggered by the two pushes:
  - Job `271` (`59f31f5`) — **SUCCEED** (5 min, 13:01 → 13:06 MDT)
  - Job `272` (`85cd997`) — **SUCCEED** (5 min, 13:08 → 13:13 MDT)

### Smoke tests (all green)

```
OPTIONS https://api.myrecruiteragency.com/auth/session   → 200 + correct CORS
GET     https://api.myrecruiteragency.com/domains        → 401 (auth required)
GET     https://api.myrecruiteragency.com/audit          → 401 (auth required)
GET     https://api.myrecruiteragency.com/auth/handoff   → 401 (auth required)
GET     https://www.myrecruiteragency.com/               → 200
GET     https://www.myrecruiteragency.com/robots.txt     → 200, canonical-host rules
GET     https://www.myrecruiteragency.com/sitemap.xml    → 200, canonical-host rules
```

`robots.txt` served from Next.js correctly emits:

```
User-Agent: *
Allow: /
Disallow: /landing
Disallow: /auth/handoff
Sitemap: https://www.myrecruiteragency.com/sitemap.xml
```

### Known limitation — domain wizard pauses at "cert ISSUED"

The edge stack is deliberately thin scaffolding. No shared CloudFront
distribution exists yet, so `EDGE_DISTRIBUTION_ID` and `EDGE_TRAFFIC_TARGET`
are unset in the backend environment. This is safe: the `/domains` handler
no-ops the CloudFront alias attach/detach when those values are empty, so
the attach flow persists the `DOMAIN#` record, requests the ACM cert,
polls DNS, and then waits at `cert ISSUED` until an operator attaches the
alias manually. To finish the edge automation:

1. Provision the shared CloudFront distribution (origin = Amplify
   `d2yp6hyv6u0efd.amplifyapp.com` or equivalent), attach the
   `HostRouterFunction` as a viewer-request association.
2. Set `EDGE_DISTRIBUTION_ID` and `EDGE_TRAFFIC_TARGET` in `.env.local`.
3. Re-run `npm run infra:deploy`.

### Rollback playbook

#### Frontend (Amplify)

Amplify's UI can promote any prior job back to the branch with one click:
`Amplify → myagency-web-prd → master → Redeploy this version` on job 270
(commit `8ca9c71`) returns the product to the pre-whitelabel state.

Or via CLI:

```bash
AWS_PROFILE=myagency aws amplify start-job \
  --region us-east-2 --app-id d2yp6hyv6u0efd --branch-name master \
  --job-type RETRY --job-id 270
```

A destructive git-level revert is:

```bash
git revert --no-edit 85cd997 59f31f5
git push origin master   # triggers a fresh Amplify build
```

#### Backend API (Serverless, us-west-1)

```bash
# List recent deployments
AWS_PROFILE=myagency npx serverless deploy list --stage prod --region us-west-1

# Roll back to a prior timestamp (pick the one before today):
AWS_PROFILE=myagency npx serverless rollback \
  --stage prod --region us-west-1 --timestamp <timestamp>
```

#### Edge stack (Serverless, us-east-1)

The edge stack is scaffolding only (log bucket + placeholder CloudFront
Function). If the stack itself needs to disappear:

```bash
cd infra/edge && \
  AWS_PROFILE=myagency AWS_REGION=us-east-1 STAGE=prd \
  npx serverless remove --config serverless-edge.yml
```

The `EdgeLogBucket` has `DeletionPolicy: Retain`, so it will remain in S3
after the stack is removed; delete manually with `aws s3 rb
s3://an-edge-logs-prd --force` if desired.

### Follow-ups

- Provision the shared CloudFront distribution and wire `EDGE_*` env vars
  (closes the "cert ISSUED" pause described above).
- Address repo lint baseline (~911 pre-existing errors) so the pre-commit
  hook can run again without `--no-verify`.
- Remove the hardcoded GitHub PAT from `.git/config`'s `origin` remote URL
  (it was surfaced during `git remote -v` today); rotate the token and
  switch to SSH or a credential helper.
