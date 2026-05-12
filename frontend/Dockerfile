# Stage 1: Dependency Installation & Compilation
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable NPM Workspace intelligence by copying root and project configs
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY packages/shared-types ./packages/shared-types/

# Trigger workspace-level npm ci to resolve all local cross-links
RUN npm ci

# Build shared types workspace (frontend depends on it)
RUN npm run build --workspace=@basaeer/shared-types

# Critical Step: Next.js requires PUBLIC variables at the time of `next build`
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

# Copy frontend source logic
COPY frontend ./frontend

# Initiate build. Output targets .next/standalone due to config update.
WORKDIR /app/frontend
RUN npm run build

# Stage 2: Tiny Production Execution Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Explicit host required to receive docker internal proxy requests
ENV HOSTNAME="0.0.0.0"

# Create non-root user for container security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# In Workspace/Standalone mode, Next.js creates a self-contained replicate tree.
# We copy that tree and manually insert non-compiled files (public, static).
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

EXPOSE 3000

# Health check verifying the application serves requests
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# The entry point is nested in the target project folder under monolithic builds
CMD ["node", "frontend/server.js"]
