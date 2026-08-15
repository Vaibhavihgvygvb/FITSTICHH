'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { cx, inr } from '@/lib/draft';
import { useCart } from '@/components/site/CartProvider';
import { CutButton, DraftButton, RuleInput } from '@/components/draft/controls';
import { TitleBlock, GrainArrow, Notch } from '@/components/draft/marks';

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const FIELDS = [
  { k: 'name', label: 'Full name', span: 2, autoComplete: 'name' },
  { k: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { k: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { k: 'address', label: 'Address', span: 2, autoComplete: 'street-address' },
  { k: 'city', label: 'City', autoComplete: 'address-level2' },
  { k: 'state', label: 'State', autoComplete: 'address-level1' },
  { k: 'pincode', label: 'Pincode', span: 2, autoComplete: 'postal-code', inputMode: 'numeric' },
];

function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'We need a name for the parcel.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'This address is incomplete — we send tracking here.';
  if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Ten digits, so the courier can call.';
  if (!form.address.trim()) e.address = 'Add a street and house number.';
  if (!form.city.trim()) e.city = 'Which city?';
  if (!form.state.trim()) e.state = 'Which state?';
  if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'A pincode is six digits.';
  return e;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clear, ready } = useCart();

  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({ ...f, name: f.name || session.user.name || '', email: f.email || session.user.email || '' }));
    }
  }, [session]);

  useEffect(() => {
    if (ready && items.length === 0 && !orderId) router.replace('/');
  }, [ready, items.length, orderId, router]);

  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function guard() {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error('Some details are still missing');
      document.querySelector(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return false;
    }
    return true;
  }

  async function placeOrder(paymentMethod) {
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: form,
        items,
        subtotal,
        shipping,
        total,
        paymentMethod,
        userId: session?.user?.id || null,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Checkout failed');
    return data;
  }

  async function handleCOD() {
    if (!guard()) return;
    setLoading('COD');
    try {
      const data = await placeOrder('COD');
      setOrderId(data.orderId);
      clear();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleRazorpay() {
    if (!guard()) return;
    setLoading('razorpay');
    try {
      const data = await placeOrder('razorpay');
      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) throw new Error('The payment gateway did not load. Check your connection.');
      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: 'INR',
        name: 'FITSTICH',
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response) => {
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              paymentMethod: 'razorpay',
              razorpayPaymentId: response.razorpay_payment_id,
            }),
          });
          setOrderId(data.orderId);
          clear();
        },
        modal: { ondismiss: () => setLoading(null) },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message);
      setLoading(null);
    }
  }

  async function handleStripe() {
    if (!guard()) return;
    setLoading('stripe');
    try {
      const data = await placeOrder('stripe');
      setOrderId(data.orderId);
      clear();
      toast.success('Order placed — Stripe sandbox, no real charge');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  /* ----------------------------- Confirmed ----------------------------- */
  if (orderId) {
    return (
      <main className="sheet-fine tooth flex min-h-screen items-center justify-center px-5 py-20">
        <div className="w-full max-w-lg">
          <h1 className="display text-[clamp(2.4rem,6vw,3.6rem)]">Cut and confirmed.</h1>
          <p className="measure mt-6 text-[16px] leading-relaxed text-graphite">
            It is on the cutting table. We send a note to {form.email} when it ships.
          </p>
          <TitleBlock
            className="mt-10"
            rows={[
              ['Order', orderId],
              ['Total', inr(total)],
              ['To', `${form.city}, ${form.state} ${form.pincode}`],
            ]}
          />
          <div className="mt-10 flex flex-wrap gap-4">
            <CutButton as={Link} href={`/orders?id=${orderId}&email=${encodeURIComponent(form.email)}`} size="lg">
              Track it
            </CutButton>
            <DraftButton as={Link} href="/" size="lg">
              Back to the sheet
            </DraftButton>
          </div>
        </div>
      </main>
    );
  }

  /* ------------------------------ Checkout ------------------------------ */
  return (
    <main className="sheet-fine tooth min-h-screen">
      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10 lg:py-16">
        <Link href="/" className="annot text-graphite hover:text-ink">
          ← Back to the sheet
        </Link>

        <h1 className="display mt-8 text-[clamp(2.2rem,6vw,3.4rem)]">Checkout</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          {/* Ship to */}
          <div>
            <span className="annot mb-8 block text-graphite">Ship to</span>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.k} className={cx(f.span === 2 && 'sm:col-span-2')}>
                  <label htmlFor={f.k} className="annot mb-2 block text-graphite">
                    {f.label}
                  </label>
                  <RuleInput
                    id={f.k}
                    name={f.k}
                    type={f.type || 'text'}
                    inputMode={f.inputMode}
                    autoComplete={f.autoComplete}
                    value={form[f.k]}
                    onChange={(e) => set(f.k, e.target.value)}
                    aria-invalid={Boolean(errors[f.k])}
                    aria-describedby={errors[f.k] ? `${f.k}-err` : undefined}
                    className={cx(errors[f.k] && 'border-ink border-b-cut')}
                  />
                  {errors[f.k] && (
                    <p id={`${f.k}-err`} className="annot mt-2 flex items-center gap-2 text-ink">
                      <Notch size={8} dir="right" />
                      {errors[f.k]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!session && (
              <p className="annot mt-10 text-graphite">
                Have an account?{' '}
                <Link href="/auth/signin" className="text-ink underline underline-offset-4">
                  Sign in
                </Link>{' '}
                and these fill themselves.
              </p>
            )}
          </div>

          {/* The docket */}
          <aside>
            <div className="sticky top-8 border-thin border-ink bg-paper p-6">
              <span className="annot mb-6 block text-graphite">Docket</span>

              <div className="flex flex-col">
                {items.map((i) => (
                  <div key={i.key} className="flex gap-4 border-b-hair border-ink/15 py-4 first:pt-0">
                    <span className="h-20 w-16 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                      {i.image && <img src={i.image} alt="" className="h-full w-full object-cover grayscale" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[14px] font-semibold leading-tight tracking-[-0.02em]">
                        {i.name}
                      </span>
                      <span className="annot mt-1.5 block text-graphite">
                        {i.size} · {i.color?.name} · ×{i.quantity}
                      </span>
                    </span>
                    <span className="font-mono text-[13px] tnum">{inr(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <TitleBlock
                className="mt-6"
                rows={[
                  ['Subtotal', inr(subtotal)],
                  ['Shipping', shipping === 0 ? 'Free' : inr(shipping)],
                  ['Total', inr(total)],
                ]}
              />

              <div className="mt-7 flex flex-col gap-3">
                <CutButton onClick={handleRazorpay} disabled={Boolean(loading)} size="lg" className="w-full">
                  {loading === 'razorpay' ? 'Opening…' : `Pay ${inr(total)} · Razorpay`}
                </CutButton>
                <DraftButton onClick={handleStripe} disabled={Boolean(loading)} className="w-full">
                  {loading === 'stripe' ? 'Processing…' : 'Pay by card · Stripe'}
                </DraftButton>
                <DraftButton onClick={handleCOD} disabled={Boolean(loading)} className="w-full">
                  {loading === 'COD' ? 'Placing…' : 'Cash on delivery'}
                </DraftButton>
              </div>

              <p className="annot mt-5 flex items-center gap-2.5 text-graphite">
                <GrainArrow />
                Sandbox keys · no real charge
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
