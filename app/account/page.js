'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Package, User, Mail, MapPin, ArrowLeft, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/orders/user')
        .then(r => r.json())
        .then(d => setOrders(d.orders || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-neutral-400">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>
        {/* Profile */}
        <div className="bg-white p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
              </div>
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight">{session?.user?.name || 'Account'}</h1>
                <p className="text-sm text-neutral-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {session?.user?.email}</p>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-black">
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </div>
        {/* Orders */}
        <h2 className="font-display font-black text-xl tracking-tight mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" /> My Orders
        </h2>
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center text-neutral-400">
            <Package className="w-10 h-10 mx-auto mb-4 stroke-1" />
            <p className="mb-4">No orders yet</p>
            <Button onClick={() => router.push('/')} className="rounded-none bg-black text-xs uppercase tracking-[0.2em]">Start shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <button key={o.id} onClick={() => router.push(`/orders?id=${o.id}&email=${encodeURIComponent(o.customer?.email || '')}`)} className="w-full bg-white p-4 text-left hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">#{o.id}</div>
                    <div className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-xs text-neutral-500">{o.items?.length} item(s) · {inr(o.total)} · {o.paymentMethod?.toUpperCase()}</div>
                    {o.trackingNumber && <div className="text-xs text-indigo-600 mt-1">📦 {o.trackingNumber}</div>}
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
