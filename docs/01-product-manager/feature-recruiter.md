Title: Feature — Recruiter (PM)

Summary
Recruiters can discover, evaluate, and contact athletes. They can view profiles, stats, and social metrics, and manage outreach workflows.

Users
- Recruiter: searches and reviews athlete profiles, manages pipeline.
- Athlete: receives and manages recruiter contact.

User Stories
- As a recruiter, I can filter athletes by sport, position, graduation year, location, and tags.
- As a recruiter, I can view an athlete’s profile with performance, grades, social stats, and recent activity.
- As a recruiter, I can mark interest level and add notes.
- As a recruiter, I can initiate contact via provided channels respecting privacy controls.

Acceptance Criteria
- Search/filter results are paginated and performant.
- Profile pages display the same key data as mobile (performance cards, progress, grades).
- Notes and interest level persist via services and are tenant-isolated.
- Proper empty/loading/error states.
- Unit tests for core flows; integration tests for search → profile → note.

KPIs
- Average time-to-find relevant athlete decreases.
- Increased recruiter engagement (e.g., notes created per session).


