#!/bin/sh

# Start Django in the background
cd /app
python manage.py runserver 0.0.0.0:8000 &

# Start nginx in the foreground
nginx -g 'daemon off;'
