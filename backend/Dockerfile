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

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app /app

EXPOSE 8000

# run uvicorn on container start
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
