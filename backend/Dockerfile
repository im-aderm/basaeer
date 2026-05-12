# Stage 1: Workspace Resolution & Compilation
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

# Load the NPM Workspace topology to enable native local linking
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
COPY packages/shared-types ./packages/shared-types/

# Install at workspace root. This links packages/shared-types automatically.
# Skip postinstall (prisma generate) — schema is present but TypeScript source isn't copied yet.
RUN npm ci --ignore-scripts

# Build the shared-types workspace package first (backend depends on it)
RUN npm run build --workspace=@basaeer/shared-types

# Stage backend artifacts needed for build
COPY backend ./backend

# Generate ORM and transform TypeScript to vanilla Node
WORKDIR /app/backend
RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 2: Lightweight Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Setup user identity
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Load dependency requirements for pure runtime installation
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
COPY packages/shared-types ./packages/shared-types/

# Install only runtime deps, skip postinstall (prisma client already built in stage 1)
RUN npm ci --omit=dev --ignore-scripts

# Copy source artifacts generated during phase 1
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/src/generated ./backend/src/generated
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# Align dynamic health check to our internal path routing
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

WORKDIR /app/backend
CMD ["npm", "run", "start:prod"]
