/**
 * Signature-based authentication routes.
 *
 * POST /api/auth/nonce   — generate a one-time nonce (no address required)
 * POST /api/auth/verify  — recover signer from signature, issue JWT
 * POST /api/auth/logout  — invalidate session
 *
 * Identity is derived entirely from the cryptographic signature.
 * We do NOT trust the address returned by eth_accounts — that value is only
 * used as a hint for the wallet UI. The JWT wallet is always the recovered address.
 */

const express  = require("express");
const crypto   = require("crypto");
const jwt      = require("jsonwebtoken");
const { ethers } = require("ethers");
const { z }    = require("zod");
const { isNoDbMode } = require("../config/database");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const logger   = require("../utils/logger");

const router = express.Router();

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── In-memory nonce store (NO-DB mode only) ──────────────────────────────────
const memNonces = new Map();

function memCreateNonce() {
  const nonce = crypto.randomBytes(16).toString("hex");
  memNonces.set(nonce, Date.now() + NONCE_TTL_MS);
  return nonce;
}

function memConsumeNonce(nonce) {
  const expiry = memNonces.get(nonce);
  if (!expiry) return false;
  memNonces.delete(nonce);
  if (Date.now() > expiry) return false;
  return true;
}

// ─── DB-backed nonce helpers (DB mode) ───────────────────────────────────────
async function dbCreateNonce() {
  const Nonce = require("../models/Nonce");
  const nonce = crypto.randomBytes(16).toString("hex");
  await Nonce.create({ nonce, expiresAt: new Date(Date.now() + NONCE_TTL_MS) });
  return nonce;
}

async function dbConsumeNonce(nonce) {
  const Nonce = require("../models/Nonce");
  // findOneAndDelete is atomic — guarantees single-use even under concurrent requests
  const doc = await Nonce.findOneAndDelete({ nonce, expiresAt: { $gt: new Date() } });
  return !!doc;
}

// ─── POST /nonce ─────────────────────────────────────────────────────────────
// No address required — identity is established by the signature, not by
// what the wallet claims its address is.

router.post("/nonce", authLimiter, async (req, res) => {
  try {
    const nonce = isNoDbMode() ? memCreateNonce() : await dbCreateNonce();
    res.json({ nonce });
  } catch (err) {
    logger.error("[Auth] nonce creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /verify ─────────────────────────────────────────────────────────────
// Accept { message, signature }. Recover the signer address from the signature.
// The message must contain the nonce in the form "Nonce: <hex>".

router.post("/verify", authLimiter, async (req, res) => {
  const schema = z.object({
    message:   z.string().min(10).max(2000),
    signature: z.string().min(130).max(200),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Invalid payload" });

  const { message, signature } = result.data;

  try {
    // 1 — Extract nonce from message
    const nonceMatch = message.match(/Nonce:\s*([a-f0-9]{32})/i);
    if (!nonceMatch) return res.status(400).json({ error: "Message missing valid nonce" });
    const nonce = nonceMatch[1];

    // 2 — Consume nonce (single-use, 5-min TTL) — atomic in DB mode
    const nonceValid = isNoDbMode()
      ? memConsumeNonce(nonce)
      : await dbConsumeNonce(nonce);
    if (!nonceValid) {
      return res.status(401).json({ error: "Invalid or expired nonce" });
    }

    // 3 — Recover true signing address from signature
    //     This is wallet-agnostic: works for MetaMask, Kortana Wallet, etc.
    //     The recovered address is the ground-truth identity — we never trust
    //     eth_accounts alone.
    let wallet;
    try {
      wallet = ethers.verifyMessage(message, signature).toLowerCase();
    } catch (sigErr) {
      logger.error("[Auth] signature recovery error:", sigErr.message);
      return res.status(401).json({ error: "Invalid signature" });
    }

    // 4 — No-DB mode: issue JWT immediately
    if (isNoDbMode()) {
      const token = jwt.sign(
        { wallet, isAdmin: false },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );
      return res.json({ token, wallet, isAdmin: false });
    }

    // 5 — DB mode: upsert User, issue JWT
    const User = require("../models/User");
    let user = await User.findOne({ walletAddress: wallet });
    if (!user) user = await User.create({ walletAddress: wallet });
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { wallet, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );
    res.json({ token, wallet, isAdmin: user.isAdmin });

  } catch (err) {
    logger.error("[Auth] verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /logout ─────────────────────────────────────────────────────────────

router.post("/logout", requireAuth, async (req, res) => {
  if (!isNoDbMode() && req.user?.refreshNonce) {
    try { await req.user.refreshNonce(); } catch {}
  }
  res.json({ ok: true });
});

module.exports = router;
