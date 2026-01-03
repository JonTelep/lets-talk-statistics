.PHONY: help install build dev start clean clean-all logs terminal test lint format

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@printf "$(BLUE)Frontend Makefile Commands$(NC)\n"
	@printf "==============================\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@printf "$(BLUE)Installing frontend dependencies...$(NC)\n"
	npm install
	@printf "$(GREEN)✓ Dependencies installed$(NC)\n"

build: ## Build for production
	@printf "$(BLUE)Building frontend for production...$(NC)\n"
	npm run build
	@printf "$(GREEN)✓ Build complete$(NC)\n"

dev: ## Start development server
	@printf "$(BLUE)Starting frontend development server...$(NC)\n"
	@printf "$(YELLOW)Frontend will be available at http://localhost:3000$(NC)\n"
	npm run dev

start: ## Start production server
	@printf "$(BLUE)Starting frontend production server...$(NC)\n"
	@printf "$(YELLOW)Frontend will be available at http://localhost:3000$(NC)\n"
	npm start

clean: ## Clean build artifacts and cache
	@printf "$(BLUE)Cleaning frontend build artifacts...$(NC)\n"
	rm -rf .next
	rm -rf out
	rm -rf .cache
	@printf "$(GREEN)✓ Build artifacts cleaned$(NC)\n"

clean-all: clean ## Clean everything including node_modules
	@printf "$(BLUE)Cleaning all frontend files including node_modules...$(NC)\n"
	rm -rf node_modules
	rm -rf package-lock.json
	@printf "$(GREEN)✓ All files cleaned$(NC)\n"

logs: ## Show development server logs (follow mode)
	@printf "$(BLUE)Showing frontend logs...$(NC)\n"
	@printf "$(YELLOW)Note: Run 'make dev' in another terminal first$(NC)\n"
	@if [ -f .next/server/app-paths-manifest.json ]; then \
		tail -f .next/trace 2>/dev/null || echo "$(RED)No logs available. Start dev server with 'make dev'$(NC)"; \
	else \
		echo "$(RED)Frontend not running. Start with 'make dev'$(NC)"; \
	fi

terminal: ## Open terminal in frontend context
	@printf "$(BLUE)Opening terminal in frontend directory...$(NC)\n"
	@printf "$(YELLOW)Frontend directory: $(PWD)$(NC)\n"
	@printf "$(YELLOW)Node version: $$(node --version 2>/dev/null || echo 'Not installed')$(NC)\n"
	@printf "$(YELLOW)npm version: $$(npm --version 2>/dev/null || echo 'Not installed')$(NC)\n"
	@bash

test: ## Run tests
	@printf "$(BLUE)Running frontend tests...$(NC)\n"
	npm test

lint: ## Run ESLint
	@printf "$(BLUE)Running ESLint...$(NC)\n"
	npm run lint

format: ## Format code (if configured)
	@printf "$(BLUE)Formatting code...$(NC)\n"
	@if command -v prettier >/dev/null 2>&1; then \
		npx prettier --write .; \
	else \
		echo "$(YELLOW)Prettier not installed$(NC)"; \
	fi

all: install build ## Install dependencies and build
	@printf "$(GREEN)✓ Frontend setup complete$(NC)\n"

status: ## Show frontend status
	@printf "$(BLUE)Frontend Status$(NC)\n"
	@printf "===============\n"
	@printf "Directory: $(PWD)\n"
	@printf "Node installed: $$(command -v node >/dev/null 2>&1 && echo 'Yes' || echo 'No')\n"
	@printf "npm installed: $$(command -v npm >/dev/null 2>&1 && echo 'Yes' || echo 'No')\n"
	@printf "Dependencies installed: $$([ -d node_modules ] && echo 'Yes' || echo 'No')\n"
	@printf "Build exists: $$([ -d .next ] && echo 'Yes' || echo 'No')\n"
	@printf "\n"
	@if [ -f package.json ]; then \
		echo "Package info:"; \
		node -e "const pkg=require('./package.json'); console.log('Name:', pkg.name); console.log('Version:', pkg.version);"; \
	fi
