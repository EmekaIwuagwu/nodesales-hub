import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Simple middleware-like check for admin auth cookie
function checkAuth(req: NextRequest) {
    const authCookie = req.cookies.get('presale_admin_auth');
    if (!authCookie || authCookie.value !== 'authenticated') {
        return false;
    }
    return true;
}

export async function PATCH(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, status } = await req.json();

        if (!userId || !status) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('kortana_presale');

        await db.collection('presale_users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { paymentStatus: status, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Missing User ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('kortana_presale');

        await db.collection('presale_users').deleteOne({ _id: new ObjectId(userId) });

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Deletion failed' }, { status: 500 });
    }
}
