export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const cx = (...c) => c.filter(Boolean).join(' ');

export const GENDERS = { MEN: 'men', WOMEN: 'women' };
export const GENDER_LABELS = { men: 'Men', women: 'Women' };

export const CATEGORIES = [
  { key: 'oversized', label: 'Oversized Tees', code: 'OS' },
  { key: 'regular', label: 'Regular Tees', code: 'RG' },
  { key: 'joggers', label: 'Joggers', code: 'JG' },
  { key: 'pyjamas', label: 'Pyjamas', code: 'PY' },
];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
export const CATEGORY_CODE = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.code]));

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Body measurements per size, in inches — the grading table a pattern is nested from. */
export const GRADE_TABLE = {
  XS: { chest: 36, length: 26.5 },
  S: { chest: 38, length: 27.5 },
  M: { chest: 40, length: 28.5 },
  L: { chest: 42, length: 29.5 },
  XL: { chest: 44, length: 30.5 },
  XXL: { chest: 46, length: 31.5 },
};

/**
 * Stock state, expressed as line form rather than colour.
 * solid = stocked · dashed = made to order · graphite = low · hairline+struck = out
 */
export function stockState(stock) {
  const n = Number(stock);
  if (!Number.isFinite(n)) return { key: 'stocked', label: 'In stock', cls: 'state-stocked' };
  if (n <= 0) return { key: 'out', label: 'Cut out', cls: 'state-out' };
  if (n <= 6) return { key: 'low', label: `Last ${n}`, cls: 'state-low' };
  if (n <= 15) return { key: 'made', label: 'Low bolt', cls: 'state-made' };
  return { key: 'stocked', label: 'In stock', cls: 'state-stocked' };
}

/** Pull the GSM out of a material string like "100% Combed Cotton, 240 GSM". */
export function gsmOf(material) {
  const m = /(\d{2,3})\s*GSM/i.exec(material || '');
  return m ? Number(m[1]) : null;
}

export function yarnOf(material) {
  return (material || '').split(',')[0].trim();
}

/** Stable per-product drafting reference, e.g. FS·OS·M·1299 */
export function draftRef(p) {
  if (!p) return 'FS';
  return ['FS', CATEGORY_CODE[p.category] || 'XX', (p.gender || 'm')[0].toUpperCase(), p.price].join('·');
}

export function discountPct(p) {
  if (!p?.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

export const CART_KEY = 'fitstich_cart';

/**
 * Ask the host for a sensibly sized image.
 *
 * The seeded catalogue points at full-resolution Pexels originals — 0.7 to 2.9 MB
 * each, roughly 24 MB across the home page. This store is phone-first on Indian
 * mobile data, so we request a width instead. Presentation only: it rewrites
 * nothing in the database, and any URL it does not recognise passes through
 * untouched, including the locally uploaded `/uploads/...` files.
 */
export function sizedSrc(src, width = 900) {
  if (!src || typeof src !== 'string') return src;
  if (!/(^https?:)?\/\/images\.pexels\.com\//.test(src)) return src;
  if (src.includes('?')) return src;
  return `${src}?auto=compress&cs=tinysrgb&dpr=2&w=${width}`;
}
