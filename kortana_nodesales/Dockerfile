# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --include=dev
COPY frontend/ ./
# VITE_ env vars are baked into the bundle at build time.
# On Render, VITE_API_URL is left empty — frontend and API share the same origin.
ARG VITE_API_URL=""
ARG VITE_CHAIN_ID=72511
ARG VITE_RPC_URL="https://poseidon-rpc.testnet.kortana.xyz/"
ARG VITE_EXPLORER_URL="https://explorer.testnet.kortana.xyz"
ARG VITE_NODE_SALE_ADDRESS=""
ARG VITE_REWARD_VAULT_ADDRESS=""
ARG VITE_USDT_ADDRESS=""
ARG VITE_WALLETCONNECT_PROJECT_ID=""
RUN npm run build

# ── Stage 2: Production server ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install backend deps only
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend's public folder
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 4000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
