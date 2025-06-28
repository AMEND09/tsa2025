#!/bin/bash

# Wait for database to be ready (if using external DB)
echo "Starting AgriMind.ai application..."

# Navigate to app directory
cd /app

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start Django in the background
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000 &

# Start nginx in the foreground
echo "Starting Nginx..."
nginx -g 'daemon off;'
