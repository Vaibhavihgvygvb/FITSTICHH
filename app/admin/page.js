'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Mail, LogOut, Plus, Search,
  Pencil, Trash2, X, Eye, Download, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cx, inr } from '@/lib/draft';
import { CutButton, DraftButton, RuleInput } from '@/components/draft/controls';
import { TitleBlock, Notch, SheetRule, SheetStamp } from '@/components/draft/marks';

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const CATEGORIES = ['oversized', 'regular', 'joggers', 'pyjamas'];
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

/** Status as line form, never colour — the same grammar the storefront uses. */
const STATUS_LINE = {
  pending: 'border-dashed border-ink text-ink',
  processing: 'border-dashed border-ink text-ink',
  shipped: 'border-solid border-ink text-ink',
  delivered: 'border-solid border-ink bg-ink text-paper',
  cancelled: 'border-solid border-ink/30 text-graphite line-through',
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
      try {
        const j = await res.json();
        msg = j.error || msg;
      } catch {}
      if (res.status === 401) {
        localStorage.removeItem('fitstich_admin');
        location.reload();
      }
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

/* ============ Shared shells ============ */
function PageHead({ title, note, action }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b-cut border-ink pb-7">
      <div>
        <h1 className="display text-[clamp(2rem,5vw,3rem)]">{title}</h1>
        {note && <p className="annot mt-3 text-graphite">{note}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div className={cx(span === 2 && 'sm:col-span-2')}>
      <span className="annot mb-2 block text-graphite">{label}</span>
      {children}
    </div>
  );
}

const TH = ({ children, className }) => (
  <th className={cx('annot border-b-thin border-ink py-3 pr-5 text-left font-normal text-graphite', className)}>
    {children}
  </th>
);
const TD = ({ children, className }) => (
  <td className={cx('border-b-hair border-ink/15 py-3.5 pr-5 align-middle', className)}>{children}</td>
);

/* ============ Login ============ */
function LoginScreen({ onAuth }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'That password was not accepted.');
      localStorage.setItem('fitstich_admin', j.token);
      onAuth(j.token);
      toast.success('Signed in');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sheet-fine tooth relative flex min-h-screen items-center justify-center px-5 py-16">
      <SheetStamp className="absolute right-5 top-6">Cutting room · Restricted</SheetStamp>
      {/* the drawing's ruled margin */}
      <span className="pointer-events-none absolute inset-6 border-hair border-ink/20 lg:inset-10" aria-hidden="true" />

      <div className="relative w-full max-w-[400px]">
        <span className="font-display text-2xl tracking-[-0.05em]" style={{ fontWeight: 900 }}>
          FITSTICH
        </span>
        <h1 className="display mt-10 text-[clamp(2rem,7vw,2.8rem)]">Staff only.</h1>

        <form onSubmit={submit} className="mt-10 flex flex-col gap-7">
          <div>
            <label htmlFor="pw" className="annot mb-2 block text-graphite">
              Admin password
            </label>
            <RuleInput
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && (
            <p className="annot flex items-center gap-2">
              <Notch size={8} dir="right" />
              {error}
            </p>
          )}
          <CutButton type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Checking…' : 'Sign in'}
          </CutButton>
        </form>

        <TitleBlock
          className="mt-14 w-full"
          rows={[
            ['Sheet', 'FS-ADM'],
            ['Access', 'Staff only'],
            ['Cut in', 'India · in-house'],
          ]}
        />
      </div>
    </main>
  );
}

/* ============ Nav ============ */
const NAV = [
  { key: 'dashboard', label: 'Floor', Icon: LayoutDashboard },
  { key: 'products', label: 'Patterns', Icon: Package },
  { key: 'orders', label: 'Orders', Icon: ShoppingCart },
  { key: 'newsletter', label: 'List', Icon: Mail },
];

function Sidebar({ view, setView, onLogout }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r-thin border-ink bg-paper lg:flex">
      <div className="border-b-thin border-ink p-6">
        <a href="/" className="font-display text-xl tracking-[-0.05em]" style={{ fontWeight: 900 }}>
          FITSTICH
        </a>
        <span className="annot mt-2 block text-graphite">Cutting room</span>
      </div>
      <nav className="flex-1 p-3">
        {NAV.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={cx(
              'mb-1 flex w-full items-center gap-3 border-thin px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors',
              view === key ? 'border-ink bg-ink text-paper' : 'border-transparent text-graphite hover:border-ink/30 hover:text-ink'
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="m-3 flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite transition-colors hover:text-ink"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} /> Sign out
      </button>
    </aside>
  );
}

function TopBar({ view, setView, onLogout }) {
  return (
    <div className="sticky top-0 z-30 border-b-thin border-ink bg-paper lg:hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <a href="/" className="font-display text-lg tracking-[-0.05em]" style={{ fontWeight: 900 }}>
          FITSTICH
        </a>
        <button onClick={onLogout} aria-label="Sign out">
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
        {NAV.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={cx(
              'shrink-0 border-thin px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]',
              view === key ? 'border-ink bg-ink text-paper' : 'border-ink/30 text-graphite'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Dashboard ============ */
function Dashboard({ client }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client
      .get('/admin/stats')
      .then(setStats)
      .catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) return <div className="p-6 lg:p-10"><span className="annot text-graphite">Reading the floor…</span></div>;

  const { totals, lowStock, recentOrders, salesByDay } = stats;
  const maxRev = Math.max(...salesByDay.map((d) => d.revenue), 1);

  return (
    <div className="max-w-[1400px] p-6 lg:p-10">
      <PageHead title="Floor" note="Where the store stands today" />

      {/* Totals as one measurement strip, not four cards */}
      <div className="grid border-thin border-ink sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Revenue', inr(totals.revenue), `${totals.orders} orders`],
          ['Pending', String(totals.pending).padStart(2, '0'), 'Awaiting cut'],
          ['Patterns', String(totals.products).padStart(2, '0'), `${totals.lowStockCount} low`],
          ['On list', String(totals.subscribers).padStart(2, '0'), 'Subscribers'],
        ].map(([label, value, hint], i) => (
          <div
            key={label}
            className={cx(
              'p-5',
              i > 0 && 'border-t-hair border-ink/20 sm:border-t-0 sm:border-l-hair sm:border-l-ink/20',
              i === 2 && 'sm:border-t-hair sm:border-t-ink/20 sm:border-l-0 lg:border-t-0 lg:border-l-hair'
            )}
          >
            <span className="annot block text-graphite">{label}</span>
            <span className="mt-3 block font-mono text-[26px] leading-none tnum">{value}</span>
            <span className="annot mt-2.5 block text-graphite">{hint}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Sales — plotted on the sheet's own rule */}
        <section className="border-thin border-ink p-6 lg:col-span-2">
          <SheetRule label="Last 7 days" />
          <div className="mt-8 flex h-44 items-end gap-2">
            {salesByDay.map((d) => (
              <div key={d.date} className="group flex flex-1 flex-col items-center gap-2.5">
                <div className="relative flex w-full flex-1 items-end border-b-hair border-ink/20">
                  <div
                    className="relative w-full bg-ink transition-[height] duration-700 ease-draft"
                    style={{ height: `${Math.max((d.revenue / maxRev) * 100, 1.5)}%` }}
                  >
                    <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap border-hair border-ink bg-paper px-1.5 py-1 font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100 tnum">
                      {inr(d.revenue)}
                    </span>
                  </div>
                </div>
                <span className="annot text-graphite tnum">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Low bolt */}
        <section className="border-thin border-ink p-6">
          <SheetRule label="Low bolt" />
          {lowStock.length === 0 ? (
            <p className="annot mt-8 text-graphite">Every pattern has cloth.</p>
          ) : (
            <div className="mt-6 flex flex-col">
              {lowStock.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-3 border-b-hair border-ink/15 py-3">
                  <span className="h-12 w-10 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                    {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover grayscale" alt="" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{p.name}</span>
                    <span className="annot mt-1 block text-graphite">{p.id}</span>
                  </span>
                  <span
                    className={cx(
                      'annot shrink-0 border-thin px-2 py-1 tnum',
                      (p.stock || 0) <= 10 ? 'border-ink bg-ink text-paper' : 'border-ink'
                    )}
                  >
                    {p.stock || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 border-thin border-ink p-6">
        <SheetRule label="Recent orders" />
        {recentOrders.length === 0 ? (
          <p className="annot mt-8 text-graphite">Nothing has come through yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Total</TH>
                  <TH>Stage</TH>
                  <TH>Placed</TH>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <TD className="font-mono text-[12px]">{o.id}</TD>
                    <TD>{o.customer?.name || '—'}</TD>
                    <TD className="font-mono tnum">{inr(o.total)}</TD>
                    <TD>
                      <span className={cx('annot border-thin px-2 py-1', STATUS_LINE[o.status])}>{o.status}</span>
                    </TD>
                    <TD className="annot text-graphite">{fmtDateTime(o.createdAt)}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ============ Products ============ */
function ProductsPage({ client }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await client.get('/admin/products');
      setItems(r.products);
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter(
      (i) => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s) || i.id.toLowerCase().includes(s)
    );
  }, [items, q]);

  const remove = async (id) => {
    try {
      await client.del(`/admin/products/${id}`);
      toast.success('Pattern removed');
      setConfirming(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-[1400px] p-6 lg:p-10">
      <PageHead
        title="Patterns"
        note={`${items.length} in the catalogue`}
        action={
          <CutButton onClick={() => setEditing('new')}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> New pattern
          </CutButton>
        }
      />

      <div className="relative mb-8 max-w-sm">
        <Search className="pointer-events-none absolute left-0 top-3.5 h-4 w-4 text-graphite" strokeWidth={1.5} />
        <RuleInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, category or id"
          className="pl-7"
          aria-label="Search patterns"
        />
      </div>

      <div className="overflow-x-auto border-thin border-ink">
        {loading ? (
          <div className="p-10"><span className="annot text-graphite">Loading…</span></div>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr>
                <TH className="pl-5">Pattern</TH>
                <TH>Piece</TH>
                <TH>Price</TH>
                <TH>Cloth</TH>
                <TH className="pr-5 text-right">—</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <TD className="pl-5">
                    <div className="flex items-center gap-3">
                      <span className="h-14 w-12 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                        {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover grayscale" alt="" />}
                      </span>
                      <span>
                        <span className="block font-medium">{p.name}</span>
                        <span className="annot mt-1 block text-graphite">{p.id}</span>
                      </span>
                    </div>
                  </TD>
                  <TD className="capitalize">{p.category}</TD>
                  <TD>
                    <span className="block font-mono tnum">{inr(p.price)}</span>
                    {p.compareAt > p.price && (
                      <span className="annot mt-1 block text-graphite line-through tnum">{inr(p.compareAt)}</span>
                    )}
                  </TD>
                  <TD>
                    <span
                      className={cx(
                        'annot border-thin px-2 py-1 tnum',
                        (p.stock || 0) === 0
                          ? 'border-ink/30 text-graphite line-through'
                          : (p.stock || 0) <= 25
                            ? 'border-dashed border-ink'
                            : 'border-ink'
                      )}
                    >
                      {p.stock || 0}
                    </span>
                  </TD>
                  <TD className="pr-5">
                    <div className="flex items-center justify-end gap-1">
                      {confirming === p.id ? (
                        <>
                          <button
                            onClick={() => remove(p.id)}
                            className="annot border-thin border-ink bg-ink px-2.5 py-1.5 text-paper"
                          >
                            Delete
                          </button>
                          <button onClick={() => setConfirming(null)} className="annot px-2.5 py-1.5 text-graphite">
                            Keep
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditing(p)}
                            className="p-2 text-graphite transition-colors hover:text-ink"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setConfirming(p.id)}
                            className="p-2 text-graphite transition-colors hover:text-ink"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <span className="annot text-graphite">No pattern matches that.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          client={client}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        images: form.images.split(/\n+/).map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (isNew) await client.post('/admin/products', payload);
      else await client.put(`/admin/products/${product.id}`, payload);
      toast.success(isNew ? 'Pattern created' : 'Pattern saved');
      onSaved();
    } catch (e) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const updateColor = (i, k, v) => {
    const next = [...form.colors];
    next[i] = { ...next[i], [k]: v };
    set('colors', next);
  };

  const inputCls = 'h-11 w-full border-thin border-ink/30 bg-transparent px-3 font-mono text-[13px] outline-none focus:border-ink';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <aside
        className="sheet absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l-cut border-ink bg-paper"
        role="dialog"
        aria-label={isNew ? 'New pattern' : product.name}
      >
        <div className="flex items-start justify-between border-b-thin border-ink p-6">
          <div>
            <h2 className="display text-2xl">{isNew ? 'Draft a pattern' : product.name}</h2>
            <span className="annot mt-3 block text-graphite">{isNew ? 'New pattern' : product.id}</span>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Name" span={2}>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Piece">
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={cx(inputCls, 'capitalize')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Fit">
              <input value={form.fit} onChange={(e) => set('fit', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Price ₹">
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} className={cx(inputCls, 'tnum')} />
            </Field>
            <Field label="Compare at ₹">
              <input type="number" value={form.compareAt} onChange={(e) => set('compareAt', e.target.value)} className={cx(inputCls, 'tnum')} />
            </Field>
            <Field label="Cloth in stock">
              <input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={cx(inputCls, 'tnum')} />
            </Field>
            <Field label="Sizes · comma">
              <input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tags · best-seller, new, trending" span={2}>
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Description" span={2}>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="w-full border-thin border-ink/30 bg-transparent p-3 text-[14px] leading-relaxed outline-none focus:border-ink"
              />
            </Field>
            <Field label="Material · state the GSM">
              <input value={form.material} onChange={(e) => set('material', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Wash care">
              <input value={form.fabricCare} onChange={(e) => set('fabricCare', e.target.value)} className={inputCls} />
            </Field>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="annot text-graphite">Images · one URL per line</span>
                <label className="annot cursor-pointer underline underline-offset-4">
                  Upload
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 5 * 1024 * 1024) {
                        toast.error('Max 5MB — compress it first');
                        return;
                      }
                      const fd = new FormData();
                      fd.append('file', f);
                      try {
                        const r = await fetch('/api/upload', { method: 'POST', body: fd });
                        const d = await r.json();
                        if (d.ok) {
                          set('images', form.images ? form.images + '\n' + d.url : d.url);
                          toast.success('Uploaded');
                        } else toast.error(d.error);
                      } catch {
                        toast.error('Upload failed');
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <textarea
                value={form.images}
                onChange={(e) => set('images', e.target.value)}
                rows={4}
                className="w-full border-thin border-ink/30 bg-transparent p-3 font-mono text-[12px] outline-none focus:border-ink"
                placeholder="https://…"
              />
              {form.images && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {form.images
                    .split(/\n+/)
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((u, i) => (
                      <span key={i} className="h-20 w-16 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                        <img src={u} className="h-full w-full object-cover grayscale" alt="" />
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="annot text-graphite">Colourways</span>
                <button
                  onClick={() => set('colors', [...form.colors, { name: 'New', hex: '#000000' }])}
                  className="annot underline underline-offset-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {form.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-11 w-11 shrink-0 border-thin border-ink/30" style={{ background: c.hex }} />
                    <input
                      value={c.name}
                      onChange={(e) => updateColor(i, 'name', e.target.value)}
                      placeholder="Name"
                      className={cx(inputCls, 'flex-1')}
                    />
                    <input
                      value={c.hex}
                      onChange={(e) => updateColor(i, 'hex', e.target.value)}
                      placeholder="#000000"
                      className={cx(inputCls, 'w-32')}
                    />
                    <button
                      onClick={() => set('colors', form.colors.filter((_, idx) => idx !== i))}
                      className="p-2 text-graphite hover:text-ink"
                      aria-label="Remove colourway"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t-thin border-ink p-6">
          <DraftButton onClick={onClose} className="flex-1">
            Cancel
          </DraftButton>
          <CutButton onClick={save} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? 'Create' : 'Save'}
          </CutButton>
        </div>
      </aside>
    </div>
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
    try {
      const r = await client.get(`/admin/orders${status !== 'all' ? `?status=${status}` : ''}`);
      setOrders(r.orders);
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const updateStatus = async (id, newStatus) => {
    try {
      await client.put(`/admin/orders/${id}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
      load();
      setDetail(null);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-[1400px] p-6 lg:p-10">
      <PageHead
        title="Orders"
        note={`${orders.length} ${status !== 'all' ? `· ${status}` : ''}`}
        action={
          <div className="flex flex-wrap gap-2">
            {['all', ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cx(
                  'border-thin px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
                  status === s ? 'border-ink bg-ink text-paper' : 'border-ink/30 text-graphite hover:border-ink'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      <div className="overflow-x-auto border-thin border-ink">
        {loading ? (
          <div className="p-10"><span className="annot text-graphite">Loading…</span></div>
        ) : orders.length === 0 ? (
          <div className="p-14 text-center">
            <span className="annot text-graphite">Nothing at this stage.</span>
          </div>
        ) : (
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr>
                <TH className="pl-5">Order</TH>
                <TH>Customer</TH>
                <TH>Pieces</TH>
                <TH>Total</TH>
                <TH>Paid by</TH>
                <TH>Stage</TH>
                <TH>Placed</TH>
                <TH className="pr-5" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <TD className="pl-5 font-mono text-[12px]">{o.id}</TD>
                  <TD>
                    <span className="block font-medium">{o.customer?.name || '—'}</span>
                    <span className="annot mt-1 block text-graphite">{o.customer?.email}</span>
                  </TD>
                  <TD className="tnum">{o.items?.length}</TD>
                  <TD className="font-mono tnum">{inr(o.total)}</TD>
                  <TD className="annot">{o.paymentMethod}</TD>
                  <TD>
                    <span className={cx('annot border-thin px-2 py-1', STATUS_LINE[o.status])}>{o.status}</span>
                  </TD>
                  <TD className="annot text-graphite">{fmtDateTime(o.createdAt)}</TD>
                  <TD className="pr-5">
                    <button
                      onClick={() => setDetail(o)}
                      className="p-2 text-graphite transition-colors hover:text-ink"
                      aria-label={`Open ${o.id}`}
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} onStatus={updateStatus} />}
    </div>
  );
}

function OrderDetail({ order, onClose, onStatus }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="sheet relative w-full max-w-2xl border-thin border-ink bg-paper" role="dialog" aria-label={`Order ${order.id}`}>
        <div className="flex items-start justify-between border-b-thin border-ink p-6">
          <div>
            <h2 className="display text-2xl">{order.id}</h2>
            <span className="annot mt-3 block text-graphite">{fmtDateTime(order.createdAt)}</span>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <span className="annot mb-3 block text-graphite">Customer</span>
              <p className="text-[14px] font-medium">{order.customer?.name}</p>
              <p className="mt-1 text-[13px] text-graphite">{order.customer?.email}</p>
              <p className="text-[13px] text-graphite">{order.customer?.phone}</p>
            </div>
            <div>
              <span className="annot mb-3 block text-graphite">Ship to</span>
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-graphite">{order.customer?.address}</p>
              <p className="text-[13px] text-graphite">
                {order.customer?.city}, {order.customer?.state} {order.customer?.pincode}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <span className="annot mb-3 block text-graphite">Pieces</span>
            <div className="flex flex-col">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex gap-4 border-b-hair border-ink/15 py-3.5">
                  <span className="h-16 w-14 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                    {i.image && <img src={i.image} className="h-full w-full object-cover grayscale" alt="" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium">{i.name}</span>
                    <span className="annot mt-1.5 block text-graphite">
                      {i.color?.name} · {i.size} · ×{i.quantity}
                    </span>
                  </span>
                  <span className="font-mono text-[13px] tnum">{inr(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <TitleBlock
            className="mt-8"
            rows={[
              ['Subtotal', inr(order.subtotal)],
              ...(order.discount > 0
                ? [[`Discount${order.couponCode ? ` ${order.couponCode}` : ''}`, `−${inr(order.discount)}`]]
                : []),
              ['Shipping', order.shipping === 0 ? 'Free' : inr(order.shipping)],
              ['Total', inr(order.total)],
              ['Payment', `${order.paymentMethod} · ${order.paymentStatus}`],
            ]}
          />

          <div className="mt-8">
            <span className="annot mb-3 block text-graphite">Move to stage</span>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(order.id, s)}
                  className={cx(
                    'border-thin px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
                    order.status === s ? 'border-ink bg-ink text-paper' : 'border-ink/30 hover:border-ink'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Newsletter ============ */
function NewsletterPage({ client, token }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/admin/newsletter')
      .then((r) => setSubs(r.subscribers))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadCsv = async () => {
    try {
      const res = await fetch('/api/admin/newsletter?format=csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fitstich-subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-[1400px] p-6 lg:p-10">
      <PageHead
        title="The list"
        note={`${subs.length} on the list`}
        action={
          <CutButton onClick={downloadCsv} disabled={subs.length === 0}>
            <Download className="h-3.5 w-3.5" strokeWidth={2} /> Export CSV
          </CutButton>
        }
      />

      <div className="border-thin border-ink">
        {loading ? (
          <div className="p-10"><span className="annot text-graphite">Loading…</span></div>
        ) : subs.length === 0 ? (
          <div className="p-14 text-center">
            <span className="annot text-graphite">Nobody on the list yet.</span>
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <TH className="pl-5">Email</TH>
                <TH className="pr-5">Joined</TH>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={i}>
                  <TD className="pl-5">{s.email}</TD>
                  <TD className="annot pr-5 text-graphite">{fmtDateTime(s.subscribedAt)}</TD>
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
export default function AdminApp() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('dashboard');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('fitstich_admin');
    if (t) setToken(t);
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('fitstich_admin');
    setToken(null);
    toast.success('Signed out');
  };

  const client = useMemo(() => api(token), [token]);

  if (!ready) return null;
  if (!token) return <LoginScreen onAuth={setToken} />;

  return (
    <div className="sheet-fine tooth flex min-h-screen">
      <Sidebar view={view} setView={setView} onLogout={logout} />
      <div className="min-w-0 flex-1">
        <TopBar view={view} setView={setView} onLogout={logout} />
        {view === 'dashboard' && <Dashboard client={client} />}
        {view === 'products' && <ProductsPage client={client} />}
        {view === 'orders' && <OrdersPage client={client} />}
        {view === 'newsletter' && <NewsletterPage client={client} token={token} />}
      </div>
    </div>
  );
}
