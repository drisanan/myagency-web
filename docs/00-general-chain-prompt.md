Title: AthleteNarrative Web — Build Chain Prompt (Authoritative Reference)

Purpose: This is the single source of truth for how all work is executed. Every code change MUST follow this chain in order:
1) Product Manager Prompt
2) Solutions Architect Prompt
3) Software Development Manager Prompt
4) QA Prompt (Unit tests first; TDD enforced)

Principles
- Functional Programming: small pure functions, predictable inputs/outputs, minimal shared mutable state.
- Test-Driven Development: write failing unit tests first, then implement the minimal production code to pass, then refactor.
- Separation of Concerns: components for UI; feature modules for domain logic; services for IO (network, storage), never mixing concerns.
- Single Source of Truth: configuration (endpoints, secrets, flags) centralized in dedicated config; do not duplicate.
- 100% Component-Focused UI: all interface elements are reusable MUI-based components. No ad-hoc JSX in pages without components.
- Multi-Tenancy & White Label by design: tenant resolution and branding are first-class in routing, theming, and assets.

Required Process for ANY Task
1) Read Product Manager Prompt for the feature. Clarify acceptance criteria and user flows.
2) Read Solutions Architect Prompt to understand architecture, patterns, and libraries to use.
3) Read Software Development Manager Prompt to follow engineering rules, repo structure, code style, and TDD workflow.
4) Author unit tests that encode the acceptance criteria. Commit tests first.
5) Implement production code to satisfy tests using functional, composable components and services.
6) Ensure services only interface with Dynamo-backed APIs or third-party SDKs via the service layer. No direct IO in components.
7) Ensure all config/secrets/endpoints live in the config module. No inline secrets.
8) Run unit tests. All must pass. If not, fix implementation, not tests, unless requirements changed.
9) Submit for review. Reviewers check: TDD adherence, functional style, SoC, component reuse, multi-tenancy readiness, performance.

Dependencies and UI System
- Use MUI for components and theming. Reference: https://mui.com/
- Use TypeScript everywhere.
- Use Jest and Testing Library for unit tests.
- Use Next.js for app and routing (app router), SSR and edge-ready where applicable.

Non-Negotiables Checklist (must be true before merging)
- Tests written first and passing.
- No secrets or endpoints hardcoded outside config.
- No side-effects in components; all IO via services.
- Feature uses shared components or adds new reusable components in a composable way.
- Tenant-aware theming and assets verified with at least 2 test tenants.
- Performance-conscious: no blocking work in render; avoid large bundles on initial route by code-splitting where needed.

How to Use This Prompt
- Reference this prompt before starting any work.
- Follow the chain strictly: PM → SA → SDM → QA.
- If any step conflicts, the earlier step rules (PM/SA) take precedence for feature requirements and architecture; escalate changes to prompts via PRs to docs.


