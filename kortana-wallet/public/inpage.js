/**
 * Kortana Wallet - Inpage Provider (EIP-1193 + EIP-6963)
 * Full Wagmi v3 / viem compatibility
 */
(function () {
    class KortanaProvider {
        constructor() {
            this._rpcId = 0;
            this._rpcCallbacks = {};   // id -> {resolve, reject}
            this._eventListeners = {}; // eventName -> handler[]
            this.isKortana = true;
            this.isMetaMask = false;

            // Bind all methods upfront so 'this' is never lost when
            // Wagmi/viem destructures the provider or calls methods indirectly.
            this.request = this.request.bind(this);
            this.on = this.on.bind(this);
            this.removeListener = this.removeListener.bind(this);
            // DOM-style aliases – Wagmi v3 calls these internally
            this.addEventListener = this.on.bind(this);
            this.removeEventListener = this.removeListener.bind(this);
            // Some connectors call provider.emit() directly
            this.emit = this._emit.bind(this);

            window.addEventListener('message', (event) => {
                if (!event.data || event.source !== window) return;
                const msg = event.data;
                if (msg.source !== 'kortana-contentscript') return;

                const { id, result, error, event: eventName, data } = msg;

                if (eventName) {
                    // Incoming EIP-1193 event (accountsChanged, chainChanged…)
                    this._emit(eventName, data);
                    return;
                }

                // Resolve/reject a pending RPC call matched by ID
                const cb = this._rpcCallbacks[id];
                if (cb) {
                    delete this._rpcCallbacks[id];
                    if (error) {
                        const err = new Error(error.message || 'RPC Error');
                        err.code = error.code;
                        cb.reject(err);
                    } else {
                        cb.resolve(result);
                    }
                }
            });
        }

        async request(args) {
            if (!args || typeof args.method !== 'string') {
                throw new Error('Kortana Wallet: Invalid RPC request.');
            }
            return new Promise((resolve, reject) => {
                const id = this._rpcId++;
                this._rpcCallbacks[id] = { resolve, reject };
                window.postMessage({
                    source: 'kortana-inpage',
                    id,
                    method: args.method,
                    params: args.params != null ? args.params : []
                }, '*');
            });
        }

        on(eventName, handler) {
            if (typeof handler !== 'function') return this;
            if (!this._eventListeners[eventName]) this._eventListeners[eventName] = [];
            this._eventListeners[eventName].push(handler);
            return this;
        }

        removeListener(eventName, handler) {
            if (!this._eventListeners[eventName]) return this;
            this._eventListeners[eventName] =
                this._eventListeners[eventName].filter(h => h !== handler);
            return this;
        }

        _emit(eventName, data) {
            (this._eventListeners[eventName] || []).forEach(h => {
                try { h(data); } catch (e) {
                    console.error('[KortanaWallet] event handler error:', e);
                }
            });
        }
    }

    const provider = new KortanaProvider();
    window.kortana = provider;

    // ── EIP-6963 Multi-Injected Provider Discovery ───────────────────────────
    const PROVIDER_INFO = Object.freeze({
        uuid: 'e05d04c0-7f55-4424-b19d-725110000001',
        name: 'Kortana Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMDYwNjA2Ii8+PHBhdGggZD0iTTIwIDEwTDEwIDE1VjI1TDIwIDMwTDMwIDI1VjE1TDIwIDEwWiIgc3Ryb2tlPSIjMzhCREY4IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
        rdns: 'xyz.kortana.wallet',
    });

    const announce = () => {
        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
            detail: Object.freeze({ info: PROVIDER_INFO, provider }),
        }));
    };
    window.addEventListener('eip6963:requestProvider', announce);
    announce();

    // Only take window.ethereum if no other wallet claimed it first
    if (!window.ethereum) {
        window.ethereum = provider;
        window.dispatchEvent(new Event('ethereum#initialized'));
    }
    window.dispatchEvent(new Event('kortana#initialized'));
})();
