#!/bin/bash

# Render.com Build Script for AgriMind.ai
# This script builds both the Django backend and React frontend for Render deployment

set -e  # Exit on any error

echo "🚀 Starting Render build process..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build React frontend
echo "🔨 Building React frontend..."
npm run build

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run Django setup
echo "🔧 Setting up Django..."

# Run migrations
echo "📊 Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build completed successfully!"
echo "🎉 Ready for Render deployment!"
