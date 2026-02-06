# Makefile Commands Guide

This project includes comprehensive Makefiles for easy management of the frontend, backend, and overall project.

## Quick Reference

### Complete Setup (First Time)
```bash
# From project root
make all                  # Install dependencies, build everything, start Podman
make dev                  # Start both frontend and backend in dev mode
```

### Daily Development Workflow
```bash
make docker-up           # Start PostgreSQL and Redis
make dev                 # Start frontend + backend (parallel)
# OR start individually:
make backend             # Start only backend
make frontend            # Start only frontend
```

## Root Directory Commands

From `/home/telep/Projects/lets-talk-statistics/`

### Setup & Installation
| Command | Description |
|---------|-------------|
| `make all` | Complete setup: Podman + install + build everything |
| `make install` | Install dependencies for both frontend and backend |
| `make build` | Build both frontend and backend for production |

### Running Services
| Command | Description |
|---------|-------------|
| `make dev` | Start both services in development mode (parallel) |
| `make run` | Start both services in production mode (parallel) |
| `make backend` | Start backend only in dev mode |
| `make frontend` | Start frontend only in dev mode |
| `make stop` | Stop all running services |
| `make quick-start` | Quick start for development (assumes deps installed) |

### Podman Management
| Command | Description |
|---------|-------------|
| `make docker-up` | Start PostgreSQL and Redis containers |
| `make docker-down` | Stop Podman containers |
| `make docker-logs` | Show Podman container logs (follow mode) |
| `make docker-ps` | Show Podman container status |
| `make docker-clean` | Remove Podman volumes (⚠️ deletes data!) |

### Monitoring & Debugging
| Command | Description |
|---------|-------------|
| `make status` | Show status of all components |
| `make logs` | Show logs from all services |
| `make terminal` | Interactive menu to choose component terminal |
| `make test` | Run all tests (frontend + backend) |

### Cleanup
| Command | Description |
|---------|-------------|
| `make clean` | Clean build artifacts |
| `make clean-all` | Clean everything including dependencies |

### Background Tasks (Celery)
| Command | Description |
|---------|-------------|
| `make celery-worker` | Start Celery worker for background tasks |
| `make celery-beat` | Start Celery beat scheduler |
| `make celery-monitor` | Start Flower dashboard at http://localhost:5555 |

### Component-Specific Commands
| Command | Description |
|---------|-------------|
| `make backend-*` | Run any backend command (e.g., `make backend-migrate`) |
| `make frontend-*` | Run any frontend command (e.g., `make frontend-build`) |

## Frontend Directory Commands

From `/home/telep/Projects/lets-talk-statistics/frontend/`

### Setup & Build
| Command | Description |
|---------|-------------|
| `make install` | Install npm dependencies |
| `make build` | Build for production |
| `make all` | Install dependencies and build |

### Development
| Command | Description |
|---------|-------------|
| `make dev` | Start development server at http://localhost:3000 |
| `make start` | Start production server at http://localhost:3000 |

### Tools & Utilities
| Command | Description |
|---------|-------------|
| `make terminal` | Open terminal in frontend context |
| `make logs` | Show development server logs |
| `make test` | Run tests |
| `make lint` | Run ESLint |
| `make format` | Format code with Prettier |
| `make status` | Show frontend status |

### Cleanup
| Command | Description |
|---------|-------------|
| `make clean` | Clean build artifacts (.next, out, cache) |
| `make clean-all` | Clean everything including node_modules |

## Backend Directory Commands

From `/home/telep/Projects/lets-talk-statistics/backend/`

### Setup & Build
| Command | Description |
|---------|-------------|
| `make install` | Create venv and install Python dependencies |
| `make build` | Install dependencies + run migrations |
| `make all` | Complete backend setup |

### Development
| Command | Description |
|---------|-------------|
| `make dev` | Start development server at http://localhost:8000 |
| `make run` | Start production server at http://localhost:8000 |

### Database
| Command | Description |
|---------|-------------|
| `make migrate` | Run database migrations |
| `make migrate-create MSG="description"` | Create new migration |
| `make db-shell` | Open PostgreSQL shell |

### Tools & Utilities
| Command | Description |
|---------|-------------|
| `make terminal` | Open terminal with venv activated |
| `make shell` | Open Python shell with app context |
| `make logs` | Show backend logs |
| `make test` | Run tests |
| `make test-cov` | Run tests with coverage report |
| `make lint` | Run linting |
| `make format` | Format code with black |
| `make status` | Show backend status |

### Celery
| Command | Description |
|---------|-------------|
| `make celery-worker` | Start Celery worker |
| `make celery-beat` | Start Celery beat scheduler |
| `make celery-monitor` | Start Flower at http://localhost:5555 |

### Cleanup
| Command | Description |
|---------|-------------|
| `make clean` | Clean Python cache files (__pycache__, *.pyc) |
| `make clean-all` | Clean everything including venv |

## Common Usage Examples

### First Time Setup
```bash
# Start from project root
cd /home/telep/Projects/lets-talk-statistics

# Complete setup
make all

# This will:
# 1. Start Podman (PostgreSQL + Redis)
# 2. Install backend dependencies (create venv)
# 3. Install frontend dependencies (npm install)
# 4. Run database migrations
# 5. Build frontend for production
```

### Daily Development
```bash
# Start Podman services
make docker-up

# Start development servers (both in parallel)
make dev

# Visit:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Working on Backend Only
```bash
cd backend

# Activate venv and open terminal
make terminal

# Run migrations
make migrate

# Start dev server
make dev

# In another terminal - start Celery worker
make celery-worker
```

### Working on Frontend Only
```bash
cd frontend

# Install new package
npm install <package-name>

# Start dev server
make dev

# Build for production
make build
```

### Running Tests
```bash
# From root - test everything
make test

# Backend only
cd backend
make test-cov          # With coverage report

# Frontend only
cd frontend
make test
```

### Accessing Terminals
```bash
# From root
make terminal          # Interactive menu

# Or directly
make backend-terminal  # Backend terminal with venv
make frontend-terminal # Frontend terminal
```

### Database Operations
```bash
cd backend

# Open PostgreSQL shell
make db-shell

# Create new migration
make migrate-create MSG="add user table"

# Run migrations
make migrate
```

### Monitoring Background Tasks
```bash
# Start Celery worker
make celery-worker

# In another terminal - start beat scheduler
make celery-beat

# In another terminal - start Flower dashboard
make celery-monitor
# Visit http://localhost:5555
```

### Checking Status
```bash
# From root
make status

# Shows:
# - Podman containers status
# - Backend status (running processes, venv)
# - Frontend status (node/npm versions, build status)
# - All running processes
```

### Cleanup
```bash
# Clean build artifacts only
make clean

# Clean everything (keeps Podman data)
make clean-all

# Clean Podman volumes too (⚠️ deletes database!)
make docker-clean
```

### Stopping Everything
```bash
# Stop all services (backend, frontend, celery)
make stop

# Stop Podman containers
make docker-down
```

## URLs Reference

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc
- **Flower Dashboard**: http://localhost:5555
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Environment Variables

### Backend (.env)
Located at `backend/.env`:
- Database connection
- Redis connection
- API settings

### Frontend (.env.local)
Located at `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_NAME` - Site name

## Tips & Best Practices

1. **Always start Podman first**: `make docker-up` before running backend
2. **Use `make dev` for development**: Auto-reload on file changes
3. **Check status regularly**: `make status` shows what's running
4. **Use component-specific commands**: Faster than going through root
5. **Terminal access**: Use `make terminal` for venv/context
6. **Clean builds**: If things are weird, try `make clean && make build`
7. **Background tasks**: Start celery-worker when using admin endpoints
8. **Logs**: Use `make logs` to debug issues

## Troubleshooting

### "Port already in use"
```bash
make stop              # Stop all services
make docker-ps         # Check Podman containers
```

### "Command not found"
```bash
# Backend
cd backend
make status            # Check if venv exists

# Frontend
cd frontend
make status            # Check if node_modules exists
```

### "Database connection error"
```bash
make docker-up         # Ensure PostgreSQL is running
make docker-ps         # Verify container status
```

### "Module not found"
```bash
# Backend
cd backend
make clean-all
make install

# Frontend
cd frontend
make clean-all
make install
```

## Getting Help

```bash
# Show all commands
make help

# Show backend commands
cd backend && make help

# Show frontend commands
cd frontend && make help
```
