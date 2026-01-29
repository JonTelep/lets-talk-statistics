.PHONY: help build up down logs ps clean dev

.DEFAULT_GOAL := help

PODMAN_COMPOSE := podman-compose

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0m
NC := \033[0m

help: ## Show this help
	@printf "$(BLUE)Let's Talk Statistics$(NC)\n"
	@printf "======================\n\n"
	@printf "$(YELLOW)Container Commands:$(NC)\n"
	@printf "  $(GREEN)make build$(NC)      Build container images\n"
	@printf "  $(GREEN)make up$(NC)         Start containers (detached)\n"
	@printf "  $(GREEN)make dev$(NC)        Start containers with logs\n"
	@printf "  $(GREEN)make down$(NC)       Stop containers\n"
	@printf "  $(GREEN)make logs$(NC)       View container logs\n"
	@printf "  $(GREEN)make ps$(NC)         Show container status\n"
	@printf "  $(GREEN)make clean$(NC)      Stop containers and remove images\n"
	@printf "\n"
	@printf "$(YELLOW)Quick Start:$(NC)\n"
	@printf "  1. make build\n"
	@printf "  2. make up\n"
	@printf "  3. Visit http://localhost:3000\n"

build: ## Build container images
	@printf "$(BLUE)Building images...$(NC)\n"
	$(PODMAN_COMPOSE) build
	@printf "$(GREEN)Done$(NC)\n"

up: ## Start containers (detached)
	@printf "$(BLUE)Starting containers...$(NC)\n"
	$(PODMAN_COMPOSE) up -d
	@printf "$(GREEN)Done$(NC)\n"
	@printf "\n  Frontend:  http://localhost:3000\n"
	@printf "  Backend:   http://localhost:8000\n"
	@printf "  API Docs:  http://localhost:8000/docs\n"

dev: ## Start containers with logs (foreground)
	@printf "$(BLUE)Starting containers...$(NC)\n"
	$(PODMAN_COMPOSE) up

down: ## Stop containers
	@printf "$(BLUE)Stopping containers...$(NC)\n"
	$(PODMAN_COMPOSE) down
	@printf "$(GREEN)Done$(NC)\n"

logs: ## View container logs
	$(PODMAN_COMPOSE) logs -f

ps: ## Show container status
	$(PODMAN_COMPOSE) ps

clean: ## Stop containers and remove images
	@printf "$(BLUE)Stopping containers...$(NC)\n"
	$(PODMAN_COMPOSE) down --rmi all -v
	@printf "$(GREEN)Done$(NC)\n"
