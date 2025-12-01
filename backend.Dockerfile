FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && pip install --no-cache-dir -r requirements.txt gunicorn

COPY backend/ /app

ENV FLASK_APP=src.app
ENV FLASK_CONFIG=prod
ENV FRONTEND_URL=https://localhost

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "src.app:create_app()"]
