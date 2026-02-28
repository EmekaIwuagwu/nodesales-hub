import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            txHash,
            paymentType,
            recipient,
            amount,
            amountDNR,
            description,
            serviceId,
            serviceType,
            metadata
        } = body;

        if (!txHash || !paymentType || !recipient || !amount || !description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const transaction = await Transaction.create({
            txHash,
            status: 'pending',
            paymentType,
            payer: (session.user as any).address,
            recipient,
            amount,
            amountDNR,
            description,
            serviceId,
            serviceType,
            metadata,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, transaction });
    } catch (error: any) {
        console.error("API Transaction Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const address = (session.user as any).address;

        const transactions = await Transaction.find({
            $or: [{ payer: address }, { recipient: address }]
        }).sort({ createdAt: -1 }).limit(50);

        return NextResponse.json({ transactions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
