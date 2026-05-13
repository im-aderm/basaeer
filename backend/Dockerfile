# Stage 1
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

COPY packages/shared-types ./packages/shared-types
RUN npm run build --workspace=@basaer/shared-types

# Copy backend source
COPY backend ./backend

WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Stage 2
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/src/generated ./backend/src/generated
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist

EXPOSE 3001

WORKDIR /app/backend
CMD ["node", "dist/main"]