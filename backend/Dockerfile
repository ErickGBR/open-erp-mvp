FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json nest-cli.json ./

RUN npm ci

COPY . .

# Clean any cached build info to ensure fresh compilation
RUN rm -f tsconfig.tsbuildinfo

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main"]
