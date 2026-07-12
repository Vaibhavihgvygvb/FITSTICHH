'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ShoppingBag, CreditCard, Truck, ArrowLeft, Check } from 'lucide-react';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script'); s.src = src; s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState('details'); // details, payment, success
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || '', email: session?.user?.email || '',
    phone: '', address: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    try { const raw = localStorage.getItem('fitstich_cart'); if (raw) { const items = JSON.parse(raw); if (items.length === 0) router.push('/'); setCart(items); } else router.push('/'); } catch { router.push('/'); }
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm(f => ({ ...f, name: session.user.name || f.name, email: session.user.email || f.email }));
    }
  }, [session]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCOD = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form, items: cart, subtotal, shipping, total, paymentMethod: 'COD', userId: session?.user?.id || null }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error); setLoading(false); return; }
      setOrderId(data.orderId);
      localStorage.removeItem('fitstich_cart');
      setStep('success');
    } catch { toast.error('Checkout failed'); setLoading(false); }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form, items: cart, subtotal, shipping, total, paymentMethod: 'razorpay', userId: session?.user?.id || null }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error); setLoading(false); return; }
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) { toast.error('Failed to load payment gateway'); setLoading(false); return; }
      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: 'INR',
        name: 'FITSTICH',
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response) => {
          await fetch('/api/payment/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderId, paymentMethod: 'razorpay', razorpayPaymentId: response.razorpay_payment_id }),
          });
          setOrderId(data.orderId);
          localStorage.removeItem('fitstich_cart');
          setStep('success');
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch { toast.error('Payment failed'); setLoading(false); }
  };

  const handleStripe = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form, items: cart, subtotal, shipping, total, paymentMethod: 'stripe', userId: session?.user?.id || null }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error); setLoading(false); return; }
      setOrderId(data.orderId);
      localStorage.removeItem('fitstich_cart');
      setStep('success');
      // Stripe redirect handled client-side via Payment Element in production
      toast.success('Order placed! (Stripe sandbox — payment simulated)');
    } catch { toast.error('Payment failed'); setLoading(false); }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="font-display font-black text-3xl tracking-tight mb-2">Order confirmed!</h1>
          <p className="text-neutral-500 mb-2">Your order <strong>#{orderId}</strong> has been placed.</p>
          <p className="text-neutral-400 text-sm mb-8">We'll send updates to {form.email}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/')} variant="outline" className="rounded-none border-black">Continue shopping</Button>
            <Button onClick={() => router.push(`/orders?id=${orderId}&email=${encodeURIComponent(form.email)}`)} className="rounded-none bg-black text-white hover:bg-neutral-800">Track order</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <h1 className="font-display font-black text-3xl tracking-tight mb-8">Checkout</h1>
            <div className="bg-white p-6 mb-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Truck className="w-4 h-4" /> Shipping details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2"><Input placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} className="h-11 rounded-none" /></div>
                <Input placeholder="Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} className="h-11 rounded-none" />
                <Input placeholder="Phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="h-11 rounded-none" />
                <div className="sm:col-span-2"><Textarea placeholder="Address" value={form.address} onChange={e => update('address', e.target.value)} className="rounded-none" rows={2} /></div>
                <Input placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} className="h-11 rounded-none" />
                <Input placeholder="State" value={form.state} onChange={e => update('state', e.target.value)} className="h-11 rounded-none" />
                <Input placeholder="Pincode" value={form.pincode} onChange={e => update('pincode', e.target.value)} className="h-11 rounded-none" />
              </div>
            </div>
            {!session && (
              <div className="bg-white p-6 mb-4">
                <p className="text-sm text-neutral-500">
                  Already have an account?{' '}
                  <a href="/auth/signin" className="underline underline-offset-4 hover:text-black">Sign in</a>
                  {' '}for faster checkout.
                </p>
              </div>
            )}
          </div>
          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sticky top-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Order summary</h2>
              <div className="space-y-3 mb-6">
                {cart.map(i => (
                  <div key={i.key} className="flex gap-3">
                    <div className="w-14 h-16 bg-neutral-50 flex-shrink-0"><img src={i.image} alt="" className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{i.name}</div>
                      <div className="text-xs text-neutral-500">{i.size} · {i.color?.name} · x{i.quantity}</div>
                      <div className="text-sm font-medium">{inr(i.price * i.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="flex justify-between text-neutral-500"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : inr(shipping)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t border-neutral-100 pt-2 mt-2"><span>Total</span><span>{inr(total)}</span></div>
              </div>
              <div className="mt-6 space-y-3">
                <Button onClick={handleCOD} disabled={loading} variant="outline" className="w-full h-12 rounded-none border-black text-xs uppercase tracking-[0.2em]">
                  {loading ? 'Processing...' : 'Cash on Delivery'}
                </Button>
                <Button onClick={handleRazorpay} disabled={loading} className="w-full h-12 rounded-none bg-black hover:bg-neutral-800 text-xs uppercase tracking-[0.2em]">
                  <CreditCard className="w-4 h-4 mr-2" /> Pay via Razorpay
                </Button>
                <Button onClick={handleStripe} disabled={loading} variant="outline" className="w-full h-12 rounded-none border-black text-xs uppercase tracking-[0.2em]">
                  Pay via Stripe
                </Button>
              </div>
              <p className="text-[10px] text-neutral-400 text-center mt-3">Your payment info is secured. Sandbox mode — no real charges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
