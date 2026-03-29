/**
 * Kortana Node License — Frontend Logic
 * Senior Blockchain Engineer Implementation
 */

// --- Starfield Animation ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
const starCount = 200;

function initStarfield() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            opacity: Math.random() * 0.7 + 0.3,
            speed: Math.random() * 0.2 + 0.05
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStarfield);
initStarfield();
animateStars();

// --- ROI Calculator ---
const tierRewards = {
    0: { price: 300, dnr: 14600 },
    1: { price: 500, dnr: 29200 },
    2: { price: 1000, dnr: 73000 },
    3: { price: 2000, dnr: 146000 }
};

function calculateROI() {
    const tier = document.getElementById('calcTier').value;
    const price = parseFloat(document.getElementById('calcPrice').value);
    
    const data = tierRewards[tier];
    const annualDNR = data.dnr;
    const annualUSD = annualDNR * price;
    const roi = (annualUSD / data.price) * 100;
    
    // Update UI
    document.getElementById('resInvestment').innerText = `$${data.price.toLocaleString()}`;
    document.getElementById('resDNR').innerText = `${annualDNR.toLocaleString()} DNR`;
    document.getElementById('resUSD').innerText = `$${annualUSD.toLocaleString()}`;
    document.getElementById('resROI').innerText = `${roi.toFixed(1)}%`;
}

// Initial calculation
calculateROI();

// --- MetaMask Integration ---
async function addNetwork(chainId) {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    
    const networks = {
        9002: {
            chainId: "0x232A", // Hex for 9002
            chainName: "Kortana Mainnet",
            nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
            rpcUrls: ["https://zeus-rpc.mainnet.kortana.xyz"],
            blockExplorerUrls: ["https://explorer.mainnet.kortana.xyz"]
        },
        72511: {
            chainId: "0x11B3F", // Hex for 72511
            chainName: "Kortana Testnet",
            nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
            rpcUrls: ["https://poseidon-rpc.testnet.kortana.xyz/"],
            blockExplorerUrls: ["https://explorer.testnet.kortana.xyz"]
        }
    };
    
    const params = networks[chainId];
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
        });
    } catch (error) {
        console.error("User rejected network addition", error);
    }
}

// --- Tabs for MetaMask Section ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
    });
});

// --- FAQ Accordion ---
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        const answer = item.querySelector('.faq-answer');
        const span = q.querySelector('span');
        
        const isOpen = answer.style.display === 'block';
        
        // Close others
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-question span').forEach(s => s.innerText = '+');
        
        if (!isOpen) {
            answer.style.display = 'block';
            span.innerText = '-';
        }
    });
});

// --- Live Supply Tracking ---
const NFT_ADDRESS = "0x53A816C9961131B778475664CAF2D318B30eC596"; // Testnet Address
const NFT_ABI = [
    "function totalMinted(uint8 tier) view returns (uint256)",
    "function maxSupply(uint8 tier) view returns (uint256)"
];

async function loadSupplyStats() {
    try {
        const provider = new ethers.JsonRpcProvider("https://poseidon-rpc.testnet.kortana.xyz/");
        const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

        for (let i = 0; i < 4; i++) {
            const minted = await nftContract.totalMinted(i);
            const max = await nftContract.maxSupply(i);
            
            const percentage = (Number(minted) / Number(max)) * 100;
            
            document.getElementById(`supplyFill${i}`).style.width = `${percentage}%`;
            document.getElementById(`supplyInfo${i}`).innerText = `${minted} / ${max} minted`;
        }
    } catch (error) {
        console.warn("Supply stats failed to load (Check NFT_ADDRESS):", error.message);
    }
}

loadSupplyStats();
setInterval(loadSupplyStats, 30000); // 30s update

// --- Real Blockchain Stats Fetching ---
async function updateStats() {
    try {
        const provider = new ethers.JsonRpcProvider("https://zeus-rpc.mainnet.kortana.xyz");
        const blockNumber = await provider.getBlockNumber();
        const statEl = document.getElementById('statBlocks');
        if (statEl) statEl.innerText = blockNumber.toLocaleString();
        
        const valEl = document.getElementById('statValidators');
        if (valEl) valEl.innerText = "50";
    } catch (error) {
        console.warn("Real network stats fetch failed:", error.message);
    }
}

setInterval(updateStats, 15000); // 15s update
updateStats();

// --- MetaMask Connection ---
async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask to connect your wallet.");
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const btn = document.getElementById('connectWalletBtn');
        if (btn) {
            btn.innerText = account.substring(0, 6) + "..." + account.substring(38);
            btn.classList.add('connected');
        }
        console.log("Connected to:", account);
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
}

// --- Form Submission ---
const applyForm = document.getElementById('applyForm');
const successMessage = document.getElementById('successMessage');

applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const hash = document.getElementById('tronHash').value.trim();
    const address = document.getElementById('kortanaAddress').value.trim();
    const email = document.getElementById('email').value.trim();
    const tierEl = applyForm.querySelector('input[name="tier"]:checked');
    const tier = tierEl ? tierEl.value : 'Unknown';
    const message = applyForm.querySelector('textarea[name="message"]').value.trim();

    if (hash.length < 10) {
        alert("Please provide a valid Transaction Hash (at least 10 characters).");
        return;
    }
    if (!address.startsWith('0x') || address.length < 10) {
        alert("Please provide a valid Kortana Wallet Address starting with 0x.");
        return;
    }

    const btn = applyForm.querySelector('.btn-submit');
    const originalText = btn.innerText;
    btn.innerText = "SENDING APPLICATION...";
    btn.disabled = true;

    // Build the mailto fallback (always works, zero dependencies)
    const subject = encodeURIComponent(`[Kortana Node Sale] New ${tier} Application`);
    const body = encodeURIComponent(
        `NEW NODE LICENSE APPLICATION\n` +
        `==============================\n` +
        `Tier: ${tier}\n` +
        `Tron/BEP20 TX Hash: ${hash}\n` +
        `Kortana Wallet: ${address}\n` +
        `Applicant Email: ${email}\n` +
        `Notes: ${message || 'None'}\n` +
        `==============================\n` +
        `Submitted: ${new Date().toUTCString()}`
    );

    // --- PRIMARY: SMTP Relay (Vercel API in production, localhost in dev) ---
    let sent = false;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocal ? 'http://localhost:3001/apply' : '/api/apply';

    try {
        const payload = { tier, tron_hash: hash, kortana_address: address, email, message };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("SMTP Relay response:", response.status, data);

        if (response.ok && data.success) {
            sent = true;
            console.log("✅ Email sent via SMTP successfully.");
        } else {
            console.warn("⚠️ SMTP Relay rejected:", data.error);
        }
    } catch (err) {
        console.warn("⚠️ SMTP server unreachable:", err.message);
    }

    // --- FALLBACK: mailto (always opens email client with pre-filled data) ---
    if (!sent) {
        console.log("Falling back to mailto...");
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    // Show success UI regardless (user has their data to send)
    setTimeout(() => {
        applyForm.classList.add('hidden');
        successMessage.classList.remove('hidden');
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.innerText = originalText;
        btn.disabled = false;
    }, 800);
});

// --- GSAP Animations ---
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline();
tl.from('.badge-pill', { y: -50, opacity: 0, duration: 0.8, ease: 'back.out' })
  .from('.hero-title .line', { y: 100, opacity: 0, duration: 1, stagger: 0.2, ease: 'power4.out' }, '-=0.4')
  .from('.hero-subtitle', { opacity: 0, duration: 1 }, '-=0.6')
  .from('.hero-ctas .btn', { scale: 0.8, opacity: 0, stagger: 0.2, duration: 0.6, ease: 'back.out' }, '-=0.6')
  .from('.live-stats-bar', { y: 50, opacity: 0, duration: 0.8 }, '-=0.4');

gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    });
});

gsap.utils.toArray('.tier-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 90%",
        },
        opacity: 0,
        scale: 0.9,
        y: 30,
        delay: i * 0.1,
        duration: 0.8,
        ease: 'back.out'
    });
});

// --- Utilities ---
function copyAddress(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "COPIED!";
        btn.classList.add('success');
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('success');
        }, 2000);
    });
}

function selectTier(tierId) {
    const tierSelect = document.getElementById('calcTier');
    tierSelect.value = tierId;
    calculateROI();
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
    const radios = document.getElementsByName('tier');
    if (radios[tierId]) radios[tierId].checked = true;
}
