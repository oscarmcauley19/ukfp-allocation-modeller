# UKFP Allocation Modeller - Worker Service

Celery worker service for the UKFP Deanery Allocation modeller.

This subdirectory contains the Celery worker logic and simulation code.

## Prerequisites

- Python 3.11+
- RabbitMQ (AMQP broker) and Redis (result backend). You can run these
  locally (recommended for development) using Docker.

## Quickstart (development)

1.  Create and activate a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate
```

2.  Install Python dependencies:

```bash
pip install -r requirements.txt
```

3.  Start RabbitMQ and Redis (development, using Docker):

```bash
# RabbitMQ with management UI
docker run -d --hostname rabbitmq --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Redis
docker run -d --name redis -p 6379:6379 redis:7
```

4.  (Optional) Create a `.env` file at the root of the worker subdirectory (`ukfp-allocation-modeller/worker.env`) to override connection URLs.

Example `.env`:

```env
# RabbitMQ broker (example)
BROKER_URL=pyamqp://guest:guest@localhost:5672//

# Redis URL (example)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

Notes on precedence: the config loader will read `.env` using `python-dotenv` if installed, but exported/process environment variables take precedence over `.env` values (this follows 12-factor best practices).

5.  Start the Celery worker

You must ensure Python can import the `src` package. From the project root you can either set `PYTHONPATH` or run the worker from the `src` directory.

From the worker subdirectory root (recommended):

```bash
# Ensure you're in the worker subdirectory
cd ukfp-allocation-modeller/worker

# Activate your virtualenv so the `celery` CLI is on PATH
source venv/bin/activate

# Make the `src` folder importable from the project root
export PYTHONPATH=./src

# Start the worker. Use the module:object form so Celery picks the
# Celery instance named `celery_app` defined in `src/celery_app.py`.
celery -A celery_app:celery_app worker --loglevel=info
```

Or from the `src` folder directly (no PYTHONPATH required):

```bash
cd ukfp-allocation-modeller/worker/src

# activate venv if you use one
source ../venv/bin/activate
celery -A celery_app:celery_app worker --loglevel=info
```

If you encounter issues related to event loops or concurrency in the worker, try adding `--pool=solo` for debugging, e.g. `celery ... --pool=solo`.

Common errors and fixes:

- "celery: command not found": make sure you've installed dependencies and activated the virtualenv in the same shell (`pip install -r requirements.txt` and `source venv/bin/activate`). The `celery` binary lives in `venv/bin`.
- "ModuleNotFoundError: No module named 'celery_app'": ensure you set `PYTHONPATH=./src` when running from the project root, or run the `celery` command from inside the `src` directory.

To enqueue simulation jobs, use the Express API (`ukfp-allocation-modeller/api`) which publishes Celery-compatible messages directly to RabbitMQ.

## How configuration works

- `src/config.py` reads configuration values from environment variables.
- If `python-dotenv` is available, `src/config.py` will also load a `.env` file from the worker subdirectory root so you can drop `ukfp-allocation-modeller/worker/.env` to provide local defaults. Process/exported environment variables still take precedence.

## Development tips & troubleshooting

- To quickly check your configuration is being read correctly:

```bash
cd ukfp-allocation-modeller/worker
python3.11 -c "import sys; sys.path.append('./src'); import config; print(config.BROKER_URL, config.REDIS_URL)"
```

- If the Celery worker can't connect to RabbitMQ or Redis, check the Docker
  containers (`docker ps`) and the connection URLs in your environment or
  `.env` file.

- If you change `requirements.txt`, re-run `pip install -r requirements.txt`
  to update your environment.

## Running in Docker / Production

This README focuses on local development. For deployment you probably want to run RabbitMQ/Redis as managed services or via orchestration (docker-compose, Kubernetes), and install Python dependencies in a pinned environment.

## Files of interest

- `src/celery_app.py` — Celery app and `run_simulation` task.
- `src/config.py` — configuration loader (reads env and optional `.env`).
- `src/simulations.py` — simulation logic called by the Celery task.
