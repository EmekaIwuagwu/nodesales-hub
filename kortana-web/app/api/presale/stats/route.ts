import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic'; // Ensure we always get fresh stats

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db('kortana_presale');

        // 1. Get main stats
        const statsDoc = await db.collection('presale_stats').findOne({});

        const stats = statsDoc ? (statsDoc as any) : {
            totalRegistrations: 0,
            totalAmountRaised: 0,
            averageContribution: 0,
            tierBreakdown: {
                starter: { count: 0, percentage: 0 },
                professional: { count: 0, percentage: 0 },
                enterprise: { count: 0, percentage: 0 }
            },
            lastUpdated: new Date()
        };

        // 2. Get top referrers
        const topReferrers = await db.collection('presale_users')
            .aggregate([
                { $match: { referrerId: { $ne: null } } },
                { $group: { _id: "$referrerId", referralsCount: { $sum: 1 } } },
                { $sort: { referralsCount: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "presale_users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                { $unwind: "$userInfo" },
                {
                    $project: {
                        name: "$userInfo.fullName",
                        referralsCount: 1,
                        bonusTokens: { $multiply: ["$referralsCount", 100] }
                    }
                }
            ]).toArray();

        // 3. Calculate Countdown
        const endDate = new Date(process.env.NEXT_PUBLIC_PRESALE_END_DATE || '2026-03-11T00:00:00Z');
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const goal = parseInt(process.env.NEXT_PUBLIC_PRESALE_GOAL || '2000000');
        const percentageToGoal = (stats.totalAmountRaised / goal) * 100;

        return NextResponse.json({
            totalRegistrations: stats.totalRegistrations,
            totalAmountRaised: `$${(stats.totalAmountRaised || 0).toLocaleString()}`,
            percentageToGoal: Math.min(percentageToGoal, 100).toFixed(2),
            countdown: {
                daysRemaining: Math.max(days, 0),
                hoursRemaining: Math.max(hours, 0),
                minutesRemaining: Math.max(minutes, 0),
                secondsRemaining: Math.max(seconds, 0),
                presaleEndsAt: endDate.toISOString()
            },
            tierBreakdown: stats.tierBreakdown,
            topReferrers
        });

    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
