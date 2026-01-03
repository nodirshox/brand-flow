.PHONY: help landing-build landing-start landing-stop landing-restart landing-logs

# Default target - show help
help:
	@echo "BrandFlow - Makefile Commands"
	@echo "=============================="
	@echo ""
	@echo "Landing Page Commands:"
	@echo "  make landing-build     - Build the landing page Docker image"
	@echo "  make landing-start     - Start the landing page container"
	@echo "  make landing-stop      - Stop the landing page container"
	@echo "  make landing-restart   - Restart the landing page container"
	@echo "  make landing-logs      - View landing page container logs"
	@echo ""

# Build the landing page Docker image
landing-build:
	@echo "Building landing page Docker image..."
	docker build -t brandflow-landing ./apps/landing

# Start the landing page container
landing-start:
	@echo "Starting landing page container..."
	docker run -d --name brandflow-landing -p 8080:80 brandflow-landing
	@echo "Landing page is running at http://localhost:8080"

# Stop the landing page container
landing-stop:
	@echo "Stopping landing page container..."
	docker stop brandflow-landing || true
	docker rm brandflow-landing || true

# Restart the landing page container
landing-restart: landing-stop landing-build landing-start

# View landing page logs
landing-logs:
	docker logs -f brandflow-landing
