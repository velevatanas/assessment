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

RUN mkdir -p /app/backend/staticfiles

RUN python products/manage.py collectstatic --noinput --verbosity 3

# ---- Frontend Stage (React) ----
FROM node:20-slim AS frontend

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

RUN npm install rollup --save-dev --legacy-peer-deps

# Copy the rest of the frontend files
COPY frontend /app/frontend

RUN npm run build

# ---- Final Image ----
FROM base AS final

WORKDIR /app

# Install Node.js in final stage (needed if not inherited)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Create logs directory (if needed)
RUN mkdir -p /app/logs /app/backend/static

# Install Supervisor in final stage (if still using it for process management)
RUN pip install supervisor

# Copy backend from the backend stage and frontend from the frontend stage
COPY --from=backend /app/backend /app/backend
COPY --from=frontend /app/frontend/dist /app/frontend/dist


# Reinstall Python dependencies in final stage
RUN pip install --no-cache-dir -r /app/backend/products/requirements.txt

COPY --from=backend /app/backend/staticfiles /app/backend/staticfiles

WORKDIR /app

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 8000

COPY supervisor.conf /app/supervisor.conf

WORKDIR /app/backend

CMD service nginx start && supervisord -c /app/supervisor.conf
