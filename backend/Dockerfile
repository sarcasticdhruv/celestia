# Backend Dockerfile - Python FastAPI service
# multi-stage build is not strictly needed, but we'll keep it simple

FROM python:3.11-slim as builder
WORKDIR /app

# install build tools if any (none needed here) and copy requirements
env PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy the application
COPY . .

# final image
FROM python:3.11-slim
WORKDIR /app

# copy installed packages and CLI executables from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

EXPOSE 8000

# run uvicorn on container start; respect PORT env var when provided
CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
