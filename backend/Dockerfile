FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create data directory for caching
RUN mkdir -p /app/data/cache

# Make cache warming script executable
RUN chmod +x /app/scripts/warm_cache.py

# Run the application
# Warm cache on startup, then start server
EXPOSE 6003
CMD ["sh", "-c", "python scripts/warm_cache.py; uvicorn app.main:app --host 0.0.0.0 --port 6003"]
