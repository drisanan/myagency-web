Title: Feature — White Label & Multi-Tenancy (PM)

Summary
Enable multiple tenants (brands/organizations) to use the same app with isolated branding, theme, assets, and configuration. Tenants can be resolved by hostname (preferred) or path prefix fallback.

Users
- Tenant Admin: configures branding, colors, logos, feature flags.
- End Users (Athletes/Recruiters/Coaches): experience tenant-specific UI and behavior.

User Stories
- As a tenant admin, I can define primary/secondary colors, typography scale, and logos.
- As a tenant admin, I can upload favicon and social share images.
- As a user, I automatically see the correct tenant branding based on the domain I use.
- As a tenant admin, I can enable/disable certain features (e.g., AI Counselor) per tenant.

Acceptance Criteria
- Tenant detection by hostname supports at least 2+ tenants.
- Theme, logos, and favicons change per tenant without redeploy.
- Feature flags evaluate per tenant.
- Configurable endpoints/secrets are tenant-aware through config, not code duplication.
- All elements use MUI theming system to reflect tenant branding (https://mui.com/).

Non-Goals
- Runtime admin UI for changing config (initially file-based or API-driven from existing services).

KPIs
- Time-to-onboard new tenant < 1 day.
- Zero code changes to add a tenant (config-only).


