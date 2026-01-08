# Feature: Client (Athlete) Impersonation

> **Status:** Requirements  
> **Priority:** Medium  
> **Requested By:** Product  
> **Target Release:** TBD

---

## Executive Summary

Enable agency users to impersonate their athlete clients with a single "Impersonate" button click. This allows agencies to view the client portal exactly as the athlete sees it, troubleshoot issues, and provide better support without requiring the athlete's login credentials.

---

## User Story

**As an** agency user  
**I want to** click an "Impersonate" button next to any of my athletes  
**So that** I can view and experience the client portal as they do, helping me provide better support and understand their perspective.

---

## Current State

### Existing Impersonation Architecture

| Component | Status | Description |
|-----------|--------|-------------|
| `Session.impersonatedBy` | ✅ Exists | Field to track who initiated impersonation |
| `AuditEventType` | ✅ Exists | `impersonation_start` / `impersonation_end` events |
| `logImpersonationStart()` | ✅ Exists | Audit logging function |
| `logImpersonationEnd()` | ✅ Exists | Audit logging function |
| Parent → Agency | ✅ Implemented | Parents can impersonate agencies |
| Agency → Client | ❌ Not Implemented | This feature request |

### Existing Parent → Agency Flow (Reference)

```typescript
// app/(app)/agencies/page.tsx
const impersonate = () => {
  const parent = session;
  if (parent) {
    window.localStorage.setItem('session_impersonation_base', JSON.stringify(parent));
  }
  logImpersonationStart(parent.email, params.row.email);
  setSession({ 
    role: 'agency', 
    email: params.row.email, 
    agencyId: params.row.id, 
    impersonatedBy: { email: parent.email, role: 'parent' } 
  });
};
```

---

## Requirements

### Functional Requirements

#### FR-1: Impersonate Button Placement

| ID | Requirement |
|----|-------------|
| FR-1.1 | Add "Impersonate" button to each row in the Athletes list (`ClientsList.tsx`) |
| FR-1.2 | Button should be visible only to users with `role: 'agency'` |
| FR-1.3 | Button should be disabled if already impersonating another user |

#### FR-2: Impersonation Flow

| ID | Requirement |
|----|-------------|
| FR-2.1 | Clicking "Impersonate" stores current agency session in localStorage |
| FR-2.2 | Session switches to `role: 'client'` with target athlete's data |
| FR-2.3 | `impersonatedBy` field populated with agency email and role |
| FR-2.4 | User automatically redirected to `/client/lists` (client portal home) |
| FR-2.5 | All client portal features function as if logged in as athlete |

#### FR-3: Session Data Requirements

| Field | Source | Description |
|-------|--------|-------------|
| `role` | Hardcoded | `'client'` |
| `email` | Client record | Athlete's email |
| `clientId` | Client record | Athlete's ID |
| `agencyId` | Preserved | Agency's ID (for data access) |
| `agencyEmail` | Preserved | Agency's email |
| `firstName` | Client record | Athlete's first name |
| `lastName` | Client record | Athlete's last name |
| `agencySettings` | Preserved | White-label theming |
| `agencyLogo` | Preserved | Agency logo |
| `impersonatedBy` | Current session | `{ email: agencyEmail, role: 'agency' }` |

#### FR-4: Stop Impersonation

| ID | Requirement |
|----|-------------|
| FR-4.1 | Display impersonation banner in client portal when impersonating |
| FR-4.2 | "Stop Impersonating" button restores original agency session from localStorage |
| FR-4.3 | User redirected back to `/clients` (athletes list) after stopping |
| FR-4.4 | LocalStorage impersonation base cleared on stop |

#### FR-5: Audit Trail

| ID | Requirement |
|----|-------------|
| FR-5.1 | Log `impersonation_start` event with agency email and client email |
| FR-5.2 | Log `impersonation_end` event when stopping impersonation |
| FR-5.3 | Include timestamp, actor, and target in all audit events |
| FR-5.4 | Actions taken while impersonating should be attributable in audit log |

---

### Non-Functional Requirements

#### NFR-1: Security

| ID | Requirement |
|----|-------------|
| NFR-1.1 | Only agencies can impersonate clients they own (same `agencyId`) |
| NFR-1.2 | Cannot impersonate while already impersonating (no nested impersonation) |
| NFR-1.3 | Impersonation session must not grant access beyond client's normal permissions |
| NFR-1.4 | All API calls during impersonation use client's `clientId` for data scoping |

#### NFR-2: User Experience

| ID | Requirement |
|----|-------------|
| NFR-2.1 | Impersonation must be instant (no page reload required) |
| NFR-2.2 | Clear visual indicator when impersonating (banner) |
| NFR-2.3 | One-click stop impersonation from any page |

---

## User Interface Design

### Athletes List - Impersonate Button

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Athletes                                                    [New] [Gen] │
├─────────────────────────────────────────────────────────────────────────┤
│ Athlete          │ Email              │ Sport    │ Gmail   │ Actions   │
├──────────────────┼────────────────────┼──────────┼─────────┼───────────┤
│ 👤 John Smith    │ john@email.com     │ Football │ ✓ Conn  │ [View]    │
│    Quarterback   │                    │          │         │ [Edit]    │
│                  │                    │          │         │ [Delete]  │
│                  │                    │          │         │ [Imperson]│ ← NEW
├──────────────────┼────────────────────┼──────────┼─────────┼───────────┤
│ 👤 Jane Doe      │ jane@email.com     │ Soccer   │ ✗ None  │ [View]    │
│    Midfielder    │                    │          │         │ [Edit]    │
│                  │                    │          │         │ [Delete]  │
│                  │                    │          │         │ [Imperson]│
└─────────────────────────────────────────────────────────────────────────┘
```

### Client Portal - Impersonation Banner

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ You are viewing as: John Smith (john@email.com)  [Stop Impersonating]│
├─────────────────────────────────────────────────────────────────────────┤
│  [Logo]  Client Portal    Lists    Recruiter    Tasks         John S.  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         (Normal Client Portal UI)                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `features/clients/ClientsList.tsx` | MODIFY | Add Impersonate button to actions column |
| `app/client/layout.tsx` | MODIFY | Add impersonation banner with stop button |
| `services/audit.ts` | MODIFY | Add `client_impersonation_start` / `client_impersonation_end` types |
| `hooks/useImpersonation.ts` | CREATE | Centralized impersonation logic hook |

### Proposed Hook: useImpersonation

```typescript
// hooks/useImpersonation.ts
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { logImpersonationStart, logImpersonationEnd } from '@/services/audit';

export function useImpersonation() {
  const { session, setSession } = useSession();
  const router = useRouter();

  const impersonateClient = (client: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) => {
    if (!session || session.role !== 'agency') return;
    if (session.impersonatedBy) return; // No nesting

    // Save current session for restoration
    window.localStorage.setItem(
      'session_impersonation_base',
      JSON.stringify(session)
    );

    // Log audit event
    logImpersonationStart(session.email, client.email);

    // Switch to client session
    setSession({
      role: 'client',
      email: client.email,
      clientId: client.id,
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail || session.email,
      firstName: client.firstName,
      lastName: client.lastName,
      agencySettings: session.agencySettings,
      agencyLogo: session.agencyLogo,
      impersonatedBy: { email: session.email, role: 'agency' },
    });

    // Navigate to client portal
    router.push('/client/lists');
  };

  const stopImpersonation = () => {
    const baseRaw = window.localStorage.getItem('session_impersonation_base');
    if (!baseRaw || !session?.impersonatedBy) return;

    const base = JSON.parse(baseRaw);
    
    // Log audit event
    logImpersonationEnd(base.email, session.email);

    // Restore original session
    setSession(base);

    // Clear storage
    window.localStorage.removeItem('session_impersonation_base');

    // Navigate back to clients list
    router.push('/clients');
  };

  return {
    impersonateClient,
    stopImpersonation,
    isImpersonating: Boolean(session?.impersonatedBy),
    impersonatedBy: session?.impersonatedBy,
  };
}
```

### Data Flow

```
┌──────────────────┐     Click          ┌──────────────────┐
│  ClientsList     │─────────────────────│ Impersonate()   │
│  (Agency View)   │                     │                  │
└──────────────────┘                     └────────┬─────────┘
                                                  │
                                                  ▼
                                         ┌───────────────────┐
                                         │ 1. Save base      │
                                         │    session to     │
                                         │    localStorage   │
                                         └────────┬──────────┘
                                                  │
                                                  ▼
                                         ┌───────────────────┐
                                         │ 2. Log audit      │
                                         │    event          │
                                         └────────┬──────────┘
                                                  │
                                                  ▼
                                         ┌───────────────────┐
                                         │ 3. setSession()   │
                                         │    with client    │
                                         │    role + data    │
                                         └────────┬──────────┘
                                                  │
                                                  ▼
                                         ┌───────────────────┐
                                         │ 4. Navigate to    │
                                         │    /client/lists  │
                                         └───────────────────┘
```

### Session Transformation

```typescript
// Before (Agency Session)
{
  role: 'agency',
  email: 'agency@example.com',
  agencyId: 'agency-123',
  agencyEmail: 'agency@example.com',
  firstName: 'Agency',
  lastName: 'Owner',
  agencySettings: { primaryColor: '#1976d2', ... },
  agencyLogo: 'https://...',
}

// After (Impersonated Client Session)
{
  role: 'client',
  email: 'athlete@example.com',
  clientId: 'client-456',
  agencyId: 'agency-123',           // Preserved for data access
  agencyEmail: 'agency@example.com', // Preserved
  firstName: 'John',
  lastName: 'Smith',
  agencySettings: { ... },           // Preserved for theming
  agencyLogo: '...',                 // Preserved
  impersonatedBy: { 
    email: 'agency@example.com', 
    role: 'agency' 
  },
}
```

---

## API Changes

### None Required

This feature operates entirely on the frontend using existing session management. The backend already supports `role: 'client'` and scopes data access by `clientId`.

**Note:** If persistent impersonation across page refreshes is desired, a backend endpoint for server-side session switching would be needed.

---

## Acceptance Criteria

### AC-1: Impersonate Flow
- [ ] Agency user sees "Impersonate" button on each athlete row
- [ ] Clicking button switches session to client role
- [ ] User is redirected to client portal
- [ ] Client portal displays athlete's data correctly

### AC-2: Visual Indicators
- [ ] Impersonation banner displayed at top of client portal
- [ ] Banner shows athlete name and email being impersonated
- [ ] "Stop Impersonating" button is visible and clickable

### AC-3: Stop Impersonation
- [ ] Clicking "Stop" restores original agency session
- [ ] User is redirected back to athletes list
- [ ] No impersonation banner after stopping

### AC-4: Audit Logging
- [ ] `impersonation_start` event logged with agency and client emails
- [ ] `impersonation_end` event logged when stopping
- [ ] Events include timestamps

### AC-5: Security
- [ ] Cannot impersonate clients from other agencies
- [ ] Cannot nest impersonation (impersonate while impersonating)

---

## Testing Requirements

### Unit Tests

```typescript
describe('Client Impersonation', () => {
  test('agency can impersonate their client', () => {
    // Setup agency session
    // Click impersonate on client row
    // Verify session switches to client role
    // Verify impersonatedBy is populated
  });

  test('impersonation banner shows when impersonating', () => {
    // Setup impersonated client session
    // Render client portal
    // Verify banner is visible with correct info
  });

  test('stop impersonation restores agency session', () => {
    // Setup impersonated session with localStorage base
    // Click stop impersonating
    // Verify original session restored
  });

  test('cannot impersonate client from different agency', () => {
    // Setup agency session with agencyId A
    // Attempt to impersonate client with agencyId B
    // Verify action is blocked
  });
});
```

### Selenium E2E Tests

- [ ] `tests/selenium/client-impersonation-flow.js` - Full impersonate/stop flow
- [ ] Verify data isolation (impersonated user only sees their data)

---

## Implementation Checklist

- [ ] Create `hooks/useImpersonation.ts` hook
- [ ] Add Impersonate button to `ClientsList.tsx`
- [ ] Add impersonation banner to `app/client/layout.tsx`
- [ ] Update `Session` type if needed (already supports `impersonatedBy`)
- [ ] Write unit tests for impersonation hook
- [ ] Write unit tests for ClientsList impersonate button
- [ ] Write unit tests for client portal banner
- [ ] Create Selenium E2E test
- [ ] Update Sentry tags for impersonation context

---

## Future Considerations

1. **Server-Side Impersonation**: For session persistence across refresh
2. **Time-Limited Impersonation**: Auto-expire after 30 minutes
3. **Impersonation History**: View past impersonation sessions
4. **Impersonation Permissions**: Role-based control over who can impersonate
5. **Read-Only Mode**: Option to impersonate in read-only mode

---

## Related Documents

- [Authentication & Onboarding](./feature-auth-onboarding.md)
- [Architecture Overview](../02-solutions-architect/sa-architecture.md)
- [Engineering Playbook](../03-software-dev-manager/sdm-engineering-playbook.md)

---

*Last Updated: January 2026*

