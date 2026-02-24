import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const { address, network } = await req.json();

        if (!address || address.length < 20) {
            return NextResponse.json({ success: false, message: 'Invalid wallet address' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('kortana_presale');
        const requests = db.collection('faucet_requests');

        // Rate limit: check if address requested in last 24h
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await requests.findOne({
            address,
            createdAt: { $gt: last24h }
        });

        if (existing) {
            return NextResponse.json({
                success: false,
                message: 'Rate limit exceeded. Please wait 24 hours between requests.'
            }, { status: 429 });
        }

        const faucetRequest = {
            address,
            network,
            amount: 10,
            symbol: 'DNR',
            status: 'pending', // Will be picked up by a distribution service
            createdAt: new Date()
        };

        const result = await requests.insertOne(faucetRequest);

        return NextResponse.json({
            success: true,
            message: 'Tokens are being processed. Check the explorer in a few minutes!',
            requestId: result.insertedId
        });
    } catch (error) {
        console.error('Faucet Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
