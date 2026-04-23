# White-Label Landing Audit (Phase 0)

This document captures the state-of-the-codebase findings that justify the phased rollout in [plans/whitelabel_landing_domains](../../../.cursor/plans/whitelabel_landing_domains_b38a92a3.plan.md). It is the single reference that every subsequent phase cites.

## 1. Five-place branding audit

Branding is currently spread across the following. The target is to collapse to a single source of truth: `AGENCY#<id>/PROFILE.settings` as persisted by [services/agencies.ts](../../services/agencies.ts).

| Location | Role today | Target role |
| --- | --- | --- |
| [config/index.ts](../../config/index.ts) | Hardcoded `{default, acme}` registry with `brand.primary/secondary` and `flags`. Used by [tenancy/tenantResolver.ts](../../tenancy/tenantResolver.ts) and [tenancy/serverTenant.ts](../../tenancy/serverTenant.ts). | Retired as a tenant registry. Replaced with a minimal `defaultBranding` constant used only when no agency context is resolved. |
| [tenancy/themeBuilder.ts](../../tenancy/themeBuilder.ts) | `createTenantTheme(tenant)` consumes `tenant.brand.secondary`. Called by [tenancy/TenantThemeProvider.tsx](../../tenancy/TenantThemeProvider.tsx). | Consumes the canonical `AgencyBranding` shape only. No registry reads. |
| [features/theme/DynamicThemeProvider.tsx](../../features/theme/DynamicThemeProvider.tsx) | Builds runtime theme from `session.agencySettings` for authenticated users. | Keeps this exact pattern; becomes the only runtime theme source on authenticated routes. |
| [app/app-shell.tsx](../../app/app-shell.tsx) | Reads branding for the authenticated chrome. | Reads `agency.settings` via one consolidated selector. |
| [features/settings/SettingsForm.tsx](../../features/settings/SettingsForm.tsx) and [features/settings/ProfileForm.tsx](../../features/settings/ProfileForm.tsx) | Write branding via `updateAgencySettings`. | Write the canonical shape the render layer reads. No translation layer. |
| [infra/src/handlers/auth.ts](../../infra/src/handlers/auth.ts) GET path | Hydrates `session.agencySettings` and `session.agencyLogo` from the agency record. | Unchanged behavior; becomes the session-time branding fetch used by all authenticated routes. |

Canonical branding shape (Phase 2 deliverable):

```ts
export type AgencyBranding = {
  primary: string;          // hex
  secondary: string;        // hex
  accent?: string;
  logoUrl?: string;
  logoDataUrl?: string;     // legacy, migrate out
  faviconUrl?: string;
  fontFamily?: string;
  agencyName?: string;
};
```

Stored under `AGENCY#<id>/PROFILE.settings.branding`. Existing flat fields on `settings` (color, logoDataUrl, etc) are read for backward-compat and re-persisted under `settings.branding` on first write.

## 2. Auth/session remediation contract

Gap: [infra/src/handlers/auth.ts](../../infra/src/handlers/auth.ts) `POST` path mints a signed `an_session` cookie from `{agencyId, email, role}` posted in the body with no credential verification.

Remediation (Phase 1, surgical):

- `POST /auth/session` requires a `handoffToken` in the body.
- `handoffToken` is an HMAC-signed blob issued by exactly three upstream callers that have already performed credential verification:
  - GHL login handler (`infra/src/handlers/ghl-login.ts`).
  - Client portal login handler (`infra/src/handlers/auth-client-login.ts`).
  - Google OAuth callback (`infra/src/handlers/google-*.ts`).
- Signature is HMAC-SHA256 with `SESSION_SECRET`. Payload includes `{agencyId, email, role, userId?, firstName?, lastName?, source, iat, exp, jti}`. TTL 60 seconds.
- Single-use: the `jti` is persisted with a conditional put to `PK=SESSION_HANDOFF#<jti>, SK=META` on mint and transition-to-used on consume. Reuse returns 401.
- Every successful mint and every explicit clear writes an audit row: `PK=AUDIT#AUTH#<agencyId>, SK=<iso>#<jti>` with source IP, user agent, upstream method, result.
- Any POST without a valid `handoffToken` returns `401` with error code `ERR_AUTH_NO_HANDOFF`.

Permission matrix to encode as tests:

| Request | Expected |
| --- | --- |
| POST body-only `{agencyId, email, role}` | 401 `ERR_AUTH_NO_HANDOFF` |
| POST `{handoffToken}` valid, unused | 200, cookie set, audit row written |
| POST `{handoffToken}` valid, already used | 401 `ERR_AUTH_HANDOFF_USED` |
| POST `{handoffToken}` expired | 401 `ERR_AUTH_HANDOFF_EXPIRED` |
| POST `{handoffToken}` bad signature | 401 `ERR_AUTH_HANDOFF_BAD` |
| GET existing cookie | unchanged |
| DELETE | unchanged, audit row written |

## 3. CORS drift

Static CORS in two places today:

- [serverless.yml](../../serverless.yml) `httpApi.cors.allowedOrigins`.
- [infra/src/handlers/cors.ts](../../infra/src/handlers/cors.ts) `ALLOWED_ORIGINS`.

Target (Phase 5): single runtime allowlist composed from (a) a small hardcoded baseline for canonical hosts, plus (b) a DynamoDB scan of `DOMAIN#` items with `status=ACTIVE`. Cached at Lambda cold start with 5-minute TTL. `serverless.yml` moves to `*` with origin reflection per route. `infra/src/handlers/cors.ts` `buildCors` consults the runtime allowlist.

## 4. Layout duplication

Both [app/layout.tsx](../../app/layout.tsx) and [app/(public)/layout.tsx](../../app/(public)/layout.tsx) currently render `<html>` and `<body>`. Next 16 + React 19 hydration will increasingly complain about this.

Target (Phase 2): only the root [app/layout.tsx](../../app/layout.tsx) renders `<html>/<body>`. The `(public)` group becomes a body-level fragment that injects marketing CSS via Next `metadata` / asset list keyed off route group, not a second document root.

## 5. Custom-domain auth decision

Today's `an_session` cookie is locked to `.myrecruiteragency.com` in [infra/src/lib/session.ts](../../infra/src/lib/session.ts). A user landing on a custom host would set a cookie the API never sees.

Decision for v1: canonical auth host + redirect-back, not per-domain cookies.

- Custom-host "Sign in" links point at `https://auth.myrecruiteragency.com/login?return=<url>&agencyId=<id>`.
- Canonical host authenticates (cookie set on `.myrecruiteragency.com`), issues a short-lived one-time handoff token, and redirects back.
- The return URL on the custom host exchanges the handoff token and renders the app shell. API calls continue to hit `api.myrecruiteragency.com` with the canonical cookie.

## 6. Single-SOT decision for landing config

Rejected: a parallel `AGENCY#<id>/SK=LANDING` row.

Accepted: `settings.landing` additive on the existing agency record.

```ts
export type AgencyLandingConfig = {
  templateId: 'athleteClassic' | 'recruiterBold' | 'minimalDark';
  seo: { title: string; description: string; ogImageUrl?: string };
  hero: { headline: string; subhead: string; ctaLabel: string; ctaHref: string; imageUrl?: string };
  features: Array<{ icon?: string; title: string; body: string }>; // 3..6
  testimonials: Array<{ quote: string; author: string; role?: string; avatarUrl?: string }>;
  footer: { legal: string; links: Array<{ label: string; href: string }> };
};
```

Brand tokens continue to live in `settings.branding`; they are not duplicated under `settings.landing`.

## 7. Hostname normalization rules

Every DOMAIN# write goes through `normalizeHostname(input)`:

1. `trim()` whitespace.
2. Lowercase.
3. Strip trailing dot.
4. Convert IDN -> punycode via Node's `URL` / `punycode` semantics.
5. Reject if segment count < 2 (apex rule: minimum 3 labels for a subdomain; apex `acme.com` is blocked).
6. Reject reserved labels on the leading segment: `www`, `api`, `auth`, `mail`, `smtp`, `imap`, `pop`, `admin`, `root`, `ns1`, `ns2`.
7. Reject duplicate hostname across agencies via GSI1 conditional write.
8. Reject hostnames that end in `.myrecruiteragency.com` from the public attach path (those are pilot-internal only, admin-gated).

## 8. SEO / canonical rules

- `noindex, nofollow` meta until `status=ACTIVE`.
- `<link rel="canonical">` always points at the `status=ACTIVE` domain for the agency if one exists.
- Per-tenant `<title>`, `<meta description>`, and OG tags from `settings.landing.seo`.
- `app/sitemap.ts` emits only URLs scoped to the current Host's agency.

## 9. Observability targets

- Audit log rows for every lifecycle transition (`DOMAIN_ATTACH`, `DOMAIN_VALIDATED`, `DOMAIN_ISSUED`, `DOMAIN_ATTACHED`, `DOMAIN_ACTIVE`, `DOMAIN_REMOVED`, `DOMAIN_FAILED`).
- Alarms on: cert-near-expiry (auto-renew belt-and-suspenders), stuck `PROVISIONING` > 24h, alias-attach failures, CORS cache misses.
- Rate limits: 5 pending attach per agency, 20 attach/hour per source IP.

---

_Last updated: Phase 0 deliverable. Subsequent phases update this document when their scope lands._
