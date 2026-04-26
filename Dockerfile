FROM nginxinc/nginx-unprivileged:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ ./

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
