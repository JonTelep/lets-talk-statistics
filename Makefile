.PHONY: help build up down logs ps clean dev \
        build-backend build-frontend \
        dev-backend dev-frontend \
        run-backend run-frontend \
        logs-backend logs-frontend

.DEFAULT_GOAL := help

PODMAN_COMPOSE := podman-compose

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help
	@printf "$(BLUE)Let's Talk Statistics$(NC)\n"
	@printf "======================\n\n"
	@printf "$(YELLOW)Full Stack Commands:$(NC)\n"
	@printf "  $(GREEN)make build$(NC)          Build all container images\n"
	@printf "  $(GREEN)make up$(NC)             Start all containers (detached)\n"
	@printf "  $(GREEN)make dev$(NC)            Start all containers with logs\n"
	@printf "  $(GREEN)make down$(NC)           Stop all containers\n"
	@printf "  $(GREEN)make logs$(NC)           View all container logs\n"
	@printf "  $(GREEN)make ps$(NC)             Show container status\n"
	@printf "  $(GREEN)make clean$(NC)          Stop containers and remove images\n"
	@printf "\n"
	@printf "$(YELLOW)Backend Only:$(NC)\n"
	@printf "  $(GREEN)make build-backend$(NC)  Build backend image\n"
	@printf "  $(GREEN)make run-backend$(NC)    Run backend container (detached)\n"
	@printf "  $(GREEN)make dev-backend$(NC)    Run backend with logs\n"
	@printf "  $(GREEN)make logs-backend$(NC)   View backend logs\n"
	@printf "\n"
	@printf "$(YELLOW)Frontend Only:$(NC)\n"
	@printf "  $(GREEN)make build-frontend$(NC) Build frontend image\n"
	@printf "  $(GREEN)make run-frontend$(NC)   Run frontend container (detached)\n"
	@printf "  $(GREEN)make dev-frontend$(NC)   Run frontend with logs\n"
	@printf "  $(GREEN)make logs-frontend$(NC)  View frontend logs\n"
	@printf "\n"
	@printf "$(YELLOW)Quick Start:$(NC)\n"
	@printf "  1. make build\n"
	@printf "  2. make up\n"
	@printf "  3. Visit http://localhost:3000\n"

# =============================================================================
# Full Stack Commands
# =============================================================================

build: ## Build all container images
	@printf "$(BLUE)Building all images...$(NC)\n"
	$(PODMAN_COMPOSE) build
	@printf "$(GREEN)Done$(NC)\n"

up: ## Start all containers (detached)
	@printf "$(BLUE)Starting containers...$(NC)\n"
	$(PODMAN_COMPOSE) up -d
	@printf "$(GREEN)Done$(NC)\n"
	@printf "\n  Frontend:  http://localhost:3000\n"
	@printf "  Backend:   http://localhost:8000\n"
	@printf "  API Docs:  http://localhost:8000/docs\n"

dev: ## Start all containers with logs (foreground)
	@printf "$(BLUE)Starting containers...$(NC)\n"
	$(PODMAN_COMPOSE) up

down: ## Stop all containers
	@printf "$(BLUE)Stopping containers...$(NC)\n"
	$(PODMAN_COMPOSE) down
	@printf "$(GREEN)Done$(NC)\n"

logs: ## View all container logs
	$(PODMAN_COMPOSE) logs -f

ps: ## Show container status
	$(PODMAN_COMPOSE) ps

clean: ## Stop containers and remove images
	@printf "$(BLUE)Stopping containers...$(NC)\n"
	$(PODMAN_COMPOSE) down --rmi all -v
	@printf "$(GREEN)Done$(NC)\n"

# =============================================================================
# Backend Only Commands
# =============================================================================

build-backend: ## Build backend image only
	@printf "$(BLUE)Building backend image...$(NC)\n"
	podman build --network=host -t lts-backend ./backend
	@printf "$(GREEN)Done$(NC)\n"

run-backend: ## Run backend container (detached)
	@printf "$(BLUE)Starting backend...$(NC)\n"
	podman run -d --name lts_backend \
		--network=host \
		--env-file ./backend/.env \
		-v ./backend:/app:Z \
		-v ./data:/app/data:Z \
		-p 8000:8000 \
		lts-backend
	@printf "$(GREEN)Backend running at http://localhost:8000$(NC)\n"
	@printf "  API Docs: http://localhost:8000/docs\n"

dev-backend: ## Run backend with logs (foreground)
	@printf "$(BLUE)Starting backend...$(NC)\n"
	podman run --rm --name lts_backend \
		--network=host \
		--env-file ./backend/.env \
		-v ./backend:/app:Z \
		-v ./data:/app/data:Z \
		-p 8000:8000 \
		lts-backend

logs-backend: ## View backend logs
	podman logs -f lts_backend

stop-backend: ## Stop backend container
	podman stop lts_backend && podman rm lts_backend

# =============================================================================
# Frontend Only Commands
# =============================================================================

build-frontend: ## Build frontend image only
	@printf "$(BLUE)Building frontend image...$(NC)\n"
	podman build --network=host \
		--build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
		--build-arg NEXT_PUBLIC_SITE_NAME="Let's Talk Statistics" \
		-t lts-frontend ./frontend
	@printf "$(GREEN)Done$(NC)\n"

run-frontend: ## Run frontend container (detached)
	@printf "$(BLUE)Starting frontend...$(NC)\n"
	podman run -d --name lts_frontend \
		--network=host \
		-p 3000:3000 \
		lts-frontend
	@printf "$(GREEN)Frontend running at http://localhost:3000$(NC)\n"

dev-frontend: ## Run frontend with logs (foreground)
	@printf "$(BLUE)Starting frontend...$(NC)\n"
	podman run --rm --name lts_frontend \
		--network=host \
		-p 3000:3000 \
		lts-frontend

logs-frontend: ## View frontend logs
	podman logs -f lts_frontend

stop-frontend: ## Stop frontend container
	podman stop lts_frontend && podman rm lts_frontend
