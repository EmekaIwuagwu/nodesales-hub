# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --include=dev
COPY frontend/ ./
# VITE_ env vars are baked into the bundle at build time.
# On Render, VITE_API_URL is left empty — frontend and API share the same origin.
<<<<<<< HEAD
# Declare build args — must match keys in Render dashboard
=======
>>>>>>> 950be0e5dc8638d7b550e2982ea0f9f98a9c5448
ARG VITE_API_URL=""
ARG VITE_CHAIN_ID=72511
ARG VITE_RPC_URL="https://poseidon-rpc.testnet.kortana.xyz/"
ARG VITE_EXPLORER_URL="https://explorer.testnet.kortana.xyz"
ARG VITE_NODE_SALE_ADDRESS=""
ARG VITE_REWARD_VAULT_ADDRESS=""
ARG VITE_USDT_ADDRESS=""
ARG VITE_WALLETCONNECT_PROJECT_ID=""
<<<<<<< HEAD

# Promote ARGs to ENV so Vite can read them via process.env during npm run build
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CHAIN_ID=$VITE_CHAIN_ID \
    VITE_RPC_URL=$VITE_RPC_URL \
    VITE_EXPLORER_URL=$VITE_EXPLORER_URL \
    VITE_NODE_SALE_ADDRESS=$VITE_NODE_SALE_ADDRESS \
    VITE_REWARD_VAULT_ADDRESS=$VITE_REWARD_VAULT_ADDRESS \
    VITE_USDT_ADDRESS=$VITE_USDT_ADDRESS \
    VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID

=======
>>>>>>> 950be0e5dc8638d7b550e2982ea0f9f98a9c5448
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
