# 🚀 Quick Reference Card

## To Run EVERYTHING in Containers (Recommended)

### First Time Setup
```bash
make docker-build         # Build all images (2-5 min)
```

### Start Application
```bash
make docker-up-all        # Start all 6 containers
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Stop
```bash
make docker-down          # Stop all containers
```

---

## All 6 Containers

When you run `make docker-up-all`, these start:

1. **PostgreSQL** - Database (port 5432)
2. **Redis** - Cache/Queue (port 6379)
3. **Backend** - FastAPI (port 8000)
4. **Frontend** - Next.js (port 3000)
5. **Celery Worker** - Background tasks
6. **Celery Beat** - Task scheduler

---

## Essential Commands

| What You Want | Command |
|--------------|---------|
| Build containers (first time) | `make docker-build` |
| Start everything | `make docker-up-all` |
| Start with logs | `make docker-dev` |
| Stop everything | `make docker-down` |
| Check status | `make docker-ps` |
| View logs | `make docker-logs` |
| Restart | `make docker-restart` |
| Rebuild after changes | `make docker-rebuild` |

---

## Using Podman (Not Podman)

Your system has both `docker` and `podman`. Use **docker**:

✅ `podman ps`
✅ `make docker-*`
❌ `podman container ls`

---

## Files Created

- `backend/Dockerfile` - Backend container
- `frontend/Dockerfile` - Frontend container
- `docker-compose.yml` - All 6 services
- `DOCKER_GUIDE.md` - Complete guide
- `CONTAINER_SETUP.md` - Setup details

---

## Troubleshooting

**"Port in use"**
```bash
make stop           # Stop local services
lsof -i :3000       # Check port 3000
lsof -i :8000       # Check port 8000
```

**"Container won't start"**
```bash
podman compose logs backend
podman compose logs frontend
make docker-rebuild
```

**"Frontend can't connect"**
```bash
curl http://localhost:8000/docs    # Test backend
podman compose restart backend     # Restart backend
```

---

## Documentation

- `README.md` - Project overview
- `DOCKER_GUIDE.md` - Complete Podman guide
- `CONTAINER_SETUP.md` - What changed
- `MAKEFILE_GUIDE.md` - All Makefile commands
- `QUICK_START.md` - Local development guide

---

## The Simple Way

```bash
# Three commands to run everything:

make docker-build      # 1. Build (first time only)
make docker-up-all     # 2. Start all services
                       # 3. Visit http://localhost:3000

# When done:
make docker-down       # Stop everything
```

That's it! 🎉
