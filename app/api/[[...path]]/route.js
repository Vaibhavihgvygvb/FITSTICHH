import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fitstich2025';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'fitstich-secret';
const IS_DEV = process.env.NODE_ENV !== 'production';

/* ============ Seed data ============ */
const GENDERS = { MEN: 'men', WOMEN: 'women' };
const SEED_PRODUCTS = [
  // ── MEN ──
  { gender: GENDERS.MEN, id: 'm-oversized-noir', name: 'Noir Oversized Tee', slug: 'noir-oversized-tee', category: 'oversized', price: 1299, compareAt: 1899, rating: 4.8, reviewCount: 214, sizes: ['XS','S','M','L','XL','XXL'], colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Bone', hex: '#efeae1' }], fit: 'Oversized', material: '100% Combed Cotton, 240 GSM', fabricCare: 'Machine wash cold. Do not bleach. Tumble dry low.', description: 'Heavyweight combed cotton with a drop-shoulder silhouette. Enzyme washed for a soft, lived-in feel from day one.', images: ['https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg','https://images.pexels.com/photos/16238582/pexels-photo-16238582.jpeg','https://images.pexels.com/photos/8558849/pexels-photo-8558849.jpeg'], tags: ['best-seller','new'], stock: 42 },
  { gender: GENDERS.MEN, id: 'm-oversized-bone', name: 'Bone Oversized Tee', slug: 'bone-oversized-tee', category: 'oversized', price: 1299, compareAt: 1799, rating: 4.7, reviewCount: 168, sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Bone', hex: '#efeae1' }, { name: 'Stone', hex: '#c9c3ba' }], fit: 'Oversized', material: '100% Combed Cotton, 240 GSM', fabricCare: 'Machine wash cold. Iron inside out.', description: 'The essential bone-white oversized tee. Boxy, breathable, and quietly confident.', images: ['https://images.pexels.com/photos/4066292/pexels-photo-4066292.jpeg','https://images.pexels.com/photos/35644532/pexels-photo-35644532.jpeg'], tags: ['new','trending'], stock: 68 },
  { gender: GENDERS.MEN, id: 'm-oversized-stone', name: 'Stone Boxy Tee', slug: 'stone-boxy-tee', category: 'oversized', price: 1399, compareAt: 1999, rating: 4.6, reviewCount: 92, sizes: ['S','M','L','XL'], colors: [{ name: 'Stone', hex: '#c9c3ba' }, { name: 'Charcoal', hex: '#3a3a3a' }], fit: 'Boxy Oversized', material: 'Cotton–Modal Blend, 260 GSM', fabricCare: 'Cold wash. Dry flat.', description: 'A weighty modal-cotton blend with a soft drape. Cut long, worn easy.', images: ['https://images.pexels.com/photos/16238582/pexels-photo-16238582.jpeg','https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg'], tags: ['trending'], stock: 30 },
  { gender: GENDERS.MEN, id: 'm-regular-classic', name: 'Classic Crew Tee', slug: 'classic-crew-tee', category: 'regular', price: 999, compareAt: 1499, rating: 4.5, reviewCount: 340, sizes: ['XS','S','M','L','XL','XXL'], colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'White', hex: '#ffffff' }, { name: 'Grey', hex: '#8b8b8b' }], fit: 'Regular', material: '100% Cotton, 200 GSM', fabricCare: 'Machine wash cold.', description: 'The everyday crew. Tailored regular fit, reinforced neckline, made to last.', images: ['https://images.pexels.com/photos/8558849/pexels-photo-8558849.jpeg','https://images.pexels.com/photos/7871177/pexels-photo-7871177.jpeg'], tags: ['best-seller'], stock: 120 },
  { gender: GENDERS.MEN, id: 'm-regular-charcoal', name: 'Charcoal Essential Tee', slug: 'charcoal-essential-tee', category: 'regular', price: 999, compareAt: 1399, rating: 4.6, reviewCount: 155, sizes: ['S','M','L','XL'], colors: [{ name: 'Charcoal', hex: '#3a3a3a' }], fit: 'Regular', material: '100% Cotton, 200 GSM', fabricCare: 'Cold wash.', description: 'A quiet, considered charcoal tee. Effortlessly versatile.', images: ['https://images.pexels.com/photos/7871177/pexels-photo-7871177.jpeg','https://images.pexels.com/photos/8558849/pexels-photo-8558849.jpeg'], tags: [], stock: 55 },
  { gender: GENDERS.MEN, id: 'm-jogger-noir', name: 'Noir Tapered Joggers', slug: 'noir-tapered-joggers', category: 'joggers', price: 1799, compareAt: 2499, rating: 4.7, reviewCount: 187, sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Charcoal', hex: '#3a3a3a' }], fit: 'Tapered', material: 'French Terry, 320 GSM', fabricCare: 'Cold wash. Do not tumble dry.', description: 'Structured French terry, tapered leg, elastic waist with drawcord. Studio to street.', images: ['https://images.pexels.com/photos/26524780/pexels-photo-26524780.jpeg','https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg'], tags: ['best-seller','new'], stock: 60 },
  { gender: GENDERS.MEN, id: 'm-jogger-slate', name: 'Slate Relaxed Joggers', slug: 'slate-relaxed-joggers', category: 'joggers', price: 1899, compareAt: 2599, rating: 4.6, reviewCount: 98, sizes: ['S','M','L','XL'], colors: [{ name: 'Slate', hex: '#5a5f66' }, { name: 'Black', hex: '#0a0a0a' }], fit: 'Relaxed', material: 'French Terry, 320 GSM', fabricCare: 'Cold wash.', description: 'A relaxed silhouette in muted slate. Deep pockets, gusseted crotch, engineered to move.', images: ['https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg','https://images.pexels.com/photos/26524780/pexels-photo-26524780.jpeg'], tags: ['trending'], stock: 40 },
  { gender: GENDERS.MEN, id: 'm-jogger-bone', name: 'Bone Straight Joggers', slug: 'bone-straight-joggers', category: 'joggers', price: 1899, compareAt: 2499, rating: 4.5, reviewCount: 61, sizes: ['S','M','L','XL'], colors: [{ name: 'Bone', hex: '#efeae1' }], fit: 'Straight', material: 'Heavy French Terry, 340 GSM', fabricCare: 'Wash separately first time.', description: 'Straight-leg cut with a heavier hand. Editorial minimalism, everyday utility.', images: ['https://images.pexels.com/photos/18584221/pexels-photo-18584221.jpeg','https://images.pexels.com/photos/26524780/pexels-photo-26524780.jpeg'], tags: ['new'], stock: 35 },
  { gender: GENDERS.MEN, id: 'm-pyjama-linen', name: 'Ivory Linen Pyjama Set', slug: 'ivory-linen-pyjama-set', category: 'pyjamas', price: 2299, compareAt: 2999, rating: 4.9, reviewCount: 74, sizes: ['S','M','L','XL'], colors: [{ name: 'Ivory', hex: '#f4f0e8' }, { name: 'Stone', hex: '#c9c3ba' }], fit: 'Relaxed', material: '100% European Linen', fabricCare: 'Cold hand wash preferred.', description: 'Airy European linen. A two-piece set that lives between sleep and Sunday.', images: ['https://images.pexels.com/photos/16238583/pexels-photo-16238583.jpeg','https://images.pexels.com/photos/8346048/pexels-photo-8346048.jpeg'], tags: ['new'], stock: 22 },
  { gender: GENDERS.MEN, id: 'm-pyjama-cotton', name: 'Midnight Cotton Pyjamas', slug: 'midnight-cotton-pyjamas', category: 'pyjamas', price: 1999, compareAt: 2699, rating: 4.7, reviewCount: 51, sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Midnight', hex: '#0f1216' }, { name: 'Charcoal', hex: '#3a3a3a' }], fit: 'Relaxed', material: 'Brushed Cotton, 180 GSM', fabricCare: 'Machine wash cold. Iron on low.', description: 'Brushed for softness. Cut for rest. The pyjama, considered.', images: ['https://images.pexels.com/photos/8346048/pexels-photo-8346048.jpeg','https://images.pexels.com/photos/16238583/pexels-photo-16238583.jpeg'], tags: ['best-seller'], stock: 48 },
  { gender: GENDERS.MEN, id: 'm-oversized-charcoal', name: 'Charcoal Drop-Shoulder Tee', slug: 'charcoal-drop-shoulder-tee', category: 'oversized', price: 1299, compareAt: 1799, rating: 4.6, reviewCount: 112, sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Black', hex: '#0a0a0a' }], fit: 'Oversized', material: '100% Combed Cotton, 240 GSM', fabricCare: 'Cold wash.', description: 'A drop-shoulder oversized tee in a soft charcoal wash.', images: ['https://images.pexels.com/photos/35644532/pexels-photo-35644532.jpeg','https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg'], tags: ['trending'], stock: 44 },
  { gender: GENDERS.MEN, id: 'm-jogger-onyx', name: 'Onyx Cargo Joggers', slug: 'onyx-cargo-joggers', category: 'joggers', price: 2199, compareAt: 2999, rating: 4.8, reviewCount: 89, sizes: ['S','M','L','XL'], colors: [{ name: 'Black', hex: '#0a0a0a' }], fit: 'Utility', material: 'Twill Cotton, 320 GSM', fabricCare: 'Cold wash.', description: 'Utility cargo joggers with side pockets and reinforced stitching.', images: ['https://images.pexels.com/photos/18584221/pexels-photo-18584221.jpeg','https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg'], tags: ['new','best-seller'], stock: 28 },
  // ── WOMEN ──
  { gender: GENDERS.WOMEN, id: 'w-oversized-cream', name: 'Cream Relaxed Tee', slug: 'cream-relaxed-tee', category: 'oversized', price: 1299, compareAt: 1799, rating: 4.7, reviewCount: 134, sizes: ['XS','S','M','L','XL'], colors: [{ name: 'Cream', hex: '#f5f0e8' }, { name: 'Mauve', hex: '#c4a4a4' }], fit: 'Relaxed Oversized', material: '100% Combed Cotton, 220 GSM', fabricCare: 'Machine wash cold. Tumble dry low.', description: 'A softer take on the oversized tee. Relaxed through the body with a gentle drape.', images: ['https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg','https://images.pexels.com/photos/4066292/pexels-photo-4066292.jpeg'], tags: ['best-seller','new'], stock: 35 },
  { gender: GENDERS.WOMEN, id: 'w-oversized-dusty-pink', name: 'Dusty Pink Boyfriend Tee', slug: 'dusty-pink-boyfriend-tee', category: 'oversized', price: 1399, compareAt: 1899, rating: 4.6, reviewCount: 98, sizes: ['XS','S','M','L','XL'], colors: [{ name: 'Dusty Pink', hex: '#d4a5a5' }, { name: 'White', hex: '#ffffff' }], fit: 'Boyfriend', material: 'Cotton–Modal Blend, 240 GSM', fabricCare: 'Cold wash. Dry flat.', description: 'Borrowed-from-him fit in a delicate dusty pink. Effortlessly undone.', images: ['https://images.pexels.com/photos/5705505/pexels-photo-5705505.jpeg','https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg'], tags: ['new','trending'], stock: 28 },
  { gender: GENDERS.WOMEN, id: 'w-regular-scoop', name: 'Scoop Neck Essential', slug: 'scoop-neck-essential', category: 'regular', price: 899, compareAt: 1299, rating: 4.5, reviewCount: 210, sizes: ['XS','S','M','L','XL'], colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Ivory', hex: '#f4f0e8' }, { name: 'Rose', hex: '#e8b4b4' }], fit: 'Slim', material: '100% Cotton, 180 GSM', fabricCare: 'Machine wash cold.', description: 'A classic scoop neck tee. Clean lines, slim fit, endlessly wearable.', images: ['https://images.pexels.com/photos/5705503/pexels-photo-5705503.jpeg','https://images.pexels.com/photos/4066292/pexels-photo-4066292.jpeg'], tags: ['best-seller'], stock: 80 },
  { gender: GENDERS.WOMEN, id: 'w-jogger-highrise', name: 'High-Rise Joggers', slug: 'high-rise-joggers', category: 'joggers', price: 1899, compareAt: 2599, rating: 4.8, reviewCount: 156, sizes: ['XS','S','M','L','XL'], colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Slate', hex: '#5a5f66' }], fit: 'High-Rise Tapered', material: 'French Terry, 300 GSM', fabricCare: 'Cold wash. Do not tumble dry.', description: 'High-rise joggers with a flattering tapered leg. Elastic waist, perfected.', images: ['https://images.pexels.com/photos/5802805/pexels-photo-5802805.jpeg','https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg'], tags: ['new','trending'], stock: 45 },
  { gender: GENDERS.WOMEN, id: 'w-jogger-wide', name: 'Wide-Leg Sweatpants', slug: 'wide-leg-sweatpants', category: 'joggers', price: 1999, compareAt: 2799, rating: 4.6, reviewCount: 88, sizes: ['XS','S','M','L','XL'], colors: [{ name: 'Oat', hex: '#d4c9b8' }, { name: 'Charcoal', hex: '#3a3a3a' }], fit: 'Wide Leg', material: 'Heavy French Terry, 340 GSM', fabricCare: 'Machine wash cold.', description: 'Wide-leg sweatpants with an easy elastic waist. Lounging, elevated.', images: ['https://images.pexels.com/photos/18584221/pexels-photo-18584221.jpeg','https://images.pexels.com/photos/5802805/pexels-photo-5802805.jpeg'], tags: ['new'], stock: 32 },
  { gender: GENDERS.WOMEN, id: 'w-pyjama-silk', name: 'Silk Trim Pyjama Set', slug: 'silk-trim-pyjama-set', category: 'pyjamas', price: 2499, compareAt: 3299, rating: 4.9, reviewCount: 67, sizes: ['XS','S','M','L'], colors: [{ name: 'Blush', hex: '#e8c8c8' }, { name: 'Ivory', hex: '#f4f0e8' }], fit: 'Relaxed', material: 'Cotton–Silk Blend', fabricCare: 'Dry clean recommended.', description: 'Silk-trimmed pyjamas that blur the line between sleepwear and going out.', images: ['https://images.pexels.com/photos/8346048/pexels-photo-8346048.jpeg','https://images.pexels.com/photos/16238583/pexels-photo-16238583.jpeg'], tags: ['best-seller','new'], stock: 18 },
  { gender: GENDERS.WOMEN, id: 'w-pyjama-short', name: 'Linen Short Set', slug: 'linen-short-set', category: 'pyjamas', price: 1899, compareAt: 2499, rating: 4.5, reviewCount: 41, sizes: ['XS','S','M','L','XL'], colors: [{ name: 'Ivory', hex: '#f4f0e8' }, { name: 'Mint', hex: '#b5d5c5' }], fit: 'Relaxed Short', material: '100% European Linen', fabricCare: 'Cold hand wash.', description: 'A linen short set for warmer nights. Breezy, breathable, bedtime approved.', images: ['https://images.pexels.com/photos/5864267/pexels-photo-5864267.jpeg','https://images.pexels.com/photos/8346048/pexels-photo-8346048.jpeg'], tags: ['new'], stock: 24 },
];

async function ensureSeed(db) {
  const count = await db.collection('products').countDocuments();
  if (count === 0) await db.collection('products').insertMany(SEED_PRODUCTS);
}

/* ============ Response helper ============ */
function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/* ============ Admin auth ============ */
function signToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verifyToken(token) {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(body).digest('base64url');
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    // 7-day expiry
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch { return null; }
}
function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

/* ============ OPTIONS ============ */
export async function OPTIONS() { return json({}, 200); }

/* ============ GET ============ */
export async function GET(request, { params }) {
  try {
    const db = await getDb();
    await ensureSeed(db);
    const p = (await params)?.path || [];
    const url = new URL(request.url);

    if (p.length === 0 || (p.length === 1 && p[0] === 'health')) {
      return json({ ok: true, service: 'fitstich-api' });
    }

    /* -------- Public products -------- */
    if (p[0] === 'products' && p.length === 1) {
      const category = url.searchParams.get('category');
      const tag = url.searchParams.get('tag');
      const size = url.searchParams.get('size');
      const color = url.searchParams.get('color');
      const minPrice = parseInt(url.searchParams.get('minPrice') || '0', 10);
      const maxPrice = parseInt(url.searchParams.get('maxPrice') || '999999', 10);
      const sort = url.searchParams.get('sort') || 'newest';
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();

      const query = { price: { $gte: minPrice, $lte: maxPrice } };
      if (category && category !== 'all') query.category = category;
      if (tag) query.tags = tag;
      if (size) query.sizes = size;
      if (color) query['colors.name'] = color;
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ];
      }

      const list = await db.collection('products').find(query, { projection: { _id: 0 } }).toArray();
      if (sort === 'price-low') list.sort((a,b) => a.price - b.price);
      else if (sort === 'price-high') list.sort((a,b) => b.price - a.price);
      else if (sort === 'popular') list.sort((a,b) => b.reviewCount - a.reviewCount);
      return json({ products: list, count: list.length });
    }

    if (p[0] === 'products' && p.length === 2) {
      const prod = await db.collection('products').findOne({ id: p[1] }, { projection: { _id: 0 } });
      if (!prod) return json({ error: 'Not found' }, 404);
      const related = await db.collection('products').find({ category: prod.category, id: { $ne: prod.id } }, { projection: { _id: 0 } }).limit(4).toArray();
      return json({ product: prod, related });
    }

    /* -------- Cart -------- */
    if (p[0] === 'cart') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) return json({ error: 'sessionId required' }, 400);
      const cart = await db.collection('carts').findOne({ sessionId }, { projection: { _id: 0 } });
      return json({ cart: cart || { sessionId, items: [] } });
    }

    /* -------- Guest order lookup -------- */
    if (p[0] === 'orders' && p.length === 2) {
      const order = await db.collection('orders').findOne({ id: p[1] }, { projection: { _id: 0 } });
      if (!order) return json({ error: 'Not found' }, 404);
      return json({ order });
    }

    /* -------- Admin endpoints -------- */
    if (p[0] === 'admin') {
      const admin = requireAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      if (p[1] === 'me') return json({ ok: true, admin });

      if (p[1] === 'stats') {
        const [orders, products, subs] = await Promise.all([
          db.collection('orders').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('products').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('newsletter').countDocuments(),
        ]);
        const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
        const pending = orders.filter(o => o.status === 'pending').length;
        const lowStock = products.filter(p => (p.stock || 0) <= 25).sort((a,b) => (a.stock||0) - (b.stock||0));
        const recentOrders = orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        // sales last 7 days
        const now = new Date();
        const salesByDay = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
          const next = new Date(d); next.setDate(next.getDate() + 1);
          const dayOrders = orders.filter(o => {
            const t = new Date(o.createdAt); return t >= d && t < next;
          });
          salesByDay.push({
            date: d.toISOString().slice(0,10),
            revenue: dayOrders.reduce((s,o) => s + (o.total || 0), 0),
            count: dayOrders.length,
          });
        }
        return json({
          totals: {
            orders: orders.length,
            revenue,
            pending,
            products: products.length,
            subscribers: subs,
            lowStockCount: lowStock.length,
          },
          lowStock: lowStock.slice(0, 10),
          recentOrders,
          salesByDay,
        });
      }

      if (p[1] === 'products') {
        const list = await db.collection('products').find({}, { projection: { _id: 0 } }).toArray();
        return json({ products: list });
      }

      if (p[1] === 'orders') {
        const status = url.searchParams.get('status');
        const q = {};
        if (status && status !== 'all') q.status = status;
        const list = await db.collection('orders').find(q, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
        return json({ orders: list });
      }

      if (p[1] === 'newsletter') {
        const subs = await db.collection('newsletter').find({}, { projection: { _id: 0 } }).sort({ subscribedAt: -1 }).toArray();
        // return CSV if requested
        if (url.searchParams.get('format') === 'csv') {
          const csv = 'email,subscribed_at\n' + subs.map(s => `${s.email},${new Date(s.subscribedAt).toISOString()}`).join('\n');
          return new NextResponse(csv, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="fitstich-subscribers.csv"',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        return json({ subscribers: subs });
      }
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

/* ============ POST ============ */
export async function POST(request, { params }) {
  try {
    const db = await getDb();
    await ensureSeed(db);
    const p = (await params)?.path || [];
    const body = await request.json().catch(() => ({}));

    /* Cart */
    if (p[0] === 'cart') {
      const { sessionId, items } = body;
      if (!sessionId) return json({ error: 'sessionId required' }, 400);
      await db.collection('carts').updateOne(
        { sessionId },
        { $set: { sessionId, items: items || [], updatedAt: new Date() } },
        { upsert: true }
      );
      return json({ ok: true });
    }

    /* Newsletter */
    if (p[0] === 'newsletter') {
      const { email } = body;
      if (!email) return json({ error: 'email required' }, 400);
      const rl = rateLimit({ interval: 60000, max: 5 });
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const check = rl(`newsletter:${clientIp}`);
      if (!check.allowed) return json({ error: `Too many requests. Retry in ${check.retryAfter}s` }, 429);
      await db.collection('newsletter').updateOne(
        { email: email.toLowerCase().trim() },
        { $set: { email: email.toLowerCase().trim(), subscribedAt: new Date() } },
        { upsert: true }
      );
      return json({ ok: true });
    }

    /* Guest order placement */
    if (p[0] === 'orders') {
      const rl = rateLimit({ interval: 60000, max: 10 });
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const check = rl(`orders:${clientIp}`);
      if (!check.allowed) return json({ error: `Too many requests. Retry in ${check.retryAfter}s` }, 429);

      const { customer, items, subtotal, discount, shipping, total, couponCode, paymentMethod } = body;
      if (!customer?.email || !customer?.phone || !customer?.address || !items?.length) {
        return json({ error: 'Missing required fields' }, 400);
      }
      // Validate stock
      for (const it of items) {
        const prod = await db.collection('products').findOne({ id: it.id }, { projection: { stock: 1 } });
        if (!prod) return json({ error: `Product ${it.id} not found` }, 400);
        if ((prod.stock || 0) < it.quantity) {
          return json({ error: `Insufficient stock for ${it.name || it.id}. Available: ${prod.stock || 0}, requested: ${it.quantity}` }, 409);
        }
      }
      const order = {
        id: `FS-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0,4).toUpperCase()}`,
        customer,
        items,
        subtotal: subtotal || 0,
        discount: discount || 0,
        shipping: shipping || 0,
        total: total || 0,
        couponCode: couponCode || null,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
        status: 'pending',
        createdAt: new Date(),
      };
      await db.collection('orders').insertOne(order);
      // reduce stock
      for (const it of items) {
        await db.collection('products').updateOne(
          { id: it.id, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } }
        );
      }
      const { _id, ...rest } = order;
      // Trigger order confirmation email (async, non-blocking)
      try { await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'confirmation', order: rest }) }); } catch {}
      return json({ ok: true, order: rest });
    }

    /* Admin login */
    if (p[0] === 'admin' && p[1] === 'login') {
      const { password } = body;
      if (!password || password !== ADMIN_PASSWORD) {
        return json({ error: 'Invalid password' }, 401);
      }
      const token = signToken({ role: 'admin' });
      return json({ ok: true, token });
    }

    /* Admin protected POSTs */
    if (p[0] === 'admin') {
      const admin = requireAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      /* Create product */
      if (p[1] === 'products') {
        const now = new Date();
        const prod = {
          gender: body.gender || 'men',
          id: body.id || `p-${uuidv4().slice(0,8)}`,
          name: body.name || 'Untitled',
          slug: (body.slug || body.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          category: body.category || 'oversized',
          price: Number(body.price) || 0,
          compareAt: Number(body.compareAt) || Number(body.price) || 0,
          rating: Number(body.rating) || 4.5,
          reviewCount: Number(body.reviewCount) || 0,
          sizes: body.sizes || ['S','M','L','XL'],
          colors: body.colors || [{ name: 'Black', hex: '#0a0a0a' }],
          fit: body.fit || 'Regular',
          material: body.material || '',
          fabricCare: body.fabricCare || '',
          description: body.description || '',
          images: body.images || [],
          tags: body.tags || [],
          stock: Number(body.stock) || 0,
          createdAt: now,
        };
        await db.collection('products').insertOne(prod);
        const { _id, ...rest } = prod;
        return json({ ok: true, product: rest });
      }

      /* Reseed — dev-only */
      if (p[1] === 'reseed') {
        if (!IS_DEV) return json({ error: 'Not available in production' }, 403);
        await db.collection('products').deleteMany({});
        await db.collection('products').insertMany(SEED_PRODUCTS);
        return json({ ok: true, seeded: SEED_PRODUCTS.length });
      }
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

/* ============ PUT ============ */
export async function PUT(request, { params }) {
  try {
    const db = await getDb();
    const p = (await params)?.path || [];
    const body = await request.json().catch(() => ({}));

    if (p[0] === 'admin') {
      const admin = requireAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      /* Update product */
      if (p[1] === 'products' && p[2]) {
        const update = { ...body };
        delete update._id; delete update.id; delete update.createdAt;
        if (update.price != null) update.price = Number(update.price);
        if (update.compareAt != null) update.compareAt = Number(update.compareAt);
        if (update.stock != null) update.stock = Number(update.stock);
        if (update.reviewCount != null) update.reviewCount = Number(update.reviewCount);
        if (update.rating != null) update.rating = Number(update.rating);
        update.updatedAt = new Date();
        const r = await db.collection('products').updateOne({ id: p[2] }, { $set: update });
        if (!r.matchedCount) return json({ error: 'Not found' }, 404);
        const prod = await db.collection('products').findOne({ id: p[2] }, { projection: { _id: 0 } });
        return json({ ok: true, product: prod });
      }

      /* Update order status */
      if (p[1] === 'orders' && p[2]) {
        const allowed = ['pending','processing','shipped','delivered','cancelled'];
        if (body.status && !allowed.includes(body.status)) return json({ error: 'Invalid status' }, 400);
        const update = { updatedAt: new Date() };
        if (body.status) update.status = body.status;
        if (body.paymentStatus) update.paymentStatus = body.paymentStatus;
        if (body.trackingNumber) update.trackingNumber = body.trackingNumber;
        const r = await db.collection('orders').updateOne({ id: p[2] }, { $set: update });
        if (!r.matchedCount) return json({ error: 'Not found' }, 404);
        const order = await db.collection('orders').findOne({ id: p[2] }, { projection: { _id: 0 } });
        // Trigger shipping notification email
        if (body.status === 'shipped') {
          try { await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'shipping', order }) }); } catch {}
        }
        return json({ ok: true, order });
      }
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

/* ============ DELETE ============ */
export async function DELETE(request, { params }) {
  try {
    const db = await getDb();
    const p = (await params)?.path || [];

    if (p[0] === 'admin') {
      const admin = requireAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      if (p[1] === 'products' && p[2]) {
        const r = await db.collection('products').deleteOne({ id: p[2] });
        if (!r.deletedCount) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
      }

      if (p[1] === 'orders' && p[2]) {
        const r = await db.collection('orders').deleteOne({ id: p[2] });
        if (!r.deletedCount) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
      }
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}
