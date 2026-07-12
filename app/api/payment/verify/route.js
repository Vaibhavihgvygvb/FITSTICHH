import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { orderId, razorpayPaymentId, stripePaymentIntentId } = body;

    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await db.collection('orders').findOne({ id: orderId }, { projection: { _id: 0 } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ ok: true, message: 'Already verified' });
    }

    const update = {
      paymentStatus: 'paid',
      status: 'processing',
      updatedAt: new Date(),
    };
    if (razorpayPaymentId) update.razorpayPaymentId = razorpayPaymentId;
    if (stripePaymentIntentId) update.stripePaymentIntentId = stripePaymentIntentId;

    await db.collection('orders').updateOne({ id: orderId }, { $set: update });

    // Deduct stock only for online payments (COD already deducted at order placement)
    if (order.paymentMethod !== 'COD' && order.items) {
      for (const it of order.items) {
        await db.collection('products').updateOne(
          { id: it.id, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Payment verification error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
