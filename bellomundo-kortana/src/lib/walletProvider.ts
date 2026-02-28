import { parseEther } from "viem";

const WALLET_KEY = 'bm_active_wallet';

const KORTANA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_KORTANA_CHAIN_ID) || 72511;
const KORTANA_CHAIN_HEX = `0x${KORTANA_CHAIN_ID.toString(16)}`;
const KORTANA_RPC = process.env.NEXT_PUBLIC_KORTANA_RPC_URL || 'https://poseidon-rpc.testnet.kortana.xyz/';
const KORTANA_EXPLORER = process.env.NEXT_PUBLIC_KORTANA_EXPLORER || 'https://explorer.testnet.kortana.xyz';

// ─── Wallet ID Storage ────────────────────────────────────────────────────────

/** Called by WalletModal after successful login. */
export function setActiveWalletId(id: 'kortana' | 'metamask' | 'injected') {
    if (typeof window !== 'undefined') {
        localStorage.setItem(WALLET_KEY, id);
        console.log('[Wallet] Active wallet set to:', id);
    }
}

/** Returns stored wallet id or null */
export function getActiveWalletId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WALLET_KEY);
}

/** Clears wallet on logout */
export function clearActiveWallet() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(WALLET_KEY);
        console.log('[Wallet] Active wallet cleared.');
    }
}

// ─── Provider Resolution ──────────────────────────────────────────────────────

/**
 * Returns the raw EIP-1193 provider for the wallet the citizen used to sign in.
 *
 * Key logic:
 * - For MetaMask: use window.ethereum.providers[] (EIP-5164) to find the REAL
 *   MetaMask — not Kortana's wrapper which intercepts window.ethereum.
 * - For Kortana: use window.kortana directly (bypasses any wrapping).
 * - Fallback: window.ethereum (whatever the browser provides).
 */
export function getActiveProvider(): any | null {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    const id = getActiveWalletId();

    console.log('[Wallet] Resolving provider for wallet id:', id || 'AUTO-DETECT');

    // ── Kortana Wallet ─────────────────────────────────────────────────
    if (id === 'kortana' || (!id && w.kortana)) {
        const p = w.kortana;
        if (p) {
            console.log('[Wallet] Using Kortana provider (native)');
            return p;
        }
    }

    // ── MetaMask ───────────────────────────────────────────────────────
    if (id === 'metamask') {
        if (w.ethereum?.providers?.length) {
            const mm = w.ethereum.providers.find(
                (p: any) => p.isMetaMask && !p.isKortana
            );
            if (mm) { console.log('[Wallet] MetaMask found via providers[]'); return mm; }
            return w.ethereum.providers[0];
        }
        if (w.ethereum) { console.log('[Wallet] Using window.ethereum (MetaMask)'); return w.ethereum; }
        return null;
    }

    // ── Auto-detect Fallback ──────────────────────────────────────────
    if (w.ethereum?.providers?.length) {
        const mm = w.ethereum.providers.find((p: any) => p.isMetaMask);
        if (mm) return mm;
        return w.ethereum.providers[0];
    }
    return w.ethereum || null;
}

// ─── Chain Switching ──────────────────────────────────────────────────────────

/**
 * Ensures the active wallet is switched to the Kortana network.
 * Silent on error — the transaction will fail with a clear message instead.
 */
async function ensureKortanaChain(provider: any): Promise<void> {
    try {
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: KORTANA_CHAIN_HEX }],
        });
    } catch (switchErr: any) {
        if (switchErr?.code === 4902 || switchErr?.code === -32603) {
            // Chain not added — add it
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: KORTANA_CHAIN_HEX,
                    chainName: 'Kortana Testnet',
                    nativeCurrency: { name: 'Dinar', symbol: 'DNR', decimals: 18 },
                    rpcUrls: [KORTANA_RPC],
                    blockExplorerUrls: [KORTANA_EXPLORER],
                }],
            });
        }
        // If user rejected the switch, continue and let tx fail naturally
    }
}

// ─── Transaction Sending ──────────────────────────────────────────────────────

const TREASURY = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

export interface SendTxParams {
    to?: string;           // defaults to TREASURY
    valueEther: string;    // human-readable ether/DNR amount
    paymentType: string;   // 'housing' | 'transport' | 'utility'
    description: string;
    serviceType: string;
    amount?: string;       // display amount
}

export interface SendTxResult {
    txHash: string;
    from: string;
}

/**
 * Full settlement flow:
 * 1. Resolve provider from stored wallet id
 * 2. Request accounts
 * 3. Switch to Kortana chain
 * 4. Send transaction
 * 5. Returns txHash + from address
 */
export async function executeSettlement(params: SendTxParams): Promise<SendTxResult> {
    const provider = getActiveProvider();

    if (!provider) {
        const id = getActiveWalletId();
        if (!id) {
            throw new Error('NO_WALLET_STORED: Please log out and log back in, then try again.');
        }
        throw new Error(`WALLET_NOT_FOUND: ${id} wallet was not detected. Make sure the extension is active.`);
    }

    // Step 1: Get accounts
    console.log('[Settlement] Requesting accounts...');
    const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
    const from = accounts?.[0];
    if (!from) throw new Error('No account available in wallet.');
    console.log('[Settlement] Account:', from);

    // Step 2: Ensure Kortana chain
    console.log('[Settlement] Switching to Kortana chain...');
    await ensureKortanaChain(provider);

    // Step 3: Build transaction
    const to = params.to || TREASURY;
    // CRITICAL: use parseEther to handle decimals safely.
    // parseFloat * 1e18 will crash BigInt() for many values (scientific notation).
    const valueWei = parseEther(params.valueEther);
    const valueHex = `0x${valueWei.toString(16)}`;
    console.log('[Settlement] Sending tx:', { from, to, value: valueHex });

    // Step 4: Send — wallet shows signing popup
    const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
            from,
            to,
            value: valueHex,
            gas: '0x5208', // 21000 — standard for native token transfers
        }],
    });

    if (!txHash) throw new Error('Transaction returned no hash.');
    console.log('[Settlement] TX Hash:', txHash);

    return { txHash, from };
}
