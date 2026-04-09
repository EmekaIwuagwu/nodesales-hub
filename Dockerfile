# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 – install deps
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 – build
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Verify the standalone output exists before the runner stage tries to copy it.
# If server.js is missing the build will fail here with a clear message instead
# of a cryptic "not found" error in the COPY step.
RUN test -f /app/.next/standalone/server.js \
    || (echo "ERROR: /app/.next/standalone/server.js not found. Check next.config output:'standalone'" && exit 1)

# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 – production runner
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# public/ assets
COPY --from=builder /app/public ./public

# Standalone bundle — server.js + minimal node_modules + .next/server
# The standalone dir contents land directly at /app (no nested subfolder).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./

# Static assets must be alongside the .next directory that server.js expects
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
