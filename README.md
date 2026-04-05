[![Coverage](https://img.shields.io/badge/coverage-96.61%25-brightgreen)](./coverage/index.html)
[![Quality](https://img.shields.io/badge/quality-checks%20passing-brightgreen)](https://github.com/iamseth/omoikane/actions/workflows/ci.yml)
[![Actions](https://img.shields.io/github/actions/workflow/status/iamseth/omoikane/ci.yml?branch=master&label=actions)](https://github.com/iamseth/omoikane/actions/workflows/ci.yml)
[![Docker Hub](https://img.shields.io/badge/docker%20hub-iamseth%2Fomoikane-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/iamseth/omoikane)

---

# Omoikane

<img src="docs/assets/logo.png" alt="Omoikane logo" width="50%" />

Omoikane is a small scheduling app for finding the best date for a group event.

## Local Development

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

Run the Svelte and TypeScript checks with:

```sh
npm run check
```

Create a production build with:

```sh
npm run build
```

## Database

The app uses SQLite through `better-sqlite3`.

- Default database path: `data/omoikane.sqlite`
- Override with: `DATABASE_PATH=/absolute/path/to/omoikane.sqlite`

The database schema is created automatically on first server access.
