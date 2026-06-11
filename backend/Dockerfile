# Stage 1
FROM node:20-slim AS builder

WORKDIR /app

# Copy all package.json files for correct workspace resolution
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# Copy shared-types and build it
COPY packages/shared-types ./packages/shared-types
RUN npm run build --workspace=@basaer/shared-types

# Copy backend source
COPY backend ./backend

WORKDIR /app/backend
RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=4096" npx nest build

# Stage 2
FROM node:20-slim AS runner

# Install openssl and ca-certificates for Prisma engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Copy package.json files again for npm prune context
COPY package.json ./
COPY backend/package.json ./backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY frontend/package.json ./frontend/

COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev --ignore-scripts

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/scripts ./backend/scripts
COPY --from=builder /app/backend/public ./backend/public
COPY --from=builder /app/backend/src/generated ./backend/src/generated
COPY --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist

RUN chmod +x ./backend/scripts/start.sh

EXPOSE 3001

CMD ["sh", "./backend/scripts/start.sh"]