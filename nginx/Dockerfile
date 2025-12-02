# Stage 1: Build the frontend (copying from frontend.Dockerfile)
FROM node:20-slim AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY frontend/ /app
RUN npm install
RUN npm run build

# Stage 2: Setup Nginx reverse proxy
FROM nginx:alpine

RUN apk add --no-cache gettext

# Copy Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf.template

# Copy SSL certs
# COPY nginx/certs/ /etc/ssl/certs/

# Copy the built frontend static files to the Nginx root directory
COPY --from=build /app/dist /app/dist

# Update the RUN block that creates /docker-entrypoint.sh:
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -x' >> /docker-entrypoint.sh && \
    echo 'echo "Original BACKEND_URL: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo '# Add https:// prefix if not present' >> /docker-entrypoint.sh && \
    echo 'if [[ ! $BACKEND_URL =~ ^https?:// ]]; then' >> /docker-entrypoint.sh && \
    echo '  BACKEND_URL="https://${BACKEND_URL}"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'echo "Final BACKEND_URL: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$BACKEND_URL" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "Generated config:"' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]
