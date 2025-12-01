#!/bin/sh
# Wait until backend is listening on port 5000
echo "Waiting for backend..."
while ! nc -z backend 5000; do
  sleep 1
done
echo "Backend is ready, starting Nginx..."
exec nginx -g 'daemon off;'
