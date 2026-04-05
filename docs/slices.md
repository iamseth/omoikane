# Omoikane Slices

This document breaks the initial product plan into small, implementation-oriented slices. Each slice should leave the app in a working state and avoid speculative abstractions.

## Slice Index

| ID | Title | Status | Depends On |
| --- | --- | --- | --- |
| S01 | Scaffold app and local tooling | Done | - |
| S02 | Database schema and persistence setup | Done | S01 |
| S03 | Event creation flow | Done | S01, S02 |
| S04 | Public event page shell | Done | S03 |
| S05 | Interactive monthly calendar selection | Done | S04 |
| S06 | Save and update attendee availability | Done | S05 |
| S07 | Ranked results and best-date summary | Done | S06 |
| S08 | Admin token flow and event management | Done | S03 |
| S09 | Mobile polish and accessibility pass | Done | S05, S07 |
| S10 | Docker Compose deployment | Todo | S07 |

Status values: `Todo`, `In Progress`, `Done`, `Blocked`

## S01: Scaffold app and local tooling

Goal: create the base application and a repeatable local development workflow.

Deliverables:
- Initialize a `SvelteKit + TypeScript` application.
- Add baseline scripts for `dev`, `build`, `preview`, `check`, and `test` if tests are added.
- Add formatting/linting only if the generated template already uses them or they are needed immediately.
- Commit to a simple server deployment model rather than a static-only build.

Acceptance criteria:
- App starts locally.
- A default homepage renders successfully.
- Build completes without errors.

Notes:
- Prefer the smallest generated template that supports server routes.
- Avoid adding UI libraries in the first slice.

## S02: Database schema and persistence setup

Goal: create persistent storage that makes common-date queries trivial.

Deliverables:
- Add SQLite integration.
- Create schema for `events`, `participants`, and `availability`.
- Add startup/init logic or migration mechanism.
- Add a tiny data access layer for common queries.

Acceptance criteria:
- Database file is created locally.
- Schema can be initialized from a clean checkout.
- A query can create and read back an event.

Notes:
- Keep the schema simple and explicit.
- Use unique constraints to support upsert-like behavior instead of extra deduplication code.

## S03: Event creation flow

Goal: let a user create an event and receive a shareable public URL plus a private admin URL.

Deliverables:
- Build a create-event page/form.
- Capture title, optional description, timezone, and allowed date range.
- Generate a unique public slug.
- Generate a secret admin token and store only a hash if practical.
- Redirect to the created event page and expose the admin link once.

Acceptance criteria:
- A new event can be created from the browser.
- Public URL resolves by slug.
- Admin URL resolves by token.

Notes:
- Keep creation synchronous and simple.
- Timezone is fixed per event.

## S04: Public event page shell

Goal: render the core event page before wiring up interactive selection.

Deliverables:
- Event header with title and optional description.
- Name and email inputs at the top of the page.
- Month navigation and a visible monthly calendar grid.
- Current month shown by default.
- Current day visually highlighted.

Acceptance criteria:
- Visiting `/e/:slug` renders event metadata.
- Calendar grid renders the expected days for the current month.
- Layout works on desktop and mobile widths.

Notes:
- The event page must be directly accessible from its URL.
- Avoid premature optimization around calendar rendering.

## S05: Interactive monthly calendar selection

Goal: allow a participant to toggle available dates for the event.

Deliverables:
- Make each valid day tile a button.
- Toggle selected state on click/tap.
- Prevent selecting dates outside the event range.
- Display selected dates in a small summary section.

Acceptance criteria:
- A participant can select zero or more dates.
- Selected dates are visually distinct from today.
- Selection survives month navigation inside the current browser session.

Notes:
- The common case is a handful of selected days, not dense selection.
- Keep the interaction obvious on touch devices.

## S06: Save and update attendee availability

Goal: persist a participant's date selections and allow later updates.

Deliverables:
- Add a write endpoint for attendee submissions.
- Validate required fields: event, name, email.
- Upsert participant by `(event_id, email)`.
- Replace that participant's selected dates on save.

Acceptance criteria:
- A participant can submit availability.
- Re-submitting with the same email updates their previous selection.
- Reloading the page and re-entering the same email can retrieve existing selections if implemented in this slice.

Notes:
- No email verification in v1.
- Keep server validation strict and client validation helpful.

Progress update (2026-04-04):
- Added attendee save handling on the public event page.
- Added strict server-side validation for name, email, and selected dates.
- Upserted participants by `(event_id, email)` and replaced saved availability on re-submit.

## S07: Ranked results and best-date summary

Goal: show which dates work for the most people.

Deliverables:
- Add a results query grouped by date.
- Render ranked dates with attendee counts.
- Show a compact "best options" summary near the top or beside the calendar.
- Optionally show attendee names per date if it does not complicate the UI too much.

Acceptance criteria:
- Results update after submissions are saved.
- Best dates are sorted by highest count, then date.
- Empty-state messaging is clear when there are no responses.

Notes:
- This is the core payoff of the product.
- Do not add charting libraries.

Progress update (2026-04-04):
- Added a grouped availability query that ranks dates by attendee count, breaking ties by date.
- Rendered a compact best-options summary near the top of the public event page.
- Added a full ranked results list with clear empty-state messaging when no responses exist.

## S08: Admin token flow and event management

Goal: allow the creator to manage the event without full accounts.

Deliverables:
- Admin page resolved by secret token.
- Edit title, description, timezone, and date range.
- Close or reopen the event.
- Optionally regenerate admin token if the original link is exposed.

Acceptance criteria:
- Admin URL is required for management actions.
- Closed events block new submissions clearly.
- Existing responses remain visible after closing.

Notes:
- This replaces an account system for v1.
- Treat the admin URL as a bearer secret.

Progress update (2026-04-04):
- Implemented the admin page behind the bearer token and added event editing for title, description, timezone, and date range.
- Added close and reopen controls on the admin page while keeping existing public results visible.
- Updated the public event page to show clear closed-state messaging and block new submissions when an event is closed.

## S09: Mobile polish and accessibility pass

Goal: make the main flow comfortable on phones and accessible to keyboard and assistive tech users.

Deliverables:
- Improve spacing, tap targets, and responsive layout.
- Ensure keyboard interaction works for day selection.
- Add labels, focus states, and sensible semantic markup.
- Verify color contrast between today, selected, and default states.

Acceptance criteria:
- The app is usable in a mobile browser.
- Calendar controls are keyboard accessible.
- Form controls have accessible names.

Notes:
- Native browser usage on mobile is a first-class target.

Progress update (2026-04-04):
- Tightened the public event page layout for small screens with denser card spacing, full-width mobile submit controls, and larger tap targets for calendar days and month navigation.
- Added clearer accessibility semantics for attendee submission states, including explicit error associations, live announcements for save feedback, and accessible labels for calendar navigation and day-selection buttons.
- Improved calendar state communication for assistive tech by exposing selected-date status updates and strengthening the visual separation of today, in-range, and selected states.

## S10: Docker Compose deployment

Goal: make local and small-server deployment simple.

Deliverables:
- Add `Dockerfile` for the app.
- Add `docker-compose.yml` with persistent volume for SQLite.
- Optionally add reverse proxy config if needed for production.
- Document environment variables and startup steps.

Acceptance criteria:
- `docker compose up` starts the app.
- Database persists across container restarts.
- Production build runs inside the container.

Notes:
- Keep the deployment path boring and portable.
- Prefer one app container plus an optional proxy over multi-service complexity.

## Suggested Slice Order

1. S01
2. S02
3. S03
4. S04
5. S05
6. S06
7. S07
8. S08
9. S09
10. S10

## Implementation Rules For Future Agents

- Favor the smallest correct change in each slice.
- Keep the stack simple: `SvelteKit`, `TypeScript`, `SQLite`, `Docker Compose`.
- Avoid introducing auth, background jobs, queues, ORMs, or external services unless the user asks.
- Preserve direct event access by public slug and management access by secret admin token.
- Keep the event timezone fixed per event.
