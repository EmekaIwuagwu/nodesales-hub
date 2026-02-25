/**
 * Kortana Wallet - Inpage Provider (EIP-1193)
 */
(function () {
    class KortanaProvider {
        constructor() {
            this._requestId = 0;
            this._listeners = {};
            this.isKortana = true;
            this.isMetaMask = false; // Be honest, but some dApps look for this

            // Listen for responses from content script
            window.addEventListener('message', (event) => {
                if (event.source !== window || event.data.source !== 'kortana-contentscript') return;

                const { id, result, error, event: eventName, data } = event.data;

                if (eventName) {
                    this._emit(eventName, data);
                    return;
                }

                // Handle RPC response
                const listener = this._listeners[id];
                if (listener) {
                    delete this._listeners[id];
                    if (error) listener.reject(error);
                    else listener.resolve(result);
                }
            });
        }

        request(args) {
            return new Promise((resolve, reject) => {
                const id = this._requestId++;
                this._listeners[id] = { resolve, reject };

                window.postMessage({
                    source: 'kortana-inpage',
                    id,
                    method: args.method,
                    params: args.params
                }, '*');
            });
        }

        on(eventName, handler) {
            if (!this._listeners[eventName]) this._listeners[eventName] = [];
            this._listeners[eventName].push(handler);
        }

        removeListener(eventName, handler) {
            if (!this._listeners[eventName]) return;
            this._listeners[eventName] = this._listeners[eventName].filter(h => h !== handler);
        }

        _emit(eventName, data) {
            if (this._listeners[eventName]) {
                this._listeners[eventName].forEach(handler => handler(data));
            }
        }
    }

    window.ethereum = new KortanaProvider();
    window.dispatchEvent(new Event('ethereum#initialized'));
})();
