# UKFP Allocation Modeller

This repository contains a small modelling application that demonstrates how applicants' preferences and randomised allocation interact in the UK Foundation Programme (UKFP) allocation process.

## Context

The UK Foundation Programme allocates newly graduated doctors to foundation schools and deaneries based on a combination of a random score and applicant preferences. For background on the allocation process, see the official NHS documentation:

https://foundationprogramme.nhs.uk/programmes/2-year-foundation-programme/ukfp/application-process/allocation-to-a-foundation-school/

## Purpose of this project

This project is intended as an interactive tool to aid prospective applicants by allowing them to model the allocation process and see how different preference rankings might affect their chances of being allocated to various deaneries.

## How does the modelling work?

The core idea is to allow users to submit ranked preferences for deaneries (or foundation schools) and run [Monte Carlo-style](https://en.wikipedia.org/wiki/Monte_Carlo_method) simulations to estimate chances of being allocated to each deanery given the competition and number of places.

The key assumption made is that the first choice application ratio for each deanery is the same as the second choice, third choice, etc. In reality, this is **unlikely to be the case** (some deaneries may be more popular as a first choice but very unpopular as a second-choice, for instance), but the NHS only provides data on application ratios for the first choice.

The user can select the number of simulation runs to perform (e.g., 100) to get a more accurate estimate, but this also increases the time it takes to run the simulation. The backend is designed to handle these potentially long-running simulations by offloading them to a background worker and providing real-time progress updates.

## High-level architecture

### Overview (components):

- Frontend (React + Vite)
  - UI for entering preferences, starting simulation jobs, and visualising results.
  - Connects to the API via HTTP (`/api/*`) and subscribes to job progress updates with Socket.IO
    (client uses `path: '/ws/socket.io'`).
  - Located in `frontend/`.

- API (Express + TypeScript)
  - Exposes REST endpoints to create jobs and fetch job results.
  - Publishes Celery-compatible task messages to RabbitMQ when a job is created.
  - Subscribes to Redis pub/sub channel (e.g., `job_updates`) and forwards messages to Socket.IO rooms
    named `job:<jobId>` so clients receive `jobUpdate` events.
  - Located in `api/`.

- Worker (Python + Celery)
  - Runs the actual simulation tasks (registered Celery task `celery_app.run_simulation`).
  - Publishes progress updates to Redis so the API can forward them to connected clients.
  - Located in `worker/`.

- Infrastructure
  - RabbitMQ — task broker for Celery task messages.
  - Redis — used for pub/sub messages containing job progress.

### Data and message flow (simplified):

1. User submits a ranking from the frontend.
2. Frontend POSTs to `POST /job` on the API.
3. API publishes a Celery-compatible task message to RabbitMQ and returns a `job_id` to the client.
4. A Python Celery worker consumes the task, runs the simulation, and publishes progress updates to Redis.
5. The API, subscribed to Redis' `job_updates` channel, receives updates and emits them over Socket.IO to clients
   in the room `job:<jobId>`.
6. Once the simulation completes, final results are available via `GET /job/:id` (or delivered via Socket.IO updates).

## Quickstart (development)

### Docker Compose (recommended)

This repository uses multiple services. The simplest way to run everything locally is using the provided Docker
Compose configuration in `deploy/docker-compose.yaml`.

1. Ensure Docker and Docker Compose are installed.
2. From the repository root run:

```bash
# Bring up the whole stack: API, frontend, RabbitMQ, Redis, worker (if configured in compose)
docker compose -f deploy/docker-compose.yaml up --build
```

3. Visit the frontend (Vite) URL printed by the container logs (commonly http://localhost:5173) and interact with the
   UI to create jobs and view progress.

### Manual local dev (without Docker)

1. Start RabbitMQ and Redis locally (or have accessible instances).
2. Run the API:

```bash
cd api
npm install
npm run dev
```

3. Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Start the Python worker (from `worker/`) in a separate terminal (see `worker/requirements.txt`):

```bash
cd worker
# create and activate venv, install requirements
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# start Celery (example)
celery -A celery_app worker --loglevel=info
```

### Where to look next

- `frontend/README.full.md` — detailed frontend README (install, env, scripts, Docker notes).
- `api/README.full.md` — detailed API README (install, env, RabbitMQ/Celery notes, Socket.IO, Redis).
- `worker/` — Python Celery worker and simulation logic.
