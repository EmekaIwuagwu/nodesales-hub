/**
 * Backend unit tests — nodes routes + SaleConfig model
 */

const request  = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express  = require("express");

process.env.JWT_SECRET              = "test-jwt-secret";
process.env.NODE_ENV                = "test";
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";

const SaleConfig   = require("../models/SaleConfig");
const NodePurchase = require("../models/NodePurchase");

let mongoServer;
let app;

const SEED_CONFIG = {
  tiers: [
    { tierId: 0, name: "Genesis", priceUSDT: 300e6,  maxSupply: 1000, sold: 200, dnrPerEpoch: 1,  active: true, licenseTokenAddress: "0x01" },
    { tierId: 1, name: "Early",   priceUSDT: 500e6,  maxSupply: 2000, sold: 500, dnrPerEpoch: 2,  active: true, licenseTokenAddress: "0x02" },
    { tierId: 2, name: "Full",    priceUSDT: 1000e6, maxSupply: 1000, sold: 0,   dnrPerEpoch: 5,  active: false, licenseTokenAddress: "0x03" },
    { tierId: 3, name: "Premium", priceUSDT: 2000e6, maxSupply: 500,  sold: 500, dnrPerEpoch: 10, active: true, licenseTokenAddress: "0x04" },
  ],
  currentEpoch:        5,
  epochDurationSeconds: 86400,
  totalDNRDistributed: 10000,
  totalUSDTRaised:     350000e6,
  nextEpochTime:       new Date(Date.now() + 3600000),
};

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
  it("returns all 4 tiers with remaining supply", async () => {
    const res = await request(app).get("/api/nodes/tiers");
    expect(res.status).toBe(200);
    expect(res.body.tiers).toHaveLength(4);

    const genesis = res.body.tiers[0];
    expect(genesis.tierId).toBe(0);
    expect(genesis.sold).toBe(200);
    expect(genesis.remaining).toBe(800);
    expect(genesis.active).toBe(true);
  });

  it("returns 503 when SaleConfig not seeded", async () => {
    await SaleConfig.deleteMany({});
    const res = await request(app).get("/api/nodes/tiers");
    expect(res.status).toBe(503);
  });
});

// ─── GET /stats ───────────────────────────────────────────────────────────────

describe("GET /api/nodes/stats", () => {
  it("returns platform stats", async () => {
    await NodePurchase.insertMany([
      { walletAddress: "0x01", tierId: 0, tierName: "Genesis", quantity: 2, pricePerNode: 300e6, totalPaid: 600e6, txHash: "0xaaa", status: "confirmed" },
      { walletAddress: "0x02", tierId: 1, tierName: "Early",   quantity: 1, pricePerNode: 500e6, totalPaid: 500e6, txHash: "0xbbb", status: "confirmed" },
    ]);

    const res = await request(app).get("/api/nodes/stats");
    expect(res.status).toBe(200);
    expect(res.body.totalNodesSold).toBe(3);
    expect(res.body.currentEpoch).toBe(5);
    expect(res.body.totalDNRDistributed).toBe(10000);
  });
});

// ─── POST /verify-purchase ────────────────────────────────────────────────────

describe("POST /api/nodes/verify-purchase", () => {
  it("returns existing purchase when txHash found", async () => {
    const txHash = "0x" + "a".repeat(64);
    await NodePurchase.create({
      walletAddress: "0xabc", tierId: 0, tierName: "Genesis",
      quantity: 1, pricePerNode: 300e6, totalPaid: 300e6,
      txHash, status: "confirmed",
    });

    const res = await request(app).post("/api/nodes/verify-purchase").send({ txHash });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("rejects malformed txHash", async () => {
    const res = await request(app).post("/api/nodes/verify-purchase").send({ txHash: "notahash" });
    expect(res.status).toBe(400);
  });
});
