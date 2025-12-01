FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt

RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && pip install --no-cache-dir -r requirements.txt gunicorn

COPY backend/ /app

ENV FLASK_APP=src.app
ENV FLASK_CONFIG=prod
ENV FRONTEND_URL=https://localhost

# Copy entrypoint script
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Run the entrypoint
CMD ["/app/entrypoint.sh"]
