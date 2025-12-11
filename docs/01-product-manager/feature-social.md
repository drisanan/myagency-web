Title: Feature — Social (PM)

Summary
Enable social posting, sharing, and streaks with previews and asset selection. Parity with mobile SocialPost/SocialShare/PostingStreak.

Users
- Athlete primarily; Recruiters/Coaches view social previews and metrics.

User Stories
- As an athlete, I can compose posts with templates and asset pickers.
- As a user, I can share branded images with tenant-specific overlays.
- As a user, I can see posting streaks and progress.

Acceptance Criteria
- Image selectors use MUI components (https://mui.com/) and work across devices.
- Share assets reflect tenant branding and aspect ratios for platforms.
- Streak calculations mirror mobile logic.
- Unit tests for formatters/generators; integration tests for compose → preview → share.

KPIs
- Posts created, shares per session, streak retention.


