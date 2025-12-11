Title: Feature — Paywall & Subscription (PM)

Summary
Gate premium features with a tenant-configurable paywall; support subscription management and entitlements.

Users
- All roles

User Stories
- As a user, I see a clear value proposition and pricing tailored to my tenant.
- As a user, I can start/cancel a subscription and see my entitlement status.
- As a tenant admin, I can configure feature flags that map to subscriptions.

Acceptance Criteria
- Paywall content and price points are tenant-configurable.
- Entitlement checks guard premium features consistently on client.
- Subscription status is fetched from services and cached with stale-while-revalidate.
- Unit tests around entitlement guards; integration tests on paywall navigation.

KPIs
- Conversion rate from free to paid.
- Churn reduction.


