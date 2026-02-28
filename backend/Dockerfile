# ==============================================================
# Legistra Backend — Production Dockerfile
# ==============================================================
# Multi-stage build: install deps in a build stage, copy to slim runtime.
# Keeps the final image clean and small(er).
# ==============================================================

# ---- Stage 1: Build / install dependencies ----
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

# System libs needed to compile native wheels (psycopg2, faiss, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# ---- Stage 2: Runtime ----
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Runtime-only system libs (no gcc / build-essential)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r legistra && useradd -r -g legistra -m legistra

WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /install /usr/local

# Copy application code
COPY . /app/

# Create the uploads directory (writable by non-root user)
RUN mkdir -p /app/uploads && chown -R legistra:legistra /app

# Switch to non-root user
USER legistra

# Expose the Flask port
EXPOSE 5000

# Healthcheck — calls the /api/health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Run with gunicorn (4 workers, 120s timeout for ML-heavy requests)
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "4", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "app:app"]
