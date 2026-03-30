.PHONY: help build up down logs ps clean dev install

.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

help: ## Show this help
	@printf "$(BLUE)Let's Talk Statistics$(NC)\n"
	@printf "======================\n\n"
	@printf "$(YELLOW)Commands:$(NC)\n"
	@printf "  $(GREEN)make install$(NC)   Install dependencies\n"
	@printf "  $(GREEN)make dev$(NC)       Start dev server\n"
	@printf "  $(GREEN)make build$(NC)     Build container image\n"
	@printf "  $(GREEN)make up$(NC)        Start container (detached)\n"
	@printf "  $(GREEN)make down$(NC)      Stop container\n"
	@printf "  $(GREEN)make logs$(NC)      View container logs\n"
	@printf "  $(GREEN)make ps$(NC)        Show container status\n"
	@printf "  $(GREEN)make clean$(NC)     Stop container and remove image\n"
	@printf "\n"
	@printf "$(YELLOW)Quick Start:$(NC)\n"
	@printf "  1. make install\n"
	@printf "  2. make dev\n"
	@printf "  3. Visit http://localhost:3003\n"

install: ## Install dependencies
	npm ci

dev: ## Start development server
	npm run dev

build: ## Build container image
	@printf "$(BLUE)Building container image...$(NC)\n"
	podman build --network=host -t lts-app .
	@printf "$(GREEN)Done$(NC)\n"

up: ## Start container (detached)
	@printf "$(BLUE)Starting container...$(NC)\n"
	podman run -d --name lts_app \
		--network=host \
		-e PORT=3003 \
		-e NODE_ENV=production \
		-e FRED_API_KEY=$${FRED_API_KEY:-} \
		-e TRADES_API_URL=$${TRADES_API_URL:-https://trades.telep.io} \
		-p 3003:3003 \
		lts-app
	@printf "$(GREEN)Running at http://localhost:3003$(NC)\n"

down: ## Stop container
	@printf "$(BLUE)Stopping container...$(NC)\n"
	podman stop lts_app && podman rm lts_app
	@printf "$(GREEN)Done$(NC)\n"

logs: ## View container logs
	podman logs -f lts_app

ps: ## Show container status
	podman ps --filter name=lts_app

clean: ## Stop container and remove image
	@printf "$(BLUE)Cleaning up...$(NC)\n"
	-podman stop lts_app 2>/dev/null
	-podman rm lts_app 2>/dev/null
	-podman rmi lts-app 2>/dev/null
	@printf "$(GREEN)Done$(NC)\n"
