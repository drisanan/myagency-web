Title: Feature — AI Counselor (PM)

Summary
Users receive AI-powered guidance (content generation, recommendations) respecting tenant feature flags and safety constraints.

Users
- Athlete, Recruiter, Coach

User Stories
- As a user, I can ask guided questions and receive suggestions contextualized by my profile and tenant configuration.
- As a tenant admin, I can enable/disable AI Counselor and adjust safety/limits.

Acceptance Criteria
- Requests route through services; no direct LLM keys in client.
- Feature flag gating per tenant.
- Clear error handling and safety messaging.
- Unit tests for guards and prompt builders; integration tests for request lifecycle.

KPIs
- Counselor engagement and satisfaction ratings.


