import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const orderId = url.searchParams.get('orderId');

    if (!email || !orderId) {
      return NextResponse.json({ error: 'email and orderId required' }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection('orders').findOne(
      { id: orderId, 'customer.email': email.toLowerCase().trim() },
      { projection: { _id: 0 } }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const db = await getDb();
    const orders = await db.collection('orders')
      .find({ 'customer.email': email.toLowerCase().trim() },
        { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
