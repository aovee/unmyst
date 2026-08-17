# Contributing to Unmyst

Thanks for taking the time to contribute! This document explains how to propose changes and get them merged.

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report bugs** — open a [bug report](https://github.com/aovee/unmyst/issues/new?template=bug_report.md).
- **Suggest features** — open a [feature request](https://github.com/aovee/unmyst/issues/new?template=feature_request.md).
- **Improve docs** — fixes to the README, comments or this guide are very welcome.
- **Send code** — see the workflow below.

For anything larger than a small fix, please open an issue first to discuss the approach before you invest time in a PR.

## Development setup

See the [Getting started](./README.md#getting-started) section of the README. In short:

```bash
pnpm install
cp .env.example .env   # then fill in your values
pnpm dev
```

## Before you open a pull request

Please make sure the checks pass locally — CI runs the same ones:

```bash
pnpm lint
pnpm typecheck
```

Unit tests use [Vitest](https://vitest.dev) (see `test/`). If you add or change tested logic, run them with:

```bash
pnpm dlx vitest run
```

If you changed the database schema (`server/db/schema.ts`), generate and commit the migration:

```bash
pnpm drizzle-kit generate
```

## Pull request guidelines

1. Fork the repo and create a branch from `main` (e.g. `feat/renewal-reminders` or `fix/forecast-rounding`).
2. Keep PRs focused — one logical change per PR is easier to review.
3. Match the existing code style; ESLint (with the project's stylistic rules) is the source of truth.
4. Write a clear description of **what** changed and **why**. Link the issue it closes (`Closes #123`).
5. Make sure `pnpm lint` and `pnpm typecheck` pass.

## Commit messages

Follow the style already in the history — a capitalised, scoped, imperative subject, e.g.:

```
Feat(dashboard): add rolling 12-month spend forecast
Fix(i18n): correct French plural for renewals
Refactor: extract billing helpers into shared/
```

## Reporting security issues

Please **do not** file public issues for security vulnerabilities. Follow the process in [SECURITY.md](./SECURITY.md) instead.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE) that covers this project.
