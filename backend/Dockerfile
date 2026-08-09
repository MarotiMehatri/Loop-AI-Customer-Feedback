FROM node:20-slim AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate

# ---------- build stage ----------
FROM base AS build

RUN npm run build

# ---------- production stage ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

RUN npx prisma generate

COPY --from=build /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate resolve --rolled-back 20260726074511_init || true; npx prisma migrate deploy && node dist/src/server.js"]
