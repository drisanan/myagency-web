# Stability Route Contracts

This document is the implementation baseline for platform stability work.

## Auth Models

Every endpoint should fit exactly one contract:

- `public-token`
  - No session cookie required.
  - Access is granted only by a signed token with explicit claims.
  - Example: public intake and update forms.
- `authenticated-session`
  - Requires a valid `an_session` cookie.
  - Tenant scope comes from validated session claims, never from request body or query params.
  - Example: agency CRUD, task management, Gmail actions, form issuance.
- `internal-maintenance`
  - Not user-facing.
  - Must require an explicit secret or equivalent protected trigger.
  - Example: cache rehydrate or maintenance jobs.

## Canonical Route Families

### Public Token Routes

- `GET /forms/agency`
- `POST /forms/submit`
- `GET /update-forms/agency`
- `POST /update-forms/submit`

### Session Routes

- `POST /auth/session`
- `GET /auth/session`
- `DELETE /auth/session`
- `POST /forms/issue`
- `GET /forms/submissions`
- `POST /forms/consume`
- `POST /update-forms/issue`
- `GET /update-forms/submissions`
- `POST /update-forms/consume`
- `GET|POST|PATCH|DELETE /tasks`
- `GET|POST|PATCH|DELETE /notes`
- `GET|POST|DELETE /google/*`
- `POST /gmail/send`
- `POST /gmail/create-draft`

### Internal Maintenance Routes

- `POST /api/commits/rehydrate`

## Current High-Risk Drift To Eliminate

- Duplicate `app/api/forms/*` routes exist alongside Lambda handlers.
- Some legacy routes accept `agencyEmail` from the request instead of deriving tenant scope from session claims.
- Session parsing currently has a header-based fallback path, which can mask auth regressions.
- Public onboarding and update flows depend on signed token behavior but do not yet have a single documented owner across all route implementations.
- Some maintenance/runtime paths still depend on in-memory state or side effects at module import time.

## Implementation Rules

- New public routes must carry enough token claims to bind the operation to the intended tenant and subject.
- New private routes must reject missing session with `401` and reject role or subject mismatch with `403`.
- A Next `app/api` route should only exist if it is a thin passthrough or adapter over the canonical backend contract.
- No route should infer auth or tenancy from `agencyEmail`, `clientId`, or similar request fields without first validating session or token claims.
