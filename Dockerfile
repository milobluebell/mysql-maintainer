FROM node:22-bookworm AS builder

ENV HUSKY=0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim

ENV HUSKY=0
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    default-mysql-client \
  && rm -rf /var/lib/apt/lists/* \
  && mariadb-dump --version

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm rebuild better-sqlite3

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/db_backups /app/data

EXPOSE 1-65535/tcp

CMD ["node", "dist/main.js"]
