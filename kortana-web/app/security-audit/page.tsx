import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security Audit | Kortana Blockchain',
    description:
        'Official Kortana Mainnet Internal Security Audit Report — February 2026. All critical vulnerabilities identified and remediated. Certified secure for investor confidence.',
    openGraph: {
        title: 'Kortana Security Audit Report 2026',
        description:
            'Full internal security audit of the Kortana Mainnet v1.1.0. Score: 90/100 — EXCELLENT.',
        url: 'https://kortana.xyz/security-audit',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Kortana Security Audit' }],
    },
};

import AuditPageClient from './AuditPageClient';

export default function AuditPage() {
    return <AuditPageClient />;
}
