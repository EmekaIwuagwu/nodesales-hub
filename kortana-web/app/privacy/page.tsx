import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Kortana Blockchain",
    description:
        "Kortana's comprehensive Privacy Policy — covering the Kortana Wallet Chrome Extension, web platform, mobile applications, and blockchain infrastructure. Compliant with GDPR, CCPA, and Chrome Web Store User Data Policy.",
    alternates: {
        canonical: "https://kortana.network/privacy",
    },
    openGraph: {
        title: "Privacy Policy | Kortana Blockchain",
        description:
            "Read the full Kortana Privacy Policy covering data collection, usage, storage, and your rights as a user of the Kortana ecosystem.",
        url: "https://kortana.network/privacy",
    },
};

const sections = [
    {
        id: "overview",
        title: "1. Overview & Scope",
        content: `This Privacy Policy ("Policy") is published by the Kortana Foundation ("Kortana", "we", "our", or "us") and governs the collection, processing, storage, and disclosure of personal data and information generated through your use of:

• The **Kortana Wallet** Chrome Browser Extension (Chrome Web Store Item ID: efbodlbedoer/mcla/lkkkldahekahldmdeg)
• The **Kortana Web Platform** at kortana.network and all subdomain properties
• The **Kortana Mobile Wallet** applications (iOS and Android)
• The **Kortana Blockchain Networks** (Mainnet Chain ID 9002, Testnet Chain ID 9001)
• The **Kortana IDE (Kortana Studio)** web and desktop development environment
• The **Kortana Block Explorers** (explorer.kortana.network and related endpoints)
• The **Kortana Faucet** and developer infrastructure services
• Any API, SDK, or developer tool published under the Kortana namespace

This Policy is effective as of March 12, 2026. By accessing or using any part of the Kortana ecosystem, you acknowledge that you have read, understood, and agree to be bound by this Policy. If you do not agree, please discontinue use immediately.

This Policy is specifically designed to comply with:
• The **Chrome Web Store Developer Program Policies** (User Data Privacy requirements)
• The **General Data Protection Regulation (GDPR)** — EU 2016/679
• The **California Consumer Privacy Act (CCPA)** — Cal. Civ. Code § 1798.100 et seq.
• The **Children's Online Privacy Protection Act (COPPA)**`,
    },
    {
        id: "wallet-extension",
        title: "2. Kortana Wallet Chrome Extension — Specific Disclosures",
        content: `In accordance with the **Chrome Web Store User Data Privacy Policy**, we make the following specific disclosures regarding the Kortana Wallet browser extension:

**2.1 Data Collected by the Extension**

The Kortana Wallet extension collects and processes the following categories of data solely to power its core functionality:

| Data Type | Purpose | Stored Locally | Transmitted Externally |
|---|---|---|---|
| Wallet Public Address | Display balance, transaction history | Yes (encrypted) | Yes — to Kortana RPC nodes only |
| Encrypted Private Key / Seed Phrase | Account signing operations | Yes — AES-256, user-password-locked | **Never** |
| Transaction History | Display activity log | Yes (local cache) | Queried from public blockchain |
| Network Configuration | Connect to correct chain | Yes | No |
| User Preferences (theme, currency) | UI personalisation | Yes | No |

**2.2 Data We Do NOT Collect**

We explicitly confirm that the Kortana Wallet extension does **NOT**:
- Collect, transmit, or share your private keys or seed phrases to any server, including our own
- Track your browsing history or activity outside of wallet-specific interactions
- Sell, rent, or monetise any user data to any third party for advertising
- Use data for purposes unrelated to the core wallet functionality described above
- Collect data for credit, insurance, lending, or employment purposes
- Share data with data brokers

**2.3 Permissions Justification**

The Kortana Wallet extension requests the following Chrome permissions and they are used only as described:

• \`storage\` — Required to persist your encrypted wallet keys, network preferences, and transaction history locally in Chrome's secure storage API. Data never leaves your device without explicit user action.
• \`activeTab\` — Required to detect dApp connection requests from websites you are currently visiting, enabling WalletConnect and Web3 dApp interaction.
• \`scripting\` — Required to inject the \`window.kortana\` Web3 provider object into pages, enabling EVM-compatible dApp interaction (equivalent to MetaMask's standard pattern).
• \`notifications\` — Used solely to notify you of completed transactions, pending signature requests, and wallet activity. Never used for marketing.
• \`host_permissions\` (\`https://*/*\`) — Required to enable dApp detection and Web3 provider injection into websites at the user's request. No browsing data is collected.

**2.4 Remote Code Policy**

The Kortana Wallet extension does **not** load or execute any remote code. All JavaScript is bundled and reviewed as part of the Chrome Web Store submission package. No eval() or dynamic script loading is performed on external data.

**2.5 Data Retention for Extension**

All extension data is stored exclusively on your local device using Chrome's \`chrome.storage.local\` API. Kortana servers never receive a copy of this data. You can delete all data at any time by uninstalling the extension or using the "Reset Wallet" feature in extension Settings.`,
    },
    {
        id: "data-collection",
        title: "3. Information We Collect",
        content: `**3.1 Information You Provide Directly**

• **Account Registration** (Kortana Studio / Developer Portal): When creating a developer account, we collect your email address, username, and organisation name (optional).
• **Support Communications**: If you contact our support team, we collect the contents of your messages, your email address, and any attachments you provide.
• **Faucet Requests**: To prevent abuse, our testnet faucet collects your wallet address and IP address for rate-limiting purposes only. IP addresses are hashed and not retained beyond 24 hours.
• **Bug Reports / Feedback**: Voluntary submissions via our GitHub or feedback forms.

**3.2 Information Collected Automatically**

• **Blockchain Transactions**: All transactions broadcast to the Kortana public blockchain are publicly visible by design. This is an inherent property of distributed ledger technology and falls outside the scope of data privacy regulation. We do not collect this data — it is recorded by the decentralised network.
• **RPC Node Requests**: When your wallet queries our hosted RPC endpoints (rpc.kortana.network, testnet-rpc.kortana.network), your wallet address and request metadata (block number, gas price queries) are processed in memory to serve the response. We retain anonymised RPC access logs for **72 hours** for security and infrastructure purposes only.
• **Web Platform Analytics**: We use **privacy-respecting, self-hosted analytics** (no Google Analytics, no Meta Pixel). We collect page views, referral source (anonymised), browser type, and country (not city). No personal identifiers.
• **Error Monitoring**: Anonymised crash reports and error stack traces may be collected to improve product stability. These are stripped of wallet addresses and personal identifiers before collection.

**3.3 Information We Never Collect**

• Private keys, seed phrases, or wallet passwords — under any circumstance
• Precise geolocation data
• Contents of private dApp sessions not explicitly shared with Kortana
• Biometric data
• Health or financial data beyond on-chain public records`,
    },
    {
        id: "data-use",
        title: "4. How We Use Your Information",
        content: `We use information collected for the following **strictly defined** purposes only. We operate on a **data minimisation** principle — we collect only what is necessary and use it only as described.

**4.1 Core Service Provision**
- Operate and maintain the Kortana blockchain network infrastructure
- Process RPC requests and serve blockchain data to wallets and dApps
- Provide developer tools, faucet, and block explorer services

**4.2 Security and Fraud Prevention**
- Detect and prevent abuse of faucet services (rate limiting)
- Monitor for network attacks, spam transactions, and protocol-level threats
- Investigate security incidents when reported

**4.3 Product Improvement**
- Analyse anonymised, aggregated usage patterns to improve user experience
- Fix bugs and optimise performance based on anonymised error reports

**4.4 Communications (Opt-In Only)**
- Send transactional emails (e.g., password resets, grant confirmations) — these are never promotional unless you have explicitly opted in
- Developer changelog and update notifications to registered developers — fully opt-out at any time

**4.5 Legal Compliance**
- Comply with applicable law, regulation, or lawful government request
- Enforce our Terms of Service where necessary

**We do not:**
- Sell your personal data to third parties
- Use your data for targeted advertising or ad networks
- Profile users based on off-chain behaviour
- Engage in automated decision making with legal or significant effects on users`,
    },
    {
        id: "data-sharing",
        title: "5. Data Sharing & Third-Party Disclosure",
        content: `**5.1 No Data Sales**

Kortana does not sell, trade, rent, or otherwise transfer your personal data to third parties for commercial gain. Period.

**5.2 Service Providers**

We share limited data with trusted service providers who assist in operating our platform, under strict data processing agreements:

| Service Provider | Category | Data Shared | Purpose |
|---|---|---|---|
| Cloud Infrastructure (self-hosted VPS) | Hosting | Server logs (IP, timestamp) | Network operation |
| GitHub | Code hosting | Public repository data | Open source development |
| Sendgrid / Email Provider | Transactional email | Email address only | Account notifications |

No marketing data platforms, advertising networks, or data brokers are used.

**5.3 Legal Requests**

We may disclose information if required by law, court order, or governmental authority. Where legally permitted, we will notify affected users of such requests. We will challenge overbroad or legally deficient requests.

**5.4 Business Transfers**

In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity. We will provide advance notice and ensure the successor commits to equivalent privacy protections.

**5.5 Anonymised Aggregate Data**

We may publish anonymised, aggregate statistics (e.g., "Kortana processed 5 million transactions this quarter") that cannot be used to identify any individual user.`,
    },
    {
        id: "blockchain-data",
        title: "6. Blockchain Data & Public Ledger Disclosure",
        content: `**6.1 The Public Nature of Blockchain**

Kortana is a public, permissionless Layer 1 blockchain. All transactions broadcast to the Kortana network — including sender address, receiver address, value transferred, smart contract interactions, and gas fees — are permanently and publicly recorded on the blockchain by design.

This is not a privacy violation but a fundamental and disclosed property of public distributed ledger technology. Users must be aware that:

• **Wallet addresses are pseudonymous, not anonymous.** While they are not directly linked to your legal identity by Kortana, transactions may be traceable through on-chain analysis.
• **Smart contract deployments** and their source code (if verified) are publicly visible on the Kortana Block Explorer.
• **We cannot delete or modify blockchain records.** Once a transaction is confirmed, it is immutable and cannot be removed even upon user request.

**6.2 Wallet Address Privacy**

We recommend users take responsibility for their own pseudonymity by:
• Using separate addresses for different purposes
• Not publicly linking wallet addresses to personal identity unless intentional
• Understanding that Kortana cannot guarantee the privacy of on-chain activity

**6.3 GDPR and Blockchain**

We acknowledge the tension between GDPR's right to erasure and blockchain immutability. We have determined that on-chain data falls outside the scope of "personal data" under GDPR Article 4 as wallet addresses alone do not constitute personal data unless combined with identifying information held by a controller. Kortana does not hold such combining information for public wallet addresses.`,
    },
    {
        id: "cookies",
        title: "7. Cookies & Tracking Technologies",
        content: `**7.1 Essential Cookies Only**

The Kortana web platform uses only functional/essential cookies necessary for site operation. We do not use:
• Advertising cookies or tracking pixels
• Third-party analytics cookies (Google Analytics, Facebook Pixel, etc.)
• Cross-site tracking cookies
• Cookie-based user profiling

**7.2 Cookies We Set**

| Cookie Name | Type | Duration | Purpose |
|---|---|---|---|
| \`kortana_session\` | Session | Browser session | Maintain authenticated developer sessions |
| \`kortana_theme\` | Preference | 1 year | Remember dark/light mode preference |
| \`kortana_consent\` | Functional | 1 year | Record your cookie preference |

**7.3 Chrome Extension — No Cookies**

The Kortana Wallet Chrome Extension does not set, read, or track browser cookies. All data is stored exclusively via \`chrome.storage.local\`.

**7.4 Managing Cookies**

You can control cookies through your browser settings. Disabling essential cookies may impact site functionality. Third-party cookie blockers (uBlock Origin, Privacy Badger) are fully compatible with our platform.`,
    },
    {
        id: "data-security",
        title: "8. Data Security",
        content: `**8.1 Security Measures**

We implement industry-standard and best-practice security measures:

• **AES-256 Encryption**: All locally stored private keys and seed phrases in the Kortana Wallet are encrypted using AES-256-GCM with a key derived from your wallet password via PBKDF2 (100,000 iterations). Your password never leaves your device.
• **TLS 1.3**: All data in transit between clients and Kortana infrastructure is protected by TLS 1.3 with forward secrecy.
• **Zero-Knowledge Architecture**: Private keys are never transmitted to or stored on Kortana servers. You are the sole custodian of your private keys.
• **Regular Security Audits**: Our smart contracts and infrastructure undergo periodic third-party security audits. Audit results are published at kortana.network/security-audit.
• **Bug Bounty Programme**: Security researchers can responsibly disclose vulnerabilities through our bug bounty programme.

**8.2 No Central Key Storage**

Kortana operates a **non-custodial** wallet architecture. We do not and cannot hold your private keys. If you lose your seed phrase, Kortana cannot recover your wallet. This means your funds are under your sole control — but also your sole responsibility.

**8.3 Incident Response**

In the event of a security breach affecting personal data, we will:
• Notify affected users within 72 hours of discovery (GDPR Article 33 compliant)
• Publish a public incident report with full transparency
• Cooperate with relevant supervisory authorities`,
    },
    {
        id: "your-rights",
        title: "9. Your Rights",
        content: `**9.1 GDPR Rights (EEA/UK Users)**

If you are located in the European Economic Area or United Kingdom, you have the following rights under GDPR:

• **Right of Access (Article 15)**: Request a copy of personal data we hold about you.
• **Right to Rectification (Article 16)**: Correct inaccurate personal data.
• **Right to Erasure / "Right to be Forgotten" (Article 17)**: Request deletion of your personal data (subject to legal retention obligations and blockchain immutability constraints outlined in Section 6).
• **Right to Data Portability (Article 20)**: Receive your data in a structured, machine-readable format.
• **Right to Object (Article 21)**: Object to processing based on legitimate interests.
• **Right to Restrict Processing (Article 18)**: Request restriction of processing in certain circumstances.
• **Right to Withdraw Consent**: Where processing is based on consent, withdraw at any time without affecting lawfulness of prior processing.
• **Right to Lodge a Complaint**: You may lodge a complaint with your local data protection supervisory authority (e.g., ICO in the UK, CNIL in France).

**9.2 CCPA Rights (California Users)**

California residents have the right to:
• Know what personal information is collected, used, shared, or sold
• Delete personal information held by businesses
• Opt-out of the sale of personal information (Kortana does not sell personal information)
• Non-discrimination for exercising CCPA rights

**9.3 Exercising Your Rights**

Submit a data request to: **privacy@kortana.network**

We will respond within **30 days** (GDPR) or **45 days** (CCPA) of receiving a verifiable request. We may need to verify your identity before processing certain requests.

**9.4 Automated Decision-Making**

Kortana does not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects on you.`,
    },
    {
        id: "children",
        title: "10. Children's Privacy (COPPA)",
        content: `The Kortana platform and Kortana Wallet extension are **not directed at children under the age of 13** (or 16 in the EU under GDPR). We do not knowingly collect personal data from children.

If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us immediately at **privacy@kortana.network**. We will delete such information within 30 days of verified notice.

Cryptocurrency and blockchain applications carry financial risk. We strongly recommend parental guidance for users under 18 years of age.`,
    },
    {
        id: "data-transfers",
        title: "11. International Data Transfers",
        content: `Kortana Foundation operates globally. If you are located in the EEA, UK, or other jurisdictions with data transfer restrictions, your personal data may be transferred to and processed in countries that may not provide the same level of data protection as your home jurisdiction.

Where we transfer personal data internationally, we implement appropriate safeguards including:
• **Standard Contractual Clauses (SCCs)** approved by the European Commission (for transfers from EEA)
• **UK International Data Transfer Agreements (IDTAs)** for transfers from the UK
• Adequacy decisions where applicable

Our infrastructure is primarily hosted on servers located in the **European Union and United States**. All RPC node operators who process transaction requests are contractually bound to our data protection standards.`,
    },
    {
        id: "retention",
        title: "12. Data Retention",
        content: `We retain personal data only for as long as necessary for the purposes described in this Policy:

| Data Category | Retention Period | Basis |
|---|---|---|
| Developer account data | Duration of account + 2 years after deletion | Contractual obligation |
| Support communications | 3 years | Legitimate interest (dispute resolution) |
| RPC node access logs (anonymised) | 72 hours | Security monitoring |
| Faucet request logs (hashed IP) | 24 hours | Rate limiting |
| Security incident records | 5 years | Legal obligation |
| Anonymised analytics | 24 months rolling | Product improvement |
| On-chain blockchain data | **Permanent** (immutable by design) | Public ledger |

When retention periods expire, data is securely deleted or irreversibly anonymised.`,
    },
    {
        id: "updates",
        title: "13. Policy Updates",
        content: `We may update this Privacy Policy to reflect changes in our practices, legal obligations, or the Kortana ecosystem. When we make material changes, we will:

• Post the updated Policy at **kortana.network/privacy** with a new "Last Updated" date
• Notify registered users via email (for material changes)
• Post a notice on the Kortana wallet extension update notes and Chrome Web Store listing
• Where required by law, obtain fresh consent

We recommend checking this page periodically. Continued use of Kortana services after the posted effective date constitutes acceptance of the updated Policy.

**Previous Policy versions** are archived and available upon request.`,
    },
    {
        id: "contact",
        title: "14. Contact & Data Protection Officer",
        content: `If you have any questions, concerns, or requests relating to this Privacy Policy or our data practices, please contact us:

**Kortana Foundation — Privacy & Data Protection**
📧 **Email**: privacy@kortana.network
🌐 **Web**: kortana.network/privacy
📮 **Response Time**: Within 30 days for privacy requests

**For Chrome Web Store extension-specific privacy concerns:**
📧 **Email**: privacy@kortana.network
**Subject line**: "Kortana Wallet Extension — Privacy Inquiry"

**For security vulnerabilities or incident reporting:**
📧 **Email**: security@kortana.network

**For EU/UK GDPR Data Subject Requests:**
Please email **privacy@kortana.network** with subject "GDPR Data Subject Request" and include your wallet address (if applicable) and the specific right you are invoking. We will verify your identity and respond within 30 days.

If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority:
• **UK**: ico.org.uk
• **Ireland**: dataprotection.ie
• **EU (lead authority)**: Your national DPA as listed at edpb.europa.eu`,
    },
];

export default function PrivacyPage() {
    const lastUpdated = "March 12, 2026";

    return (
        <div className="min-h-screen bg-[#020510]">
            {/* Hero */}
            <section className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-6">
                    {/* Badge */}
                    <div className="flex items-center justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
                            Legal &amp; Compliance
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-br from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-center text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
                        Kortana is committed to protecting your privacy and operating with full transparency.
                        This Policy covers the Kortana Wallet extension, web platform, mobile apps, and
                        blockchain infrastructure.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Last Updated: <strong className="text-slate-300">{lastUpdated}</strong></span>
                        </div>
                        <span className="hidden sm:block text-slate-700">•</span>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>GDPR · CCPA · COPPA · Chrome Web Store Compliant</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Nav */}
            <section className="max-w-4xl mx-auto px-6 mb-12">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Table of Contents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors py-1 px-2 rounded-lg hover:bg-indigo-500/5 group"
                            >
                                <svg className="w-3 h-3 text-indigo-500/40 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 6 6">
                                    <circle cx="3" cy="3" r="3" />
                                </svg>
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chrome Web Store Compliance Banner */}
            <section className="max-w-4xl mx-auto px-6 mb-12">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
                    <div className="relative flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-300 mb-1 text-sm">Kortana Wallet — Chrome Web Store Compliance Statement</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This Privacy Policy constitutes the publicly accessible privacy policy required by the{" "}
                                <strong className="text-slate-300">Chrome Web Store Developer Program Policies (User Data Privacy)</strong>.
                                The Kortana Wallet extension handles user data (encrypted wallet keys and public addresses) only
                                as described in Section 2 of this Policy. We do not sell user data. All sensitive data (private keys,
                                seed phrases) is stored exclusively on the user&apos;s device and never transmitted to Kortana servers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Policy Sections */}
            <section className="max-w-4xl mx-auto px-6 pb-20">
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            id={section.id}
                            className="scroll-mt-24 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-indigo-500/15 transition-colors duration-300"
                        >
                            {/* Section Header */}
                            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.05] bg-white/[0.01]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                    {String(index + 1).padStart(2, "0")}
                                </div>
                                <h2 className="text-base font-semibold text-white">{section.title}</h2>
                            </div>

                            {/* Section Content */}
                            <div className="px-6 py-5">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {section.content.split('\n\n').map((paragraph, pIdx) => {
                                        // Table detection
                                        if (paragraph.includes('|---|')) {
                                            const rows = paragraph.trim().split('\n').filter(r => r.trim());
                                            const headers = rows[0].split('|').filter(c => c.trim());
                                            const dataRows = rows.slice(2);
                                            return (
                                                <div key={pIdx} className="overflow-x-auto my-4 rounded-xl border border-white/[0.06]">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-white/[0.04]">
                                                                {headers.map((h, i) => (
                                                                    <th key={i} className="px-4 py-3 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider whitespace-nowrap border-b border-white/[0.06]">
                                                                        {h.trim()}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataRows.map((row, rIdx) => {
                                                                const cells = row.split('|').filter(c => c.trim() !== '---' && c !== '');
                                                                return (
                                                                    <tr key={rIdx} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                                        {cells.map((cell, cIdx) => (
                                                                            <td key={cIdx} className="px-4 py-3 text-slate-400 text-xs">
                                                                                {cell.replace(/\*\*/g, '').trim()}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        }

                                        // Bullet points
                                        if (paragraph.trim().startsWith('•')) {
                                            const bullets = paragraph.split('\n').filter(l => l.trim().startsWith('•'));
                                            return (
                                                <ul key={pIdx} className="my-3 space-y-1.5">
                                                    {bullets.map((b, bIdx) => (
                                                        <li key={bIdx} className="flex items-start gap-2.5 text-slate-400 text-sm leading-relaxed">
                                                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500/60 mt-1.5" />
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: b.replace('• ', '').replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-200 font-semibold">$1</strong>').replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-mono">$1</code>')
                                                            }} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                        }

                                        // Bold headers (lines starting with **)
                                        if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**') && !paragraph.includes('\n')) {
                                            return (
                                                <h3 key={pIdx} className="text-sm font-bold text-indigo-300 mt-5 mb-2 uppercase tracking-wider">
                                                    {paragraph.replace(/\*\*/g, '').trim()}
                                                </h3>
                                            );
                                        }

                                        // Regular paragraph with inline markdown
                                        return (
                                            <p key={pIdx} className="text-slate-400 text-sm leading-relaxed my-3" dangerouslySetInnerHTML={{
                                                __html: paragraph
                                                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-200 font-semibold">$1</strong>')
                                                    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-mono">$1</code>')
                                                    .replace(/\n/g, '<br/>')
                                            }} />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-12 text-center">
                    <div className="inline-block px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                        <p className="text-slate-500 text-xs leading-relaxed max-w-lg">
                            This Privacy Policy was last updated on <strong className="text-slate-400">{lastUpdated}</strong>.
                            For questions or data requests, contact{" "}
                            <a href="mailto:privacy@kortana.network" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                privacy@kortana.network
                            </a>
                            . View our{" "}
                            <a href="/docs" className="text-indigo-400 hover:text-indigo-300 transition-colors">Documentation</a>
                            {" "}or{" "}
                            <a href="/security-audit" className="text-indigo-400 hover:text-indigo-300 transition-colors">Security Audit</a>.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
