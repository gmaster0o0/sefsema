# SefSema — Recipe app (Next.js App Router)

## Overview

SefSema — Recipe-sharing app built with Next.js App Router, featuring dedicated create/detail pages
and filtering by tags and ingredients.

## Key features

- Unified recipe list with public and personal recipes.
- Ingredient search with suggestions.
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
- Data layer: in-memory repository (development) or MongoDB (production/optional)
  - Switch with `USE_MONGO=true` in `.env.local` to enable MongoDB-backed `mongoRecipeRepo`.
- Auth: session cookie
- Validation: Zod
- Slug generation: custom utility (`app/lib/slug.ts`)

### MongoDB & migration

- Files added:
  - `app/lib/mongodb.ts` — MongoDB client singleton and connection helper
  - `app/lib/mongoRecipeRepo.ts` — Mongo-backed implementation of the `RecipeRepository` API
  - `app/lib/getRecipeRepo.ts` — helper that returns the selected repo based on `USE_MONGO`
  - `scripts/migrate-memory-to-mongo.ts` — one-off migration script to copy in-memory seed data to MongoDB

- Env vars (add to `.env.local`):
  - `MONGODB_URI` (e.g. `mongodb://localhost:27017`)
  - `MONGODB_DB` (e.g. `recipe_app`)
  - `USE_MONGO=true` to enable Mongo usage

- How to migrate seed data into MongoDB:

```bash
# install runner if you don't have it
npm install -D tsx dotenv

# ensure .env.local contains MONGODB_URI / MONGODB_DB and USE_MONGO=true
npm run migrate:memory-to-mongo
```

The migration script upserts users and recipes from the in-memory repo into `users` and `recipes` collections and preserves the original in-memory id in `legacyId`.

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
Migration and refactor also produced by AI with human supervision.
