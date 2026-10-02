# AURA Cosmetics — Development Shortcuts
# Usage: make <target>

.PHONY: help up down build seed migrate superuser logs shell

help:
	@echo ""
	@echo "AURA Cosmetics — Available commands:"
	@echo ""
	@echo "  make up          Start all services (Docker)"
	@echo "  make down        Stop all services"
	@echo "  make build       Rebuild all Docker images"
	@echo "  make migrate     Run Django migrations"
	@echo "  make seed        Seed demo data"
	@echo "  make superuser   Create Django superuser"
	@echo "  make logs        Tail backend logs"
	@echo "  make shell       Open Django shell"
	@echo "  make test        Run backend tests"
	@echo ""

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up --build -d

migrate:
	docker compose exec backend python manage.py migrate

seed: migrate
	docker compose exec backend python manage.py seed_data

superuser:
	docker compose exec backend python manage.py createsuperuser

logs:
	docker compose logs -f backend

shell:
	docker compose exec backend python manage.py shell

test:
	docker compose exec backend python manage.py test --verbosity=2

# Local dev (without Docker)
local-backend:
	cd backend && python manage.py runserver

local-frontend:
	cd frontend && npm run dev

local-celery:
	cd backend && celery -A config worker -l info
