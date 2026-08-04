# Contributing

## Development baseline

- Use Node.js 24 or newer.
- Install dependencies with `npm ci`.
- Run `npm run lint`, `npm run test:coverage -- --runInBand`, and `npm run build` before opening a pull request.

## Branches

Use one focused branch per concern:

- `fix/...` for defects
- `feat/...` for features
- `docs/...` for documentation
- `chore/dependencies-...` for dependency-only updates

## Commit scope

Keep dependency updates separate from visual, copy, behavior, and refactoring changes. A dependency repair should contain only package manifests, lockfiles, and directly required compatibility fixes.

Do not combine these in one commit or pull request:

- dependency updates and UI redesigns
- security fixes and unrelated formatting
- content changes and large refactors
- deployment repairs and new features

This makes failures easier to isolate and changes safer to revert.

## Public identity

Use **Mohammad Mansib Newaz** consistently in titles, metadata, structured data, documentation, and visible copy.

## Pull requests

A pull request should explain:

1. What changed.
2. Why the change is necessary.
3. How it was tested.
4. Any deployment or compatibility risk.

All blocking checks must pass before merge.
