# Podman Container Guide

## 🐳 Everything in Containers (Recommended)

This guide shows how to run the **entire application** in Podman containers.

### What Gets Containerized

All 6 services run in containers:
- ✅ PostgreSQL (database)
- ✅ Redis (cache/queue)
- ✅ Backend (FastAPI)
- ✅ Frontend (Next.js)
- ✅ Celery Worker (background tasks)
- ✅ Celery Beat (task scheduler)

## Quick Start

### 1. First Time Setup

```bash
# Build all Podman images
make docker-build

# This will build:
# - Backend image (Python + FastAPI)
# - Frontend image (Node + Next.js)
# - Celery worker/beat (uses backend image)
```

### 2. Start Everything

```bash
# Start all services in background
make docker-up-all

# OR start with logs visible (Ctrl+C to stop)
make docker-dev
```

### 3. Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Common Commands

### Starting & Stopping

```bash
# Start all containers (detached)
make docker-up-all

# Start with logs (foreground)
make docker-dev

# Stop all containers
make docker-down

# Restart all containers
make docker-restart
```

### Monitoring

```bash
# Check container status
make docker-ps

# View logs (all services)
make docker-logs

# View logs for specific service
podman compose logs -f backend
podman compose logs -f frontend
podman compose logs -f celery_worker
```

### Building & Rebuilding

```bash
# Build all images
make docker-build

# Rebuild and restart (after code changes)
make docker-rebuild

# Build specific service
podman compose build backend
podman compose build frontend
```

### Data Management

```bash
# Clean everything (⚠️ deletes database!)
make docker-clean

# Just stop containers (keeps data)
make docker-down
```

## Architecture

### Network
All services are on the same Podman network: `crime_stats_network`

Services communicate using container names:
- Backend connects to `postgres:5432` (not localhost)
- Backend connects to `redis:6379` (not localhost)
- Frontend connects to backend via `http://localhost:8000` (exposed port)

### Volumes

**Named Volumes (persist data):**
- `postgres_data` - Database files
- `redis_data` - Redis snapshots
- `backend_storage` - Uploaded files/storage

**Bind Mounts (for development):**
- `./backend:/app` - Live code changes
- `./frontend:/app` - Live code changes

## Development Workflow

### Making Code Changes

When you edit code:

**Backend:** Container auto-reloads (using `--reload` flag)
**Frontend:** Hot reload works automatically

No need to restart containers for code changes!

### Running Migrations

```bash
# Migrations run automatically on backend startup
# Or manually:
podman compose exec backend alembic upgrade head

# Create new migration
podman compose exec backend alembic revision --autogenerate -m "description"
```

### Accessing Shells

```bash
# Backend Python shell
podman compose exec backend python

# Backend bash shell
podman compose exec backend bash

# PostgreSQL shell
podman compose exec postgres psql -U crime_stats_user -d crime_statistics

# Frontend bash shell
podman compose exec frontend sh
```

### Running Tests

```bash
# Backend tests
podman compose exec backend pytest

# Backend tests with coverage
podman compose exec backend pytest --cov=app

# Frontend tests
podman compose exec frontend npm test
```

## Production Deployment

### Environment Variables

Create production `.env` file:

```bash
# Backend environment
DATABASE_URL=postgresql://user:pass@postgres:5432/dbname
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key

# Frontend environment
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SITE_NAME=Let's Talk Statistics
```

### Production Build

```bash
# Build for production
podman compose build --no-cache

# Start in production mode
podman compose up -d
```

### Health Checks

All services have health checks:

```bash
# Check health status
podman compose ps

# Services should show "healthy"
```

## Troubleshooting

### "Port already in use"

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Stop conflicting services
make stop  # Stop local services
make docker-down  # Stop containers
```

### "Container keeps restarting"

```bash
# Check logs
podman compose logs backend
podman compose logs frontend

# Common issues:
# - Database not ready (wait for health check)
# - Environment variables missing
# - Port conflicts
```

### "Database connection failed"

```bash
# Ensure postgres is healthy
podman compose ps postgres

# Check if migrations ran
podman compose logs backend | grep alembic

# Manually run migrations
podman compose exec backend alembic upgrade head
```

### "Frontend can't connect to backend"

```bash
# Ensure backend is running
podman compose ps backend

# Check backend logs
podman compose logs backend

# Test backend directly
curl http://localhost:8000/docs
```

### "Changes not reflecting"

For **backend:**
```bash
# Check if --reload is active
podman compose logs backend | grep "Uvicorn running"

# Restart backend
podman compose restart backend
```

For **frontend:**
```bash
# Restart frontend
podman compose restart frontend

# Rebuild if needed
podman compose up -d --build frontend
```

## Cleanup

### Remove Everything

```bash
# Stop and remove containers + volumes
make docker-clean

# Remove images too
podman compose down --rmi all -v

# Remove all unused Podman resources
podman system prune -a
```

## Comparison: Local vs Podman

| Aspect | Local Development | Podman Containers |
|--------|-------------------|-------------------|
| **Setup** | `make all` | `make docker-build && make docker-up-all` |
| **Start** | `make dev` | `make docker-dev` |
| **Speed** | Faster (native) | Slightly slower (virtualization) |
| **Isolation** | Uses system Python/Node | Fully isolated |
| **Portability** | Requires local setup | Works anywhere with Podman |
| **Production Parity** | Different from prod | Same as production |
| **Cleanup** | Clean files locally | Just remove containers |

## Best Practices

1. **Use Podman for:**
   - Production deployments
   - CI/CD pipelines
   - Team consistency
   - Clean environments

2. **Use Local for:**
   - Faster iteration
   - Debugging with IDE
   - When you need native performance

3. **Hybrid Approach:**
   - Run databases in Podman: `make docker-up`
   - Run code locally: `make dev`
   - Best of both worlds!

## Next Steps

Once containers are running:

1. ✅ Visit http://localhost:3000
2. ✅ Explore the API at http://localhost:8000/docs
3. ✅ Check logs with `make docker-logs`
4. ✅ Monitor with `make docker-ps`

For development, you can switch between:
- **Full containers**: `make docker-dev`
- **Local with DB containers**: `make docker-up && make dev`
