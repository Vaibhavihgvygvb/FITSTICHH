import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const db = await getDb();
    const orders = await db.collection('orders')
      .find({ userId: token.id }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ orders });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
