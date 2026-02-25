/**
 * Kortana Wallet - Content Script
 */

// Inject inpage.js
try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('inpage.js');
    scriptTag.setAttribute('async', 'false');
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
} catch (e) {
    console.error('Kortana Wallet: Injection failed', e);
}

// Relay messages between inpage.js and background.js
window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.source !== 'kortana-inpage') return;

    chrome.runtime.sendMessage(event.data, (response) => {
        window.postMessage({
            source: 'kortana-contentscript',
            id: event.data.id,
            ...response
        }, '*');
    });
});

// Listen for events from background script (like account changed)
chrome.runtime.onMessage.addListener((message) => {
    if (message.source === 'kortana-background') {
        window.postMessage({
            source: 'kortana-contentscript',
            event: message.event,
            data: message.data
        }, '*');
    }
});
