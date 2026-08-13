'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, ChevronLeft,
  Star, Truck, ShieldCheck, RotateCcw, Plus, Minus, Instagram, Facebook,
  Twitter, ArrowRight, Check, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const cx = (...c) => c.filter(Boolean).join(' ');

const GENDERS = { MEN: 'men', WOMEN: 'women' };
const GENDER_LABELS = { men: 'Men', women: 'Women' };
const CATEGORIES = [
  { key: 'oversized', label: 'Oversized Tees' },
  { key: 'regular', label: 'Regular Tees' },
  { key: 'joggers', label: 'Joggers' },
  { key: 'pyjamas', label: 'Pyjamas' },
];
const GENDER_CARDS = [
  { gender: GENDERS.MEN, label: 'Men', img: 'https://images.pexels.com/photos/7945666/pexels-photo-7945666.jpeg' },
  { gender: GENDERS.WOMEN, label: 'Women', img: 'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg' },
];
const ALL_SIZES = ['XS','S','M','L','XL','XXL'];
const ALL_COLORS = [
  { name: 'Black', hex: '#0a0a0a' }, { name: 'White', hex: '#ffffff' },
  { name: 'Bone', hex: '#efeae1' }, { name: 'Stone', hex: '#c9c3ba' },
  { name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Slate', hex: '#5a5f66' },
  { name: 'Ivory', hex: '#f4f0e8' }, { name: 'Midnight', hex: '#0f1216' },
  { name: 'Grey', hex: '#8b8b8b' },
];

function useCart() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem('fitstich_cart'); if (raw) setItems(JSON.parse(raw)); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('fitstich_cart', JSON.stringify(items)); }, [items, ready]);
  const add = (product, size, color, qty = 1) => {
    setItems((prev) => {
      const key = `${product.id}|${size}|${color?.name}`;
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], quantity: next[idx].quantity + qty }; return next; }
      return [...prev, { key, id: product.id, name: product.name, price: product.price, image: product.images[0], size, color, quantity: qty, slug: product.slug }];
    });
  };
  const update = (key, qty) => setItems((prev) => prev.flatMap((i) => i.key !== key ? [i] : (qty <= 0 ? [] : [{ ...i, quantity: qty }])));
  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  return { items, add, update, remove, subtotal, totalQty };
}

function AnnouncementBar() {
  const msgs = ['FREE SHIPPING ON ORDERS OVER ₹1499','IN-HOUSE MANUFACTURED · SHIPPED FROM INDIA','NEW SEASON DROP — LIVE NOW','EXTRA 10% OFF ON PREPAID ORDERS'];
  return (
    <div className="bg-black text-white text-[11px] tracking-[0.2em] uppercase overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee py-2.5">
        {[...msgs, ...msgs, ...msgs].map((m, i) => <span key={i} className="mx-8 opacity-80">{m}</span>)}
      </div>
    </div>
  );
}

function Navbar({ onNav, cartCount, onCartOpen, onSearchOpen, activeGender }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaGender, setMegaGender] = useState(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const handleGenderClick = (g) => onNav({ view: 'shop', gender: g });
  return (
    <header className={cx('sticky top-0 z-40 w-full transition-all duration-500 bg-white', scrolled ? 'shadow-luxe border-b border-neutral-100' : 'border-b border-transparent')}>
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
        <div className="h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <button aria-label="menu" onClick={() => setMobileOpen(true)}><Menu className="w-6 h-6" /></button>
          </div>
          <button onClick={() => onNav({ view: 'home' })} className="font-display font-black text-2xl lg:text-3xl tracking-[-0.05em]">
            FITSTICH<span className="text-neutral-300">.</span>
          </button>
          <nav className="hidden lg:flex items-center gap-8 relative">
            <div className="flex items-center gap-1 border border-neutral-200 rounded-full p-0.5">
              {[GENDERS.MEN, GENDERS.WOMEN].map((g) => (
                <button key={g} onClick={() => handleGenderClick(g)}
                  className={cx('px-5 py-1.5 text-[12px] uppercase tracking-[0.15em] font-medium rounded-full transition-all',
                    activeGender === g ? 'bg-black text-white' : 'text-neutral-600 hover:text-black')}>
                  {GENDER_LABELS[g]}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-neutral-200" />
            <div className="flex items-center gap-6">
              {CATEGORIES.map((c) => (
                <button key={c.key} onClick={() => onNav({ view: 'shop', gender: activeGender || GENDERS.MEN, category: c.key })}
                  className="text-[12px] uppercase tracking-[0.15em] font-medium text-neutral-600 hover:text-black transition-colors py-2">
                  {c.label}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-neutral-200" />
            <button onClick={() => onNav({ view: 'shop', tag: 'new', gender: activeGender || GENDERS.MEN })} className="text-[12px] uppercase tracking-[0.15em] font-medium text-neutral-600 hover:text-black transition-colors py-2">New</button>
            <button onClick={() => onNav({ view: 'shop', tag: 'best-seller', gender: activeGender || GENDERS.MEN })} className="text-[12px] uppercase tracking-[0.15em] font-medium text-neutral-600 hover:text-black transition-colors py-2">Best Sellers</button>
          </nav>
          <div className="flex items-center gap-4 lg:gap-5">
            <button aria-label="search" onClick={onSearchOpen} className="hover:opacity-60"><Search className="w-5 h-5" /></button>
            <button aria-label="wishlist" className="hidden sm:block hover:opacity-60"><Heart className="w-5 h-5" /></button>
            <a href="/account" aria-label="account" className="hidden sm:block hover:opacity-60"><User className="w-5 h-5" /></a>
            <button aria-label="cart" onClick={onCartOpen} className="relative hover:opacity-60">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.35 }} onClick={(e) => e.stopPropagation()} className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-xl tracking-tight">FITSTICH.</span>
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex gap-2 mb-6">
                {[GENDERS.MEN, GENDERS.WOMEN].map((g) => (
                  <button key={g} onClick={() => { setMobileOpen(false); handleGenderClick(g); }}
                    className={cx('flex-1 py-2 text-xs uppercase tracking-widest border', activeGender === g ? 'bg-black text-white border-black' : 'border-neutral-200')}>
                    {GENDER_LABELS[g]}
                  </button>
                ))}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">Categories</div>
              <nav className="flex flex-col gap-1 mb-6">
                {CATEGORIES.map((c) => (
                  <button key={c.key} onClick={() => { setMobileOpen(false); onNav({ view: 'shop', gender: activeGender || GENDERS.MEN, category: c.key }); }}
                    className="text-left py-3 border-b border-neutral-100 uppercase text-sm tracking-widest">
                    {c.label}
                  </button>
                ))}
              </nav>
              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <button onClick={() => { setMobileOpen(false); onNav({ view: 'shop', tag: 'new', gender: activeGender || GENDERS.MEN }); }} className="block text-sm py-2">New Arrivals</button>
                <button onClick={() => { setMobileOpen(false); onNav({ view: 'shop', tag: 'best-seller', gender: activeGender || GENDERS.MEN }); }} className="block text-sm py-2">Best Sellers</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function SearchOverlay({ open, onClose, products, onNav }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)).slice(0, 6);
  }, [q, products]);
  useEffect(() => { if (!open) setQ(''); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-[900px] mx-auto px-6 pt-10 pb-20">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">Search FITSTICH</span>
              <button onClick={onClose}><X className="w-5 h-5" /></button>
            </div>
            <div className="border-b-2 border-black flex items-center gap-3 pb-3">
              <Search className="w-5 h-5" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search oversized, joggers, pyjamas..." className="w-full text-2xl lg:text-4xl font-display tracking-tight outline-none bg-transparent placeholder:text-neutral-300" />
            </div>
            <div className="mt-8">
              {!q && (
                <>
                  <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3">Popular</div>
                  <div className="flex flex-wrap gap-2">
                    {['Oversized','Black Tee','Joggers','Bone','Linen Pyjamas'].map(t => (
                      <button key={t} onClick={() => setQ(t)} className="px-4 py-2 rounded-full border border-neutral-200 hover:border-black text-sm">{t}</button>
                    ))}
                  </div>
                </>
              )}
              {results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                  {results.map(p => (
                    <button key={p.id} onClick={() => { onClose(); onNav({ view: 'product', productId: p.id }); }} className="text-left group">
                      <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-2"><img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" /></div>
                      <div className="text-sm">{p.name}</div>
                      <div className="text-xs text-neutral-500">{inr(p.price)}</div>
                    </button>
                  ))}
                </div>
              )}
              {q && results.length === 0 && <p className="text-neutral-400 text-sm mt-8">No products match "{q}".</p>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hero({ onNav }) {
  return (
    <section className="relative w-full bg-white">
      <div className="grid lg:grid-cols-2 min-h-[85vh]">
        <div className="flex items-center px-6 md:px-12 lg:px-20 py-16 order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }} className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">SS25 · Essentials</div>
            <h1 className="font-display font-black text-[13vw] lg:text-[6.5vw] leading-[0.9] tracking-[-0.05em] mb-6">WEAR<br/>CONFIDENCE.</h1>
            <p className="text-neutral-600 text-base md:text-lg leading-relaxed max-w-md mb-10">Premium everyday essentials. Manufactured in-house, engineered to outlast trends.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => onNav({ view: 'shop', gender: 'men' })} className="h-12 px-8 rounded-none bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em]">Shop Men <ArrowRight className="w-4 h-4 ml-2" /></Button>
              <Button variant="outline" onClick={() => onNav({ view: 'shop', gender: 'women' })} className="h-12 px-8 rounded-none border-black text-black hover:bg-black hover:text-white text-xs uppercase tracking-[0.2em]">Shop Women</Button>
            </div>
          </motion.div>
        </div>
        <div className="relative order-1 lg:order-2 min-h-[50vh] lg:min-h-full overflow-hidden bg-neutral-100">
          <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} src="https://images.pexels.com/photos/7945666/pexels-photo-7945666.jpeg" alt="FITSTICH SS25" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-6 right-6 text-white text-[10px] uppercase tracking-[0.3em] bg-black/40 backdrop-blur px-3 py-1.5">Editorial 01</div>
        </div>
      </div>
    </section>
  );
}

function CategoryCards({ onNav }) {
  const cards = [
    { gender: GENDERS.MEN, label: 'Men', img: 'https://images.pexels.com/photos/7945666/pexels-photo-7945666.jpeg', subtitle: 'Oversized · Regular · Joggers · Pyjamas' },
    { gender: GENDERS.WOMEN, label: 'Women', img: 'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg', subtitle: 'Oversized · Regular · Joggers · Pyjamas' },
  ];
  return (
    <section className="py-20 lg:py-28 px-5 lg:px-10 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">The Collection</div>
          <h2 className="font-display font-black text-4xl lg:text-6xl tracking-[-0.04em]">Shop by gender</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
        {cards.map((c, i) => (
          <motion.button key={c.gender} onClick={() => onNav({ view: 'shop', gender: c.gender })}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
            className="group relative overflow-hidden zoom-parent block text-left min-h-[50vh] lg:min-h-[65vh]">
            <div className="absolute inset-0 bg-neutral-100 overflow-hidden">
              <img src={c.img} alt={c.label} className="zoom-child w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="font-display font-bold text-4xl lg:text-5xl tracking-tight mb-2">{c.label}</h3>
              <p className="text-sm text-white/70 uppercase tracking-widest">{c.subtitle}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, onNav, onQuickAdd }) {
  const [hover, setHover] = useState(false);
  const discount = Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="group">
      <button onClick={() => onNav({ view: 'product', productId: product.id })} className="block w-full text-left">
        <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
          <img src={product.images[0]} alt={product.name} className={cx('absolute inset-0 w-full h-full object-cover transition-opacity duration-700', hover && product.images[1] ? 'opacity-0' : 'opacity-100')} />
          {product.images[1] && <img src={product.images[1]} alt="" className={cx('absolute inset-0 w-full h-full object-cover transition-opacity duration-700', hover ? 'opacity-100' : 'opacity-0')} />}
          {discount > 0 && <div className="absolute top-3 left-3 bg-white text-black text-[10px] uppercase tracking-widest px-2 py-1">-{discount}%</div>}
          {product.tags?.includes('new') && <div className="absolute top-3 right-3 bg-black text-white text-[10px] uppercase tracking-widest px-2 py-1">New</div>}
          <div className={cx('absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300', hover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}>
            <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(product); }} className="flex-1 bg-black text-white text-[11px] uppercase tracking-widest py-3 text-center cursor-pointer hover:bg-neutral-800">Quick Add</span>
            <span className="bg-white text-black text-[11px] px-3 flex items-center justify-center cursor-pointer hover:bg-neutral-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success('Added to wishlist'); }}>
              <Heart className="w-4 h-4" />
            </span>
          </div>
        </div>
        <div className="pt-4">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 fill-black" />
            <span className="text-[11px] text-neutral-500">{product.rating} · {product.reviewCount}</span>
          </div>
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold">{inr(product.price)}</span>
            {product.compareAt > product.price && <span className="text-xs text-neutral-400 line-through">{inr(product.compareAt)}</span>}
          </div>
          <div className="flex gap-1.5 mt-2">
            {product.colors.slice(0,4).map(c => (
              <span key={c.name} title={c.name} className="w-3 h-3 rounded-full border border-neutral-200" style={{ background: c.hex }} />
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}

function FeaturedGrid({ products, onNav, onQuickAdd, title = 'Best sellers', tag = 'best-seller', gender = GENDERS.MEN }) {
  return (
    <section className="py-16 lg:py-20 px-5 lg:px-10 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">{gender === GENDERS.MEN ? "Men's" : "Women's"} Featured</div>
          <h2 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.04em]">{title}</h2>
        </div>
        <button onClick={() => onNav({ view: 'shop', tag, gender })} className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:gap-3 transition-all">
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
        {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onNav={onNav} onQuickAdd={onQuickAdd} />)}
      </div>
    </section>
  );
}

function TrendingSlider({ products, onNav, onQuickAdd, title = 'Just dropped' }) {
  const scroller = useRef(null);
  const scroll = (dir) => { if (scroller.current) scroller.current.scrollBy({ left: dir * 400, behavior: 'smooth' }); };
  return (
    <section className="py-16 lg:py-20 bg-neutral-50">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">Trending Now</div>
            <h2 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.04em]">{title}</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll(-1)} className="w-11 h-11 rounded-full border border-neutral-300 hover:bg-black hover:text-white transition flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => scroll(1)} className="w-11 h-11 rounded-full border border-neutral-300 hover:bg-black hover:text-white transition flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <div ref={scroller} className="flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar px-5 lg:px-10 max-w-[1400px] mx-auto snap-x snap-mandatory">
        {products.map(p => (
          <div key={p.id} className="min-w-[70%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[24%] snap-start">
            <ProductCard product={p} onNav={onNav} onQuickAdd={onQuickAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ValueProps() {
  const items = [
    { Icon: Truck, title: 'Free Shipping', text: 'On orders over ₹1,499' },
    { Icon: RotateCcw, title: 'Easy Returns', text: '7-day hassle-free returns' },
    { Icon: ShieldCheck, title: 'Secure Payments', text: 'UPI · Cards · COD' },
    { Icon: Check, title: 'Made In-House', text: 'From loom to your door' },
  ];
  return (
    <section className="border-y border-neutral-100 py-10">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4">
            <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-neutral-500">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
      toast.success('Welcome to FITSTICH.');
      setEmail('');
    } catch { toast.error('Try again'); } finally { setLoading(false); }
  };
  return (
    <section className="py-24 bg-black text-white">
      <div className="max-w-[900px] mx-auto px-6 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4">The Newsletter</div>
        <h2 className="font-display font-black text-4xl lg:text-6xl tracking-[-0.04em] mb-4">First to know. First to wear.</h2>
        <p className="text-neutral-400 mb-10 max-w-md mx-auto">Get 10% off your first order + early access to drops.</p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="your@email.com" className="h-12 rounded-none border-neutral-700 bg-transparent text-white placeholder:text-neutral-500 focus-visible:ring-white" />
          <Button type="submit" disabled={loading} className="h-12 rounded-none bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-[0.2em] px-8">{loading ? 'Subscribing…' : 'Subscribe'}</Button>
        </form>
      </div>
    </section>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="bg-white pt-20 pb-8 border-t border-neutral-100">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 grid md:grid-cols-5 gap-10 mb-16">
        <div className="md:col-span-2">
          <div className="font-display font-black text-3xl tracking-[-0.05em] mb-4">FITSTICH.</div>
          <p className="text-sm text-neutral-500 max-w-xs">Premium everyday essentials. Manufactured in-house. Made to outlast.</p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com/fitstich" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="w-5 h-5 hover:text-neutral-500 transition-colors" /></a>
            <a href="https://facebook.com/fitstich" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="w-5 h-5 hover:text-neutral-500 transition-colors" /></a>
            <a href="https://twitter.com/fitstich" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter className="w-5 h-5 hover:text-neutral-500 transition-colors" /></a>
          </div>
        </div>
        {[
          { title: 'Men', links: [['Oversized Tees', GENDERS.MEN, 'oversized'],['Regular Tees', GENDERS.MEN, 'regular'],['Joggers', GENDERS.MEN, 'joggers'],['Pyjamas', GENDERS.MEN, 'pyjamas']] },
          { title: 'Women', links: [['Oversized Tees', GENDERS.WOMEN, 'oversized'],['Regular Tees', GENDERS.WOMEN, 'regular'],['Joggers', GENDERS.WOMEN, 'joggers'],['Pyjamas', GENDERS.WOMEN, 'pyjamas']] },
          { title: 'Help', links: [['Track Order','/orders'],['Shipping','/shipping'],['Returns','/returns'],['Size Guide','/shipping'],['Contact','mailto:support@fitstich.com']] },
          { title: 'Company', links: [['About','/#about'],['Careers','/#careers'],['Privacy','/privacy'],['Terms','/terms']] },
        ].map(col => (
          <div key={col.title}>
            <div className="text-xs uppercase tracking-[0.2em] mb-4 text-neutral-400">{col.title}</div>
            <ul className="space-y-2">
              {col.links.map(([label, ...rest]) => {
                if (rest.length === 1 && typeof rest[0] === 'string' && rest[0].startsWith('/')) return <li key={label}><a href={rest[0]} className="text-sm text-neutral-700 hover:text-black">{label}</a></li>;
                if (rest.length === 1 && typeof rest[0] === 'string' && rest[0].startsWith('mailto:')) return <li key={label}><a href={rest[0]} className="text-sm text-neutral-700 hover:text-black">{label}</a></li>;
                const [gender, category] = rest;
                return <li key={label}><button onClick={() => onNav({ view: 'shop', gender, category })} className="text-sm text-neutral-700 hover:text-black">{label}</button></li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-neutral-100 text-xs text-neutral-400">
        <div>© {new Date().getFullYear()} FITSTICH. All rights reserved.</div>
        <div className="flex gap-6"><a href="/privacy" className="hover:text-black">Privacy Policy</a><a href="/terms" className="hover:text-black">Terms of Service</a><a href="/returns" className="hover:text-black">Returns</a></div>
      </div>
    </footer>
  );
}

function ShopPage({ products, onNav, onQuickAdd, initialGender, initialCategory, initialTag }) {
  const [gender, setGender] = useState(initialGender || GENDERS.MEN);
  const [category, setCategory] = useState(initialCategory || 'all');
  const [tag, setTag] = useState(initialTag || null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [price, setPrice] = useState([0, 3000]);
  const [sort, setSort] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (gender) list = list.filter(p => p.gender === gender);
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (tag) list = list.filter(p => p.tags?.includes(tag));
    if (sizes.length) list = list.filter(p => p.sizes.some(s => sizes.includes(s)));
    if (colors.length) list = list.filter(p => p.colors.some(c => colors.includes(c.name)));
    list = list.filter(p => p.price >= price[0] && p.price <= price[1]);
    if (sort === 'price-low') list.sort((a,b) => a.price - b.price);
    else if (sort === 'price-high') list.sort((a,b) => b.price - a.price);
    else if (sort === 'popular') list.sort((a,b) => b.reviewCount - a.reviewCount);
    return list;
  }, [products, gender, category, tag, sizes, colors, price, sort]);

  const toggle = (arr, setter, val) => setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] mb-4">Category</div>
        <div className="space-y-2">
          {[{ key: 'all', label: 'All' }, ...CATEGORIES].map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} className={cx('block text-sm w-full text-left py-1', category === c.key ? 'font-semibold' : 'text-neutral-500 hover:text-black')}>{c.label}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] mb-4">Price · {inr(price[0])} — {inr(price[1])}</div>
        <Slider value={price} onValueChange={setPrice} min={0} max={3000} step={100} />
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] mb-4">Size</div>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map(s => (
            <button key={s} onClick={() => toggle(sizes, setSizes, s)} className={cx('w-11 h-11 border text-sm', sizes.includes(s) ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black')}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] mb-4">Color</div>
        <div className="flex flex-wrap gap-2">
          {ALL_COLORS.map(c => (
            <button key={c.name} onClick={() => toggle(colors, setColors, c.name)} title={c.name} className={cx('w-9 h-9 rounded-full border-2 relative', colors.includes(c.name) ? 'border-black' : 'border-neutral-200')} style={{ background: c.hex }}>
              {colors.includes(c.name) && <Check className={cx('w-4 h-4 absolute inset-0 m-auto', ['White','Bone','Ivory'].includes(c.name) ? 'text-black' : 'text-white')} />}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => { setCategory('all'); setTag(null); setSizes([]); setColors([]); setPrice([0,3000]); }} className="text-xs uppercase tracking-widest underline underline-offset-4">Clear all</button>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-12">
      <div className="flex items-center gap-3 mb-8">
        {[GENDERS.MEN, GENDERS.WOMEN].map((g) => (
          <button key={g} onClick={() => { setGender(g); setCategory('all'); setTag(null); }}
            className={cx('px-6 py-2 text-xs uppercase tracking-[0.2em] font-medium border transition-all',
              gender === g ? 'bg-black text-white border-black' : 'border-neutral-200 text-neutral-600 hover:border-black')}>
            {GENDER_LABELS[g]}
          </button>
        ))}
      </div>
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">{GENDER_LABELS[gender]} {tag ? `· ${tag.replace('-', ' ')}` : ''}</div>
        <h1 className="font-display font-black text-4xl lg:text-6xl tracking-[-0.04em]">{category === 'all' ? `All ${GENDER_LABELS[gender]}'s Essentials` : CATEGORIES.find(c => c.key === category)?.label || 'Shop'}</h1>
      </div>
      <div className="flex justify-between items-center mb-6 gap-3">
        <button onClick={() => setFilterOpen(true)} className="lg:hidden flex items-center gap-2 border border-neutral-200 px-4 py-2 text-sm"><SlidersHorizontal className="w-4 h-4" /> Filters</button>
        <div className="text-sm text-neutral-500">{filtered.length} products</div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px] rounded-none border-neutral-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Popularity</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-24 self-start"><FilterPanel /></aside>
        <div>
          {filtered.length === 0 ? (
            <p className="text-neutral-500 py-20 text-center">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
              {filtered.map(p => <ProductCard key={p.id} product={p} onNav={onNav} onQuickAdd={onQuickAdd} />)}
            </div>
          )}
        </div>
      </div>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
          <div className="mt-6"><FilterPanel /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ProductPage({ productId, onNav, cart }) {
  const [data, setData] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');

  useEffect(() => {
    setImgIdx(0); setSize(null); setQty(1); setData(null);
    (async () => {
      const r = await fetch(`/api/products/${productId}`).then(r => r.json()).catch(() => null);
      if (r?.product) { setData(r); setColor(r.product.colors[0]); }
    })();
  }, [productId]);

  if (!data) return <div className="max-w-[1400px] mx-auto p-10 min-h-[60vh]">Loading…</div>;
  const { product, related } = data;
  const discount = Math.round(((product.compareAt - product.price) / product.compareAt) * 100);

  const handleAdd = () => {
    if (!size) { toast.error('Select a size first'); return; }
    cart.add(product, size, color, qty);
    toast.success(`Added to bag · ${product.name} (${size})`);
  };
  const checkPincode = () => {
    if (!pincode.match(/^\d{6}$/)) { setDeliveryMsg('Enter a valid 6-digit pincode.'); return; }
    setDeliveryMsg('Delivers in 3–5 business days. Free shipping.');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8 lg:py-12">
      <div className="text-xs text-neutral-500 mb-6">
        <button onClick={() => onNav({ view: 'home' })} className="hover:text-black">Home</button>
        <span className="mx-2">/</span>
        <button onClick={() => onNav({ view: 'shop', category: product.category })} className="hover:text-black capitalize">{product.category}</button>
        <span className="mx-2">/</span>
        <span className="text-neutral-800">{product.name}</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <div className="grid lg:grid-cols-[80px_1fr] gap-3">
            <div className="flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={cx('flex-shrink-0 w-20 aspect-[3/4] overflow-hidden border-2', i === imgIdx ? 'border-black' : 'border-transparent opacity-70')}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="order-1 lg:order-2 relative bg-neutral-50 overflow-hidden aspect-[3/4]">
              <AnimatePresence mode="wait">
                <motion.img key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} src={product.images[imgIdx]} className="w-full h-full object-cover" alt={product.name} />
              </AnimatePresence>
              {discount > 0 && <div className="absolute top-4 left-4 bg-white text-black text-[11px] uppercase tracking-widest px-3 py-1.5">-{discount}%</div>}
            </div>
          </div>
        </div>
        <div className="lg:pt-4">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">FITSTICH · {product.fit}</div>
          <h1 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.03em] mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{[...Array(5)].map((_,i) => <Star key={i} className={cx('w-4 h-4', i < Math.round(product.rating) ? 'fill-black' : 'text-neutral-300')} />)}</div>
            <span className="text-sm text-neutral-500">{product.rating} · {product.reviewCount} reviews</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">{inr(product.price)}</span>
            {product.compareAt > product.price && (
              <>
                <span className="text-lg text-neutral-400 line-through">{inr(product.compareAt)}</span>
                <span className="text-sm text-green-700 font-medium">{discount}% off</span>
              </>
            )}
          </div>
          <p className="text-neutral-600 leading-relaxed mb-8">{product.description}</p>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.2em] mb-3">Color · <span className="text-neutral-500 normal-case tracking-normal">{color?.name}</span></div>
            <div className="flex gap-2">
              {product.colors.map(c => (
                <button key={c.name} onClick={() => setColor(c)} className={cx('w-10 h-10 rounded-full border-2 flex items-center justify-center', color?.name === c.name ? 'border-black' : 'border-neutral-200')} style={{ background: c.hex }}>
                  {color?.name === c.name && <Check className={cx('w-4 h-4', ['White','Bone','Ivory'].includes(c.name) ? 'text-black' : 'text-white')} />}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs uppercase tracking-[0.2em]">Size</div>
              <button className="text-xs underline underline-offset-4">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map(s => {
                const avail = product.sizes.includes(s);
                return (
                  <button key={s} disabled={!avail} onClick={() => setSize(s)} className={cx('w-14 h-12 border text-sm',
                    !avail ? 'border-neutral-100 text-neutral-300 line-through cursor-not-allowed' :
                    size === s ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black')}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.2em] mb-3">Quantity</div>
            <div className="inline-flex items-center border border-neutral-200">
              <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty+1)} className="w-10 h-10 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button onClick={handleAdd} className="h-14 flex-1 rounded-none bg-black hover:bg-neutral-800 text-xs uppercase tracking-[0.2em]">Add to bag · {inr(product.price * qty)}</Button>
            <Button variant="outline" className="h-14 rounded-none border-black hover:bg-black hover:text-white text-xs uppercase tracking-[0.2em] px-6"><Heart className="w-4 h-4 mr-2" /> Wishlist</Button>
          </div>
          <div className="border-t border-neutral-100 pt-6 mb-6">
            <div className="text-xs uppercase tracking-[0.2em] mb-3">Check delivery</div>
            <div className="flex gap-2 max-w-sm">
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode" maxLength={6} className="h-11 rounded-none border-neutral-200" />
              <Button onClick={checkPincode} variant="outline" className="h-11 rounded-none border-black text-xs uppercase tracking-widest px-5">Check</Button>
            </div>
            {deliveryMsg && <div className="text-xs mt-2 text-neutral-600">{deliveryMsg}</div>}
          </div>
          <Tabs defaultValue="material">
            <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-neutral-100 p-0 h-auto">
              <TabsTrigger value="material" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3 text-xs uppercase tracking-widest">Material</TabsTrigger>
              <TabsTrigger value="care" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3 text-xs uppercase tracking-widest">Wash Care</TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3 text-xs uppercase tracking-widest">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="material" className="text-sm text-neutral-600 pt-4 leading-relaxed">{product.material}</TabsContent>
            <TabsContent value="care" className="text-sm text-neutral-600 pt-4 leading-relaxed">{product.fabricCare}</TabsContent>
            <TabsContent value="shipping" className="text-sm text-neutral-600 pt-4 leading-relaxed">Free shipping over ₹1,499. 3–5 business day delivery pan-India. 7-day easy returns on unworn items.</TabsContent>
          </Tabs>
        </div>
      </div>
      {related?.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display font-black text-3xl lg:text-4xl tracking-[-0.03em] mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {related.map(p => <ProductCard key={p.id} product={p} onNav={onNav} onQuickAdd={() => cart.add(p, p.sizes[Math.floor(p.sizes.length/2)], p.colors[0], 1)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function CartDrawer({ open, onOpenChange, cart, onNav }) {
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null);
  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'FIRST10') { setApplied({ code: 'FIRST10', pct: 10 }); toast.success('Coupon applied · 10% off'); }
    else toast.error('Invalid coupon');
  };
  const discount = applied ? Math.round(cart.subtotal * applied.pct / 100) : 0;
  const shipping = cart.subtotal >= 1499 || cart.subtotal === 0 ? 0 : 99;
  const total = Math.max(0, cart.subtotal - discount) + shipping;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-neutral-100">
          <SheetTitle className="font-display text-2xl tracking-tight">Your Bag ({cart.totalQty})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-4 stroke-1" />
              <p className="mb-6">Your bag is empty.</p>
              <Button onClick={() => { onOpenChange(false); onNav({ view: 'shop' }); }} className="rounded-none">Start shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map(i => (
                <div key={i.key} className="flex gap-4">
                  <div className="w-20 h-24 bg-neutral-50 flex-shrink-0 overflow-hidden"><img src={i.image} alt={i.name} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="text-sm font-medium">{i.name}</div>
                      <button onClick={() => cart.remove(i.key)}><X className="w-4 h-4 text-neutral-400 hover:text-black" /></button>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">{i.color?.name} · Size {i.size}</div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="inline-flex items-center border border-neutral-200">
                        <button onClick={() => cart.update(i.key, i.quantity - 1)} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => cart.update(i.key, i.quantity + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="text-sm font-semibold">{inr(i.price * i.quantity)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.items.length > 0 && (
          <div className="border-t border-neutral-100 p-6 space-y-4">
            <div className="flex gap-2">
              <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon (try FIRST10)" className="h-10 rounded-none border-neutral-200" />
              <Button onClick={applyCoupon} variant="outline" className="rounded-none h-10 text-xs uppercase tracking-widest">Apply</Button>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{inr(cart.subtotal)}</span></div>
              {applied && <div className="flex justify-between text-green-700"><span>Discount ({applied.code})</span><span>-{inr(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{shipping === 0 ? 'FREE' : inr(shipping)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-100 mt-2"><span>Total</span><span>{inr(total)}</span></div>
            </div>
            <a href="/checkout" className="block w-full h-12 rounded-none bg-black text-white text-xs uppercase tracking-[0.2em] flex items-center justify-center hover:bg-neutral-800">Checkout · {inr(total)}</a>
            <p className="text-[11px] text-neutral-400 text-center">COD · Razorpay · Stripe</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuickAddDialog({ product, onClose, cart }) {
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(product?.colors?.[0] || null);
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5" /></button>
        <div className="flex gap-4 mb-6">
          <div className="w-24 h-32 bg-neutral-50"><img src={product.images[0]} alt="" className="w-full h-full object-cover" /></div>
          <div>
            <h3 className="font-display font-bold text-xl">{product.name}</h3>
            <div className="text-sm mt-1">{inr(product.price)}</div>
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] mb-3">Color · {color?.name}</div>
        <div className="flex gap-2 mb-6">
          {product.colors.map(c => (
            <button key={c.name} onClick={() => setColor(c)} className={cx('w-9 h-9 rounded-full border-2', color?.name === c.name ? 'border-black' : 'border-neutral-200')} style={{ background: c.hex }} />
          ))}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] mb-3">Select size</div>
        <div className="flex flex-wrap gap-2 mb-6">
          {product.sizes.map(s => (
            <button key={s} onClick={() => setSize(s)} className={cx('w-12 h-11 border text-sm', size === s ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black')}>{s}</button>
          ))}
        </div>
        <Button onClick={() => { if (!size) { toast.error('Select a size'); return; } cart.add(product, size, color, 1); toast.success('Added to bag'); onClose(); }} className="w-full h-12 rounded-none bg-black text-xs uppercase tracking-[0.2em]">Add to bag</Button>
      </motion.div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nav, setNav] = useState({ view: 'home' });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null);
  const cart = useCart();

  useEffect(() => {
    (async () => {
      try { const r = await fetch('/api/products').then(r => r.json()); setProducts(r.products || []); } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [nav]);

  const onNav = useCallback((n) => { setNav(prev => ({ ...prev, ...n })); }, []);
  const activeGender = nav.gender || GENDERS.MEN;
  const byGender = (g) => products.filter(p => p.gender === g);
  const menBestSellers = [...new Map(byGender(GENDERS.MEN).filter(p => p.tags?.includes('best-seller')).concat(byGender(GENDERS.MEN)).map(p => [p.id, p])).values()].slice(0, 4);
  const womenBestSellers = [...new Map(byGender(GENDERS.WOMEN).filter(p => p.tags?.includes('best-seller')).concat(byGender(GENDERS.WOMEN)).map(p => [p.id, p])).values()].slice(0, 4);
  const menTrending = byGender(GENDERS.MEN).filter(p => p.tags?.includes('trending') || p.tags?.includes('new'));
  const womenTrending = byGender(GENDERS.WOMEN).filter(p => p.tags?.includes('trending') || p.tags?.includes('new'));

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar onNav={onNav} cartCount={cart.totalQty} onCartOpen={() => setCartOpen(true)} onSearchOpen={() => setSearchOpen(true)} activeGender={activeGender} />
      <main className="flex-1">
        {nav.view === 'home' && (
          <>
            <Hero onNav={onNav} />
            <ValueProps />
            <CategoryCards onNav={onNav} />
            <FeaturedGrid products={menBestSellers} title="Men's best sellers" tag="best-seller" gender={GENDERS.MEN} onNav={onNav} onQuickAdd={setQuickAdd} />
            <FeaturedGrid products={womenBestSellers} title="Women's best sellers" tag="best-seller" gender={GENDERS.WOMEN} onNav={onNav} onQuickAdd={setQuickAdd} />
            <TrendingSlider products={menTrending.length ? menTrending : byGender(GENDERS.MEN)} title="Men's trending" onNav={onNav} onQuickAdd={setQuickAdd} />
            <TrendingSlider products={womenTrending.length ? womenTrending : byGender(GENDERS.WOMEN)} title="Women's trending" onNav={onNav} onQuickAdd={setQuickAdd} />
            <Newsletter />
          </>
        )}
        {nav.view === 'shop' && !loading && (
          <ShopPage products={products} onNav={onNav} onQuickAdd={setQuickAdd} initialGender={nav.gender} initialCategory={nav.category} initialTag={nav.tag} />
        )}
        {nav.view === 'product' && (
          <ProductPage productId={nav.productId} onNav={onNav} cart={cart} />
        )}
      </main>
      <Footer onNav={onNav} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} cart={cart} onNav={onNav} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} products={products} onNav={onNav} />
      {quickAdd && <QuickAddDialog product={quickAdd} onClose={() => setQuickAdd(null)} cart={cart} />}
    </div>
  );
}

export default App;
