import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'FITSTICH <noreply@fitstich.com>';

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (SMTP_USER.includes('your-') || SMTP_PASS.includes('your-') || SMTP_USER === 'your-email@gmail.com') return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function orderConfirmationHtml(order) {
  const itemsHtml = order.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee">${i.size} / ${i.color?.name || '-'}</td><td style="padding:8px;border-bottom:1px solid #eee">x${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td></tr>`
  ).join('');
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#000;color:#fff;padding:24px;text-align:center">
        <h1 style="margin:0;font-size:24px;letter-spacing:4px">FITSTICH</h1>
        <p style="margin:4px 0 0;opacity:0.7">Order Confirmation</p>
      </div>
      <div style="padding:24px">
        <p>Hi ${order.customer.name},</p>
        <p>Your order <strong>#${order.id}</strong> has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:left">Size</th><th style="padding:8px;text-align:left">Qty</th><th style="padding:8px;text-align:right">Total</th></tr>
          ${itemsHtml}
        </table>
        <div style="border-top:2px solid #000;padding-top:8px;text-align:right">
          <p>Subtotal: ₹${(order.subtotal || 0).toLocaleString('en-IN')}</p>
          ${order.discount ? `<p>Discount: -₹${order.discount.toLocaleString('en-IN')}</p>` : ''}
          <p>Shipping: ${order.shipping ? '₹' + order.shipping.toLocaleString('en-IN') : 'FREE'}</p>
          <h3>Total: ₹${(order.total || 0).toLocaleString('en-IN')}</h3>
        </div>
        <p style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:4px">
          Payment: ${order.paymentMethod.toUpperCase()} · ${order.paymentStatus}
        </p>
        <p style="color:#666;font-size:13px">Track your order: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders?id=${order.id}&email=${encodeURIComponent(order.customer.email)}">${process.env.NEXT_PUBLIC_BASE_URL}/orders</a></p>
      </div>
    </div>`;
}

export async function POST(request) {
  try {
    const { type, order } = await request.json();
    if (!order?.customer?.email) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log('Email: SMTP not configured — skipping send to', order.customer.email);
      return NextResponse.json({ ok: true, simulated: true, message: `Email to ${order.customer.email} logged (SMTP not configured)` });
    }

    let subject, html;
    if (type === 'shipping') {
      const tracking = order.trackingNumber ? ` Tracking: ${order.trackingNumber}` : '';
      subject = `FITSTICH — Order #${order.id} has been shipped!${tracking}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#000;color:#fff;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:24px;letter-spacing:4px">FITSTICH</h1>
            <p style="margin:4px 0 0;opacity:0.7">On the way!</p>
          </div>
          <div style="padding:24px">
            <p>Hi ${order.customer.name},</p>
            <p>Your order <strong>#${order.id}</strong> is on its way!</p>
            ${tracking ? `<p style="padding:12px;background:#f5f5f5;border-radius:4px">📦 Tracking: <strong>${tracking}</strong></p>` : ''}
            <p style="color:#666">Estimated delivery: 3-5 business days</p>
          </div>
        </div>`;
    } else {
      subject = `FITSTICH — Order #${order.id} Confirmed`;
      html = orderConfirmationHtml(order);
    }

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: order.customer.email,
      subject,
      html,
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (e) {
    console.error('Email error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
