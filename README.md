# Omoikane

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
