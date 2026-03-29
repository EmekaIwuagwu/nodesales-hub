# Kortana Genesis Node License — Technical Documentation

## Overview
This system enables the sale and distribution of **Node Licenses** for the Kortana Blockchain (Chain ID 9002). It consists of two primary smart contracts and a premium frontend.

### Core Architecture
- **KortanaLicenseNFT.sol**: ERC721 NFT contract with 4 tiers. Foundation-only minting after off-chain payment verification.
- **KortanaRewards.sol**: Automated native DNR reward distributor.
- **Frontend**: Single-page interactive application with ROI calculator, MetaMask integration, and application form.

---

## 🏗 Smart Contracts

### 1. KortanaLicenseNFT
- **Contract Type**: ERC721
- **Tiers**:
  - Genesis Node ($300) — Max 1,000
  - Early Node ($500) — Max 2,000
  - Full Node ($1,000) — Max 1,000
  - Premium Node ($2,000) — Max 500
- **Access Control**: Foundation (Owner)
- **Visibility**: NFTs are visible in MetaMask under standard ERC721.

### 2. KortanaRewards
- **Token**: Native DNR (Direct transfer, no ERC20)
- **Epoch**: 2160 seconds (36 minutes)
- **Reward Rates**:
  - Genesis: 1 DNR / epoch
  - Early: 2 DNR / epoch
  - Full: 5 DNR / epoch
  - Premium: 10 DNR / epoch
- **Logic**: Automatic "Push" distribution to holders. Supports batching.

---

## 🎨 Frontend Implementation

### Aesthetic: Dark Cosmos
- **Palette**: Deep Void (#020408), Electric Blue (#0ea5e9), Cyan, Purple.
- **Animations**: GSAP for scroll, Canvas API for drifting stars.
- **Features**:
  - **Live Network Stats**: Auto-updating simulated/real explorer data.
  - **ROI Calculator**: Interactive earnings projection based on DNR price.
  - **Add to MetaMask**: Seamless network configuration for Mainnet/Testnet.
  - **Application Form**: Glassmorphism form with instant validation.

---

## 🚀 Deployment Guide

### Prerequisites
- Private key with testnet DNR (for testnet deployment).
- Node 18+ installed.

### Steps
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment**:
   Create a `.env` file with `PRIVATE_KEY`.
3. **Deploy to Testnet**:
   ```bash
   npx hardhat run scripts/deploy.js --network testnet
   ```
4. **Deploy to Mainnet**:
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```
5. **Run Automation Bot**:
   Keep rewards flowing every 36 mins via the bot:
   ```bash
   REWARDS_ADDRESS=0x... pm2 start scripts/reward-bot.js --name kortana-rewards
   ```

---

## 👨‍💻 Author
Built by **Antigravity** (Senior Blockchain Engineer) for **Kortana Group LLC**.
*Confidential — Internal Use Only*
