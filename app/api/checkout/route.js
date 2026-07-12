import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

let stripeInstance = null;
function getStripe() {
  if (!stripeInstance && STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

let razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance && RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  }
  return razorpayInstance;
}

async function validateStock(db, items) {
  for (const it of items) {
    const prod = await db.collection('products').findOne({ id: it.id }, { projection: { stock: 1, name: 1 } });
    if (!prod) return { status: 404, message: `Product not found: ${it.id}` };
    if ((prod.stock || 0) < it.quantity) {
      return { status: 409, message: `Insufficient stock for ${prod.name || it.id}. Available: ${prod.stock || 0}, requested: ${it.quantity}` };
    }
  }
  return null;
}

export async function POST(request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { customer, items, subtotal, discount, shipping, total, couponCode, paymentMethod, userId } = body;

    const rl = rateLimit({ interval: 60000, max: 10 });
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const check = rl(`checkout:${clientIp}`);
    if (!check.allowed) return NextResponse.json({ error: `Too many requests. Retry in ${check.retryAfter}s` }, { status: 429 });

    if (!customer?.email || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stockError = await validateStock(db, items);
    if (stockError) return NextResponse.json({ error: stockError.message }, { status: stockError.status });

    const orderId = `FS-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    if (paymentMethod === 'COD') {
      const order = {
        id: orderId, customer, items, subtotal: subtotal || 0,
        discount: discount || 0, shipping: shipping || 0, total: total || 0,
        couponCode: couponCode || null, paymentMethod: 'COD',
        paymentStatus: 'pending', status: 'pending',
        userId: userId || null, createdAt: new Date(),
      };
      await db.collection('orders').insertOne(order);
      for (const it of items) {
        await db.collection('products').updateOne(
          { id: it.id, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } }
        );
      }
      return NextResponse.json({ ok: true, orderId, paymentMethod: 'COD' });
    }

    if (paymentMethod === 'stripe') {
      const stripe = getStripe();
      if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'inr',
        metadata: { orderId },
        receipt_email: customer.email,
        shipping: { name: customer.name, address: { line1: customer.address, city: customer.city, state: customer.state, postal_code: customer.pincode, country: 'IN' } },
      });
      await db.collection('orders').insertOne({
        id: orderId, customer, items, subtotal, discount, shipping, total,
        couponCode, paymentMethod: 'stripe', paymentStatus: 'pending',
        status: 'pending', stripePaymentIntentId: paymentIntent.id,
        userId: userId || null, createdAt: new Date(),
      });
      return NextResponse.json({ ok: true, orderId, clientSecret: paymentIntent.client_secret, paymentMethod: 'stripe' });
    }

    if (paymentMethod === 'razorpay') {
      const razorpay = getRazorpay();
      if (!razorpay) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: orderId,
        notes: { orderId },
      });
      await db.collection('orders').insertOne({
        id: orderId, customer, items, subtotal, discount, shipping, total,
        couponCode, paymentMethod: 'razorpay', paymentStatus: 'pending',
        status: 'pending', razorpayOrderId: rzpOrder.id,
        userId: userId || null, createdAt: new Date(),
      });
      return NextResponse.json({
        ok: true, orderId,
        razorpayOrderId: rzpOrder.id,
        razorpayKeyId: RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        paymentMethod: 'razorpay',
      });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
