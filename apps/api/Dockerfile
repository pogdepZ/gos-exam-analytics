# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci

COPY apps/api ./apps/api
RUN npm exec -w apps/api -- prisma generate
RUN npm run build -w apps/api

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN npm exec -w apps/api -- prisma generate

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
