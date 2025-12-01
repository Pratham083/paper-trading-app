#!/bin/sh
# Apply migrations
flask db upgrade

# Seed the database
python -m src.utils.seed

# Start Gunicorn properly
exec gunicorn -w 4 -b 0.0.0.0:5000 "src.app:create_app()"
