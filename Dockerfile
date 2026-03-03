# Root Dockerfile for Render/monorepo

# 1. build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent
COPY frontend/ .
RUN npm run build

# 2. build backend (install dependencies)
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# 3. final runtime image
FROM python:3.11-slim AS runtime
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# copy python packages, CLI tools and backend code
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin
COPY --from=backend-builder /app/backend /app/backend

# copy built frontend into backend static folder
COPY --from=frontend-builder /app/frontend/dist /app/backend/static

WORKDIR /app/backend

# allow Render (and other hosts) to specify the port via env
# variable.  Default back to 8000 for local development.
EXPOSE 8000

# when listening on render, uvicorn will serve both api and static assets
CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
