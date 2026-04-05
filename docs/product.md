# Omoikane Product Brief

## Product Summary

Omoikane helps a small group of people find a date for an event by selecting which calendar days they are available. Each event has a public shareable page where participants enter a name and email address, then choose zero or more dates from a calendar.

The core product outcome is simple: identify which date works for the most people.

## Primary Use Case

1. A creator makes an event.
2. The app generates a public event URL and a private admin URL.
3. The creator shares the public URL with friends.
4. Each participant enters name and email, then selects available dates.
5. The event page shows which dates have the most availability.

## Constraints

- Small-scale usage only; no need to optimize for high concurrency.
- Ease of deployment matters more than long-term scaling complexity.
- App must work in desktop browsers and mobile browsers.
- Users should be able to access an event directly by URL.
- Event data must persist.

## Product Decisions

### Management

- No account system in v1.
- Event creators manage events through a secret admin token URL.

### Participant Identity

- Participants provide `name + email`.
- No email verification in v1.
- A repeated submission for the same event and email should update the existing response.

### Timezone

- Each event has one fixed timezone.
- Dates are interpreted in the event timezone, not per-viewer local time.

## Core Entities

### Event

Represents a scheduling poll.

Fields:
- title
- optional description
- public slug
- admin token
- timezone
- allowed date range
- open/closed state

### Participant

Represents one responder for one event.

Fields:
- name
- email
- event reference

### Availability

Represents one selected date for one participant.

Fields:
- participant reference
- event reference
- date

## Non-Goals For V1

- Accounts and login
- Email notifications
- Real-time collaboration
- Native mobile apps
- Recurring events
- Time-of-day availability
- Complex permission models

## UX Expectations

- The event page should feel lightweight and obvious.
- The calendar should be the main focus of the screen.
- Today should be visible and visually distinct.
- Selected dates should be easy to understand at a glance.
- Mobile touch interaction should work well.

## Success Criteria For MVP

- A user can create an event without technical setup.
- A participant can submit availability in under a minute.
- The best date for the group is immediately visible from saved responses.
