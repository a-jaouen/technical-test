# syntax=docker/dockerfile:1

FROM node:26-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM busybox:1.38-musl
COPY httpd.conf /etc/httpd.conf
COPY --from=build /app/dist /www
USER 65534:65534
EXPOSE 5173
CMD ["httpd", "-f", "-p", "5173", "-h", "/www", "-c", "/etc/httpd.conf"]
