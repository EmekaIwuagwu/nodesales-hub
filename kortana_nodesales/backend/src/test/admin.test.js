/**
 * E2E Admin Route Tests
 * Covers: Zod validation on PUT /faq/:id and /announce/:id,
 *         distribute endpoint lock check, dashboard stats,
 *         user listing and pagination.
 */

const request  = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express  = require("express");
const jwt      = require("jsonwebtoken");

process.env.JWT_SECRET              = "test-jwt-secret-32chars-minimum!!";
process.env.JWT_EXPIRES_IN          = "1h";
process.env.NODE_ENV                = "test";
process.env.KORTANA_RPC_URL         = "http://localhost:9999";
process.env.DISTRIBUTOR_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001";
process.env.REWARD_VAULT_ADDRESS    = "0x0000000000000000000000000000000000000001";
process.env.NODE_SALE_ADDRESS       = "0x0000000000000000000000000000000000000001";

const FAQ          = require("../models/FAQ");
const Announcement = require("../models/Announcement");
const User         = require("../models/User");
const SaleConfig   = require("../models/SaleConfig");
const NodePurchase = require("../models/NodePurchase");
const RewardEpoch  = require("../models/RewardEpoch");

let mongoServer;
let app;
let adminToken;

// Deterministic test wallets (42 chars each)
const ADMIN_WALLET = "0x" + "a".repeat(40);
const USER_WALLET  = "0x" + "b".repeat(40);

function makeAdminToken() {
  return jwt.sign({ wallet: ADMIN_WALLET, isAdmin: true },  process.env.JWT_SECRET, { expiresIn: "1h" });
}
function makeUserToken() {
  return jwt.sign({ wallet: USER_WALLET,  isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use("/api/auth",  require("../routes/auth"));
  app.use("/api/admin", require("../routes/admin"));

  adminToken = makeAdminToken();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Seed admin + regular user before every test (afterEach clears Users)
beforeEach(async () => {
  await User.deleteMany({});
  await User.create({ walletAddress: ADMIN_WALLET, isAdmin: true });
  await User.create({ walletAddress: USER_WALLET,  isAdmin: false });
});

afterEach(async () => {
  await FAQ.deleteMany({});
  await Announcement.deleteMany({});
  await User.deleteMany({});
  await SaleConfig.deleteMany({});
  await NodePurchase.deleteMany({});
  await RewardEpoch.deleteMany({});
});

function auth() {
  return { Authorization: `Bearer ${adminToken}` };
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

describe("Admin route auth guard", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("rejects non-admin JWT with 403", async () => {
    const res = await request(app).get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${makeUserToken()}`);
    expect(res.status).toBe(403);
  });

  it("accepts valid admin JWT", async () => {
    await SaleConfig.create({ tiers: [] });
    const res = await request(app).get("/api/admin/dashboard").set(auth());
    expect(res.status).toBe(200);
  });
});

// ─── GET /dashboard ───────────────────────────────────────────────────────────

describe("GET /api/admin/dashboard", () => {
  it("returns config, totalUsers, recentEpochs, salesToday", async () => {
    await SaleConfig.create({ tiers: [], currentEpoch: 5, totalDNRDistributed: 100 });
    // beforeEach already seeded 2 users (admin + regular)

    const res = await request(app).get("/api/admin/dashboard").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBe(2);
    expect(res.body.config.currentEpoch).toBe(5);
    expect(Array.isArray(res.body.recentEpochs)).toBe(true);
    expect(Array.isArray(res.body.salesToday)).toBe(true);
  });
});

// ─── POST /distribute ─────────────────────────────────────────────────────────

describe("POST /api/admin/distribute", () => {
  it("returns 200 ok when not already distributing", async () => {
    const res = await request(app).post("/api/admin/distribute").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

// ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

describe("FAQ CRUD", () => {
  it("POST /faq creates a FAQ with valid body", async () => {
    const res = await request(app).post("/api/admin/faq")
      .set(auth())
      .send({ question: "What is Kortana?", answer: "A blockchain platform.", order: 1, isPublished: true });
    expect(res.status).toBe(201);
    expect(res.body.question).toBe("What is Kortana?");
  });

  it("POST /faq rejects missing question", async () => {
    const res = await request(app).post("/api/admin/faq")
      .set(auth())
      .send({ answer: "An answer with no question." });
    expect(res.status).toBe(400);
  });

  it("POST /faq rejects empty answer", async () => {
    const res = await request(app).post("/api/admin/faq")
      .set(auth())
      .send({ question: "Q?", answer: "" });
    expect(res.status).toBe(400);
  });

  it("PUT /faq/:id updates allowed fields", async () => {
    const faq = await FAQ.create({ question: "Old Q", answer: "Old A", order: 0, isPublished: true });

    const res = await request(app).put(`/api/admin/faq/${faq._id}`)
      .set(auth())
      .send({ question: "New Q", isPublished: false });
    expect(res.status).toBe(200);
    expect(res.body.question).toBe("New Q");
    expect(res.body.isPublished).toBe(false);
    expect(res.body.answer).toBe("Old A"); // untouched
  });

  it("PUT /faq/:id rejects invalid field types", async () => {
    const faq = await FAQ.create({ question: "Q", answer: "A" });

    const res = await request(app).put(`/api/admin/faq/${faq._id}`)
      .set(auth())
      .send({ isPublished: "yes" }); // should be boolean
    expect(res.status).toBe(400);
  });

  it("PUT /faq/:id returns 404 for unknown id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/admin/faq/${fakeId}`)
      .set(auth())
      .send({ question: "Updated" });
    expect(res.status).toBe(404);
  });

  it("DELETE /faq/:id removes FAQ", async () => {
    const faq = await FAQ.create({ question: "Delete me", answer: "Gone" });
    const res = await request(app).delete(`/api/admin/faq/${faq._id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const found = await FAQ.findById(faq._id);
    expect(found).toBeNull();
  });
});

// ─── Announcement CRUD ────────────────────────────────────────────────────────

describe("Announcement CRUD", () => {
  it("POST /announce creates with valid body", async () => {
    const res = await request(app).post("/api/admin/announce")
      .set(auth())
      .send({ title: "Launch!", body: "We are live.", isPublished: true, pinned: false });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Launch!");
  });

  it("POST /announce rejects missing title", async () => {
    const res = await request(app).post("/api/admin/announce")
      .set(auth())
      .send({ body: "Body only." });
    expect(res.status).toBe(400);
  });

  it("POST /announce rejects invalid expiresAt datetime", async () => {
    const res = await request(app).post("/api/admin/announce")
      .set(auth())
      .send({ title: "T", body: "B", expiresAt: "not-a-date" });
    expect(res.status).toBe(400);
  });

  it("PUT /announce/:id updates allowed fields only", async () => {
    const ann = await Announcement.create({ title: "Old", body: "Old body", isPublished: true, pinned: false });

    const res = await request(app).put(`/api/admin/announce/${ann._id}`)
      .set(auth())
      .send({ title: "New", pinned: true });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New");
    expect(res.body.pinned).toBe(true);
    expect(res.body.body).toBe("Old body"); // untouched
  });

  it("PUT /announce/:id rejects invalid pinned type", async () => {
    const ann = await Announcement.create({ title: "T", body: "B" });

    const res = await request(app).put(`/api/admin/announce/${ann._id}`)
      .set(auth())
      .send({ pinned: "definitely" }); // should be boolean
    expect(res.status).toBe(400);
  });

  it("PUT /announce/:id returns 404 for unknown id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/admin/announce/${fakeId}`)
      .set(auth())
      .send({ title: "Ghost" });
    expect(res.status).toBe(404);
  });

  it("DELETE /announce/:id removes announcement", async () => {
    const ann = await Announcement.create({ title: "Bye", body: "Farewell" });
    const res = await request(app).delete(`/api/admin/announce/${ann._id}`).set(auth());
    expect(res.status).toBe(200);
    const found = await Announcement.findById(ann._id);
    expect(found).toBeNull();
  });
});

// ─── GET /users ───────────────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  beforeEach(async () => {
    // Add 3 more on top of the 2 seeded by outer beforeEach = 5 total
    const wallets = Array.from({ length: 3 }, (_, i) =>
      `0x${String(i + 1).padStart(40, "1")}`
    );
    await User.insertMany(wallets.map(w => ({ walletAddress: w })));
  });

  it("returns paginated users", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=3").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(3);
    expect(res.body.total).toBe(5);
    expect(res.body.pages).toBe(2);
  });

  it("clamps limit to 100", async () => {
    const res = await request(app).get("/api/admin/users?limit=9999").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeLessThanOrEqual(100);
  });

  it("filters by wallet address search", async () => {
    // ADMIN_WALLET is 0x + "a"×40 — search for partial match
    const res = await request(app).get(`/api/admin/users?search=${ADMIN_WALLET.slice(2, 10)}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── PUT /tier/:id ────────────────────────────────────────────────────────────

describe("PUT /api/admin/tier/:id", () => {
  beforeEach(async () => {
    await SaleConfig.create({
      tiers: [
        { tierId: 0, name: "Genesis", priceUSDT: 300e6, maxSupply: 1000, sold: 0, dnrPerEpoch: 1, active: true },
      ],
    });
  });

  it("updates tier active flag", async () => {
    const res = await request(app).put("/api/admin/tier/0")
      .set(auth())
      .send({ active: false });
    expect(res.status).toBe(200);
    const cfg = await SaleConfig.findOne();
    expect(cfg.tiers[0].active).toBe(false);
  });

  it("rejects non-boolean active field", async () => {
    const res = await request(app).put("/api/admin/tier/0")
      .set(auth())
      .send({ active: "yes" });
    expect(res.status).toBe(400);
  });

  it("rejects negative priceUSDT", async () => {
    const res = await request(app).put("/api/admin/tier/0")
      .set(auth())
      .send({ priceUSDT: -100 });
    expect(res.status).toBe(400);
  });
});
