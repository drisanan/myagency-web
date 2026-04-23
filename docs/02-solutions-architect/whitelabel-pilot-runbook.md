# White-Label Pilot Runbook (Phase 3)

Status: Phase 3 acceptance. Covers the "two internal subdomains" pilot
decided in the plan (`pilot_scope: two_internal`). This runbook is the
authoritative procedure until Phase 5 automation (ACM + CloudFront + cert
issuance) replaces these manual steps.

Linked docs: `docs/02-solutions-architect/whitelabel-audit.md`,
`.cursor/plans/whitelabel_landing_domains_*.plan.md`.

## 1. Goal of the pilot

Prove end-to-end host-based tenancy with **zero external dependency**:

1. Two subdomains we already own (`pilot1.myrecruiteragency.com`,
   `pilot2.myrecruiteragency.com`).
2. Each CNAMEs to the existing Amplify host (same TLS cert via Amplify's
   `*.myrecruiteragency.com` wildcard — no ACM work needed).
3. Each resolves to a distinct agency via `DOMAIN#<hostname>` in DynamoDB.
4. The Next.js middleware detects the non-canonical host, rewrites `/` to
   `/landing?host=<host>`, and the server component renders that agency's
   branded template.
5. All authenticated surfaces (sign-in, app shell, API) remain on the
   canonical host. Phase 4 will add the redirect-back sign-in flow; until
   then the pilot landing's "Sign in" button sends users to
   `https://app.myrecruiteragency.com/auth/login` and returns them
   canonically.

## 2. Prerequisites

- Amplify app is live on the canonical host (`myrecruiteragency.com`,
  `app.myrecruiteragency.com`).
- Amplify wildcard cert covers `*.myrecruiteragency.com`. If it does not,
  use Amplify → Domain Management → add `pilot1` / `pilot2` as subdomains of
  the existing app; Amplify will auto-issue.
- DynamoDB table `agency-narrative-crm` (or `TABLE_NAME` env) has GSI1
  (`GSI1PK`/`GSI1SK`) enabled — required so the landing resolver can query
  by `DOMAIN#<hostname>` → `AGENCY#<id>`.
- You have two existing agency records (`AGENCY#<id>` / `SK=PROFILE`). The
  pilot does not create agencies; it only attaches domains to them.

## 3. DNS: add the two subdomains

Amplify is the simplest owner:

1. AWS Console → Amplify → `my-recruiter-agency` app → Domain management.
2. Edit the existing `myrecruiteragency.com` domain and add two
   sub-domains: `pilot1` and `pilot2` (both pointing to `main`
   branch / production branch).
3. Amplify creates ACM records in Route 53 automatically (if Route 53 is
   hosting the zone) and issues / extends the cert. Wait until the domain
   status is `AVAILABLE` for both.

If DNS is **not** in Route 53:

- Create two `CNAME` records:
  `pilot1.myrecruiteragency.com → <amplify-domain-target>`
  `pilot2.myrecruiteragency.com → <amplify-domain-target>`
- Add the cert validation `CNAME`s Amplify surfaces in the console.
- Wait for Amplify status `AVAILABLE`.

Verify with:

```bash
dig +short CNAME pilot1.myrecruiteragency.com
dig +short CNAME pilot2.myrecruiteragency.com
curl -sI https://pilot1.myrecruiteragency.com | head -5
```

`curl` should return a 200/30x from Amplify and a valid TLS handshake.

## 4. DynamoDB: attach DOMAIN# rows

Run the Phase 3 seeder. It upserts `DOMAIN#<hostname>` under each agency's
partition and preserves `createdAt` on re-runs:

```bash
AWS_REGION=us-west-1 \
TABLE_NAME=agency-narrative-crm \
PILOT_HOST_1=pilot1.myrecruiteragency.com \
PILOT_AGENCY_1=agency-001 \
PILOT_HOST_2=pilot2.myrecruiteragency.com \
PILOT_AGENCY_2=agency-002 \
node scripts/seed-pilot-domains.mjs
```

Verify:

```bash
aws dynamodb query \
  --table-name "$TABLE_NAME" \
  --index-name GSI1 \
  --key-condition-expression "GSI1PK = :pk" \
  --expression-attribute-values '{":pk":{"S":"DOMAIN#pilot1.myrecruiteragency.com"}}'
```

Expected item shape (see `services/domains.ts` for the canonical type):

```json
{
  "PK":     "AGENCY#agency-001",
  "SK":     "DOMAIN#pilot1.myrecruiteragency.com",
  "GSI1PK": "DOMAIN#pilot1.myrecruiteragency.com",
  "GSI1SK": "AGENCY#agency-001",
  "hostname": "pilot1.myrecruiteragency.com",
  "agencyId": "agency-001",
  "status":   "ACTIVE"
}
```

## 5. Agency settings: turn on the landing config

For each pilot agency, edit `AGENCY#<id>` / `SK=PROFILE` → `settings.landing`
to pick a template and (optionally) hero copy. Minimum payload to render:

```json
{
  "settings": {
    "primaryColor": "#0A0A0A",
    "secondaryColor": "#CCFF00",
    "landing": {
      "templateId": "athleteClassic",
      "hero": {
        "headline": "Pilot Agency 1 — recruiting reimagined.",
        "subhead": "This is the white-label landing for pilot1.",
        "ctaLabel": "Sign in",
        "ctaHref": "https://app.myrecruiteragency.com/auth/login"
      }
    }
  }
}
```

`settings.landing.templateId` options (Phase 3): `athleteClassic`,
`recruiterBold`, `minimalDark` (see
`features/whitelabel/templates/index.ts`).

## 6. Smoke test

From a browser in a **private window** (to avoid any existing session
cookie on `.myrecruiteragency.com`):

1. Visit `https://pilot1.myrecruiteragency.com/` — should render pilot1's
   template at the root path.
2. Visit `https://pilot2.myrecruiteragency.com/` — should render pilot2's
   template.
3. Visit `https://pilot1.myrecruiteragency.com/auth/login` — should **not**
   be rewritten by middleware; this path is passthrough. User is routed to
   the normal login page (still on the custom host in Phase 3; Phase 4 will
   redirect to canonical host for the actual session mint).
4. Visit `https://app.myrecruiteragency.com/` — should continue to render
   the canonical marketing page, **unchanged**.

Negative tests:

- `https://pilot1.myrecruiteragency.com/api/...` — should pass through to
  whatever API handler answers, unaffected by middleware.
- Remove the DOMAIN# row for pilot1 and reload — should render the
  default `notFound()` (404) from the `/landing` route.

## 7. Rollback

Undoing the pilot is two steps:

1. DynamoDB: delete or flip status of each pilot DOMAIN# row.
   ```bash
   aws dynamodb delete-item --table-name "$TABLE_NAME" \
     --key '{"PK":{"S":"AGENCY#agency-001"},"SK":{"S":"DOMAIN#pilot1.myrecruiteragency.com"}}'
   ```
2. Amplify: remove the pilot sub-domains from the domain management UI if
   you want to fully unbind DNS. If you just need to stop serving the
   branded landing, step 1 is enough — the middleware falls back to
   canonical behavior on unresolved hosts.

## 8. Known limitations (Phase 3)

- **Auth on custom host is canonical-only.** Sign-in links point to
  `https://app.myrecruiteragency.com/auth/login`. After login the user
  sees the authenticated app on the canonical host. Phase 4 adds the
  `/auth/handoff` redirect-back flow so the user returns to the custom
  host post-login.
- **No dynamic CORS.** API requests from pilot hostnames are not on the
  CORS allowlist yet. Phase 5 wires dynamic CORS from `DOMAIN#` rows.
- **No status board.** Operators interact with the pilot via the seed
  script and raw DDB; the wizard UI ships in Phase 6.
- **No cert automation.** Amplify's wildcard covers this pilot; customer
  domains will need ACM + CloudFront (Phase 5).

## 9. Operator checklist

- [ ] Amplify wildcard cert covers both pilot subdomains.
- [ ] `dig` resolves both subdomains.
- [ ] `DOMAIN#` rows present in DDB for both pilots via GSI1 query.
- [ ] Each pilot agency has `settings.landing.templateId` set.
- [ ] Browser smoke tests 6.1–6.4 pass.
- [ ] Negative tests 6.5 pass.
- [ ] Rollback plan exercised at least once in staging.
