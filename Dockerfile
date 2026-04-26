FROM nginxinc/nginx-unprivileged:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY public/ ./

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
