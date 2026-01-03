# 🐳 Complete Containerization - Setup Complete!

## What Changed

Your application is now **fully containerized**. Everything runs in Podman containers.

### Previous Setup
- ❌ Backend ran locally (Python venv)
- ❌ Frontend ran locally (Node.js)
- ✅ Only PostgreSQL & Redis in containers

### New Setup
- ✅ Backend in container
- ✅ Frontend in container
- ✅ PostgreSQL in container
- ✅ Redis in container
- ✅ Celery Worker in container
- ✅ Celery Beat in container

## Files Created

1. **Dockerfiles:**
   - `backend/Dockerfile` - Backend container
   - `backend/.dockerignore` - Exclude files from backend build
   - `frontend/Dockerfile` - Frontend production container
   - `frontend/Dockerfile.dev` - Frontend dev container
   - `frontend/.dockerignore` - Exclude files from frontend build

2. **Podman Compose:**
   - `docker-compose.yml` - Updated with all 6 services
   - `podman compose.dev.yml` - Development overrides for hot reload

3. **Documentation:**
   - `DOCKER_GUIDE.md` - Complete Podman usage guide
   - `CONTAINER_SETUP.md` - This file

## Quick Start (3 Steps)

### Step 1: Build Images (First Time Only)

```bash
make docker-build
```

This builds:
- Backend image (Python 3.11 + FastAPI)
- Frontend image (Node 18 + Next.js)
- Uses same image for Celery workers

**Time:** 2-5 minutes on first build

### Step 2: Start All Services

```bash
make docker-up-all
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 8000)
- Frontend (port 3000)
- Celery Worker
- Celery Beat

**Time:** 10-20 seconds

### Step 3: Access Your Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Container Commands Reference

### Starting & Stopping

| Command | What It Does |
|---------|--------------|
| `make docker-build` | Build all images (first time) |
| `make docker-up-all` | Start all containers (background) |
| `make docker-dev` | Start with logs (foreground) |
| `make docker-down` | Stop all containers |
| `make docker-restart` | Restart all containers |
| `make docker-rebuild` | Rebuild + restart |

### Monitoring

| Command | What It Does |
|---------|--------------|
| `make docker-ps` | Show container status |
| `make docker-logs` | View all logs (follow) |
| `make status` | Complete system status |

### Cleanup

| Command | What It Does |
|---------|--------------|
| `make docker-down` | Stop containers (keep data) |
| `make docker-clean` | Stop + delete data volumes ⚠️ |

## What About Local Development?

You can still run locally if you prefer:

```bash
# Option 1: Everything local
make all          # Install dependencies locally
make dev          # Run backend + frontend locally

# Option 2: Hybrid (databases in Podman, code local)
make docker-up    # Start only PostgreSQL + Redis
make dev          # Run backend + frontend locally
```

## Development Workflow

### Making Code Changes

**With containers**, code changes auto-reload:
- ✅ Backend: Changes reload automatically (`--reload` flag)
- ✅ Frontend: Hot reload works automatically

No need to restart containers!

### Running Commands in Containers

```bash
# Backend shell
podman compose exec backend bash

# Run migrations
podman compose exec backend alembic upgrade head

# Run tests
podman compose exec backend pytest

# Frontend shell
podman compose exec frontend sh

# Database shell
podman compose exec postgres psql -U crime_stats_user -d crime_statistics
```

## Verifying Everything Works

### 1. Check All Containers Running

```bash
make docker-ps
```

Should show 6 containers:
- crime_stats_db (healthy)
- crime_stats_redis (healthy)
- crime_stats_backend
- crime_stats_frontend
- crime_stats_celery_worker
- crime_stats_celery_beat

### 2. Check Logs

```bash
make docker-logs
```

Look for:
- Backend: "Uvicorn running on http://0.0.0.0:8000"
- Frontend: "Ready on http://localhost:3000"
- No error messages

### 3. Test Frontend

```bash
curl http://localhost:3000
```

Should return HTML

### 4. Test Backend

```bash
curl http://localhost:8000/docs
```

Should redirect to API docs

## Advantages of Containers

✅ **Consistency:** Same environment everywhere
✅ **Isolation:** No conflicts with system packages
✅ **Portability:** Works on any machine with Podman
✅ **Production Parity:** Dev matches production
✅ **Clean Setup:** No local Python/Node needed
✅ **Easy Cleanup:** Just delete containers

## Common Issues

### "Port already in use"

```bash
# Stop local services first
make stop

# Or check what's using the port
lsof -i :3000
lsof -i :8000
```

### "Container won't start"

```bash
# Check logs for errors
podman compose logs backend
podman compose logs frontend

# Rebuild if needed
make docker-rebuild
```

### "Can't connect to database"

```bash
# Ensure postgres is healthy
make docker-ps

# Wait a few seconds for health check
# Then restart backend
podman compose restart backend
```

## Using Docker vs Podman

You have both `docker` and `podman` on your system. **Use Podman** for this project:

✅ Use: `podman ps`, `podman compose`, `make docker-*`
❌ Don't use: `podman container ls`, `podman-compose`

## Next Steps

Now that containers are set up:

1. ✅ Run `make docker-build`
2. ✅ Run `make docker-up-all`
3. ✅ Visit http://localhost:3000
4. ✅ Read `DOCKER_GUIDE.md` for detailed info
5. ✅ Use `make docker-logs` to monitor
6. ✅ Use `make docker-down` when done

## Summary

**Before:**
- `make all` - Installed locally, only DB in containers
- `make dev` - Ran locally

**Now:**
- `make docker-build` - Build container images
- `make docker-up-all` - Everything in containers ✨

**To start everything in containers:**

```bash
make docker-build      # First time only
make docker-up-all     # Start all services
```

That's it! 🎉
