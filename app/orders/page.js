'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Package, Search, ArrowLeft } from 'lucide-react';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('lookup'); // lookup or list

  useEffect(() => {
    const id = searchParams.get('id');
    const em = searchParams.get('email');
    if (id && em) { setOrderId(id); setEmail(em); lookupOrder(id, em); }
  }, []);

  const lookupOrder = async (oid, em) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/orders/lookup?orderId=${encodeURIComponent(oid)}&email=${encodeURIComponent(em)}`);
      const data = await r.json();
      if (r.ok && data.order) setOrder(data.order);
      else toast.error('Order not found');
    } catch { toast.error('Lookup failed'); }
    setLoading(false);
  };

  const handleLookup = (e) => {
    e.preventDefault();
    if (!email || !orderId) { toast.error('Enter both email and order ID'); return; }
    lookupOrder(orderId, email);
  };

  const handleEmailSearch = async () => {
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/orders/lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (r.ok) { setOrders(data.orders || []); setMode('list'); }
      else toast.error(data.error);
    } catch { toast.error('Search failed'); }
    setLoading(false);
  };

  if (order) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-[800px] mx-auto px-4 py-8">
          <button onClick={() => { setOrder(null); setMode('lookup'); router.push('/orders'); }} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-display font-black text-2xl tracking-tight mb-6">Order #{order.id}</h1>
          <div className="bg-white p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-neutral-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="text-sm text-neutral-500">{order.customer?.name} · {order.customer?.email}</p>
              </div>
              <span className={`text-xs uppercase tracking-widest px-3 py-1 ${STATUS_BADGE[order.status] || 'bg-neutral-100 text-neutral-800'}`}>{order.status}</span>
            </div>
            <div className="space-y-3 mb-6">
              {order.items?.map((i, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-16 h-20 bg-neutral-50 flex-shrink-0"><img src={i.image} alt="" className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{i.name}</div>
                    <div className="text-xs text-neutral-500">{i.size} · {i.color?.name} · x{i.quantity}</div>
                    <div className="text-sm">{inr(i.price * i.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{inr(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{inr(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{order.shipping ? inr(order.shipping) : 'FREE'}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>{inr(order.total)}</span></div>
            </div>
            <div className="mt-4 text-xs text-neutral-400">
              Payment: {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
              {order.trackingNumber && <p className="mt-1">📦 Tracking: {order.trackingNumber}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'list') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-[800px] mx-auto px-4 py-8">
          <button onClick={() => setMode('lookup')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-display font-black text-2xl tracking-tight mb-2">My Orders</h1>
          <p className="text-neutral-500 text-sm mb-6">{email}</p>
          {orders.length === 0 ? (
            <div className="text-center py-20 text-neutral-400"><Package className="w-10 h-10 mx-auto mb-4 stroke-1" /><p>No orders found</p></div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <button key={o.id} onClick={() => setOrder(o)} className="w-full bg-white p-4 text-left hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">#{o.id}</div>
                      <div className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                      <div className="text-xs text-neutral-500">{o.items?.length} item(s) · {inr(o.total)}</div>
                    </div>
                    <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${STATUS_BADGE[o.status] || ''}`}>{o.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8">
        <div className="text-center mb-8">
          <Package className="w-10 h-10 mx-auto mb-4 stroke-1" />
          <h1 className="font-display font-black text-2xl tracking-tight mb-2">Track your order</h1>
          <p className="text-sm text-neutral-500">Enter your email and order ID to view details</p>
        </div>
        <form onSubmit={handleLookup} className="space-y-3">
          <Input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 rounded-none" />
          <Input placeholder="Order ID (e.g. FS-...)" value={orderId} onChange={e => setOrderId(e.target.value)} className="h-11 rounded-none" />
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-none bg-black hover:bg-neutral-800 text-xs uppercase tracking-[0.2em]">
            <Search className="w-4 h-4 mr-2" /> {loading ? 'Searching...' : 'Look up order'}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-neutral-400">or</span></div>
        </div>
        <Button onClick={handleEmailSearch} disabled={loading} variant="outline" className="w-full h-11 rounded-none border-black text-xs uppercase tracking-[0.2em]">
          See all orders for this email
        </Button>
        <p className="text-center text-xs text-neutral-400 mt-6">
          <a href="/" className="hover:text-black">← Back to store</a>
        </p>
      </div>
    </div>
  );
}
