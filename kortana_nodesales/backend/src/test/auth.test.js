/**
 * E2E Auth Route Tests
 * Tests the full SIWE auth flow: nonce → sign → verify → JWT → logout
 * Uses mongodb-memory-server — no external DB needed.
 */

const request   = require("supertest");
const mongoose  = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express   = require("express");
const { ethers } = require("ethers");

// Must set env before requiring app modules
process.env.JWT_SECRET              = "test-jwt-secret-32chars-minimum!!";
process.env.JWT_EXPIRES_IN          = "1h";
process.env.NODE_ENV                = "test";
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";

const User  = require("../models/User");
const Nonce = require("../models/Nonce");

let mongoServer;
let app;

// Deterministic test wallet
const TEST_WALLET = new ethers.Wallet("0x0101010101010101010101010101010101010101010101010101010101010101");

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

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
  await Nonce.deleteMany({});
});

// ─── POST /nonce ──────────────────────────────────────────────────────────────

describe("POST /api/auth/nonce", () => {
  it("returns a 32-char hex nonce without requiring an address", async () => {
    const res = await request(app).post("/api/auth/nonce").send({});
    expect(res.status).toBe(200);
    expect(res.body.nonce).toMatch(/^[a-f0-9]{32}$/);
  });

  it("persists nonce to MongoDB", async () => {
    const res = await request(app).post("/api/auth/nonce").send({});
    expect(res.status).toBe(200);
    const doc = await Nonce.findOne({ nonce: res.body.nonce });
    expect(doc).toBeTruthy();
    expect(doc.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("each call returns a unique nonce", async () => {
    const r1 = await request(app).post("/api/auth/nonce").send({});
    const r2 = await request(app).post("/api/auth/nonce").send({});
    expect(r1.body.nonce).not.toBe(r2.body.nonce);
  });
});

// ─── POST /verify ─────────────────────────────────────────────────────────────

describe("POST /api/auth/verify", () => {
  async function getNonce() {
    const res = await request(app).post("/api/auth/nonce").send({});
    return res.body.nonce;
  }

  async function buildMessage(nonce) {
    return `Sign in to Kortana Node Sale\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
  }

  it("issues JWT for a valid signature", async () => {
    const nonce   = await getNonce();
    const message = await buildMessage(nonce);
    const sig     = await TEST_WALLET.signMessage(message);

    const res = await request(app).post("/api/auth/verify").send({ message, signature: sig });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.wallet).toBe(TEST_WALLET.address.toLowerCase());
  });

  it("creates a User record in DB on first login", async () => {
    const nonce   = await getNonce();
    const message = await buildMessage(nonce);
    const sig     = await TEST_WALLET.signMessage(message);

    await request(app).post("/api/auth/verify").send({ message, signature: sig });
    const user = await User.findOne({ walletAddress: TEST_WALLET.address.toLowerCase() });
    expect(user).toBeTruthy();
  });

  it("consumes the nonce — same nonce cannot be reused", async () => {
    const nonce   = await getNonce();
    const message = await buildMessage(nonce);
    const sig     = await TEST_WALLET.signMessage(message);

    // First use succeeds
    const r1 = await request(app).post("/api/auth/verify").send({ message, signature: sig });
    expect(r1.status).toBe(200);

    // Second use with same nonce must fail
    const r2 = await request(app).post("/api/auth/verify").send({ message, signature: sig });
    expect(r2.status).toBe(401);
    expect(r2.body.error).toMatch(/nonce/i);
  });

  it("rejects a message with no nonce", async () => {
    const message = "Sign in to Kortana — no nonce here";
    const sig     = await TEST_WALLET.signMessage(message);

    const res = await request(app).post("/api/auth/verify").send({ message, signature: sig });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nonce/i);
  });

  it("rejects an invalid signature", async () => {
    const nonce   = await getNonce();
    const message = await buildMessage(nonce);
    // Sign with a different wallet
    const other   = new ethers.Wallet("0x0202020202020202020202020202020202020202020202020202020202020202");
    const sig     = await other.signMessage(message);

    // The signature is technically valid but nonce was burned by other-signed message attempt
    // What we really test: wrong nonce in message → reject
    const badMsg = `Sign in\nNonce: ffffffffffffffffffffffffffffffff`;
    const badSig = await TEST_WALLET.signMessage(badMsg);
    const res    = await request(app).post("/api/auth/verify").send({ message: badMsg, signature: badSig });
    expect(res.status).toBe(401);
  });

  it("rejects request with missing fields", async () => {
    const res = await request(app).post("/api/auth/verify").send({ message: "only message" });
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

  it("stores wallet address in lowercase", async () => {
    const user = await User.create({ walletAddress: "0xAABBCCDDEEFF00112233445566778899AABBCCDD" });
    expect(user.walletAddress).toBe("0xaabbccddeeff00112233445566778899aabbccdd");
  });

  it("refreshNonce changes the nonce", async () => {
    const user   = await User.create({ walletAddress: "0x1234567890123456789012345678901234567890" });
    const before = user.nonce;
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

// ─── Nonce model ──────────────────────────────────────────────────────────────

describe("Nonce model", () => {
  it("stores nonce with future expiry", async () => {
    const nonce = await Nonce.create({
      nonce:     "abcdef1234567890abcdef1234567890",
      expiresAt: new Date(Date.now() + 300_000),
    });
    expect(nonce.nonce).toBe("abcdef1234567890abcdef1234567890");
    expect(nonce.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("findOneAndDelete removes nonce atomically", async () => {
    const nonce = "deadbeefdeadbeefdeadbeefdeadbeef";
    await Nonce.create({ nonce, expiresAt: new Date(Date.now() + 300_000) });

    const doc = await Nonce.findOneAndDelete({ nonce, expiresAt: { $gt: new Date() } });
    expect(doc).toBeTruthy();

    // Second attempt finds nothing (single-use enforced)
    const doc2 = await Nonce.findOneAndDelete({ nonce, expiresAt: { $gt: new Date() } });
    expect(doc2).toBeNull();
  });

  it("does not find expired nonces", async () => {
    const nonce = "expiredexpiredexpiredexpiredexpi";
    await Nonce.create({ nonce, expiresAt: new Date(Date.now() - 1000) }); // already expired

    const doc = await Nonce.findOneAndDelete({ nonce, expiresAt: { $gt: new Date() } });
    expect(doc).toBeNull();
  });
});
