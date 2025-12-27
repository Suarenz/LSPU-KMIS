# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js - create dummy env for build time
RUN cat > .env <<'EOF'
DATABASE_URL=postgresql://user:pass@localhost:5432/db
DIRECT_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=dummy==;EndpointSuffix=core.windows.net
GOOGLE_AI_API_KEY=dummy
UPSTASH_REDIS_REST_URL=https://dummy.upstash.io
UPSTASH_REDIS_REST_TOKEN=dummy
UPSTASH_VECTOR_REST_URL=https://dummy.upstash.io
UPSTASH_VECTOR_REST_TOKEN=dummy
JWT_SECRET=dummy-secret-key
OPENAI_API_KEY=dummy
COLIVARA_API_KEY=dummy
COLIVARA_API_ENDPOINT=https://api.colivara.com
QWEN_API_KEY=dummy
QWEN_API_ENDPOINT=https://api.aliyun.com
EOF
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the Next.js standalone server
CMD ["node", ".next/standalone/server.js"]
