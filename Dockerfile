FROM python:3.11-slim AS base

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ---- Backend Stage (Django) ----
FROM base AS backend

WORKDIR /app/backend

COPY backend/products/requirements.txt /app/backend/products/requirements.txt
RUN python3 -m pip install --no-cache-dir -r /app/backend/products/requirements.txt

COPY backend /app/backend

COPY backend/products/db.sqlite3 /app/backend/products/db.sqlite3

RUN pip install supervisor

# ---- Frontend Stage (React) ----
FROM node:20-slim AS frontend

WORKDIR /app/frontend

COPY frontend /app/frontend

RUN rm -rf node_modules package-lock.json && npm cache clean --force

RUN npm install --no-optional --legacy-peer-deps

RUN npm install rollup --save-dev --legacy-peer-deps

RUN npm run build

# ---- Final Image ----
FROM base AS final

WORKDIR /app

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

RUN pip install supervisor

COPY --from=backend /app/backend /app/backend
COPY --from=frontend /app/frontend /app/frontend

RUN pip install --no-cache-dir -r /app/backend/products/requirements.txt

# Expose ports
EXPOSE 8000 5173

COPY supervisor.conf /app/supervisor.conf

WORKDIR /app/backend

# Start Django & React via Supervisor
CMD ["supervisord", "-c", "/app/supervisor.conf"]
