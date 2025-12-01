FROM nginx:alpine

# Copy Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy SSL certs (if you have them)
COPY certs/ /etc/ssl/certs/

EXPOSE 443
EXPOSE 80