/**
 * inject-addresses.js
 *
 * Reads addresses from .env.deployed (written by deploy.js) and injects them
 * into backend/.env and frontend/.env so you don't have to copy-paste manually.
 *
 * Usage:
 *   node scripts/inject-addresses.js
 *
 * Run AFTER:
 *   npx hardhat run scripts/deploy.js --network kortana_testnet
 */

const fs   = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ── 1. Read .env.deployed ──────────────────────────────────────────────────────

const deployedPath = path.join(ROOT, ".env.deployed");
if (!fs.existsSync(deployedPath)) {
  console.error("ERROR: .env.deployed not found. Run deploy.js first.");
  process.exit(1);
}

function parseEnv(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const vars  = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key   = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function updateEnvFile(filePath, patches) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

  for (const [key, value] of Object.entries(patches)) {
    const regex = new RegExp(`^(${key}=).*$`, "m");
    if (regex.test(content)) {
      // Replace existing line
      content = content.replace(regex, `$1${value}`);
    } else {
      // Append new key
      content += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(filePath, content.trimEnd() + "\n");
  console.log(`  Updated: ${path.relative(ROOT, filePath)}`);
}

// ── 2. Parse deployed addresses ───────────────────────────────────────────────

const deployed = parseEnv(deployedPath);

const {
  USDT_ADDRESS,
  DNR_ADDRESS,
  TREASURY,
  DISTRIBUTOR_ADDRESS,
  GENESIS_LICENSE_ADDRESS,
  EARLY_LICENSE_ADDRESS,
  FULL_LICENSE_ADDRESS,
  PREMIUM_LICENSE_ADDRESS,
  NODE_SALE_ADDRESS,
  REWARD_VAULT_ADDRESS,
  NETWORK,
} = deployed;

console.log(`\nInjecting addresses from ${NETWORK} deployment...\n`);

// ── 3. Patch backend/.env ─────────────────────────────────────────────────────

const backendEnvPath = path.join(ROOT, "backend", ".env");
updateEnvFile(backendEnvPath, {
  NODE_SALE_ADDRESS,
  REWARD_VAULT_ADDRESS,
  GENESIS_LICENSE_ADDRESS,
  EARLY_LICENSE_ADDRESS,
  FULL_LICENSE_ADDRESS,
  PREMIUM_LICENSE_ADDRESS,
  USDT_ADDRESS,
  DNR_ADDRESS,
  TREASURY,
  DISTRIBUTOR_ADDRESS,
});

// ── 4. Patch frontend/.env ────────────────────────────────────────────────────

const frontendEnvPath = path.join(ROOT, "frontend", ".env");
updateEnvFile(frontendEnvPath, {
  VITE_NODE_SALE_ADDRESS:    NODE_SALE_ADDRESS,
  VITE_REWARD_VAULT_ADDRESS: REWARD_VAULT_ADDRESS,
  VITE_USDT_ADDRESS:         USDT_ADDRESS,
});

// ── 5. Summary ────────────────────────────────────────────────────────────────

console.log(`
══════════════════════════════════════════════
 ADDRESSES INJECTED
══════════════════════════════════════════════
Network:       ${NETWORK}
USDT:          ${USDT_ADDRESS}
DNR:           ${DNR_ADDRESS}
Treasury:      ${TREASURY}
Distributor:   ${DISTRIBUTOR_ADDRESS}
────────────────────────────────────────────
Genesis:       ${GENESIS_LICENSE_ADDRESS}
Early:         ${EARLY_LICENSE_ADDRESS}
Full:          ${FULL_LICENSE_ADDRESS}
Premium:       ${PREMIUM_LICENSE_ADDRESS}
NodeSale:      ${NODE_SALE_ADDRESS}
RewardVault:   ${REWARD_VAULT_ADDRESS}
══════════════════════════════════════════════

Next steps:
  1. Set DISTRIBUTOR_PRIVATE_KEY in backend/.env
  2. Restart the backend:  npm run backend:dev
  3. Restart the frontend: npm run frontend:dev
  4. Run the seed script:  node scripts/seed.js
`);
