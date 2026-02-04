FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create data directory for caching
RUN mkdir -p /app/data/cache

# Run the application
EXPOSE 6003
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "6003"]
