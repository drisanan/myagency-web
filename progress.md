# Progress Log

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
