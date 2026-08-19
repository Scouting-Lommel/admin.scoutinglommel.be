# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 1337

CMD ["pnpm", "start"]
