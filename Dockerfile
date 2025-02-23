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

RUN mkdir -p /app/backend/staticfiles

RUN python products/manage.py collectstatic --noinput --verbosity 3

# ---- Frontend Stage (React) ----
FROM node:20-slim AS frontend

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

RUN npm install rollup --save-dev --legacy-peer-deps

COPY frontend /app/frontend

RUN npm run build

# ---- Final Image ----
FROM base AS final

WORKDIR /app

# Install Node.js in final stage
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Copy backend from the backend stage and frontend from the frontend stage
COPY --from=backend /app/backend /app/backend
COPY --from=frontend /app/frontend/dist /app/frontend/dist


# Reinstall Python dependencies in final stage
RUN pip install --no-cache-dir -r /app/backend/products/requirements.txt

WORKDIR /app

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
