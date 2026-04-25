# UKFP Allocation Modeller — API

This folder contains the Express API for the UKFP Allocation Modeller. It provides HTTP endpoints to create simulation jobs and fetch results, publishes Celery-compatible tasks to RabbitMQ for background processing, and broadcasts job progress to connected clients using Redis pub/sub and Socket.IO.

## High Level

### HTTP Endpoints

- POST /job — create a simulation job (returns { job_id })
- GET /job/:id — fetch simulation results / status for a job
- GET /deanery — get deanery / ranking options

### Web Sockets

Socket.IO is used to emit real-time job updates to rooms named `job:<jobId>`.

Clients can `subscribeToJob` with the job id to join the room and will receive `jobUpdate` events.

### Background Work

Tasks are published to RabbitMQ in a Celery-compatible format (task name `celery_app.run_simulation`).

A separate Python worker (see `/worker`) runs the Celery tasks and publishes job progress updates to Redis.

## Prerequisites

- Node.js (recommended 18+)
- npm
- RabbitMQ for task queueing (accessible via `RABBITMQ_URL`)
- Redis for pub/sub (used to forward progress updates to Socket.IO)
- Python environment and Celery worker (see `/worker`) if you want to run the simulation worker locally

## Quickstart (development)

### Install

```bash
npm install
```

### Development (hot-reload)

The project ships a `dev` script which uses `nodemon` to run the TypeScript server. It relies on `ts-node` to
execute TypeScript directly.

```bash
npm run dev
```

### Build & run production

```bash
npm run build        # compiles TypeScript into dist/
npm run start        # runs node dist/server.js
```

## Configuration

Configuration can be passed in via environment variables or a `.env` file. The server uses `dotenv` to load `.env` in development, but environment variables take precedence over `.env` values.

Below are the available configuration variables:

- PORT — port the API server listens on (default: 5000)
- RABBITMQ_URL — AMQP connection string for RabbitMQ (e.g. `amqp://guest:guest@localhost:5672/`)
- REDIS_HOST — Redis host (the server uses this for pub/sub)
- REDIS_PORT — Redis port

### Example `.env` (local development)

```env
PORT=5000
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Notes about internals

- Server entry: `src/server.ts` — sets up Express, Socket.IO and Redis subscription.
- Routes:
  - `src/routes/jobRoutes.ts` — job creation (publishes Celery task) and job retrieval (queries job results)
  - `src/routes/deaneryRoutes.ts` — deanery data endpoints (dummy data in the router)
- Celery task publishing: `src/lib/celeryPublisher.ts` publishes a minimal Celery-compatible message to the
  `celery` exchange on RabbitMQ. The task id returned by `publishTask` is used as the `job_id` returned to clients.
  The Python worker must register the task name `celery_app.run_simulation` for this to be processed correctly.
- Redis pub/sub:
  - The server creates a Redis subscriber which listens on the `job_updates` channel and forwards messages to
    Socket.IO rooms named `job:<job_id>` as `jobUpdate` events.
  - The Python worker (or any producer) should publish JSON messages to the `job_updates` channel with a shape the
    frontend expects (e.g., { job_id, progress, message, ... }). The existing frontend code listens for `jobUpdate`.

## Socket.IO and proxying

- By default, the server exposes Socket.IO on the default socket path (usually `/socket.io`). If you proxy WebSocket
  traffic (for example via an Nginx location prefix like `/ws`), ensure the path is adjusted accordingly. The frontend
  currently attempts to connect using `path: '/ws/socket.io'` — adapt either the client path, the server path or your
  proxy rules so they match.

## Worker (Python / Celery)

- The repository contains a `worker/` directory with `celery_app.py` and `simulations.py`. This is the long-running
  process that executes simulation tasks.
- To run the Python worker, follow instructions in `worker/README.md`.
- The worker must be able to connect to RabbitMQ using the same `RABBITMQ_URL` and should publish updates to the
  `job_updates` Redis channel so the API can forward them to WebSocket clients.

## Docker & Compose

- There are `Dockerfile.local` and `Dockerfile.prod` in the `api/` folder. The repository also contains a `deploy/docker-compose.yaml`.
  Using Docker Compose from `deploy/` is typically the simplest way to bring up the API, worker, RabbitMQ and Redis together.

## Troubleshooting

- `Invalid environment configuration` on server start:
  - `src/config/config.ts` validates environment variables against the `configSchema`. Ensure your `.env` or environment
    variables provide the expected values.
- Socket.IO connection failing from the frontend:
  - Check path and proxy rules. If your frontend expects `/ws/socket.io` but your server exposes `/socket.io` directly,
    either change the frontend client path or configure your reverse proxy to map `/ws/` to the backend socket endpoint.
- Celery tasks not being processed:
  - Ensure RabbitMQ is reachable (correct `RABBITMQ_URL`) and that the Python worker is running and registered for
    `celery_app.run_simulation`.
