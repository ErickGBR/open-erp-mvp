# ================================================================
# Stage 1: Build Backend (NestJS)
# ================================================================
FROM node:22-alpine AS backend-builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml backend/tsconfig*.json backend/nest-cli.json ./
RUN pnpm install --frozen-lockfile

COPY backend/ .
RUN rm -f tsconfig.tsbuildinfo && pnpm run build

# ================================================================
# Stage 2: Build Frontend (Next.js)
# ================================================================
FROM node:22-alpine AS frontend-builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/tsconfig*.json frontend/next.config.* ./
RUN pnpm install --frozen-lockfile

COPY frontend/ .
COPY frontend/messages ./messages

RUN pnpm run build

# ================================================================
# Stage 3: Runtime — both services in one container
# ================================================================
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# ── Backend dependencies & dist ──
WORKDIR /app/backend
COPY --from=backend-builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
COPY --from=backend-builder /app/dist ./dist
RUN mkdir -p /app/uploads/products

# ── Frontend dependencies & build ──
WORKDIR /app/frontend
COPY --from=frontend-builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/next.config.* ./
COPY --from=frontend-builder /app/messages ./messages

# ── Start script ──
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# ── Permissions ──
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV BACKEND_INTERNAL_URL=http://localhost:3001
ENV HOSTNAME=0.0.0.0

CMD ["/app/start.sh"]
