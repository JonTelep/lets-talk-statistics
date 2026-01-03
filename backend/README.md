# Crime Statistics Backend API

Backend service for the Let's Talk Statistics platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start services:
```bash
# From project root
docker-compose up -d
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start the server:
```bash
python -m uvicorn app.main:app --reload
```

## Development

### Code Structure

- `app/api/` - API endpoints and routing
- `app/models/` - Database models (SQLAlchemy) and schemas (Pydantic)
- `app/services/` - Business logic and data processing
- `app/tasks/` - Celery tasks for scheduled operations
- `app/utils/` - Utility functions and helpers

### Running Tests

```bash
pytest
```

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback:
```bash
alembic downgrade -1
```

### Environment Variables

See `.env.example` for all available configuration options.

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
