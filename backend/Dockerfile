# syntax=docker/dockerfile:1

FROM node:26-alpine3.24 AS build
RUN apk add --no-cache binutils && strip --strip-all /usr/local/bin/node
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY tsconfig.json rolldown.config.ts ./
COPY src ./src
RUN npm run build

FROM alpine:3.24
RUN apk add --no-cache libstdc++ \
	&& addgroup -S -g 1000 node \
	&& adduser -S -u 1000 -G node -h /app node
COPY --from=build /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/app.js ./
USER node
ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3001/ping || exit 1
CMD ["node", "app.js"]
