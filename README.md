# Recipe app (Next.js App Router)

## Overview

Recipe-sharing app built with Next.js App Router, featuring dedicated create/detail pages
and filtering by tags and ingredients.

## Key features

- Public recipe list and dynamic recipe management.
- Dedicated create page at `/create`.
- Detail page at `/recept/[slug]`.
- SEO-friendly URLs with unique slugs (accent removal).
- Optimistic UI for personal recipe deletion.
- Tag and ingredient filtering.

## Seed data

- 5 system recipes with tags and preparation.
- Extra seed user: `maria` (maria@example.com / demo1234) + 2 public recipes.
- Restart the dev server to re-seed data.

## API documentation

- REST-style overview: [docs/api.md](docs/api.md)

## Technical specification

- Framework: Next.js (App Router) + React
- UI: Tailwind CSS
- Data layer: in-memory repository
- Auth: session cookie
- Validation: Zod
- Slug generation: custom utility (`app/lib/slug.ts`)

## Validation and checks

- Lint: `npm run lint`
- Commit quality: Commitlint + Husky (conventional commits, required scope)

## Run locally

```bash
npm install
npm run dev
```

## Note (experimental)

This codebase was produced with an AI assistant (GitHub Copilot) under human supervision
as an experimental effort, and was manually reviewed.
