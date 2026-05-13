# =========================
# Stage 1: Builder
# =========================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Prevent Next.js / TypeScript heap crashes
ENV NODE_OPTIONS=--max-old-space-size=4096

# ---------------------------------
# Copy ONLY dependency manifests first
# Maximizes Docker layer caching
# ---------------------------------
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY packages/shared-types/package*.json ./packages/shared-types/

# ---------------------------------
# Install dependencies with cache mount
# Faster rebuilds
# ---------------------------------
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---------------------------------
# Copy actual workspace source ONLY after install
# Prevents invalidating npm ci layer
# ---------------------------------
COPY packages/shared-types ./packages/shared-types

# Build shared workspace package
RUN npm run build --workspace=@basaer/shared-types

# ---------------------------------
# Next.js public env vars required at build time
# ---------------------------------
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

# ---------------------------------
# Copy frontend source LAST
# So app changes don't invalidate dependency layer
# ---------------------------------
COPY frontend ./frontend

WORKDIR /app/frontend

# Disable telemetry in CI/container
ENV NEXT_TELEMETRY_DISABLED=1

# Build standalone output
RUN npm run build

# =========================
# Stage 2: Production Runner
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------
# Security hardening
# ---------------------------------
RUN addgroup -S nodejs -g 1001 && \
    adduser -S nextjs -u 1001 -G nodejs

# ---------------------------------
# Copy standalone server
# ---------------------------------
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

# Static assets
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Public folder
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

USER nextjs

EXPOSE 3000

# Alpine does not always include wget
RUN apk add --no-cache wget

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Standalone server entry
CMD ["node", "frontend/server.js"]