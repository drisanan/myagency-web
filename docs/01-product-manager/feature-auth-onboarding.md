Title: Feature — Authentication & Onboarding (PM)

Summary
Users authenticate and complete onboarding flows including profile basics and preferences. Align with existing mobile behaviors.

Users
- Athlete, Recruiter, Coach

User Stories
- As a user, I can sign up/sign in with email/password and supported social providers (tenancy-configurable).
- As a user, I can complete onboarding with minimal steps and save progress.
- As a user, I can recover my account via password reset or email verification links.

Acceptance Criteria
- Tenant-aware auth configuration (providers, terms/privacy links).
- Onboarding wizard with progress preservation and validation.
- Secure session handling; redirects for protected routes.
- Unit tests for reducers/validators; integration tests for sign-in → onboarding → home.

KPIs
- Increased onboarding completion rate.
- Reduced drop-off between auth and first-session.


