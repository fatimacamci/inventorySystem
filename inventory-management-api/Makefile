VENV=.venv

.PHONY: venv install run-local start docker-up docker-down clean

venv:
	@chmod +x ./scripts/setup_dev.sh ./scripts/run_local.sh || true
	@./scripts/setup_dev.sh

run-local: venv
	@chmod +x ./scripts/run_local.sh || true
	@./scripts/run_local.sh

start: run-local

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	-rm -rf $(VENV)
	-docker-compose down -v