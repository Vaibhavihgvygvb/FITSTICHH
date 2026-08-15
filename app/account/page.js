'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cx, inr } from '@/lib/draft';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import { CutButton, DraftButton } from '@/components/draft/controls';
import { Notch } from '@/components/draft/marks';

/** Status reads as line form — solid for done, dashed for in flight, hairline for cancelled. */
const STATUS_LINE = {
  pending: 'border-dashed border-ink',
  processing: 'border-dashed border-ink',
  confirmed: 'border-solid border-ink',
  shipped: 'border-solid border-ink',
  delivered: 'border-solid border-ink bg-ink text-paper',
  cancelled: 'border-solid border-ink/30 text-graphite line-through',
};

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/orders/user')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const initial = session?.user?.name?.[0] || session?.user?.email?.[0] || '?';

  return (
    <>
      <Header />
      <main className="sheet-fine tooth min-h-[70vh]">
        <div className="mx-auto max-w-[1000px] px-5 py-12 lg:px-10 lg:py-16">
          {status === 'loading' || loading ? (
            <span className="annot text-graphite">Opening the file…</span>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-6 border-b-cut border-ink pb-8">
                <div className="flex items-center gap-5">
                  <span className="flex h-16 w-16 items-center justify-center border-thin border-ink font-display text-2xl" style={{ fontWeight: 800 }}>
                    {String(initial).toUpperCase()}
                  </span>
                  <div>
                    <h1 className="display text-[clamp(1.9rem,5vw,2.7rem)]">
                      {session?.user?.name || 'Account'}
                    </h1>
                    <p className="annot mt-2 text-graphite">{session?.user?.email}</p>
                  </div>
                </div>
                <DraftButton size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </DraftButton>
              </div>

              <div className="mt-12">
                <span className="annot mb-6 block text-graphite">
                  Orders · {String(orders.length).padStart(2, '0')}
                </span>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-start gap-5 border-thin border-dashed border-ink/40 p-10">
                    <p className="font-display text-2xl tracking-[-0.03em]">Nothing cut yet</p>
                    <p className="measure text-[15px] text-graphite">
                      When you order, it shows up here with its stage on the cutting floor.
                    </p>
                    <CutButton as={Link} href="/shop/men">
                      Open the sheet
                    </CutButton>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {orders.map((o) => (
                      <Link
                        key={o.id}
                        href={`/orders?id=${o.id}&email=${encodeURIComponent(o.customer?.email || '')}`}
                        className="group flex flex-wrap items-center justify-between gap-4 border-b-hair border-ink/15 py-5 transition-colors hover:bg-paper-2"
                      >
                        <div className="flex items-center gap-4">
                          <Notch size={8} dir="right" className="text-ink opacity-0 transition-opacity group-hover:opacity-100" />
                          <div>
                            <span className="block font-mono text-[13px]">{o.id}</span>
                            <span className="annot mt-1.5 block text-graphite">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              · {o.items?.length} {o.items?.length === 1 ? 'piece' : 'pieces'}
                              {o.trackingNumber ? ` · ${o.trackingNumber}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-[13px] tnum">{inr(o.total)}</span>
                          <span
                            className={cx(
                              'annot border-thin px-2.5 py-1.5',
                              STATUS_LINE[o.status] || 'border-ink'
                            )}
                          >
                            {o.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
