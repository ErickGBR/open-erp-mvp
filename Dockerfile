# ================================================================
# Stage 1: Build Backend (NestJS)
# ================================================================
FROM node:22-alpine AS backend-builder

WORKDIR /app

COPY backend/package*.json backend/tsconfig*.json backend/nest-cli.json ./
RUN npm ci

COPY backend/ .
RUN rm -f tsconfig.tsbuildinfo && npm run build

# ================================================================
# Stage 2: Build Frontend (Next.js)
# ================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json frontend/tsconfig*.json frontend/next.config.* ./
RUN npm ci

COPY frontend/ .
COPY frontend/messages ./messages

RUN npm run build

# ================================================================
# Stage 3: Runtime — both services in one container
# ================================================================
FROM node:22-alpine AS runner

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# ── Backend dependencies & dist ──
WORKDIR /app/backend
COPY --from=backend-builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=backend-builder /app/dist ./dist
RUN mkdir -p /app/uploads/products

# ── Frontend dependencies & build ──
WORKDIR /app/frontend
COPY --from=frontend-builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
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
