FROM node:20-slim AS build

WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY frontend/ /app
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /app/dist
