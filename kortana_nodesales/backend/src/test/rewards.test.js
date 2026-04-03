/**
 * E2E Reward Engine Tests
 * Tests: DNR rate logic, distribution lock, epoch counters,
 *        UserReward model uniqueness, SaleConfig updates.
 */

const mongoose  = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET              = "test-jwt-secret-32chars-minimum!!";
process.env.NODE_ENV                = "test";
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";
process.env.DNR_ADDRESS             = "0x0000000000000000000000000000000000000002";

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

// ─── DNR rate calculation ─────────────────────────────────────────────────────

describe("DNR rate calculation", () => {
  const DNR_RATES = { 0: 1, 1: 2, 2: 5, 3: 10 };

  it("calculates correct DNR per wallet across multiple tiers", () => {
    const purchases = [
      { wallet: "0xaaa", tier: 0, qty: 2 },  // 2 × 1 = 2 DNR
      { wallet: "0xaaa", tier: 2, qty: 1 },  // 1 × 5 = 5 DNR → total 7
      { wallet: "0xbbb", tier: 3, qty: 1 },  // 1 × 10 = 10 DNR
      { wallet: "0xccc", tier: 1, qty: 3 },  // 3 × 2 = 6 DNR
    ];

    const rewardMap = {};
    for (const { wallet, tier, qty } of purchases) {
      rewardMap[wallet] = (rewardMap[wallet] || 0) + qty * (DNR_RATES[tier] ?? 0);
    }

    expect(rewardMap["0xaaa"]).toBe(7);
    expect(rewardMap["0xbbb"]).toBe(10);
    expect(rewardMap["0xccc"]).toBe(6);
  });

  it("calculates 0 for unknown tier", () => {
    const DNR_RATES = { 0: 1, 1: 2, 2: 5, 3: 10 };
    const rate = DNR_RATES[99] ?? 0;
    expect(rate).toBe(0);
  });

  it("Genesis × 1 = 1 DNR, Premium × 1 = 10 DNR", () => {
    expect(DNR_RATES[0] * 1).toBe(1);
    expect(DNR_RATES[3] * 1).toBe(10);
  });

  it("accumulates correctly for same wallet buying same tier twice", () => {
    const rewardMap = {};
    const wallet = "0xddd";
    rewardMap[wallet] = (rewardMap[wallet] || 0) + 2 * DNR_RATES[1]; // first purchase
    rewardMap[wallet] = (rewardMap[wallet] || 0) + 1 * DNR_RATES[1]; // second purchase
    expect(rewardMap[wallet]).toBe(6); // 3 × 2 DNR
  });
});

// ─── Distribution lock ────────────────────────────────────────────────────────

describe("rewardEngine distribution lock", () => {
  it("exports isDistributing() as a function returning boolean", () => {
    const { isDistributing } = require("../services/rewardEngine");
    expect(typeof isDistributing).toBe("function");
    expect(typeof isDistributing()).toBe("boolean");
  });

  it("isDistributing() returns false when no distribution is running", () => {
    const { isDistributing } = require("../services/rewardEngine");
    expect(isDistributing()).toBe(false);
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

  it("allows same wallet different epoch", async () => {
    await UserReward.create({ walletAddress: "0xaaa", epochNumber: 1, tierId: 0, dnrAmount: 5 });
    const r2 = await UserReward.create({ walletAddress: "0xaaa", epochNumber: 2, tierId: 0, dnrAmount: 5 });
    expect(r2.epochNumber).toBe(2);
  });

  it("allows different wallet same epoch", async () => {
    await UserReward.create({ walletAddress: "0xaaa", epochNumber: 1, tierId: 0, dnrAmount: 5 });
    const r2 = await UserReward.create({ walletAddress: "0xbbb", epochNumber: 1, tierId: 0, dnrAmount: 5 });
    expect(r2.walletAddress).toBe("0xbbb");
  });

  it("defaults pending to true and claimed to false", async () => {
    const r = await UserReward.create({ walletAddress: "0xccc", epochNumber: 3, tierId: 1, dnrAmount: 20 });
    expect(r.pending).toBe(true);
    expect(r.claimed).toBe(false);
  });

  it("marks claimed correctly", async () => {
    const r = await UserReward.create({ walletAddress: "0xddd", epochNumber: 4, tierId: 2, dnrAmount: 50, pending: false, claimed: true, claimedAt: new Date() });
    expect(r.claimed).toBe(true);
    expect(r.claimedAt).toBeDefined();
  });

  it("queries pending rewards by wallet", async () => {
    await UserReward.insertMany([
      { walletAddress: "0xeee", epochNumber: 1, tierId: 0, dnrAmount: 5,  pending: true,  claimed: false },
      { walletAddress: "0xeee", epochNumber: 2, tierId: 0, dnrAmount: 5,  pending: true,  claimed: false },
      { walletAddress: "0xeee", epochNumber: 3, tierId: 0, dnrAmount: 5,  pending: false, claimed: true  },
    ]);
    const pending = await UserReward.find({ walletAddress: "0xeee", pending: true });
    expect(pending).toHaveLength(2);
  });
});

// ─── RewardEpoch model ────────────────────────────────────────────────────────

describe("RewardEpoch model", () => {
  it("creates an epoch record with recipients", async () => {
    const epoch = await RewardEpoch.create({
      epochNumber:        1,
      startTime:          new Date(),
      totalDNRDistributed: 11,
      totalRecipients:    2,
      distributionTxHash: "0x" + "a".repeat(64),
      status:             "completed",
      recipients: [
        { walletAddress: "0xaaa", dnrAmount: 1,  claimed: true },
        { walletAddress: "0xbbb", dnrAmount: 10, claimed: true },
      ],
    });

    expect(epoch.epochNumber).toBe(1);
    expect(epoch.recipients).toHaveLength(2);
    expect(epoch.status).toBe("completed");
    expect(epoch.totalDNRDistributed).toBe(11);
  });
});

// ─── SaleConfig epoch counters ────────────────────────────────────────────────

describe("SaleConfig epoch updates", () => {
  it("increments currentEpoch and totalDNRDistributed atomically", async () => {
    await SaleConfig.create({ tiers: [], currentEpoch: 3, totalDNRDistributed: 500 });

    await SaleConfig.updateOne({}, { $inc: { currentEpoch: 1, totalDNRDistributed: 100 } });

    const updated = await SaleConfig.findOne();
    expect(updated.currentEpoch).toBe(4);
    expect(updated.totalDNRDistributed).toBe(600);
  });

  it("sets nextEpochTime correctly", async () => {
    await SaleConfig.create({ tiers: [], currentEpoch: 0 });
    const future = new Date(Date.now() + 2160 * 1000);

    await SaleConfig.updateOne({}, { $set: { nextEpochTime: future } });

    const updated = await SaleConfig.findOne();
    expect(updated.nextEpochTime.getTime()).toBeGreaterThan(Date.now());
  });

  it("epochDurationSeconds defaults to 86400", async () => {
    const cfg = await SaleConfig.create({ tiers: [] });
    expect(cfg.epochDurationSeconds).toBe(86400);
  });
});

// ─── NodePurchase aggregate for reward engine ─────────────────────────────────

describe("NodePurchase aggregation for reward engine", () => {
  beforeEach(async () => {
    await NodePurchase.insertMany([
      { walletAddress: "0xwallet1", tierId: 0, tierName: "Genesis", quantity: 2, pricePerNode: 300e6, totalPaid: 600e6, txHash: "0x" + "1".repeat(64), status: "confirmed" },
      { walletAddress: "0xwallet1", tierId: 2, tierName: "Full",    quantity: 1, pricePerNode: 1000e6, totalPaid: 1000e6, txHash: "0x" + "2".repeat(64), status: "confirmed" },
      { walletAddress: "0xwallet2", tierId: 3, tierName: "Premium", quantity: 1, pricePerNode: 2000e6, totalPaid: 2000e6, txHash: "0x" + "3".repeat(64), status: "confirmed" },
      { walletAddress: "0xwallet3", tierId: 1, tierName: "Early",   quantity: 1, pricePerNode: 500e6, totalPaid: 500e6, txHash: "0x" + "4".repeat(64), status: "pending" }, // excluded
    ]);
  });

  it("aggregates only confirmed purchases into wallet+tier groups", async () => {
    const results = await NodePurchase.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: { wallet: "$walletAddress", tier: "$tierId" }, totalNodes: { $sum: "$quantity" } } },
    ]);

    expect(results).toHaveLength(3); // wallet1×2tiers + wallet2 = 3 groups
    expect(results.find(r => r._id.wallet === "0xwallet3")).toBeUndefined(); // pending excluded
  });

  it("correctly sums quantity per wallet+tier group", async () => {
    const results = await NodePurchase.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: { wallet: "$walletAddress", tier: "$tierId" }, totalNodes: { $sum: "$quantity" } } },
    ]);

    const wallet1Genesis = results.find(r => r._id.wallet === "0xwallet1" && r._id.tier === 0);
    expect(wallet1Genesis.totalNodes).toBe(2);

    const wallet2Premium = results.find(r => r._id.wallet === "0xwallet2" && r._id.tier === 3);
    expect(wallet2Premium.totalNodes).toBe(1);
  });
});
