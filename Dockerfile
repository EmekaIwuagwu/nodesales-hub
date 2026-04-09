# Base image
FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the frontend folder contents to the root of the /app directory
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

# 2. Rebuild the source code only when necessary
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Next.js standalone output preserves the folder structure of the build environment
# Since we build in /app, the output is in .next/standalone/app/
# We copy from that nested 'app' folder to the root of our runner container
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/app/ ./
# We also need the base standalone libs (node_modules, etc)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./

# Then we copy static files to the correct expected locations
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
