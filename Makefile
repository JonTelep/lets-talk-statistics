# Let's Talk Statistics - Makefile
# Single container Next.js app with Bun

IMAGE_NAME = lets-talk-statistics
CONTAINER_NAME = lts-app
PORT = 3000

.PHONY: build dev up down logs clean help

help: ## Show this help message
	@echo 'Usage: make <target>'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the container image
	@echo "Building $(IMAGE_NAME)..."
	podman build --network=host -t $(IMAGE_NAME) .

dev: ## Start container with logs (for development)
	@echo "Starting $(CONTAINER_NAME) with logs..."
	$(MAKE) up
	podman logs -f $(CONTAINER_NAME)

up: ## Start container (detached)
	@echo "Starting $(CONTAINER_NAME)..."
	podman run -d --name $(CONTAINER_NAME) \
		-p $(PORT):3000 \
		--restart unless-stopped \
		$(IMAGE_NAME) || podman start $(CONTAINER_NAME)
	@echo "App running at http://localhost:$(PORT)"

down: ## Stop and remove container
	@echo "Stopping $(CONTAINER_NAME)..."
	podman stop $(CONTAINER_NAME) 2>/dev/null || true
	podman rm $(CONTAINER_NAME) 2>/dev/null || true

logs: ## Show container logs
	podman logs -f $(CONTAINER_NAME)

clean: ## Stop container and remove image
	$(MAKE) down
	@echo "Removing $(IMAGE_NAME) image..."
	podman rmi $(IMAGE_NAME) 2>/dev/null || true

ps: ## Show container status
	podman ps -a --filter name=$(CONTAINER_NAME)