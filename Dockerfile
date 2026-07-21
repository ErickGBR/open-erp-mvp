FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package*.json backend/tsconfig*.json backend/nest-cli.json ./

RUN npm ci

COPY backend/ .

RUN rm -f tsconfig.tsbuildinfo

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads/products && chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main"]
