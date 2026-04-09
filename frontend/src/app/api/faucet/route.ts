import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseEther, formatEther, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ACTIVE_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "72511", 10);
const IS_TESTNET = ACTIVE_CHAIN_ID === 72511;

const KORTANA_TESTNET = {
  id: 72511,
  name: "Kortana Testnet",
  nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls: { default: { http: ["https://poseidon-rpc.testnet.kortana.xyz/"] } },
} as const;

// KortanaMonoDEX — the single contract that IS the mdUSD token + pool
const DEX_ADDRESS = "0xA7b11655DeE84cF8BEE727fFf7539d6D300212e3" as const;
const FAUCET_AMOUNT = parseEther("10000"); // 10,000 mdUSD per request

const DEX_ABI = [
  {
    name: "mint",
    type: "function" as const,
    stateMutability: "nonpayable" as const,
    inputs: [
      { name: "to",     type: "address" as const },
      { name: "amount", type: "uint256" as const },
    ],
    outputs: [],
  },
  {
    name: "isOperator",
    type: "function" as const,
    stateMutability: "view" as const,
    inputs: [{ name: "op", type: "address" as const }],
    outputs: [{ name: "", type: "bool" as const }],
  },
] as const;

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export async function POST(req: NextRequest) {
  if (!IS_TESTNET) {
    return NextResponse.json(
      { error: "Faucet is only available on Kortana Testnet." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const address: string = body.address ?? "";

    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

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

    const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY ?? "";
    if (!rawKey) {
      return NextResponse.json(
        { error: "Faucet not configured — PRIVATE_KEY missing." },
        { status: 500 }
      );
    }
    const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
    const account = privateKeyToAccount(privateKey);

    const publicClient = createPublicClient({
      chain: KORTANA_TESTNET,
      transport: http(),
    });

    // Verify this wallet is the operator (or owner) of the DEX
    const isOp = await publicClient.readContract({
      address: DEX_ADDRESS,
      abi: DEX_ABI,
      functionName: "isOperator",
      args: [account.address],
    }) as boolean;

    if (!isOp) {
      return NextResponse.json(
        { error: `Faucet wallet (${account.address}) is not an operator of the DEX contract.` },
        { status: 503 }
      );
    }

    // Use sendRawTransaction to bypass viem's gas estimation (Kortana eth_estimateGas is broken)
    const nonce = await publicClient.getTransactionCount({ address: account.address });
    const data  = encodeFunctionData({
      abi: DEX_ABI,
      functionName: "mint",
      args: [address as `0x${string}`, FAUCET_AMOUNT],
    });

    const { signTransaction } = account;

    // Build and sign a legacy type-0 transaction
    const rawTx = await signTransaction({
      to: DEX_ADDRESS,
      data,
      value: 0n,
      gas: 200000n,
      gasPrice: 1n,
      nonce,
      chainId: 72511,
      type: "legacy",
    });

    const hash = await publicClient.sendRawTransaction({ serializedTransaction: rawTx });

    cooldowns.set(addrKey, now);

    return NextResponse.json({
      success: true,
      hash,
      amount: formatEther(FAUCET_AMOUNT),
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Faucet request failed";
    console.error("Faucet error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
