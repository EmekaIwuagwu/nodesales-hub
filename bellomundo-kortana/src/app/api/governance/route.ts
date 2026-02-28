import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

export async function GET() {
    try {
        await connectToDatabase();

        // If the collection is empty, seed with initial proposals
        let proposals = await Proposal.find({}).sort({ createdAt: -1 });

        if (proposals.length === 0) {
            const initialProposals = [
                {
                    proposalId: "PROP-042",
                    title: "NEO-SINGAPORE SECTOR 7 GRID EXPANSION",
                    category: "Infrastructure",
                    description: "Proposal to upgrade the quantum-link energy buffers in Sector 7 to support 40% higher EV density during peak atmospheric cycles.",
                    status: "Active",
                    votesYes: 840230,
                    votesNo: 120400,
                    timeLeft: "14h 22m",
                    proposer: "Metropolis Planning Dept"
                },
                {
                    proposalId: "PROP-043",
                    title: "CITIZEN TAX SHIELD ADJUSTMENT (Q1-45)",
                    category: "Economy",
                    description: "Implementation of a 2% DNR staking dividend for all e-Residents with high biological health scores (A+ Priority).",
                    status: "Active",
                    votesYes: 1540900,
                    votesNo: 42000,
                    timeLeft: "2d 4h",
                    proposer: "Sovereign Finance Council"
                },
                {
                    proposalId: "PROP-041",
                    title: "AUTONOMOUS TRANSIT PROTOCOL ALPHA-9",
                    category: "Mobility",
                    description: "Integration of Level 5 autonomous navigation for all sector-shuttles, removing mandatory human-backup nodes.",
                    status: "Passed",
                    votesYes: 2100400,
                    votesNo: 890400,
                    timeLeft: "Executed",
                    proposer: "Grid Logistics Core"
                }
            ];
            await Proposal.insertMany(initialProposals);
            proposals = await Proposal.find({}).sort({ createdAt: -1 });
        }

        return NextResponse.json({ proposals });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { proposalId, choice } = body;
        const address = (session.user as any).address;

        if (!proposalId || !choice) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const proposal = await Proposal.findOne({ proposalId });
        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
        }

        // Check if user already voted
        const hasVoted = proposal.voters.some((v: any) => v.address.toLowerCase() === address.toLowerCase());
        if (hasVoted) {
            return NextResponse.json({ error: "Vote already recorded on-chain" }, { status: 400 });
        }

        // Update vote count and record voter
        const updateField = choice.toUpperCase() === 'YES' ? 'votesYes' : 'votesNo';

        // Simulating weighted voting power for now - in production this would pull DNR balance
        const votingPower = 1000;

        await Proposal.updateOne(
            { proposalId },
            {
                $inc: { [updateField]: votingPower },
                $push: { voters: { address, choice, timestamp: new Date() } }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
