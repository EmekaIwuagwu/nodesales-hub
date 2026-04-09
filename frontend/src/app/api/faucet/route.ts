import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Faucet is testnet-only. On mainnet users acquire mdUSD by swapping DNR.
const ACTIVE_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "72511", 10);
const IS_TESTNET = ACTIVE_CHAIN_ID === 72511;

const KORTANA_TESTNET = {
  id: 72511,
  name: "Kortana Testnet",
  nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls: { default: { http: ["https://poseidon-rpc.testnet.kortana.xyz/"] } },
} as const;

// Always use the testnet mdUSD address — this endpoint never runs on mainnet
const MDUSD_ADDRESS = "0x56D2AcEBD3B1b310A1f0B5c927421c4f26710E91" as const;
const FAUCET_AMOUNT = parseEther("10000"); // 10,000 mdUSD per request

const MDUSD_ABI = [
  {
    name: "mint",
    type: "function" as const,
    stateMutability: "nonpayable" as const,
    inputs: [
      { name: "to", type: "address" as const },
      { name: "amount", type: "uint256" as const },
    ],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "account", type: "address" as const }],
    outputs: [{ name: "", type: "uint256" as const }],
  },
  {
    name: "isOperator",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "account", type: "address" as const }],
    outputs: [{ name: "", type: "bool" as const }],
  },
];

// Simple in-memory cooldown: one request per address per 60 seconds
const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export async function POST(req: NextRequest) {
  // Hard block on mainnet — never mint free tokens in production
  if (!IS_TESTNET) {
    return NextResponse.json(
      { error: "Faucet is only available on Kortana Testnet. On mainnet, swap DNR → mdUSD to acquire tokens." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const address: string = body.address ?? "";

    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    // Rate limit
    const addrKey = address.toLowerCase();
    const lastRequest = cooldowns.get(addrKey) ?? 0;
    const now = Date.now();
    if (now - lastRequest < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - lastRequest)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${wait}s before requesting again.` },
        { status: 429 }
      );
    }

    // Deployer private key — set DEPLOYER_PRIVATE_KEY in Render environment variables
    const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY ?? "";
    if (!rawKey) {
      return NextResponse.json({ error: "Faucet not configured (missing deployer key)" }, { status: 500 });
    }
    const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;

    const account = privateKeyToAccount(privateKey);

    const publicClient = createPublicClient({
      chain: KORTANA_TESTNET,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: KORTANA_TESTNET,
      transport: http(),
    });

    // Verify the deployer is an operator before attempting mint
    const isOp = await publicClient.readContract({
      address: MDUSD_ADDRESS,
      abi: MDUSD_ABI,
      functionName: "isOperator",
      args: [account.address],
    });

    if (!isOp) {
      return NextResponse.json(
        { error: "Faucet account is not an mdUSD operator. Re-run deploy script." },
        { status: 500 }
      );
    }

    const hash = await walletClient.writeContract({
      address: MDUSD_ADDRESS,
      abi: MDUSD_ABI,
      functionName: "mint",
      args: [address as `0x${string}`, FAUCET_AMOUNT],
    });

    // Mark cooldown after successful submission
    cooldowns.set(addrKey, now);

    return NextResponse.json({ success: true, hash, amount: formatEther(FAUCET_AMOUNT) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Faucet request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
