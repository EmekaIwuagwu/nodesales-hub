/**
 * Central network configuration.
 *
 * Set NEXT_PUBLIC_CHAIN_ID in your environment:
 *   72511  →  Kortana Testnet  (default — faucet enabled)
 *    9002  →  Kortana Mainnet  (faucet disabled; users get mdUSD by swapping DNR)
 *
 * Render dashboard: Environment → Add Environment Variable → NEXT_PUBLIC_CHAIN_ID = 9002
 */

export const ACTIVE_CHAIN_ID: number =
  parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "72511", 10);

export const IS_TESTNET = ACTIVE_CHAIN_ID === 72511;
export const IS_MAINNET = ACTIVE_CHAIN_ID === 9002;

/**
 * Faucet is enabled whenever we're on testnet.
 * The API route already hard-blocks requests when ACTIVE_CHAIN_ID !== 72511,
 * so there is no risk of free minting slipping through on mainnet.
 */
export const IS_FAUCET_ENABLED = IS_TESTNET;

export const ACTIVE_RPC = IS_TESTNET
  ? "https://poseidon-rpc.testnet.kortana.xyz/"
  : "https://zeus-rpc.mainnet.kortana.xyz";
