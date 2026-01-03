.PHONY: help install build run dev clean clean-all logs terminal test migrate shell db-shell celery-worker celery-beat celery-monitor

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Python and virtual environment settings
PYTHON := python3
VENV := venv
VENV_BIN := $(VENV)/bin
PIP := $(VENV_BIN)/pip
PYTHON_VENV := $(VENV_BIN)/python

help: ## Show this help message
	@printf "$(BLUE)Backend Makefile Commands$(NC)\n"
	@printf "==========================\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies in virtual environment
	@printf "$(BLUE)Setting up backend virtual environment...$(NC)\n"
	@if [ ! -d "$(VENV)" ]; then \
		$(PYTHON) -m venv $(VENV); \
		echo "$(GREEN)✓ Virtual environment created$(NC)"; \
	fi
	@printf "$(BLUE)Installing dependencies...$(NC)\n"
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@printf "$(GREEN)✓ Dependencies installed$(NC)\n"

build: install ## Setup backend (install dependencies and run migrations)
	@printf "$(BLUE)Running database migrations...$(NC)\n"
	$(VENV_BIN)/alembic upgrade head
	@printf "$(GREEN)✓ Backend setup complete$(NC)\n"

run: ## Run production server
	@printf "$(BLUE)Starting backend production server...$(NC)\n"
	@printf "$(YELLOW)Backend will be available at http://localhost:8000$(NC)\n"
	@printf "$(YELLOW)API docs at http://localhost:8000/docs$(NC)\n"
	$(VENV_BIN)/uvicorn app.main:app --host 0.0.0.0 --port 8000

dev: ## Run development server with auto-reload
	@printf "$(BLUE)Starting backend development server...$(NC)\n"
	@printf "$(YELLOW)Backend will be available at http://localhost:8000$(NC)\n"
	@printf "$(YELLOW)API docs at http://localhost:8000/docs$(NC)\n"
	$(VENV_BIN)/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

clean: ## Clean Python cache files
	@printf "$(BLUE)Cleaning Python cache files...$(NC)\n"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".coverage" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".coverage" -delete 2>/dev/null || true
	rm -rf htmlcov/
	@printf "$(GREEN)✓ Cache files cleaned$(NC)\n"

clean-all: clean ## Clean everything including virtual environment
	@printf "$(BLUE)Cleaning all backend files including virtual environment...$(NC)\n"
	rm -rf $(VENV)
	rm -rf storage/
	@printf "$(GREEN)✓ All files cleaned$(NC)\n"

logs: ## Show backend logs (if running in background)
	@printf "$(BLUE)Showing backend logs...$(NC)\n"
	@printf "$(YELLOW)Note: This shows logs from uvicorn if running$(NC)\n"
	@if pgrep -f "uvicorn app.main:app" > /dev/null; then \
		tail -f logs/backend.log 2>/dev/null || echo "$(YELLOW)Backend running but no log file found. Logs are in stdout.$(NC)"; \
	else \
		echo "$(RED)Backend not running. Start with 'make dev' or 'make run'$(NC)"; \
	fi

terminal: ## Open terminal with virtual environment activated
	@printf "$(BLUE)Opening terminal with virtual environment...$(NC)\n"
	@printf "$(YELLOW)Virtual environment will be activated$(NC)\n"
	@printf "$(YELLOW)Type 'deactivate' to exit the virtual environment$(NC)\n"
	@bash --init-file <(echo ". $(VENV_BIN)/activate; echo '$(GREEN)Virtual environment activated$(NC)'; echo 'Python: $$($(PYTHON_VENV) --version)'; echo 'Location: $(PWD)'")

shell: ## Open Python shell with app context
	@printf "$(BLUE)Opening Python shell...$(NC)\n"
	@$(VENV_BIN)/python -i -c "from app.main import app; from app.database import SessionLocal; db = SessionLocal(); print('$(GREEN)App context loaded. Variables: app, db$(NC)')"

db-shell: ## Open PostgreSQL shell
	@printf "$(BLUE)Opening PostgreSQL shell...$(NC)\n"
	@printf "$(YELLOW)Connecting to database...$(NC)\n"
	@PGPASSWORD=crimestats psql -h localhost -U crimestats -d crimestats_db

test: ## Run tests
	@printf "$(BLUE)Running backend tests...$(NC)\n"
	$(VENV_BIN)/pytest -v

test-cov: ## Run tests with coverage
	@printf "$(BLUE)Running tests with coverage...$(NC)\n"
	$(VENV_BIN)/pytest --cov=app --cov-report=html --cov-report=term-missing
	@printf "$(GREEN)✓ Coverage report generated in htmlcov/$(NC)\n"

migrate: ## Run database migrations
	@printf "$(BLUE)Running database migrations...$(NC)\n"
	$(VENV_BIN)/alembic upgrade head
	@printf "$(GREEN)✓ Migrations complete$(NC)\n"

migrate-create: ## Create a new migration (usage: make migrate-create MSG="description")
	@printf "$(BLUE)Creating new migration...$(NC)\n"
	@if [ -z "$(MSG)" ]; then \
		echo "$(RED)Error: Please provide MSG='description'$(NC)"; \
		exit 1; \
	fi
	$(VENV_BIN)/alembic revision --autogenerate -m "$(MSG)"
	@printf "$(GREEN)✓ Migration created$(NC)\n"

celery-worker: ## Start Celery worker
	@printf "$(BLUE)Starting Celery worker...$(NC)\n"
	$(VENV_BIN)/celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4

celery-beat: ## Start Celery beat scheduler
	@printf "$(BLUE)Starting Celery beat scheduler...$(NC)\n"
	$(VENV_BIN)/celery -A app.tasks.celery_app beat --loglevel=info

celery-monitor: ## Start Flower monitoring dashboard
	@printf "$(BLUE)Starting Flower monitoring dashboard...$(NC)\n"
	@printf "$(YELLOW)Dashboard will be available at http://localhost:5555$(NC)\n"
	$(VENV_BIN)/celery -A app.tasks.celery_app flower --port=5555

lint: ## Run linting (if configured)
	@printf "$(BLUE)Running linters...$(NC)\n"
	@if [ -f "$(VENV_BIN)/flake8" ]; then \
		$(VENV_BIN)/flake8 app/; \
	else \
		echo "$(YELLOW)flake8 not installed$(NC)"; \
	fi

format: ## Format code with black (if installed)
	@printf "$(BLUE)Formatting code...$(NC)\n"
	@if [ -f "$(VENV_BIN)/black" ]; then \
		$(VENV_BIN)/black app/; \
	else \
		echo "$(YELLOW)black not installed$(NC)"; \
	fi

all: install build ## Install and setup backend completely
	@printf "$(GREEN)✓ Backend setup complete$(NC)\n"

status: ## Show backend status
	@printf "$(BLUE)Backend Status$(NC)\n"
	@printf "===============\n"
	@printf "Directory: $(PWD)\n"
	@printf "Python installed: $$(command -v $(PYTHON) >/dev/null 2>&1 && echo 'Yes' || echo 'No')\n"
	@printf "Virtual env exists: $$([ -d $(VENV) ] && echo 'Yes' || echo 'No')\n"
	@if [ -d $(VENV) ]; then \
		echo "Python version: $$($(PYTHON_VENV) --version)"; \
		echo "pip version: $$($(PIP) --version | cut -d' ' -f2)"; \
	fi
	@printf "Backend running: $$(pgrep -f 'uvicorn app.main:app' > /dev/null && echo 'Yes' || echo 'No')\n"
	@printf "Celery worker running: $$(pgrep -f 'celery.*worker' > /dev/null && echo 'Yes' || echo 'No')\n"
