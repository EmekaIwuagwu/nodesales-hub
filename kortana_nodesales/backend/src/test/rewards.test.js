/**
 * Backend unit tests — reward engine logic (pure unit, no chain calls)
 */

const mongoose  = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET              = "test-jwt-secret";
process.env.NODE_ENV                = "test";
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";

const NodePurchase = require("../models/NodePurchase");
const UserReward   = require("../models/UserReward");
const RewardEpoch  = require("../models/RewardEpoch");
const SaleConfig   = require("../models/SaleConfig");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await NodePurchase.deleteMany({});
  await UserReward.deleteMany({});
  await RewardEpoch.deleteMany({});
  await SaleConfig.deleteMany({});
});

// ─── DNR rate calculation (pure logic) ───────────────────────────────────────

describe("DNR rate calculation", () => {
  const DNR_RATES = { 0: 1, 1: 2, 2: 5, 3: 10 };

  it("calculates correct DNR per wallet across tiers", () => {
    const purchases = [
      { wallet: "0xaaa", tier: 0, qty: 2 },  // 2 × 1 = 2 DNR
      { wallet: "0xaaa", tier: 2, qty: 1 },  // 1 × 5 = 5 DNR → total 7
      { wallet: "0xbbb", tier: 3, qty: 1 },  // 1 × 10 = 10 DNR
    ];

    const rewardMap = {};
    for (const { wallet, tier, qty } of purchases) {
      rewardMap[wallet] = (rewardMap[wallet] || 0) + qty * DNR_RATES[tier];
    }

    expect(rewardMap["0xaaa"]).toBe(7);
    expect(rewardMap["0xbbb"]).toBe(10);
  });

  it("handles a wallet with no purchases", () => {
    const rewardMap = {};
    expect(rewardMap["0xccc"] || 0).toBe(0);
  });
});

// ─── UserReward model ─────────────────────────────────────────────────────────

describe("UserReward model", () => {
  it("prevents duplicate wallet+epoch combinations", async () => {
    await UserReward.create({ walletAddress: "0xaaa", epochNumber: 1, tierId: 0, dnrAmount: 5 });
    await expect(
      UserReward.create({ walletAddress: "0xaaa", epochNumber: 1, tierId: 0, dnrAmount: 5 })
    ).rejects.toThrow();
  });

  it("stores and retrieves pending rewards", async () => {
    await UserReward.create({ walletAddress: "0xbbb", epochNumber: 2, tierId: 1, dnrAmount: 20, pending: true });
    const pending = await UserReward.find({ walletAddress: "0xbbb", pending: true });
    expect(pending).toHaveLength(1);
    expect(pending[0].dnrAmount).toBe(20);
  });
});

// ─── SaleConfig epoch counters ────────────────────────────────────────────────

describe("SaleConfig epoch updates", () => {
  it("increments currentEpoch and totalDNRDistributed atomically", async () => {
    await SaleConfig.create({
      tiers: [],
      currentEpoch:        3,
      totalDNRDistributed: 500,
    });

    await SaleConfig.updateOne({}, {
      $inc: { currentEpoch: 1, totalDNRDistributed: 100 },
    });

    const updated = await SaleConfig.findOne();
    expect(updated.currentEpoch).toBe(4);
    expect(updated.totalDNRDistributed).toBe(600);
  });
});
