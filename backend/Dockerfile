# ── K&P Love — Backend Dockerfile ────────────────────────────────────────────
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Render injects $PORT at runtime — default to 8000 for local use
ENV PORT=8000

# Start the server
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
