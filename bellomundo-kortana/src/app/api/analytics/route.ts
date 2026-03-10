import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Total Residents (Unique payers)
        const residents = await Transaction.distinct("payer");
        const totalResidents = residents.length;

        // 2. Economic Overview (Total amountDNR)
        const totalVolume = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: "$amountDNR" } } }
        ]);
        const economicOverview = totalVolume[0]?.total || 0;

        // 3. Wallet Leaderboard (Top transactors)
        const walletLeaderboard = await Transaction.aggregate([
            { $group: { _id: "$payer", count: { $sum: 1 }, totalSpent: { $sum: "$amountDNR" } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 4. Utility Analytics (Frequencies)
        const utilityAnalytics = await Transaction.aggregate([
            { $group: { _id: "$paymentType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 5. Recent Transactions
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({
            success: true,
            data: {
                totalResidents,
                economicOverview,
                walletLeaderboard,
                utilityAnalytics,
                recentTransactions
            }
        });
    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
