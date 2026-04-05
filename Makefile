.PHONY: help build clean dev test lint

NPM := npm

help: ## Show available targets
	@printf "Available targets:\n"
	@grep -E '^[a-zA-Z_-]+:.*## ' Makefile | sort | awk 'BEGIN {FS = ":.*## "} {printf "  %-10s %s\n", $$1, $$2}'

build: ## Build the application
	$(NPM) run build

clean: ## Remove build and temporary files
	rm -rf build .svelte-kit

dev: ## Run the local development server
	$(NPM) run dev

test: ## Run all tests
	@if $(NPM) run | grep -q '^  test$$'; then \
		$(NPM) run test; \
	else \
		printf "No test script is configured in package.json\n"; \
	fi

lint: ## Run lint checks
	@if $(NPM) run | grep -q '^  lint$$'; then \
		$(NPM) run lint; \
	else \
		$(NPM) run check; \
	fi
