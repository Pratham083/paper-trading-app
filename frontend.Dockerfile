FROM node:20-slim AS build

WORKDIR /app
COPY frontend/ /app
RUN npm install
RUN npm run build


FROM node:20-slim
WORKDIR /app

COPY --from=build /app/dist ./dist

# Install Vite globally to use preview server
RUN npm install -g vite

EXPOSE 4173
CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
