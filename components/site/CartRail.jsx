'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cx, inr, gsmOf , sizedSrc } from '@/lib/draft';
import { useCart } from './CartProvider';
import { CutButton, CountStepper } from '@/components/draft/controls';
import { TitleBlock } from '@/components/draft/marks';

const FREE_SHIP = 1499;

/**
 * The bag as a rail. Nothing set aside disappears: while the rail is closed the
 * pieces stay pinned on the edge of the sheet, in view, one click from the table.
 */
export default function CartRail() {
  const { items, update, remove, subtotal, totalQty, open, setOpen } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const toFree = Math.max(0, FREE_SHIP - subtotal);

  return (
    <>
      {/* Pinned pieces — visible without opening anything */}
      {!open && totalQty > 0 && (
        <div className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1.5 border-y-thin border-l-thin border-ink bg-paper p-2.5 transition-colors hover:bg-paper-2"
            aria-label={`Open bag, ${totalQty} pieces`}
          >
            <span className="annot mb-0.5 text-graphite">Pinned</span>
            {items.slice(0, 4).map((i) => (
              <span key={i.key} className="relative block h-14 w-12 overflow-hidden border-hair border-ink/30">
                {i.image && <img src={sizedSrc(i.image, 260)} alt="" className="h-full w-full object-cover grayscale" />}
                {i.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 bg-ink px-1 font-mono text-[9px] leading-tight text-paper tnum">
                    {i.quantity}
                  </span>
                )}
              </span>
            ))}
            {items.length > 4 && <span className="annot text-graphite tnum">+{items.length - 4}</span>}
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/55" onClick={() => setOpen(false)} />

          {/* The cutting table: chalk on cloth */}
          <aside
            className="cloth on-cloth absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l-cut border-chalk/25"
            role="dialog"
            aria-label="Bag"
          >
            <div className="flex items-center justify-between border-b-hair border-chalk/25 px-6 py-5">
              <span className="annot-lg text-chalk">
                Bag · {String(totalQty).padStart(2, '0')} {totalQty === 1 ? 'piece' : 'pieces'}
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close bag" className="text-chalk">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
                <svg viewBox="0 0 120 100" className="w-32" fill="none" aria-hidden="true">
                  <path
                    d="M34 88 L34 40 L26 26 L52 16 L60 22 L68 16 L94 26 L86 40 L86 88 Z"
                    stroke="#ffffff"
                    strokeWidth="1.25"
                    strokeDasharray="5 5"
                    opacity="0.5"
                  />
                </svg>
                <p className="annot text-chalk-dim">Nothing cut yet</p>
                <CutButton as={Link} href="/shop/men" tone="chalk" onClick={() => setOpen(false)}>
                  Open the sheet
                </CutButton>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  {items.map((i) => {
                    const gsm = gsmOf(i.material);
                    return (
                      <div key={i.key} className="flex gap-4 border-b-hair border-chalk/18 py-5">
                        <Link
                          href={`/product/${i.slug}`}
                          onClick={() => setOpen(false)}
                          className="h-28 w-24 shrink-0 overflow-hidden border-hair border-chalk/30"
                        >
                          {i.image && <img src={sizedSrc(i.image, 260)} alt="" className="h-full w-full object-cover grayscale" />}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/product/${i.slug}`}
                              onClick={() => setOpen(false)}
                              className="font-display text-[15px] font-semibold leading-tight tracking-[-0.02em] text-chalk"
                            >
                              {i.name}
                            </Link>
                            <span className="shrink-0 font-mono text-[13px] text-chalk tnum">
                              {inr(i.price * i.quantity)}
                            </span>
                          </div>
                          <span className="annot mt-2 text-chalk-dim">
                            {i.size} · {i.color?.name}
                            {gsm ? ` · ${gsm} GSM` : ''}
                          </span>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                            <CountStepper
                              value={i.quantity}
                              onChange={(q) => update(i.key, q)}
                              tone="chalk"
                            />
                            <button
                              onClick={() => remove(i.key)}
                              className="annot text-chalk-dim underline underline-offset-4 transition-colors hover:text-chalk"
                            >
                              Unpin
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-thin border-chalk/30 px-6 py-5">
                  <TitleBlock
                    tone="chalk"
                    className="mb-5"
                    rows={[
                      ['Subtotal', inr(subtotal)],
                      ['Shipping', toFree > 0 ? `${inr(toFree)} to free` : 'Free'],
                      ['Pieces', String(totalQty).padStart(2, '0')],
                    ]}
                  />
                  <CutButton as={Link} href="/checkout" tone="chalk" size="lg" className="w-full" onClick={() => setOpen(false)}>
                    Checkout · {inr(subtotal)}
                  </CutButton>
                  <p className="annot mt-4 text-center text-chalk-dim">Razorpay · Stripe · Cash on delivery</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
