# Quick Start Guide

## ✅ Your System is Ready!

Your containers ARE running, you just need to check with the right command:

### Check What's Running

```bash
# ✓ Use this (Podman)
podman ps

# ✗ Not this (Podman)
podman container ls
```

**Current Status:**
- PostgreSQL: ✓ Running on localhost:5432
- Redis: ✓ Running on localhost:6379

## Start the Frontend

The frontend is NOT running yet. Start it with:

```bash
# Option 1: Start both frontend and backend
make dev

# Option 2: Start only frontend
make frontend

# Option 3: From frontend directory
cd frontend
make dev
```

The frontend will be available at: **http://localhost:3000**

## All Service URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3000 | Not running (start with `make dev`) |
| **Backend** | http://localhost:8000 | Running ✓ |
| **API Docs** | http://localhost:8000/docs | Running ✓ |
| **PostgreSQL** | localhost:5432 | Running ✓ |
| **Redis** | localhost:6379 | Running ✓ |

## Common Commands

```bash
# Check status of everything
make status

# Start development servers (both)
make dev

# Stop everything
make stop

# View logs
make logs

# Access terminals
make terminal
```

## Docker vs Podman

Your system has both `docker` and `podman`. The Makefiles use `podman compose`, so:

✅ **Use these commands:**
- `podman ps` - See running containers
- `podman compose ps` - See compose services
- `make docker-up` - Start services
- `make docker-down` - Stop services

❌ **Don't use:**
- `podman container ls` (won't show podman containers)
- `podman-compose` (not what the Makefile uses)

## Troubleshooting

### "No containers running"
You're probably using `podman` commands. Use `podman ps` instead.

### "Frontend not accessible"
The frontend hasn't been started yet. Run `make dev` or `make frontend`.

### "Port already in use"
Something is already running on that port:
```bash
# Check what's on port 3000
lsof -i :3000

# Check what's on port 8000
lsof -i :8000

# Stop all services
make stop
```
