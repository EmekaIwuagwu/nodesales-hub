# KortanaDEX

A world-class, fully functional EVM-compatible decentralized exchange (DEX) built for the Kortana blockchain.

## Tech Stack
- **Smart Contracts:** Solidity 0.8.20, Hardhat, OpenZeppelin, custom Uniswap V2 core/periphery code.
- **Frontend:** Next.js 14, React 18, Tailwind CSS, Framer Motion, Wagmi v2, RainbowKit, Recharts.

## Blockchain Configuration

| Parameter | Testnet | Mainnet |
|---|---|---|
| Network Name | Kortana Testnet | Kortana Mainnet |
| RPC URL | `https://poseidon-rpc.testnet.kortana.xyz/` | `https://zeus-rpc.mainnet.kortana.xyz` |
| Chain ID | `72511` | `9002` |
| Currency Symbol | `DNR` | `DNR` |

## Setup & Deployment

1. Install dependencies:
   ```bash
   npm install
   cd frontend
   npm install
   ```
2. Configure `.env`:
   Create `.env` based on `.env.example` in the root:
   ```
   PRIVATE_KEY=your_private_key
   TESTNET_RPC=https://poseidon-rpc.testnet.kortana.xyz/
   MAINNET_RPC=https://zeus-rpc.mainnet.kortana.xyz
   ```

3. Compile Smart Contracts:
   ```bash
   npx hardhat compile
   ```

4. Deploy to Testnet and Seed Liquidity:
   ```bash
   npx hardhat run scripts/deploy.ts --network kortanaTestnet
   ```
   This script will automatically deploy mdUSD, WDNR, Factory, and Router. It will mint mdUSD, create the DNR/mdUSD pair, seed initial liquidity at a 1:1 price, and execute the first swap to activate indexing on DEXScreener.

5. Run the UI locally:
   ```bash
   cd frontend
   npm run dev
   ```

## Design Overview
KortanaDEX leverages deep space aesthetics, smooth Framer Motion micro-animations, glassmorphism, and neon glowing tokens (DNR Gold #F5C842 and mdUSD Teal #00D4AA). The UX mirrors top-tier decentralized consumer products.

## Security Considerations
- Ensure operator keys for mdUSD minting are tightly guarded or given to a multisig.
- Fee mechanism is standard Uniswap V2 0.3% protocol split.
- `unlocked` mutex reentrancy prevention guard implemented in Pair.
