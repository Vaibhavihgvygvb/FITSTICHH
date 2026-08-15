'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cx, inr } from '@/lib/draft';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import { CutButton, RuleInput } from '@/components/draft/controls';
import { TitleBlock, SheetStamp, Notch } from '@/components/draft/marks';

/** Fulfilment as a cutting-room travelling ticket: each stage stamped or not. */
const STAGES = [
  { key: 'pending', label: 'Received' },
  { key: 'confirmed', label: 'Cut' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function Progress({ status }) {
  const idx = Math.max(0, STAGES.findIndex((s) => s.key === status));
  const cancelled = status === 'cancelled';

  if (cancelled) {
    return (
      <div className="border-thin border-dashed border-ink px-4 py-3">
        <span className="annot">Cancelled — nothing was cut</span>
      </div>
    );
  }

  return (
    <ol className="flex items-stretch">
      {STAGES.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s.key} className="flex flex-1 flex-col gap-2.5">
            <span
              className={cx(
                'h-[3px] w-full',
                done ? 'bg-ink' : 'bg-ink/15',
                i === idx && 'relative'
              )}
            />
            <span className={cx('annot flex items-center gap-1.5', done ? 'text-ink' : 'text-graphite')}>
              {i === idx && <Notch size={7} dir="right" />}
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrdersInner() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = params.get('id');
    const em = params.get('email');
    if (id) setOrderId(id);
    if (em) setEmail(em);
    if (id && em) lookup(id, em);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function lookup(id = orderId, em = email) {
    if (!id.trim() || !em.trim()) {
      setError('Both the order number and the email it was placed with.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await fetch(`/api/orders/lookup?orderId=${encodeURIComponent(id)}&email=${encodeURIComponent(em)}`);
      const data = await r.json();
      if (!r.ok) {
        setOrder(null);
        setError(
          r.status === 404
            ? 'No order under that number and email. Check the confirmation mail.'
            : data.error || 'Lookup failed.'
        );
        return;
      }
      setOrder(data.order);
    } catch {
      setError('Could not reach the order desk. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-[900px] px-5 py-12 lg:px-10 lg:py-16">
      <SheetStamp className="absolute right-5 top-6 hidden lg:inline-flex">Order desk</SheetStamp>
      <h1 className="display text-[clamp(2.2rem,6vw,3.4rem)]">Track an order</h1>
      <p className="measure mt-6 text-[16px] leading-relaxed text-graphite">
        The number is on your confirmation mail, with the address you placed it from.
      </p>

      <form
        className="mt-10 grid gap-7 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
      >
        <div>
          <label htmlFor="oid" className="annot mb-2 block text-graphite">
            Order number
          </label>
          <RuleInput id="oid" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="FS-…" />
        </div>
        <div>
          <label htmlFor="oem" className="annot mb-2 block text-graphite">
            Email
          </label>
          <RuleInput id="oem" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <CutButton type="submit" disabled={busy}>
          {busy ? 'Looking…' : 'Find it'}
        </CutButton>
      </form>

      {error && (
        <p className="annot mt-6 flex items-center gap-2">
          <Notch size={8} dir="right" />
          {error}
        </p>
      )}

      {/* Without an order on screen this page would be a form over dead sheet;
          fill it with the answer to the question people actually arrive with. */}
      {!order && (
        <div className="mt-14 grid gap-x-10 gap-y-8 border-t-hair border-ink/20 pt-10 sm:grid-cols-2">
          {[
            {
              q: 'Cannot find the number?',
              a: 'It is in the subject line of your confirmation mail, in the form FS-XXXXXX. Search your inbox for FITSTICH.',
            },
            {
              q: 'Ordered while signed in?',
              a: 'Your orders are listed in your account with their stage on the cutting floor — no number needed.',
            },
            {
              q: 'What the stages mean',
              a: 'Received, then Cut once the pattern is on cloth, then Shipped when it leaves us, then Delivered.',
            },
            {
              q: 'Something wrong with it?',
              a: 'Returns are open for 7 days from delivery on unworn pieces with tags attached. See the returns sheet.',
            },
          ].map((f) => (
            <div key={f.q} className="relative pl-6">
              <Notch className="absolute left-0 top-1" dir="right" size={8} />
              <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">{f.q}</h2>
              <p className="measure mt-2 text-[14px] leading-relaxed text-graphite">{f.a}</p>
            </div>
          ))}

          <TitleBlock
            className="mt-4 w-full max-w-[430px] sm:col-span-2"
            rows={[
              ['Sheet', 'FS-ORD'],
              ['Desk', 'Order tracking'],
              ['Returns', '7 days from delivery'],
            ]}
          />
        </div>
      )}

      {order && (
        <div className="mt-14 border-thin border-ink p-6 lg:p-8">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <span className="font-display text-xl font-bold tracking-[-0.03em]">{order.id}</span>
            <span className="annot text-graphite">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            </span>
          </div>

          <Progress status={order.status} />

          <div className="mt-10 flex flex-col">
            {(order.items || []).map((i, n) => (
              <div key={n} className="flex gap-4 border-b-hair border-ink/15 py-4">
                <span className="h-20 w-16 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover grayscale" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-semibold tracking-[-0.02em]">{i.name}</span>
                  <span className="annot mt-1.5 block text-graphite">
                    {i.size} · {i.color?.name} · ×{i.quantity}
                  </span>
                </span>
                <span className="font-mono text-[13px] tnum">{inr(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>

          <TitleBlock
            className="mt-8 w-full max-w-md"
            rows={[
              ['Total', inr(order.total)],
              ['Payment', `${order.paymentMethod || '—'} · ${order.paymentStatus || '—'}`],
              ['Ship to', `${order.customer?.city || ''} ${order.customer?.pincode || ''}`.trim() || '—'],
              ...(order.trackingId ? [['Tracking', order.trackingId]] : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <>
      <Header />
      <main className="sheet-fine tooth relative min-h-[70vh]">
        {/* the drawing's ruled margin */}
        <span
          className="pointer-events-none absolute inset-4 hidden border-hair border-ink/20 lg:block lg:inset-6"
          aria-hidden="true"
        />
        <Suspense
          fallback={
            <div className="mx-auto max-w-[900px] px-5 py-16">
              <span className="annot text-graphite">Opening the order desk…</span>
            </div>
          }
        >
          <OrdersInner />
        </Suspense>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
