/**
 * Seed script — run once after deployment to initialise SaleConfig in MongoDB.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Reads contract addresses from .env.deployed if present, then falls back to .env.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.deployed") });
require("dotenv").config({ path: require("path").join(__dirname, "../backend/.env"), override: false });
require("dotenv").config({ path: require("path").join(__dirname, "../.env"), override: false });

// Use backend's own mongoose to avoid dual-instance buffering issues
const mongoose   = require("../backend/node_modules/mongoose");
const SaleConfig = require("../backend/src/models/SaleConfig");
const FAQ        = require("../backend/src/models/FAQ");

const TIER_DEFAULTS = [
  { tierId: 0, name: "Genesis", priceUSDT: 300e6,  maxSupply: 1000, dnrPerEpoch: 1  },
  { tierId: 1, name: "Early",   priceUSDT: 500e6,  maxSupply: 2000, dnrPerEpoch: 2  },
  { tierId: 2, name: "Full",    priceUSDT: 1000e6, maxSupply: 1000, dnrPerEpoch: 5  },
  { tierId: 3, name: "Premium", priceUSDT: 2000e6, maxSupply: 500,  dnrPerEpoch: 10 },
];

const LICENSE_ADDRESSES = [
  process.env.GENESIS_LICENSE_ADDRESS,
  process.env.EARLY_LICENSE_ADDRESS,
  process.env.FULL_LICENSE_ADDRESS,
  process.env.PREMIUM_LICENSE_ADDRESS,
];

const DEFAULT_FAQS = [
  {
    question:    "What is a Kortana Node?",
    answer:      "A Kortana Node License is an ERC-20 token that entitles you to earn daily DNR rewards from the Kortana blockchain infrastructure.",
    order:       1,
    isPublished: true,
  },
  {
    question:    "How are rewards distributed?",
    answer:      "Rewards are distributed every 24 hours at 12:00 UTC. DNR accumulates on-chain in the RewardVault and you can claim at any time — no expiry.",
    order:       2,
    isPublished: true,
  },
  {
    question:    "Can I transfer or sell my node license?",
    answer:      "Yes. Node licenses are standard ERC-20 tokens — fully transferable to any EVM wallet. Transferring the token transfers the reward entitlement.",
    order:       3,
    isPublished: true,
  },
  {
    question:    "What payment method is accepted?",
    answer:      "USDT (BEP-20 on BSC) is the accepted payment. Connect your wallet, approve the exact purchase amount, and confirm the transaction.",
    order:       4,
    isPublished: true,
  },
  {
    question:    "What is the difference between node tiers?",
    answer:      "Genesis (1 DNR/day), Early (2 DNR/day), Full (5 DNR/day), Premium (10 DNR/day). Higher tiers earn more DNR per license per epoch.",
    order:       5,
    isPublished: true,
  },
  {
    question:    "Is there a supply limit?",
    answer:      "Yes. Genesis: 1,000 nodes · Early: 2,000 nodes · Full: 1,000 nodes · Premium: 500 nodes. Once a tier sells out, no more licenses can be minted.",
    order:       6,
    isPublished: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // ── SaleConfig ────────────────────────────────────────────────────────────

  const existing = await SaleConfig.findOne();
  if (existing) {
    console.log("SaleConfig already exists — skipping (run with --force to overwrite)");
  } else {
    const tiers = TIER_DEFAULTS.map((t, i) => ({
      ...t,
      sold:                0,
      active:              true,
      licenseTokenAddress: LICENSE_ADDRESSES[i] || "",
    }));

    await SaleConfig.create({
      tiers,
      currentEpoch:         0,
      epochDurationSeconds: parseInt(process.env.EPOCH_DURATION || "86400"),
      nextEpochTime:        new Date(Date.now() + 86400 * 1000),
      totalDNRDistributed:  0,
      totalUSDTRaised:      0,
      rewardVaultAddress:   process.env.REWARD_VAULT_ADDRESS || "",
      nodeSaleAddress:      process.env.NODE_SALE_ADDRESS    || "",
    });

    console.log("SaleConfig created with tier data");
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────

  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    await FAQ.insertMany(DEFAULT_FAQS);
    console.log(`Inserted ${DEFAULT_FAQS.length} default FAQs`);
  } else {
    console.log(`FAQs already exist (${faqCount}) — skipping`);
  }

  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
