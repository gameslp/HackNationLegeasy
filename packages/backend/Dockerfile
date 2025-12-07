# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package files for all workspace packages
COPY packages/database/package.json ./packages/database/
COPY packages/validation/package.json ./packages/validation/
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/database ./packages/database
COPY packages/validation ./packages/validation
COPY packages/backend ./packages/backend

# Generate Prisma client
RUN pnpm --filter @repo/database generate

# Build validation package
RUN pnpm --filter @repo/validation build

# Build backend
RUN pnpm --filter @repo/backend build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package files
COPY packages/database/package.json ./packages/database/
COPY packages/validation/package.json ./packages/validation/
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema
COPY packages/database/prisma ./packages/database/prisma

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma ./node_modules/.prisma

# Copy database source for re-exports
COPY packages/database/src ./packages/database/src

# Copy built validation package
COPY --from=builder /app/packages/validation/dist ./packages/validation/dist

# Copy built backend
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Create uploads directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/packages/backend

CMD ["node", "dist/index.js"]
