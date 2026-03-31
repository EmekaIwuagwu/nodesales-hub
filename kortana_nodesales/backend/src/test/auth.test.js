/**
 * Backend unit tests — auth routes + models
 * Run with: npm test (from backend/)
 * Uses mongodb-memory-server for zero-dependency test DB.
 */

const request   = require("supertest");
const mongoose  = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express   = require("express");

// Models
const User = require("../models/User");

// Set test env before loading app modules
process.env.JWT_SECRET        = "test-jwt-secret";
process.env.JWT_EXPIRES_IN    = "1h";
process.env.NODE_ENV          = "test";
// Stub out blockchain config so it doesn't try to connect to RPC
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Build a minimal app with just auth routes
  app = express();
  app.use(express.json());
  app.use("/api/auth", require("../routes/auth"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

// ─── /nonce ───────────────────────────────────────────────────────────────────

describe("POST /api/auth/nonce", () => {
  it("creates a user and returns a nonce for a new wallet", async () => {
    const address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    const res = await request(app).post("/api/auth/nonce").send({ address });
    expect(res.status).toBe(200);
    expect(res.body.nonce).toBeDefined();
    expect(res.body.nonce.length).toBeGreaterThan(0);

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    expect(user).toBeTruthy();
    expect(user.nonce).toBe(res.body.nonce);
  });

  it("returns the same user's updated nonce on second call", async () => {
    const address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    const first  = await request(app).post("/api/auth/nonce").send({ address });
    const second = await request(app).post("/api/auth/nonce").send({ address });
    expect(second.status).toBe(200);
    // Nonce should be refreshed — different from first
    expect(second.body.nonce).not.toBe(first.body.nonce);
  });

  it("rejects invalid address", async () => {
    const res = await request(app).post("/api/auth/nonce").send({ address: "notanaddress" });
    expect(res.status).toBe(400);
  });
});

// ─── User model ───────────────────────────────────────────────────────────────

describe("User model", () => {
  it("auto-generates a referral code on creation", async () => {
    const user = await User.create({ walletAddress: "0xaabbccddeeff00112233445566778899aabbccdd" });
    expect(user.referralCode).toBeDefined();
    expect(user.referralCode.length).toBeGreaterThan(0);
  });

  it("lowercases wallet address", async () => {
    const user = await User.create({ walletAddress: "0xAABBCCDDEEFF00112233445566778899AABBCCDD" });
    expect(user.walletAddress).toBe("0xaabbccddeeff00112233445566778899aabbccdd");
  });

  it("refreshNonce changes the nonce", async () => {
    const user    = await User.create({ walletAddress: "0x1234567890123456789012345678901234567890" });
    const before  = user.nonce;
    await user.refreshNonce();
    const updated = await User.findOne({ walletAddress: user.walletAddress });
    expect(updated.nonce).not.toBe(before);
  });

  it("prevents duplicate wallet addresses", async () => {
    const addr = "0x1111111111111111111111111111111111111111";
    await User.create({ walletAddress: addr });
    await expect(User.create({ walletAddress: addr })).rejects.toThrow();
  });
});
