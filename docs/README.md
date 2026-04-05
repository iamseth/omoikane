# Omoikane Docs

Start here when implementing the project.

## Reading Order

1. `docs/product.md` for product intent and constraints
2. `docs/architecture.md` for stack and implementation boundaries
3. `docs/slices.md` for the build order and acceptance criteria

## Working Agreement For Future Agents

- Implement one slice at a time.
- Update the status table in `docs/slices.md` as slices progress.
- Prefer the smallest correct implementation that keeps the app runnable.
- Do not add accounts, email verification, or unnecessary infrastructure unless requested.

## Source Of Truth

- Product decisions live in `docs/product.md`.
- Technical decisions live in `docs/architecture.md`.
- Delivery sequencing lives in `docs/slices.md`.
