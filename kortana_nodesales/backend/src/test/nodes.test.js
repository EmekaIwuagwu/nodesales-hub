/**
 * E2E Node Routes Tests
 * Covers: GET /tiers, GET /stats, POST /verify-purchase, POST /faucet,
 *         POST /purchase idempotency, rate limiting, input validation.
 */

const request  = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express  = require("express");

process.env.JWT_SECRET              = "test-jwt-secret-32chars-minimum!!";
process.env.NODE_ENV                = "test";
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";
process.env.USDT_ADDRESS            = "0x0000000000000000000000000000000000000002";
process.env.TREASURY                = "0x0000000000000000000000000000000000000003";
process.env.GENESIS_LICENSE_ADDRESS = "0x0000000000000000000000000000000000000004";
process.env.EARLY_LICENSE_ADDRESS   = "0x0000000000000000000000000000000000000005";
process.env.FULL_LICENSE_ADDRESS    = "0x0000000000000000000000000000000000000006";
process.env.PREMIUM_LICENSE_ADDRESS = "0x0000000000000000000000000000000000000007";

const SaleConfig   = require("../models/SaleConfig");
const NodePurchase = require("../models/NodePurchase");

const VALID_TX   = "0x" + "a".repeat(64);
const VALID_ADDR = "0x" + "b".repeat(40);

const SEED_CONFIG = {
  tiers: [
    { tierId: 0, name: "Genesis", priceUSDT: 300e6,  maxSupply: 1000, sold: 200, dnrPerEpoch: 1,  active: true,  licenseTokenAddress: "0x04" },
    { tierId: 1, name: "Early",   priceUSDT: 500e6,  maxSupply: 2000, sold: 500, dnrPerEpoch: 2,  active: true,  licenseTokenAddress: "0x05" },
    { tierId: 2, name: "Full",    priceUSDT: 1000e6, maxSupply: 1000, sold: 0,   dnrPerEpoch: 5,  active: false, licenseTokenAddress: "0x06" },
    { tierId: 3, name: "Premium", priceUSDT: 2000e6, maxSupply: 500,  sold: 499, dnrPerEpoch: 10, active: true,  licenseTokenAddress: "0x07" },
  ],
  currentEpoch: 5,
  epochDurationSeconds: 86400,
  totalDNRDistributed: 10000,
  totalUSDTRaised: 350000e6,
  nextEpochTime: new Date(Date.now() + 3600000),
};

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use("/api/nodes", require("../routes/nodes"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await SaleConfig.deleteMany({});
  await NodePurchase.deleteMany({});
  await SaleConfig.create(SEED_CONFIG);
});

// ─── GET /tiers ───────────────────────────────────────────────────────────────

describe("GET /api/nodes/tiers", () => {
  it("returns all 4 tiers with correct remaining supply", async () => {
    const res = await request(app).get("/api/nodes/tiers");
    expect(res.status).toBe(200);
    expect(res.body.tiers).toHaveLength(4);

    const genesis = res.body.tiers[0];
    expect(genesis.tierId).toBe(0);
    expect(genesis.sold).toBe(200);
    expect(genesis.remaining).toBe(800);
    expect(genesis.active).toBe(true);

    const premium = res.body.tiers[3];
    expect(premium.remaining).toBe(1); // 500 max - 499 sold
  });

  it("returns 503 when SaleConfig not seeded", async () => {
    await SaleConfig.deleteMany({});
    const res = await request(app).get("/api/nodes/tiers");
    expect(res.status).toBe(503);
  });

  it("includes treasury address on each tier", async () => {
    const res = await request(app).get("/api/nodes/tiers");
    expect(res.status).toBe(200);
    res.body.tiers.forEach(t => {
      expect(t).toHaveProperty("treasury");
    });
  });
});

// ─── GET /stats ───────────────────────────────────────────────────────────────

describe("GET /api/nodes/stats", () => {
  it("returns correct totalNodesSold from confirmed purchases", async () => {
    await NodePurchase.insertMany([
      { walletAddress: "0x01", tierId: 0, tierName: "Genesis", quantity: 2, pricePerNode: 300e6, totalPaid: 600e6, txHash: "0x" + "a".repeat(64), status: "confirmed" },
      { walletAddress: "0x02", tierId: 1, tierName: "Early",   quantity: 1, pricePerNode: 500e6, totalPaid: 500e6, txHash: "0x" + "b".repeat(64), status: "confirmed" },
      { walletAddress: "0x03", tierId: 2, tierName: "Full",    quantity: 3, pricePerNode: 1000e6, totalPaid: 3000e6, txHash: "0x" + "c".repeat(64), status: "pending" }, // not confirmed
    ]);

    const res = await request(app).get("/api/nodes/stats");
    expect(res.status).toBe(200);
    expect(res.body.totalNodesSold).toBe(3); // only confirmed
    expect(res.body.currentEpoch).toBe(5);
    expect(res.body.totalDNRDistributed).toBe(10000);
    expect(res.body.nextEpochTime).toBeDefined();
  });

  it("returns 0 totalNodesSold when no confirmed purchases", async () => {
    const res = await request(app).get("/api/nodes/stats");
    expect(res.status).toBe(200);
    expect(res.body.totalNodesSold).toBe(0);
  });
});

// ─── POST /verify-purchase ────────────────────────────────────────────────────

describe("POST /api/nodes/verify-purchase", () => {
  it("returns confirmed status for known txHash", async () => {
    await NodePurchase.create({
      walletAddress: "0xabc", tierId: 0, tierName: "Genesis",
      quantity: 1, pricePerNode: 300e6, totalPaid: 300e6,
      txHash: VALID_TX, status: "confirmed",
    });

    const res = await request(app).post("/api/nodes/verify-purchase").send({ txHash: VALID_TX });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
    expect(res.body.purchase).toBeDefined();
  });

  it("rejects a txHash shorter than 66 chars", async () => {
    const res = await request(app).post("/api/nodes/verify-purchase").send({ txHash: "0xshort" });
    expect(res.status).toBe(400);
  });

  it("rejects a txHash longer than 66 chars", async () => {
    const res = await request(app).post("/api/nodes/verify-purchase").send({ txHash: "0x" + "a".repeat(65) });
    expect(res.status).toBe(400);
  });

  it("rejects missing txHash", async () => {
    const res = await request(app).post("/api/nodes/verify-purchase").send({});
    expect(res.status).toBe(400);
  });
});

// ─── POST /faucet ─────────────────────────────────────────────────────────────

describe("POST /api/nodes/faucet", () => {
  it("rejects invalid wallet address", async () => {
    const res = await request(app).post("/api/nodes/faucet").send({ walletAddress: "notanaddress" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects wallet address that is too short", async () => {
    const res = await request(app).post("/api/nodes/faucet").send({ walletAddress: "0x1234" });
    expect(res.status).toBe(400);
  });

  it("rejects missing wallet address", async () => {
    const res = await request(app).post("/api/nodes/faucet").send({});
    expect(res.status).toBe(400);
  });

  it("rate-limits same wallet to 1 request per window", async () => {
    const walletAddress = "0x" + "f".repeat(40);

    // First call — will fail on-chain (no real RPC) but passes validation
    // We just need to confirm the second call gets rate-limited
    await request(app).post("/api/nodes/faucet").send({ walletAddress });

    // Second call within rate limit window must be rejected
    const res2 = await request(app).post("/api/nodes/faucet").send({ walletAddress });
    expect(res2.status).toBe(429);
    expect(res2.body.error).toMatch(/faucet/i);
  });
});

// ─── POST /purchase idempotency ───────────────────────────────────────────────

describe("POST /api/nodes/purchase — idempotency", () => {
  it("returns alreadyProcessed:true for duplicate txHash", async () => {
    const txHash = "0x" + "d".repeat(64);
    const buyer  = "0x" + "e".repeat(40);

    // Pre-seed an existing confirmed purchase with this txHash
    await NodePurchase.create({
      walletAddress: buyer, tierId: 0, tierName: "Genesis",
      quantity: 1, pricePerNode: 300e6, totalPaid: 300e6,
      txHash, status: "confirmed",
    });

    const res = await request(app).post("/api/nodes/purchase").send({
      txHash,
      tierId:   0,
      quantity: 1,
      buyer,
    });

    expect(res.status).toBe(200);
    expect(res.body.alreadyProcessed).toBe(true);
    expect(res.body.status).toBe("confirmed");
  });

  it("rejects purchase with invalid tierId", async () => {
    const res = await request(app).post("/api/nodes/purchase").send({
      txHash:   VALID_TX,
      tierId:   99, // invalid
      quantity: 1,
      buyer:    VALID_ADDR,
    });
    expect(res.status).toBe(400);
  });

  it("rejects purchase with quantity 0", async () => {
    const res = await request(app).post("/api/nodes/purchase").send({
      txHash:   VALID_TX,
      tierId:   0,
      quantity: 0,
      buyer:    VALID_ADDR,
    });
    expect(res.status).toBe(400);
  });

  it("rejects purchase with quantity > 10", async () => {
    const res = await request(app).post("/api/nodes/purchase").send({
      txHash:   VALID_TX,
      tierId:   0,
      quantity: 11,
      buyer:    VALID_ADDR,
    });
    expect(res.status).toBe(400);
  });

  it("rejects purchase with invalid buyer address", async () => {
    const res = await request(app).post("/api/nodes/purchase").send({
      txHash:   VALID_TX,
      tierId:   0,
      quantity: 1,
      buyer:    "notanaddress",
    });
    expect(res.status).toBe(400);
  });

  it("rejects purchase with missing fields", async () => {
    const res = await request(app).post("/api/nodes/purchase").send({ txHash: VALID_TX });
    expect(res.status).toBe(400);
  });
});

// ─── NodePurchase model ───────────────────────────────────────────────────────

describe("NodePurchase model", () => {
  it("enforces unique txHash", async () => {
    const shared = { walletAddress: "0xabc", tierId: 0, tierName: "Genesis", quantity: 1, pricePerNode: 300e6, totalPaid: 300e6 };
    await NodePurchase.create({ ...shared, txHash: "0x" + "1".repeat(64) });
    await expect(
      NodePurchase.create({ ...shared, txHash: "0x" + "1".repeat(64) })
    ).rejects.toThrow();
  });

  it("defaults status to pending", async () => {
    const np = await NodePurchase.create({
      walletAddress: "0xabc", tierId: 0, tierName: "Genesis",
      quantity: 1, pricePerNode: 300e6, totalPaid: 300e6,
      txHash: "0x" + "2".repeat(64),
    });
    expect(np.status).toBe("pending");
  });

  it("stores mintTxHash when provided", async () => {
    const np = await NodePurchase.create({
      walletAddress: "0xabc", tierId: 0, tierName: "Genesis",
      quantity: 1, pricePerNode: 300e6, totalPaid: 300e6,
      txHash: "0x" + "3".repeat(64),
      mintTxHash: "0x" + "4".repeat(64),
    });
    expect(np.mintTxHash).toBe("0x" + "4".repeat(64));
  });
});
