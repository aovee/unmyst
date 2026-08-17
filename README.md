# Unmyst

Take the mystery out of your subscriptions. Unmyst is a self-hostable web app that tracks recurring subscriptions, forecasts your spend, watches for silent price creep and free-trial conversions, and suggests where you could save.

[![CI](https://github.com/aovee/unmyst/actions/workflows/ci.yml/badge.svg)](https://github.com/aovee/unmyst/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Made with Nuxt](https://img.shields.io/badge/Made%20with-Nuxt-00DC82?logo=nuxt&labelColor=020420)](https://nuxt.com)

## Features

- **Subscription tracking** — weekly, monthly and yearly cycles with custom intervals, multi-currency amounts and shared/split costs.
- **Spend dashboard** — actual-vs-averaged monthly spend, category breakdowns, top subscriptions and a rolling forecast.
- **Renewal calendar** — upcoming renewals and a month view driven by each subscription's billing anchor date.
- **Price-creep detection** — temporal price history per subscription so you can see when and how much a price changed.
- **Free-trial tracking** — derived trial-end dates and alerts before a trial converts to a paid plan.
- **Savings suggestions** — "switch to annual" prompts on long-running monthly plans, dismissible per subscription.
- **Passwordless auth** — magic-link sign-in (via Resend) plus Google OAuth.
- **Internationalised** — English and French out of the box, with localised URL prefixes and hreflang tags.
- **Light & dark mode**, keyboard shortcuts and a command palette, powered by [Nuxt UI](https://ui.nuxt.com).

## Tech stack

| Concern        | Choice                                                                 |
| -------------- | --------------------------------------------------------------------- |
| Framework      | [Nuxt 4](https://nuxt.com) / [Vue 3](https://vuejs.org)               |
| UI             | [Nuxt UI 4](https://ui.nuxt.com) + [Tailwind CSS 4](https://tailwindcss.com) |
| Hosting/runtime| [NuxtHub](https://hub.nuxt.com)                                        |
| Database       | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)                 |
| Auth           | [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) (magic link + Google OAuth) |
| Email          | [Resend](https://resend.com) + Vue email templates                    |
| Charts         | [Unovis](https://unovis.dev) via `nuxt-charts`                         |
| i18n           | [@nuxtjs/i18n](https://i18n.nuxtjs.org)                                |
| Validation     | [Zod](https://zod.dev)                                                 |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io) 11+ (`corepack enable` to use the pinned version)
- A PostgreSQL database (e.g. [Neon](https://neon.tech) or any Postgres instance)
- A [Resend](https://resend.com) account for magic-link emails
- *(optional)* Google OAuth credentials for social sign-in

### Install

```bash
pnpm install
```

### Configure

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

See [Environment variables](#environment-variables) below for what each key does. At minimum you need `DATABASE_URL`, `NUXT_SESSION_PASSWORD` and the Resend keys.

### Run the dev server

```bash
pnpm dev
```

The app runs at `http://localhost:3000`. Database migrations under `server/db/migrations` are applied automatically by NuxtHub on start.

## Environment variables

| Variable                          | Required | Description                                                                 |
| --------------------------------- | :------: | --------------------------------------------------------------------------- |
| `DATABASE_URL`                    |    ✅    | PostgreSQL connection string.                                               |
| `NUXT_SESSION_PASSWORD`           |    ✅    | Secret ≥ 32 chars used to seal the session cookie.                          |
| `RESEND_KEY`                      |    ✅    | Resend API key, used to send magic-link emails.                             |
| `RESEND_EMAIL_FROM`               |    ✅    | Verified "from" address, e.g. `"Unmyst <contact@example.com>"`.             |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID`     |    –     | Google OAuth client ID (enables Google sign-in).                            |
| `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` |    –     | Google OAuth client secret.                                                 |
| `NUXT_SESSION_COOKIE_NAME`        |    –     | Override the session cookie name (default `unmyst_session`).                |
| `NUXT_PUBLIC_SITE_URL`            |    –     | Canonical origin for absolute URLs (canonical, OG, sitemap).                |
| `NUXT_PUBLIC_LOGO_DEV_TOKEN`      |    –     | [Logo.dev](https://logo.dev) publishable key (`pk_…`) for service logos.    |

> Never commit `.env`. It is gitignored — only `.env.example` (with placeholder values) belongs in the repo.

## Scripts

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `pnpm dev`         | Start the development server.                  |
| `pnpm build`       | Build for production.                          |
| `pnpm preview`     | Preview the production build locally.          |
| `pnpm lint`        | Run ESLint.                                    |
| `pnpm typecheck`   | Type-check with `vue-tsc`.                     |

## Database

The schema lives in [`server/db/schema.ts`](server/db/schema.ts) and migrations in [`server/db/migrations`](server/db/migrations). To change the schema, edit `schema.ts`, then generate a migration:

```bash
pnpm drizzle-kit generate
```

NuxtHub applies pending migrations automatically on the next dev-server restart.

## Project structure

```
app/            Nuxt app — pages, components, composables, layouts, emails
server/         Nitro API routes, Drizzle schema/migrations, server utils
shared/         Code shared between app and server (billing, formatting, types)
i18n/locales/   Translation files (en, fr)
test/           Unit tests
public/         Static assets and fonts
```

## Deployment

Unmyst is built for [NuxtHub](https://hub.nuxt.com); see the [NuxtHub deployment docs](https://hub.nuxt.com/docs/getting-started/deploy). Any Nitro-compatible host works too — check the [Nuxt deployment guide](https://nuxt.com/docs/getting-started/deployment). Provide the environment variables above in your host's dashboard.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md) before opening an issue or pull request.

## Security

Found a vulnerability? Please follow the process in [SECURITY.md](./SECURITY.md) — do **not** open a public issue for security reports.

## License

[MIT](./LICENSE) © Ghislain "Ao" Linais

---

Bootstrapped from the [Nuxt UI Dashboard template](https://github.com/nuxt-ui-templates/dashboard).
