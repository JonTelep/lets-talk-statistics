.PHONY: help install build run dev stop clean clean-all logs terminal status docker-up docker-down all

# Default target
.DEFAULT_GOAL := help

# Podman compose command (daemonless)
PODMAN_COMPOSE := podman-compose

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@printf "$(BLUE)Let's Talk Statistics - Root Makefile$(NC)\n"
	@printf "======================================\n"
	@printf "\n"
	@printf "$(YELLOW)🐳 CONTAINERIZED (Recommended):$(NC)\n"
	@printf "  $(GREEN)make docker-build$(NC)       - Build all Podman images\n"
	@printf "  $(GREEN)make docker-up-all$(NC)      - Start ALL services in containers\n"
	@printf "  $(GREEN)make docker-dev$(NC)         - Start in dev mode (with logs)\n"
	@printf "  $(GREEN)make docker-down$(NC)        - Stop all containers\n"
	@printf "  $(GREEN)make docker-logs$(NC)        - View container logs\n"
	@printf "  $(GREEN)make docker-ps$(NC)          - Show container status\n"
	@printf "\n"
	@printf "$(YELLOW)💻 LOCAL DEVELOPMENT:$(NC)\n"
	@printf "  $(GREEN)make all$(NC)                - Install deps locally (not containers)\n"
	@printf "  $(GREEN)make dev$(NC)                - Run backend+frontend locally\n"
	@printf "  $(GREEN)make backend$(NC)            - Run backend only locally\n"
	@printf "  $(GREEN)make frontend$(NC)           - Run frontend only locally\n"
	@printf "\n"
	@printf "$(YELLOW)Quick Start (Containers):$(NC)\n"
	@printf "  1. make docker-build      # Build images (first time)\n"
	@printf "  2. make docker-up-all     # Start all services\n"
	@printf "  3. Visit http://localhost:3000\n"
	@printf "\n"
	@printf "$(YELLOW)All Commands:$(NC)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies for both frontend and backend
	@printf "$(BLUE)Installing all dependencies...$(NC)\n"
	@printf "$(YELLOW)Installing backend dependencies...$(NC)\n"
	$(MAKE) -C backend install
	@printf "$(YELLOW)Installing frontend dependencies...$(NC)\n"
	$(MAKE) -C frontend install
	@printf "$(GREEN)✓ All dependencies installed$(NC)\n"

build: ## Build both frontend and backend
	@printf "$(BLUE)Building all components...$(NC)\n"
	@printf "$(YELLOW)Building backend...$(NC)\n"
	$(MAKE) -C backend build
	@printf "$(YELLOW)Building frontend...$(NC)\n"
	$(MAKE) -C frontend build
	@printf "$(GREEN)✓ Build complete$(NC)\n"

dev: ## Start both backend and frontend in development mode (parallel)
	@printf "$(BLUE)Starting full development environment...$(NC)\n"
	@printf "$(YELLOW)Starting services in parallel...$(NC)\n"
	@printf "$(YELLOW)Backend: http://localhost:8000$(NC)\n"
	@printf "$(YELLOW)Frontend: http://localhost:3000$(NC)\n"
	@printf "$(YELLOW)API Docs: http://localhost:8000/docs$(NC)\n"
	@printf "\n"
	@printf "$(RED)Press Ctrl+C to stop all services$(NC)\n"
	@trap 'kill 0' INT; \
	$(MAKE) -C backend dev & \
	$(MAKE) -C frontend dev & \
	wait

run: ## Start both backend and frontend in production mode (parallel)
	@printf "$(BLUE)Starting full production environment...$(NC)\n"
	@printf "$(YELLOW)Backend: http://localhost:8000$(NC)\n"
	@printf "$(YELLOW)Frontend: http://localhost:3000$(NC)\n"
	@printf "\n"
	@printf "$(RED)Press Ctrl+C to stop all services$(NC)\n"
	@trap 'kill 0' INT; \
	$(MAKE) -C backend run & \
	$(MAKE) -C frontend start & \
	wait

stop: ## Stop all running services
	@printf "$(BLUE)Stopping all services...$(NC)\n"
	@pkill -f "uvicorn app.main:app" || true
	@pkill -f "next dev" || true
	@pkill -f "next start" || true
	@pkill -f "celery.*worker" || true
	@pkill -f "celery.*beat" || true
	@printf "$(GREEN)✓ All services stopped$(NC)\n"

clean: ## Clean build artifacts from both frontend and backend
	@printf "$(BLUE)Cleaning all build artifacts...$(NC)\n"
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean
	@printf "$(GREEN)✓ Clean complete$(NC)\n"

clean-all: ## Clean everything including dependencies
	@printf "$(BLUE)Cleaning everything...$(NC)\n"
	$(MAKE) -C backend clean-all
	$(MAKE) -C frontend clean-all
	@printf "$(GREEN)✓ Everything cleaned$(NC)\n"

docker-up: ## Start Podman services (PostgreSQL and Redis)
	@printf "$(BLUE)Starting Podman services...$(NC)\n"
	$(PODMAN_COMPOSE) up -d
	@printf "$(GREEN)✓ Podman services started$(NC)\n"
	@printf "$(YELLOW)PostgreSQL: localhost:5432$(NC)\n"
	@printf "$(YELLOW)Redis: localhost:6379$(NC)\n"

docker-down: ## Stop Podman services
	@printf "$(BLUE)Stopping Podman services...$(NC)\n"
	$(PODMAN_COMPOSE) down
	@printf "$(GREEN)✓ Podman services stopped$(NC)\n"

docker-logs: ## Show Podman services logs
	@printf "$(BLUE)Showing Podman logs...$(NC)\n"
	$(PODMAN_COMPOSE) logs -f

docker-ps: ## Show Podman services status
	@printf "$(BLUE)Podman Services Status:$(NC)\n"
	@$(PODMAN_COMPOSE) ps

docker-clean: ## Remove Podman volumes and clean data
	@printf "$(BLUE)Cleaning Podman volumes...$(NC)\n"
	@printf "$(RED)WARNING: This will delete all database data!$(NC)\n"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(PODMAN_COMPOSE) down -v; \
		echo "$(GREEN)✓ Podman volumes cleaned$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

docker-build: ## Build all Podman images (backend, frontend, celery)
	@printf "$(BLUE)Building all Podman images...$(NC)\n"
	$(PODMAN_COMPOSE) build
	@printf "$(GREEN)✓ All images built$(NC)\n"

docker-up-all: ## Start ALL services in containers (recommended)
	@printf "$(BLUE)Starting all services in containers...$(NC)\n"
	@printf "$(YELLOW)This includes: PostgreSQL, Redis, Backend, Frontend, Celery Worker, Celery Beat$(NC)\n"
	$(PODMAN_COMPOSE) up -d
	@printf "$(GREEN)✓ All services started$(NC)\n"
	@printf "\n"
	@printf "$(YELLOW)Service URLs:$(NC)\n"
	@printf "  Frontend:  http://localhost:3000\n"
	@printf "  Backend:   http://localhost:8000\n"
	@printf "  API Docs:  http://localhost:8000/docs\n"
	@printf "\n"
	@printf "$(YELLOW)Check status: make docker-ps$(NC)\n"
	@printf "$(YELLOW)View logs:    make docker-logs$(NC)\n"

docker-dev: ## Start all services with live reload (uses $(PODMAN_COMPOSE))
	@printf "$(BLUE)Starting all services in development mode...$(NC)\n"
	$(PODMAN_COMPOSE) up

docker-rebuild: ## Rebuild and restart all containers
	@printf "$(BLUE)Rebuilding all containers...$(NC)\n"
	$(PODMAN_COMPOSE) up -d --build
	@printf "$(GREEN)✓ Containers rebuilt and restarted$(NC)\n"

docker-stop: ## Stop all containers (alias for docker-down)
	@$(MAKE) docker-down

docker-restart: ## Restart all containers
	@printf "$(BLUE)Restarting all containers...$(NC)\n"
	$(PODMAN_COMPOSE) restart
	@printf "$(GREEN)✓ All containers restarted$(NC)\n"

logs: ## Show logs from all services (requires them to be running)
	@printf "$(BLUE)Showing all service logs...$(NC)\n"
	@printf "$(YELLOW)Use Ctrl+C to exit$(NC)\n"
	@printf "\n"
	@trap 'kill 0' INT; \
	$(MAKE) -C backend logs & \
	$(MAKE) -C frontend logs & \
	$(MAKE) docker-logs & \
	wait

terminal: ## Open terminal menu to choose which component
	@printf "$(BLUE)Choose component:$(NC)\n"
	@printf "1) Backend\n"
	@printf "2) Frontend\n"
	@printf "3) Root\n"
	@read -p "Enter choice [1-3]: " choice; \
	case $$choice in \
		1) $(MAKE) backend-terminal ;; \
		2) $(MAKE) frontend-terminal ;; \
		3) bash ;; \
		*) echo "$(RED)Invalid choice$(NC)" ;; \
	esac

status: ## Show status of all components
	@printf "$(BLUE)=== Let's Talk Statistics Status ===$(NC)\n"
	@printf "\n"
	@printf "$(YELLOW)Podman Services:$(NC)\n"
	@$(PODMAN_COMPOSE) ps 2>/dev/null || echo "  Podman Compose not running"
	@printf "\n"
	@printf "$(YELLOW)Backend:$(NC)\n"
	@$(MAKE) -C backend status 2>/dev/null | sed 's/^/  /'
	@printf "\n"
	@printf "$(YELLOW)Frontend:$(NC)\n"
	@$(MAKE) -C frontend status 2>/dev/null | sed 's/^/  /'
	@printf "\n"
	@printf "$(YELLOW)Running Processes:$(NC)\n"
	@pgrep -f "uvicorn app.main:app" > /dev/null && echo "  ✓ Backend server running" || echo "  ✗ Backend server not running"
	@pgrep -f "next dev\|next start" > /dev/null && echo "  ✓ Frontend server running" || echo "  ✗ Frontend server not running"
	@pgrep -f "celery.*worker" > /dev/null && echo "  ✓ Celery worker running" || echo "  ✗ Celery worker not running"

all: docker-up install build ## Complete setup (Podman + install + build)
	@printf "$(GREEN)✓ Complete setup finished$(NC)\n"
	@printf "\n"
	@printf "$(YELLOW)Next steps:$(NC)\n"
	@printf "  1. Run 'make dev' to start development servers\n"
	@printf "  2. Visit http://localhost:3000 for the frontend\n"
	@printf "  3. Visit http://localhost:8000/docs for API documentation\n"

# Backend-specific commands
backend-%: ## Run backend-specific command (e.g., make backend-dev)
	$(MAKE) -C backend $*

# Frontend-specific commands
frontend-%: ## Run frontend-specific command (e.g., make frontend-dev)
	$(MAKE) -C frontend $*

# Quick commands
backend: ## Start backend only in dev mode
	$(MAKE) -C backend dev

frontend: ## Start frontend only in dev mode
	$(MAKE) -C frontend dev

test: ## Run all tests
	@printf "$(BLUE)Running all tests...$(NC)\n"
	@printf "$(YELLOW)Running backend tests...$(NC)\n"
	$(MAKE) -C backend test
	@printf "\n"
	@printf "$(YELLOW)Running frontend tests...$(NC)\n"
	$(MAKE) -C frontend test || true
	@printf "$(GREEN)✓ All tests complete$(NC)\n"

celery-worker: ## Start Celery worker
	$(MAKE) -C backend celery-worker

celery-beat: ## Start Celery beat scheduler
	$(MAKE) -C backend celery-beat

celery-monitor: ## Start Flower monitoring dashboard
	$(MAKE) -C backend celery-monitor

quick-start: docker-up ## Quick start for development (assumes deps installed)
	@printf "$(BLUE)Quick starting development environment...$(NC)\n"
	@sleep 2
	@$(MAKE) dev
