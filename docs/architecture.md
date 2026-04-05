# Omoikane Architecture Notes

## Recommended Stack

- Frontend and server: `SvelteKit`
- Language: `TypeScript`
- Database: `SQLite`
- Deployment: `Docker Compose`

This stack is intentionally small and easy to deploy for a low-scale application.

## Recommended Runtime Model

Use SvelteKit in server mode rather than as a static site.

Reasons:
- Event pages are dynamic.
- Availability submissions need server-side persistence.
- SQLite is easiest to use from the app server directly.

## Data Model

### events

- `id`
- `slug` unique
- `admin_token_hash`
- `title`
- `description`
- `timezone`
- `start_date`
- `end_date`
- `is_closed`
- `created_at`
- `updated_at`

### participants

- `id`
- `event_id`
- `name`
- `email`
- `created_at`
- `updated_at`

Constraint:
- unique `(event_id, email)`

### availability

- `event_id`
- `participant_id`
- `date`

Constraint:
- unique `(participant_id, date)`

## Query Shape

The most important query is ranked availability by date.

Example shape:

```sql
select
  date,
  count(*) as attendee_count
from availability
where event_id = ?
group by date
order by attendee_count desc, date asc;
```

This is enough for the main "best date" experience in v1.

## URL Design

- Public event page: `/e/:slug`
- Admin page: `/admin/:token`
- Event creation page: `/new`

The public slug should be unique and reasonably short.
The admin token should be unguessable and treated as a bearer secret.

## Server Responsibilities

- Render event pages by slug.
- Validate participant submission payloads.
- Upsert participant records by event and email.
- Replace saved availability for a participant on each submission.
- Authorize admin actions by token.

## Client Responsibilities

- Render the current month calendar.
- Support month navigation.
- Track selected dates in client state before submission.
- Present saved results clearly.

## Security Posture For V1

- Assume a trusted, low-scale environment.
- Do basic input validation and escaping.
- Do not rely on obscurity for public event pages.
- Do rely on admin token secrecy for event management.
- Consider hashing the admin token at rest.
- Add basic rate limiting only if abuse appears.

## Deployment Notes

### Containers

Recommended initial setup:
- one app container
- one persistent volume for SQLite
- optional reverse proxy container

### Persistence

- Store the SQLite file in a mounted volume.
- Ensure the container user can write to the database path.

### Environment

Likely environment variables:
- `PORT`
- `DATABASE_PATH`
- `ORIGIN` for absolute URL generation if needed

## Implementation Guidance For Future Agents

- Prefer direct SQL over adding a full ORM unless the user asks for one.
- Keep utilities local and simple; avoid building framework-like abstractions.
- Build vertical slices that leave the application runnable after each step.
- When a choice is close, prefer the simpler deployment story.
