# syntax=docker/dockerfile:1

# ---- Build: typecheck and produce the static bundle
FROM node:26-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- Runtime: static files served by busybox httpd (~2 MB base image)
FROM busybox:1.38-musl
COPY httpd.conf /etc/httpd.conf
COPY --from=build /app/dist /www
USER 65534:65534
EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www", "-c", "/etc/httpd.conf"]
