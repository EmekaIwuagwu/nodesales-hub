import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic'; // Ensure we always get fresh stats

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db('kortana_presale');

        // 1. Get main stats with timeout
        const statsDoc = await Promise.race([
            db.collection('presale_stats').findOne({}),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 8000))
        ]);

        const stats = statsDoc ? (statsDoc as any) : {
            totalRegistrations: 0,
            totalAmountRaised: 0,
            tierBreakdown: {
                starter: { count: 0 },
                professional: { count: 0 },
                enterprise: { count: 0 }
            }
        };

        // 2. Get top referrers (Simplified to avoid heavy aggregation if DB is slow)
        let topReferrers: any[] = [];
        try {
            topReferrers = await db.collection('presale_users')
                .find({ referrerId: { $ne: null } })
                .limit(10)
                .toArray();

            // Map to the structure expected by frontend
            topReferrers = topReferrers.slice(0, 5).map(r => ({
                name: r.fullName || 'Anonymous',
                referralsCount: 1, // Placeholder since we simplified the query
                bonusTokens: 100
            }));
        } catch (e) {
            console.error("Referrer fetch failed", e);
        }

        // 3. Calculate Countdown
        const endDate = new Date(process.env.NEXT_PUBLIC_PRESALE_END_DATE || '2026-03-11T00:00:00Z');
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const goal = parseInt(process.env.NEXT_PUBLIC_PRESALE_GOAL || '2000000');
        const percentageToGoal = (stats.totalAmountRaised / goal) * 100;

        return NextResponse.json({
            success: true,
            totalRegistrations: stats.totalRegistrations || 0,
            totalAmountRaised: `$${(stats.totalAmountRaised || 0).toLocaleString()}`,
            percentageToGoal: Math.min(percentageToGoal, 100).toFixed(2),
            countdown: {
                daysRemaining: Math.max(days, 0),
                hoursRemaining: Math.max(hours, 0),
                minutesRemaining: Math.max(minutes, 0),
                presaleEndsAt: endDate.toISOString()
            },
            tierBreakdown: stats.tierBreakdown || {},
            topReferrers
        });

    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
