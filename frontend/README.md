# UKFP Allocation Modeller — Frontend

This folder contains the React + Vite frontend for the UKFP Allocation Modeller. It provides the UI for
creating simulation jobs, monitoring their progress, and displaying results.

The frontend expects a backend API to be available at the same origin (or proxied in development). It
talks to the backend via HTTP requests to `/api/*` and uses Socket.IO for real-time job progress updates
at the path `/ws/socket.io`.

## Prerequisites

- Node.js (recommended 18+)
- npm (or yarn / pnpm)
- A running backend (see repository root `api/`)

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

## Build (production)

```bash
npm run build
npm run preview
```

## Linting & Formatting

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:fix
```

## Configuration

Any runtime configuration should be provided via Vite environment variables prefixed with `VITE_`.

The file `src/config/config.ts` automatically strips the `VITE_` prefix and validates values against the schema in `src/config/schemas/configSchema.ts`.

## Network endpoints used by the frontend

- POST /api/job — create a simulation job (`src/lib/simulation.ts`)
- GET /api/job/:id — fetch results for a job
- GET /api/deanery — fetch deanery / ranking options
- Socket.IO — connects to `/` using path `/ws/socket.io` for job progress updates (`src/lib/hooks/useJobProgress.ts`)

## Docker

There are `Dockerfile.local` and `Dockerfile.prod` in this folder. Example:

```bash
docker build -f Dockerfile.local -t ukfp-frontend:local .
docker build -f Dockerfile.prod -t ukfp-frontend:prod .
```
