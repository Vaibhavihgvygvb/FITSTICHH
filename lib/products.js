import 'server-only';
import { getDb } from './db';

const PROJECTION = { _id: 0 };

/** Server-side catalogue reads, so shop and product pages render on the server. */
export async function getProducts(filter = {}) {
  const db = await getDb();
  const q = {};
  if (filter.gender) q.gender = filter.gender;
  if (filter.category) q.category = filter.category;
  if (filter.tag) q.tags = filter.tag;
  return db.collection('products').find(q, { projection: PROJECTION }).toArray();
}

export async function getProductBySlug(slug) {
  const db = await getDb();
  return db.collection('products').findOne({ slug }, { projection: PROJECTION });
}

export async function getRelated(product, limit = 4) {
  if (!product) return [];
  const db = await getDb();
  return db
    .collection('products')
    .find(
      { gender: product.gender, category: product.category, slug: { $ne: product.slug } },
      { projection: PROJECTION }
    )
    .limit(limit)
    .toArray();
}

export async function getAllSlugs() {
  const db = await getDb();
  const rows = await db.collection('products').find({}, { projection: { slug: 1, _id: 0 } }).toArray();
  return rows.map((r) => r.slug).filter(Boolean);
}
