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

const MDUSD_ADDRESS = "0x371DeB6F2Bce2c9b3de001F4273b22A0abE03025" as const;
const FAUCET_AMOUNT = parseEther("10000"); // 10,000 mdUSD per request

// Simple transfer — no minting, no operator check needed.
// The faucet wallet just needs to hold mdUSD (pre-funded via fund_faucet.ts).
const MDUSD_ABI = [
  {
    name: "transfer",
    type: "function" as const,
    stateMutability: "nonpayable" as const,
    inputs: [
      { name: "to",     type: "address" as const },
      { name: "amount", type: "uint256" as const },
    ],
    outputs: [{ name: "", type: "bool" as const }],
  },
  {
    name: "balanceOf",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "account", type: "address" as const }],
    outputs: [{ name: "", type: "uint256" as const }],
  },
];

// Simple in-memory cooldown: one request per address per 60 seconds
const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export async function POST(req: NextRequest) {
  // Hard block on mainnet — never send free tokens in production
  if (!IS_TESTNET) {
    return NextResponse.json(
      { error: "Faucet is only available on Kortana Testnet. On mainnet, swap DNR → mdUSD." },
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

    // Load deployer key
    const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY ?? "";
    if (!rawKey) {
      return NextResponse.json(
        { error: "Faucet not configured — PRIVATE_KEY missing from environment." },
        { status: 500 }
      );
    }
    const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
    const account = privateKeyToAccount(privateKey);

    const publicClient = createPublicClient({
      chain: KORTANA_TESTNET,
      transport: http(),
    });

    // Check faucet wallet has enough mdUSD to transfer
    const faucetBalance = await publicClient.readContract({
      address: MDUSD_ADDRESS,
      abi: MDUSD_ABI,
      functionName: "balanceOf",
      args: [account.address],
    }) as bigint;

    if (faucetBalance < FAUCET_AMOUNT) {
      return NextResponse.json(
        {
          error:
            `Faucet wallet (${account.address}) has insufficient mdUSD. ` +
            `Balance: ${formatEther(faucetBalance)}. ` +
            `Run scripts/fund_faucet.ts to restock.`,
        },
        { status: 503 }
      );
    }

    const walletClient = createWalletClient({
      account,
      chain: KORTANA_TESTNET,
      transport: http(),
    });

    // Simple ERC20 transfer — no operator/owner needed
    const hash = await walletClient.writeContract({
      address: MDUSD_ADDRESS,
      abi: MDUSD_ABI,
      functionName: "transfer",
      args: [address as `0x${string}`, FAUCET_AMOUNT],
    });

    cooldowns.set(addrKey, now);

    return NextResponse.json({
      success: true,
      hash,
      amount: formatEther(FAUCET_AMOUNT),
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Faucet request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
