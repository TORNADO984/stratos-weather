# Multi-stage lean Python Dockerfile for STRATOS
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runtime image
FROM python:3.12-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r stratos && useradd -r -g stratos stratos

# Copy installed wheels
COPY --from=builder /root/.local /home/stratos/.local
ENV PATH=/home/stratos/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

COPY app/ ./app/

RUN chown -R stratos:stratos /app
USER stratos

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
