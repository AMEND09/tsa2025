# Multi-stage build for AgriMind.ai
# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install ALL dependencies (including dev dependencies)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim AS backend-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Set environment variables for Django
ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV PYTHONPATH=/app

# Run Django setup (with proper database handling)
RUN python manage.py collectstatic --noinput --clear

# Stage 3: Production image
FROM python:3.11-slim AS production

WORKDIR /app

# Install system dependencies needed for runtime
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend application
COPY --from=backend-builder /app /app

# Copy frontend build to nginx directory
COPY --from=frontend-builder /app/dist /var/www/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV PYTHONPATH=/app

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
