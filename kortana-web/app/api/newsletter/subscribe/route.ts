import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('kortana_presale');
        const subscribers = db.collection('newsletter_subscribers');

        // Check if already subscribed
        const existing = await subscribers.findOne({ email });
        if (existing) {
            return NextResponse.json({ success: true, message: 'Already subscribed' });
        }

        await subscribers.insertOne({
            email,
            subscribedAt: new Date(),
            status: 'active'
        });

        return NextResponse.json({ success: true, message: 'Subscription successful' });
    } catch (error) {
        console.error('Newsletter Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
