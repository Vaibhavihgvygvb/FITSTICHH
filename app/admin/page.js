'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Mail, LogOut, Plus, Search,
  Edit, Trash2, X, TrendingUp, AlertTriangle, IndianRupee, Users,
  ArrowUp, ArrowDown, Eye, Download, Save, Loader2, Lock, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const cx = (...c) => c.filter(Boolean).join(' ');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const CATEGORIES = ['oversized','regular','joggers','pyjamas'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

/* ============ API helper ============ */
function api(token) {
  const request = async (method, path, body) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api${path}`, opts);
    if (!res.ok) {
      let msg = 'Request failed';
      try { const j = await res.json(); msg = j.error || msg; } catch {}
      if (res.status === 401) { localStorage.removeItem('fitstich_admin'); location.reload(); }
      throw new Error(msg);
    }
    return res.json();
  };
  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    del: (path) => request('DELETE', path),
  };
}

/* ============ Login ============ */
function LoginScreen({ onAuth }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Login failed');
      localStorage.setItem('fitstich_admin', j.token);
      onAuth(j.token);
      toast.success('Welcome back');
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-black text-4xl tracking-[-0.05em] mb-2">FITSTICH.</div>
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin Console</div>
        </div>
        <form onSubmit={submit} className="bg-white p-8 shadow-luxe border border-neutral-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center"><Lock className="w-4 h-4" /></div>
            <div>
              <div className="font-semibold">Sign in to admin</div>
              <div className="text-xs text-neutral-500">Password protected</div>
            </div>
          </div>
          <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Admin Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus className="h-12 rounded-none" placeholder="Enter password" />
          <Button type="submit" disabled={loading} className="mt-6 w-full h-12 rounded-none bg-black text-xs uppercase tracking-[0.2em]">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</> : 'Sign In'}
          </Button>
        </form>
        <p className="text-[11px] text-center text-neutral-400 mt-6">Default password: <code className="bg-neutral-100 px-1.5 py-0.5">fitstich2025</code> · change in <code>.env</code></p>
      </motion.div>
    </div>
  );
}

/* ============ Sidebar ============ */
function Sidebar({ view, setView, onLogout }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { key: 'products', label: 'Products', Icon: Package },
    { key: 'orders', label: 'Orders', Icon: ShoppingCart },
    { key: 'newsletter', label: 'Subscribers', Icon: Mail },
  ];
  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-neutral-100 bg-white h-screen sticky top-0">
      <div className="p-6 border-b border-neutral-100">
        <a href="/" className="font-black text-2xl tracking-[-0.05em]">FITSTICH.</a>
        <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mt-1">Admin</div>
      </div>
      <nav className="flex-1 p-3">
        {items.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className={cx('w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors mb-1',
              view === key ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100')}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </nav>
      <button onClick={onLogout} className="m-3 flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-500 hover:text-black hover:bg-neutral-100 rounded">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </aside>
  );
}

function TopBar({ view, setView, onLogout }) {
  const items = ['dashboard','products','orders','newsletter'];
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-30">
      <a href="/" className="font-black text-xl tracking-[-0.05em]">FITSTICH.</a>
      <Select value={view} onValueChange={setView}>
        <SelectTrigger className="w-[150px] rounded-none border-neutral-200"><SelectValue /></SelectTrigger>
        <SelectContent>{items.map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}</SelectContent>
      </Select>
      <button onClick={onLogout}><LogOut className="w-5 h-5" /></button>
    </div>
  );
}

/* ============ Dashboard ============ */
function Dashboard({ client }) {
  const [stats, setStats] = useState(null);
  const load = async () => { try { const r = await client.get('/admin/stats'); setStats(r); } catch (e) { toast.error(e.message); } };
  useEffect(() => { load(); }, []);
  if (!stats) return <div className="p-10 text-neutral-500">Loading…</div>;

  const { totals, lowStock, recentOrders, salesByDay } = stats;
  const maxRev = Math.max(...salesByDay.map(d => d.revenue), 1);

  const cards = [
    { label: 'Revenue', value: inr(totals.revenue), Icon: IndianRupee, hint: `${totals.orders} orders` },
    { label: 'Pending Orders', value: totals.pending, Icon: ShoppingCart, hint: 'Need attention' },
    { label: 'Products', value: totals.products, Icon: Package, hint: `${totals.lowStockCount} low stock` },
    { label: 'Subscribers', value: totals.subscribers, Icon: Users, hint: 'Newsletter' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.04em]">Dashboard</h1>
        <p className="text-neutral-500 mt-2">Snapshot of your store today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, Icon, hint }) => (
          <div key={label} className="bg-white border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</div>
              <Icon className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold">{value}</div>
            <div className="text-xs text-neutral-400 mt-1">{hint}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">Last 7 Days</div>
              <div className="font-display text-2xl font-bold">Sales</div>
            </div>
            <TrendingUp className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {salesByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-neutral-100 relative" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-black transition-all duration-500"
                    style={{ height: `${(d.revenue / maxRev) * 100}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 transition -top-8 absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[10px] px-2 py-1">
                      {inr(d.revenue)}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-neutral-500">{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white border border-neutral-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <div className="font-display text-lg font-bold">Low Stock</div>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-sm text-neutral-500">All items well stocked.</div>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-12 bg-neutral-50 flex-shrink-0"><img src={p.images?.[0]} className="w-full h-full object-cover" alt="" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{p.name}</div>
                    <div className="text-xs text-neutral-400">SKU · {p.id}</div>
                  </div>
                  <div className={cx('text-xs font-semibold px-2 py-1', (p.stock || 0) <= 10 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                    {p.stock || 0} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-neutral-100 p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-lg font-bold">Recent Orders</div>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-neutral-500 py-8 text-center">No orders yet. Place a test order from the shop.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-neutral-400">
                <tr className="border-b border-neutral-100"><th className="text-left py-3 pr-4">Order</th><th className="text-left pr-4">Customer</th><th className="text-left pr-4">Total</th><th className="text-left pr-4">Status</th><th className="text-left">Date</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-neutral-50">
                    <td className="py-3 pr-4 font-mono text-xs">{o.id}</td>
                    <td className="pr-4">{o.customer?.name || '—'}</td>
                    <td className="pr-4 font-semibold">{inr(o.total)}</td>
                    <td className="pr-4"><span className={cx('text-xs px-2 py-1 capitalize', STATUS_COLORS[o.status])}>{o.status}</span></td>
                    <td className="text-neutral-500 text-xs">{fmtDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Products ============ */
function ProductsPage({ client }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // product object or 'new'

  const load = async () => {
    setLoading(true);
    try { const r = await client.get('/admin/products'); setItems(r.products); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s) || i.id.toLowerCase().includes(s));
  }, [items, q]);

  const remove = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try { await client.del(`/admin/products/${id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1400px]">
      <div className="flex flex-wrap gap-4 items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.04em]">Products</h1>
          <p className="text-neutral-500 mt-2">{items.length} products in catalog.</p>
        </div>
        <Button onClick={() => setEditing('new')} className="rounded-none bg-black h-11 text-xs uppercase tracking-[0.2em]"><Plus className="w-4 h-4 mr-2" /> Add product</Button>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, category, id" className="pl-9 h-10 rounded-none" />
      </div>

      <div className="bg-white border border-neutral-100 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-neutral-500">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-xs uppercase tracking-widest text-neutral-400 bg-neutral-50">
              <tr>
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left px-4">Category</th>
                <th className="text-left px-4">Price</th>
                <th className="text-left px-4">Stock</th>
                <th className="text-right px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-neutral-100 flex-shrink-0"><img src={p.images?.[0]} className="w-full h-full object-cover" alt="" /></div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-neutral-400 font-mono">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 capitalize">{p.category}</td>
                  <td className="px-4">
                    <div className="font-semibold">{inr(p.price)}</div>
                    {p.compareAt > p.price && <div className="text-xs text-neutral-400 line-through">{inr(p.compareAt)}</div>}
                  </td>
                  <td className="px-4">
                    <span className={cx('text-xs px-2 py-1 font-semibold',
                      (p.stock || 0) === 0 ? 'bg-red-100 text-red-700' :
                      (p.stock || 0) <= 25 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    <button onClick={() => setEditing(p)} className="p-2 hover:bg-neutral-100"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => remove(p.id)} className="p-2 hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-neutral-500">No products.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {editing && <ProductEditor product={editing === 'new' ? null : editing} client={client} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function ProductEditor({ product, client, onClose, onSaved }) {
  const isNew = !product;
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'oversized',
    price: product?.price || 999,
    compareAt: product?.compareAt || 1299,
    stock: product?.stock || 0,
    description: product?.description || '',
    material: product?.material || '',
    fabricCare: product?.fabricCare || '',
    fit: product?.fit || 'Regular',
    sizes: product?.sizes?.join(', ') || 'S, M, L, XL',
    images: product?.images?.join('\n') || '',
    tags: product?.tags?.join(', ') || '',
    colors: product?.colors || [{ name: 'Black', hex: '#0a0a0a' }],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        images: form.images.split(/\n+/).map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (isNew) await client.post('/admin/products', payload);
      else await client.put(`/admin/products/${product.id}`, payload);
      toast.success(isNew ? 'Product created' : 'Product updated');
      onSaved();
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  };

  const updateColor = (i, k, v) => {
    const next = [...form.colors]; next[i] = { ...next[i], [k]: v }; set('colors', next);
  };
  const addColor = () => set('colors', [...form.colors, { name: 'New', hex: '#000000' }]);
  const removeColor = (i) => set('colors', form.colors.filter((_, idx) => idx !== i));

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-neutral-100">
          <SheetTitle className="font-display text-2xl">{isNew ? 'New Product' : product.name}</SheetTitle>
          {!isNew && <div className="text-xs text-neutral-500 font-mono">{product.id}</div>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Name</label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Category</label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Fit</label>
              <Input value={form.fit} onChange={(e) => set('fit', e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Price (₹)</label>
              <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Compare At (₹)</label>
              <Input type="number" value={form.compareAt} onChange={(e) => set('compareAt', e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Stock</label>
              <Input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Sizes (comma)</label>
              <Input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} className="rounded-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Tags (comma) · e.g. best-seller, new, trending</label>
              <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="rounded-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Description</label>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Material</label>
              <Input value={form.material} onChange={(e) => set('material', e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2 block">Wash Care</label>
              <Input value={form.fabricCare} onChange={(e) => set('fabricCare', e.target.value)} className="rounded-none" />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">Images</label>
                <label className="cursor-pointer text-xs uppercase tracking-widest underline">
                  + Upload image
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB'); return; }
                    const fd = new FormData(); fd.append('file', f);
                    try {
                      const r = await fetch('/api/upload', { method: 'POST', body: fd });
                      const d = await r.json();
                      if (d.ok) { set('images', form.images ? form.images + '\n' + d.url : d.url); toast.success('Uploaded'); }
                      else toast.error(d.error);
                    } catch { toast.error('Upload failed'); }
                    e.target.value = '';
                  }} />
                </label>
              </div>
              <Textarea value={form.images} onChange={(e) => set('images', e.target.value)} rows={4} className="rounded-none font-mono text-xs" placeholder="Paste image URLs or use Upload button above" />
              {form.images && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {form.images.split(/\n+/).filter(Boolean).slice(0,6).map((u, i) => (
                    <div key={i} className="w-16 h-20 bg-neutral-50 flex-shrink-0 overflow-hidden"><img src={u} className="w-full h-full object-cover" alt="" /></div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">Colors</label>
                <button onClick={addColor} className="text-xs uppercase tracking-widest underline">+ Add color</button>
              </div>
              <div className="space-y-2">
                {form.colors.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-10 h-10 border border-neutral-200" style={{ background: c.hex }} />
                    <Input value={c.name} onChange={(e) => updateColor(i, 'name', e.target.value)} placeholder="Name" className="rounded-none h-10 flex-1" />
                    <Input value={c.hex} onChange={(e) => updateColor(i, 'hex', e.target.value)} placeholder="#000000" className="rounded-none h-10 w-32 font-mono text-xs" />
                    <button onClick={() => removeColor(i)} className="p-2 hover:bg-red-50 text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-neutral-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-none flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-none bg-black flex-1 text-xs uppercase tracking-[0.2em]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {isNew ? 'Create' : 'Save'}</>}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============ Orders ============ */
function OrdersPage({ client }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await client.get(`/admin/orders${status !== 'all' ? `?status=${status}` : ''}`); setOrders(r.orders); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id, newStatus) => {
    try { await client.put(`/admin/orders/${id}`, { status: newStatus }); toast.success('Order updated'); load(); setDetail(null); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1400px]">
      <div className="flex flex-wrap gap-4 items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.04em]">Orders</h1>
          <p className="text-neutral-500 mt-2">{orders.length} orders {status !== 'all' && `· ${status}`}</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] rounded-none"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-neutral-100 overflow-x-auto">
        {loading ? <div className="p-10 text-neutral-500">Loading…</div> : orders.length === 0 ? (
          <div className="p-14 text-center text-neutral-500">
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 stroke-1" />
            No orders yet. Place a test order from the homepage to see it appear here.
          </div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-xs uppercase tracking-widest text-neutral-400 bg-neutral-50">
              <tr><th className="text-left py-3 px-4">Order</th><th className="text-left px-4">Customer</th><th className="text-left px-4">Items</th><th className="text-left px-4">Total</th><th className="text-left px-4">Payment</th><th className="text-left px-4">Status</th><th className="text-left px-4">Date</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                  <td className="py-3 px-4 font-mono text-xs">{o.id}</td>
                  <td className="px-4">
                    <div className="font-medium">{o.customer?.name || '—'}</div>
                    <div className="text-xs text-neutral-400">{o.customer?.email}</div>
                  </td>
                  <td className="px-4">{o.items?.length}</td>
                  <td className="px-4 font-semibold">{inr(o.total)}</td>
                  <td className="px-4 text-xs uppercase">{o.paymentMethod}</td>
                  <td className="px-4"><span className={cx('text-xs px-2 py-1 capitalize', STATUS_COLORS[o.status])}>{o.status}</span></td>
                  <td className="px-4 text-xs text-neutral-500">{fmtDateTime(o.createdAt)}</td>
                  <td className="px-4"><button onClick={() => setDetail(o)} className="p-2 hover:bg-neutral-100"><Eye className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detail && (
        <Dialog open onOpenChange={() => setDetail(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Order {detail.id}</DialogTitle>
              <div className="text-xs text-neutral-500">{fmtDateTime(detail.createdAt)}</div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Customer</div>
                  <div className="font-medium">{detail.customer?.name}</div>
                  <div className="text-neutral-500">{detail.customer?.email}</div>
                  <div className="text-neutral-500">{detail.customer?.phone}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Shipping to</div>
                  <div className="text-neutral-700 whitespace-pre-line">{detail.customer?.address}</div>
                  <div className="text-neutral-700">{detail.customer?.city}, {detail.customer?.pincode}</div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Items</div>
                <div className="space-y-3">
                  {detail.items.map((i, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-14 h-16 bg-neutral-50"><img src={i.image} className="w-full h-full object-cover" alt="" /></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{i.name}</div>
                        <div className="text-xs text-neutral-500">{i.color?.name} · Size {i.size} · Qty {i.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold">{inr(i.price * i.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{inr(detail.subtotal)}</span></div>
                {detail.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount {detail.couponCode ? `(${detail.couponCode})` : ''}</span><span>-{inr(detail.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{detail.shipping === 0 ? 'FREE' : inr(detail.shipping)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>{inr(detail.total)}</span></div>
                <div className="flex justify-between text-xs text-neutral-500 pt-2"><span>Payment</span><span className="uppercase">{detail.paymentMethod} · {detail.paymentStatus}</span></div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {['pending','processing','shipped','delivered','cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(detail.id, s)}
                      className={cx('text-xs px-3 py-2 uppercase tracking-widest border', detail.status === s ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ============ Newsletter ============ */
function NewsletterPage({ client, token }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await client.get('/admin/newsletter'); setSubs(r.subscribers); }
      catch (e) { toast.error(e.message); } setLoading(false);
    })();
  }, []);

  const downloadCsv = async () => {
    try {
      const res = await fetch('/api/admin/newsletter?format=csv', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'fitstich-subscribers.csv'; a.click();
      URL.revokeObjectURL(url); toast.success('CSV downloaded');
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1400px]">
      <div className="flex flex-wrap gap-4 items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl lg:text-5xl tracking-[-0.04em]">Subscribers</h1>
          <p className="text-neutral-500 mt-2">{subs.length} newsletter subscribers.</p>
        </div>
        <Button onClick={downloadCsv} disabled={subs.length === 0} className="rounded-none bg-black h-11 text-xs uppercase tracking-[0.2em]">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-white border border-neutral-100">
        {loading ? <div className="p-10 text-neutral-500">Loading…</div> : subs.length === 0 ? (
          <div className="p-14 text-center text-neutral-500">
            <Mail className="w-8 h-8 mx-auto mb-3 stroke-1" />
            No subscribers yet. Sign up via the homepage newsletter to see one appear.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-neutral-400 bg-neutral-50">
              <tr><th className="text-left py-3 px-4">Email</th><th className="text-left px-4">Subscribed</th></tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="py-3 px-4">{s.email}</td>
                  <td className="px-4 text-neutral-500">{fmtDateTime(s.subscribedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ============ App ============ */
function AdminApp() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('dashboard');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('fitstich_admin');
    if (t) setToken(t);
    setReady(true);
  }, []);

  const logout = () => { localStorage.removeItem('fitstich_admin'); setToken(null); toast.success('Signed out'); };
  const client = useMemo(() => api(token), [token]);

  if (!ready) return null;
  if (!token) return <LoginScreen onAuth={setToken} />;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar view={view} setView={setView} onLogout={logout} />
      <div className="flex-1 min-w-0">
        <TopBar view={view} setView={setView} onLogout={logout} />
        {view === 'dashboard' && <Dashboard client={client} />}
        {view === 'products' && <ProductsPage client={client} />}
        {view === 'orders' && <OrdersPage client={client} />}
        {view === 'newsletter' && <NewsletterPage client={client} token={token} />}
      </div>
    </div>
  );
}

export default AdminApp;
