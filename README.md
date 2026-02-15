# Scalendar

Scalendar is a multi-sport calendar and tables app with a React web client, Expo mobile app, and Supabase-backed data pipeline.

## Current Scope

- Football: Premier League, Champions League, Europa League, Europa Conference League, La Liga, Bundesliga, Serie A, Ligue 1
- Motorsport: Formula 1 (race weekend sessions + driver/constructor standings)
- Baseball: MLB, KBO

The web app reads from Supabase, not direct client calls to external sports APIs.

## Tech Stack

- Web: React + TypeScript + Vite
- Mobile: React Native (Expo) + TypeScript
- Data/API: Supabase (Postgres + RLS + JS client)
- Fetch/cache: React Query

## Repository Structure

```text
/web                 React web app
/mobile              Expo app
/web/scripts          Manual sync scripts
/.github/workflows    Scheduled sync jobs
/docs                 Product and planning docs
```

## Data Sources

- Football + Baseball: TheSportsDB (server-side sync scripts)
- F1: Jolpica Ergast-compatible API (`api.jolpi.ca`)

## Local Setup

### Prerequisites

- Node.js 22.x recommended
- npm
- Supabase project with required tables/policies

### 1) Install dependencies

```bash
cd web
npm ci
```

### 2) Environment variables

Copy `web/.env.example` to `web/.env` and set:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is required for sync scripts.

### 3) Run web app

```bash
cd web
npm run dev
```

## Manual Data Sync

From repository root:

```bash
npm --prefix web run sync:football
npm --prefix web run sync:f1
npm --prefix web run sync:baseball
```

Or from `web/`:

```bash
npm run sync:football
npm run sync:f1
npm run sync:baseball
```

## Automated Sync (GitHub Actions)

Workflows:

- `football-sync.yml` every 30 minutes
- `baseball-sync.yml` every 30 minutes
- `f1-sync.yml` every 15 minutes

Required repository secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Each workflow can also be run manually via `workflow_dispatch`.

## Notes

- Sync upserts by conflict keys, so existing rows are updated and new rows are inserted.
- Current app preferences include 24-hour time and hide scores/winners, applied globally in web UI.
