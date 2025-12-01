# Stage 1: Build the frontend (copying from frontend.Dockerfile)
FROM node:20-slim AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY frontend/ /app
RUN npm install
RUN npm run build

# Stage 2: Setup Nginx reverse proxy
FROM nginx:alpine

# Copy Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy SSL certs
COPY nginx/certs/ /etc/ssl/certs/

# Copy the built frontend static files to the Nginx root directory
COPY --from=build /app/dist /app/dist

EXPOSE 443
EXPOSE 80

COPY nginx/wait-for-backend.sh /app/wait-for-backend.sh
CMD ["/app/wait-for-backend.sh"]
