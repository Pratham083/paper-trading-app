FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev

COPY backend/ /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

ENV FLASK_APP=src.app
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_CONFIG=prod

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
