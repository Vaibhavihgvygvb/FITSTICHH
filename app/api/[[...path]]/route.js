import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'fitstich';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME);
}

// ----- Seed data -----
const SEED_PRODUCTS = [
  {
    id: 'p-oversized-noir',
    name: 'Noir Oversized Tee',
    slug: 'noir-oversized-tee',
    category: 'oversized',
    price: 1299,
    compareAt: 1899,
    rating: 4.8,
    reviewCount: 214,
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Bone', hex: '#efeae1' }],
    fit: 'Oversized',
    material: '100% Combed Cotton, 240 GSM',
    fabricCare: 'Machine wash cold. Do not bleach. Tumble dry low.',
    description: 'Heavyweight combed cotton with a drop-shoulder silhouette. Enzyme washed for a soft, lived-in feel from day one.',
    images: [
      'https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg',
      'https://images.pexels.com/photos/16238582/pexels-photo-16238582.jpeg',
      'https://images.pexels.com/photos/8558849/pexels-photo-8558849.jpeg'
    ],
    tags: ['best-seller','new'],
    stock: 42,
  },
  {
    id: 'p-oversized-bone',
    name: 'Bone Oversized Tee',
    slug: 'bone-oversized-tee',
    category: 'oversized',
    price: 1299,
    compareAt: 1799,
    rating: 4.7,
    reviewCount: 168,
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Bone', hex: '#efeae1' }, { name: 'Stone', hex: '#c9c3ba' }],
    fit: 'Oversized',
    material: '100% Combed Cotton, 240 GSM',
    fabricCare: 'Machine wash cold. Iron inside out.',
    description: 'The essential bone-white oversized tee. Boxy, breathable, and quietly confident.',
    images: [
      'https://images.pexels.com/photos/4066292/pexels-photo-4066292.jpeg',
      'https://images.pexels.com/photos/35644532/pexels-photo-35644532.jpeg'
    ],
    tags: ['new','trending'],
    stock: 68,
  },
  {
    id: 'p-oversized-stone',
    name: 'Stone Boxy Tee',
    slug: 'stone-boxy-tee',
    category: 'oversized',
    price: 1399,
    compareAt: 1999,
    rating: 4.6,
    reviewCount: 92,
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Stone', hex: '#c9c3ba' }, { name: 'Charcoal', hex: '#3a3a3a' }],
    fit: 'Boxy Oversized',
    material: 'Cotton–Modal Blend, 260 GSM',
    fabricCare: 'Cold wash. Dry flat.',
    description: 'A weighty modal-cotton blend with a soft drape. Cut long, worn easy.',
    images: [
      'https://images.pexels.com/photos/16238582/pexels-photo-16238582.jpeg',
      'https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg'
    ],
    tags: ['trending'],
    stock: 30,
  },
  {
    id: 'p-regular-classic',
    name: 'Classic Crew Tee',
    slug: 'classic-crew-tee',
    category: 'regular',
    price: 999,
    compareAt: 1499,
    rating: 4.5,
    reviewCount: 340,
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'White', hex: '#ffffff' }, { name: 'Grey', hex: '#8b8b8b' }],
    fit: 'Regular',
    material: '100% Cotton, 200 GSM',
    fabricCare: 'Machine wash cold.',
    description: 'The everyday crew. Tailored regular fit, reinforced neckline, made to last.',
    images: [
      'https://images.pexels.com/photos/8558849/pexels-photo-8558849.jpeg',
      'https://images.pexels.com/photos/7871177/pexels-photo-7871177.jpeg'
    ],
    tags: ['best-seller'],
    stock: 120,
  },
  {
    id: 'p-regular-charcoal',
    name: 'Charcoal Essential Tee',
    slug: 'charcoal-essential-tee',
    category: 'regular',
    price: 999,
    compareAt: 1399,
    rating: 4.6,
    reviewCount: 155,
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }],
    fit: 'Regular',
    material: '100% Cotton, 200 GSM',
    fabricCare: 'Cold wash.',
    description: 'A quiet, considered charcoal tee. Effortlessly versatile.',
    images: [
      'https://images.pexels.com/photos/7871177/pexels-photo-7871177.jpeg',
      'https://images.pexels.com/photos/8558849/pexels-photo-8558849.jpeg'
    ],
    tags: [],
    stock: 55,
  },
  {
    id: 'p-jogger-noir',
    name: 'Noir Tapered Joggers',
    slug: 'noir-tapered-joggers',
    category: 'joggers',
    price: 1799,
    compareAt: 2499,
    rating: 4.7,
    reviewCount: 187,
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Charcoal', hex: '#3a3a3a' }],
    fit: 'Tapered',
    material: 'French Terry, 320 GSM',
    fabricCare: 'Cold wash. Do not tumble dry.',
    description: 'Structured French terry, tapered leg, elastic waist with drawcord. Studio to street.',
    images: [
      'https://images.pexels.com/photos/26524780/pexels-photo-26524780.jpeg',
      'https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg'
    ],
    tags: ['best-seller','new'],
    stock: 60,
  },
  {
    id: 'p-jogger-slate',
    name: 'Slate Relaxed Joggers',
    slug: 'slate-relaxed-joggers',
    category: 'joggers',
    price: 1899,
    compareAt: 2599,
    rating: 4.6,
    reviewCount: 98,
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Slate', hex: '#5a5f66' }, { name: 'Black', hex: '#0a0a0a' }],
    fit: 'Relaxed',
    material: 'French Terry, 320 GSM',
    fabricCare: 'Cold wash.',
    description: 'A relaxed silhouette in muted slate. Deep pockets, gusseted crotch, engineered to move.',
    images: [
      'https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg',
      'https://images.pexels.com/photos/26524780/pexels-photo-26524780.jpeg'
    ],
    tags: ['trending'],
    stock: 40,
  },
  {
    id: 'p-jogger-bone',
    name: 'Bone Straight Joggers',
    slug: 'bone-straight-joggers',
    category: 'joggers',
    price: 1899,
    compareAt: 2499,
    rating: 4.5,
    reviewCount: 61,
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Bone', hex: '#efeae1' }],
    fit: 'Straight',
    material: 'Heavy French Terry, 340 GSM',
    fabricCare: 'Wash separately first time.',
    description: 'Straight-leg cut with a heavier hand. Editorial minimalism, everyday utility.',
    images: [
      'https://images.pexels.com/photos/18584221/pexels-photo-18584221.jpeg',
      'https://images.pexels.com/photos/26524780/pexels-photo-26524780.jpeg'
    ],
    tags: ['new'],
    stock: 35,
  },
  {
    id: 'p-pyjama-linen',
    name: 'Ivory Linen Pyjama Set',
    slug: 'ivory-linen-pyjama-set',
    category: 'pyjamas',
    price: 2299,
    compareAt: 2999,
    rating: 4.9,
    reviewCount: 74,
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Ivory', hex: '#f4f0e8' }, { name: 'Stone', hex: '#c9c3ba' }],
    fit: 'Relaxed',
    material: '100% European Linen',
    fabricCare: 'Cold hand wash preferred.',
    description: 'Airy European linen. A two-piece set that lives between sleep and Sunday.',
    images: [
      'https://images.pexels.com/photos/16238583/pexels-photo-16238583.jpeg',
      'https://images.pexels.com/photos/8346048/pexels-photo-8346048.jpeg'
    ],
    tags: ['new'],
    stock: 22,
  },
  {
    id: 'p-pyjama-cotton',
    name: 'Midnight Cotton Pyjamas',
    slug: 'midnight-cotton-pyjamas',
    category: 'pyjamas',
    price: 1999,
    compareAt: 2699,
    rating: 4.7,
    reviewCount: 51,
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Midnight', hex: '#0f1216' }, { name: 'Charcoal', hex: '#3a3a3a' }],
    fit: 'Relaxed',
    material: 'Brushed Cotton, 180 GSM',
    fabricCare: 'Machine wash cold. Iron on low.',
    description: 'Brushed for softness. Cut for rest. The pyjama, considered.',
    images: [
      'https://images.pexels.com/photos/8346048/pexels-photo-8346048.jpeg',
      'https://images.pexels.com/photos/16238583/pexels-photo-16238583.jpeg'
    ],
    tags: ['best-seller'],
    stock: 48,
  },
  {
    id: 'p-oversized-charcoal',
    name: 'Charcoal Drop-Shoulder Tee',
    slug: 'charcoal-drop-shoulder-tee',
    category: 'oversized',
    price: 1299,
    compareAt: 1799,
    rating: 4.6,
    reviewCount: 112,
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Black', hex: '#0a0a0a' }],
    fit: 'Oversized',
    material: '100% Combed Cotton, 240 GSM',
    fabricCare: 'Cold wash.',
    description: 'A drop-shoulder oversized tee in a soft charcoal wash.',
    images: [
      'https://images.pexels.com/photos/35644532/pexels-photo-35644532.jpeg',
      'https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg'
    ],
    tags: ['trending'],
    stock: 44,
  },
  {
    id: 'p-jogger-onyx',
    name: 'Onyx Cargo Joggers',
    slug: 'onyx-cargo-joggers',
    category: 'joggers',
    price: 2199,
    compareAt: 2999,
    rating: 4.8,
    reviewCount: 89,
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Black', hex: '#0a0a0a' }],
    fit: 'Utility',
    material: 'Twill Cotton, 320 GSM',
    fabricCare: 'Cold wash.',
    description: 'Utility cargo joggers with side pockets and reinforced stitching.',
    images: [
      'https://images.pexels.com/photos/18584221/pexels-photo-18584221.jpeg',
      'https://images.pexels.com/photos/9558588/pexels-photo-9558588.jpeg'
    ],
    tags: ['new','best-seller'],
    stock: 28,
  },
];

async function ensureSeed(db) {
  const count = await db.collection('products').countDocuments();
  if (count === 0) {
    await db.collection('products').insertMany(SEED_PRODUCTS);
  }
}

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

export async function OPTIONS() {
  return json({}, 200);
}

export async function GET(request, { params }) {
  try {
    const db = await getDb();
    await ensureSeed(db);
    const p = (await params)?.path || [];
    const url = new URL(request.url);

    if (p.length === 0 || (p.length === 1 && p[0] === 'health')) {
      return json({ ok: true, service: 'fitstich-api' });
    }

    // GET /api/products?category=oversized&tag=best-seller&size=M&color=Black&minPrice=&maxPrice=&sort=newest&q=
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

      let cursor = db.collection('products').find(query, { projection: { _id: 0 } });
      const list = await cursor.toArray();
      // in-memory sort
      if (sort === 'price-low') list.sort((a,b) => a.price - b.price);
      else if (sort === 'price-high') list.sort((a,b) => b.price - a.price);
      else if (sort === 'popular') list.sort((a,b) => b.reviewCount - a.reviewCount);
      // newest = insertion order
      return json({ products: list, count: list.length });
    }

    // GET /api/products/:id
    if (p[0] === 'products' && p.length === 2) {
      const prod = await db.collection('products').findOne({ id: p[1] }, { projection: { _id: 0 } });
      if (!prod) return json({ error: 'Not found' }, 404);
      // related
      const related = await db.collection('products').find(
        { category: prod.category, id: { $ne: prod.id } },
        { projection: { _id: 0 } }
      ).limit(4).toArray();
      return json({ product: prod, related });
    }

    // GET /api/cart?sessionId=...
    if (p[0] === 'cart') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) return json({ error: 'sessionId required' }, 400);
      const cart = await db.collection('carts').findOne({ sessionId }, { projection: { _id: 0 } });
      return json({ cart: cart || { sessionId, items: [] } });
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

export async function POST(request, { params }) {
  try {
    const db = await getDb();
    const p = (await params)?.path || [];
    const body = await request.json().catch(() => ({}));

    // POST /api/cart  { sessionId, items: [{productId, size, color, quantity}] }
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

    // POST /api/newsletter { email }
    if (p[0] === 'newsletter') {
      const { email } = body;
      if (!email) return json({ error: 'email required' }, 400);
      await db.collection('newsletter').updateOne(
        { email },
        { $set: { email, subscribedAt: new Date() } },
        { upsert: true }
      );
      return json({ ok: true });
    }

    // POST /api/reseed (dev helper) — wipes and reseeds products
    if (p[0] === 'reseed') {
      await db.collection('products').deleteMany({});
      await db.collection('products').insertMany(SEED_PRODUCTS);
      return json({ ok: true, seeded: SEED_PRODUCTS.length });
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}
