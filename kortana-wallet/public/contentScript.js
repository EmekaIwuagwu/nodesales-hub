/**
 * Kortana Wallet - Content Script
 */

// Inject inpage.js into the page context so it can set window.kortana.
// The script tag must remain in the DOM long enough to execute — we remove it
// only AFTER the browser has loaded and run the script (onload callback).
try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('inpage.js');
    scriptTag.type = 'text/javascript';

    // Only remove the tag after the script has fully executed
    scriptTag.onload = function () {
        scriptTag.remove();
    };
    scriptTag.onerror = function (e) {
        console.error('[Kortana Wallet] Failed to load inpage.js', e);
    };

    // Insert at the very top so it runs before any dApp code
    container.insertBefore(scriptTag, container.firstChild);
} catch (e) {
    console.error('[Kortana Wallet] Injection failed', e);
}

// Relay RPC messages from inpage.js → background service worker
window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'kortana-inpage') return;

    chrome.runtime.sendMessage(event.data, (response) => {
        if (chrome.runtime.lastError) {
            // Background worker may have been suspended — reply with an error
            window.postMessage({
                source: 'kortana-contentscript',
                id: event.data.id,
                error: { code: -32603, message: chrome.runtime.lastError.message }
            }, '*');
            return;
        }
        window.postMessage({
            source: 'kortana-contentscript',
            id: event.data.id,
            ...response
        }, '*');
    });
});

// Relay push events from background → inpage (accountsChanged, chainChanged, etc.)
chrome.runtime.onMessage.addListener((message) => {
    if (message.source === 'kortana-background') {
        window.postMessage({
            source: 'kortana-contentscript',
            event: message.event,
            data: message.data
        }, '*');
    }
});
