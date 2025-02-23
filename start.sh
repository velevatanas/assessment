#!/bin/bash

nginx -g "daemon off;" &

sleep 5  

# Verify if Nginx is running
if [ ! -e /proc/$(cat /run/nginx.pid) ]; then
    echo "Nginx failed to start, exiting..."
    exit 1
fi

cd /app/backend/products  

exec gunicorn --bind unix:/app/backend/gunicorn.sock products.wsgi:application
