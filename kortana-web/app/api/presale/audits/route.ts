import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // For now, returning static audit data as per the brief.
    // In a real scenario, this would come from the 'audit_timeline' collection.
    const audits = [
        {
            id: "audit_1",
            type: "Internal Security Audit",
            provider: "Kortana Internal Team",
            status: "completed",
            completionDate: "2026-01-15T00:00:00Z",
            summary: "Comprehensive internal security review completed. All critical and high issues resolved.",
            documentUrl: "/assets/audit-docs/internal-audit-2026-01.pdf"
        },
        {
            id: "audit_2",
            type: "Smart Contract Audit",
            provider: "Trail of Bits",
            status: "in_progress",
            scheduledDate: "2026-04-15T00:00:00Z",
            summary: "Professional third-party audit currently underway to ensure maximum protocol security."
        },
        {
            id: "audit_3",
            type: "Advanced Protocol Review",
            provider: "Certik",
            status: "scheduled",
            scheduledDate: "2026-03-15T00:00:00Z",
            summary: "Scheduled architectural review focused on BFT finality and cross-chain messaging security."
        }
    ];

    return NextResponse.json({ audits });
}
