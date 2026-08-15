'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { cx, inr, gsmOf, yarnOf, discountPct, stockState, draftRef, CATEGORY_LABEL, GRADE_TABLE, ALL_SIZES , sizedSrc } from '@/lib/draft';
import { useCart } from '@/components/site/CartProvider';
import SizeNest from '@/components/draft/SizeNest';
import PieceImage from '@/components/draft/PieceImage';
import { CutButton, DraftButton, RuleInput, CountStepper } from '@/components/draft/controls';
import { TitleBlock, GrainArrow, Notch } from '@/components/draft/marks';

export default function ProductDetail({ product }) {
  const { add, setOpen } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(product.colors?.[0] || null);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [tab, setTab] = useState('cloth');

  const gsm = gsmOf(product.material);
  const off = discountPct(product);
  const state = stockState(product.stock);
  const out = state.key === 'out';

  function handleAdd() {
    if (!size) {
      toast.error('Pick a size from the nest first');
      return;
    }
    add(product, size, color, qty);
    toast.success(`${product.name} · ${size} pinned to the bag`);
    setOpen(true);
  }

  /**
   * There is no live serviceability feed behind this yet, so it validates the
   * pincode's shape and quotes the standard dispatch window. It must not claim
   * to have checked coverage it cannot check.
   */
  function checkPincode() {
    if (!/^\d{6}$/.test(pincode)) {
      setDelivery({ ok: false, msg: 'A pincode is six digits. Check and try again.' });
      return;
    }
    setDelivery({
      ok: true,
      msg: 'Standard dispatch is 3–5 business days, free over ₹1,499. We confirm coverage for your pincode when the order is packed.',
    });
  }

  const TABS = [
    { key: 'cloth', label: 'Cloth' },
    { key: 'grade', label: 'Grading' },
    { key: 'care', label: 'Care' },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-14">
      <nav className="annot mb-10 flex items-center gap-2 text-graphite" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Sheet</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/shop/${product.gender}`} className="hover:text-ink">
          {product.gender === 'men' ? 'Men' : 'Women'}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        {/* ---------------- The piece, in its window ---------------- */}
        <div>
          <div className="relative overflow-hidden border-thin border-ink bg-paper-2">
            <div className="aspect-[4/5]">
              <PieceImage src={product.images?.[imgIdx]} alt={product.name} eager />
            </div>
            <Notch className="absolute left-1/2 top-0 -translate-x-1/2 text-ink" dir="down" size={12} />
            <Notch className="absolute bottom-0 left-1/2 -translate-x-1/2 text-ink" dir="up" size={12} />
            {off > 0 && !out && (
              <span className="absolute left-0 top-0 bg-ink px-3 py-2 annot text-paper">−{off}%</span>
            )}
            {out && (
              <span className="absolute inset-0 flex items-center justify-center bg-paper/72">
                <span className="annot-lg border-thin border-ink px-4 py-3">Cut out</span>
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  aria-label={`View ${i + 1}`}
                  className={cx(
                    'h-24 w-20 shrink-0 overflow-hidden border-thin transition-opacity',
                    i === imgIdx ? 'border-ink' : 'border-ink/25 opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={sizedSrc(img, 220)} alt="" className="h-full w-full object-cover grayscale" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- The spec and the decision ---------------- */}
        <div className="lg:pt-2">
          <h1 className="display text-[clamp(2.1rem,5.2vw,3.4rem)]">{product.name}</h1>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <span className="font-mono text-[28px] leading-none tnum">{inr(product.price)}</span>
            {product.compareAt > product.price && (
              <span className="font-mono text-[15px] text-graphite line-through tnum">
                {inr(product.compareAt)}
              </span>
            )}
            <span className={cx('annot border-thin px-2.5 py-1.5', state.cls)}>{state.label}</span>
          </div>

          <p className="measure mt-7 text-[16px] leading-[1.65] text-graphite">{product.description}</p>

          {/* The spec block — the reason to buy, as drafting annotation */}
          <TitleBlock
            className="mt-9 w-full max-w-[440px]"
            rows={[
              ['Yarn', yarnOf(product.material)],
              ['Weight', gsm ? `${gsm} GSM` : '—'],
              ['Fit', product.fit || '—'],
              ['Piece', CATEGORY_LABEL[product.category] || product.category],
              ['Ref', draftRef(product)],
            ]}
          />

          {/* Colour */}
          {product.colors?.length > 0 && (
            <div className="mt-10">
              <span className="annot mb-4 block text-graphite">
                Colourway · <span className="text-ink">{color?.name}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c)}
                    aria-label={c.name}
                    aria-pressed={color?.name === c.name}
                    className={cx(
                      'h-11 w-11 border-thin transition-all duration-250',
                      color?.name === c.name ? 'border-ink ring-1 ring-ink ring-offset-2' : 'border-ink/25'
                    )}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* The nest */}
          <div className="mt-10">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <span className="annot text-graphite">Size · read off the nest</span>
              <button
                onClick={() => setTab('grade')}
                className="annot text-graphite underline underline-offset-4 hover:text-ink"
              >
                Grading table
              </button>
            </div>
            <SizeNest available={product.sizes || []} value={size} onChange={setSize} />
          </div>

          {/* Commit */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CountStepper value={qty} onChange={setQty} />
            <CutButton size="lg" onClick={handleAdd} disabled={out} className="flex-1 min-w-[240px]">
              {out ? 'Cut out' : `Add to bag · ${inr(product.price * qty)}`}
            </CutButton>
          </div>
          <p className="annot mt-4 flex items-center gap-3 text-graphite">
            <GrainArrow />
            Free shipping over ₹1,499 · 7-day returns
          </p>

          {/* Delivery */}
          <div className="mt-10 border-t-hair border-ink/20 pt-8">
            <span className="annot mb-4 block text-graphite">Where is it going?</span>
            <div className="flex max-w-sm items-end gap-4">
              <RuleInput
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit pincode"
                inputMode="numeric"
                aria-label="Pincode"
                className="tnum"
              />
              <DraftButton onClick={checkPincode}>Check</DraftButton>
            </div>
            {delivery && (
              <p className={cx('annot mt-4', delivery.ok ? 'text-ink' : 'text-graphite')}>{delivery.msg}</p>
            )}
          </div>

          {/* Specification tabs */}
          <div className="mt-10 border-t-hair border-ink/20">
            <div className="flex gap-8 border-b-hair border-ink/15">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cx(
                    'annot -mb-px border-b-cut py-4 transition-colors',
                    tab === t.key ? 'border-ink text-ink' : 'border-transparent text-graphite hover:text-ink'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="pt-6">
              {tab === 'cloth' && (
                <p className="measure text-[15px] leading-relaxed text-graphite">
                  {product.material}. {product.fit} fit, drafted to a {product.gender === 'men' ? "men's" : "women's"} block
                  and graded across six sizes.
                </p>
              )}
              {tab === 'grade' && (
                <table className="w-full max-w-md border-collapse">
                  <caption className="annot mb-3 text-left text-graphite">
                    Body measurements, inches
                  </caption>
                  <thead>
                    <tr>
                      {['Size', 'Chest', 'Length'].map((h) => (
                        <th key={h} className="annot border-b-thin border-ink py-2.5 text-left font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_SIZES.map((s) => {
                      const avail = product.sizes?.includes(s);
                      return (
                        <tr key={s} className={cx(!avail && 'opacity-35')}>
                          <td className="border-b-hair border-ink/15 py-2.5 font-mono text-[12px]">{s}</td>
                          <td className="num border-b-hair border-ink/15 py-2.5 font-mono text-[12px]">
                            {GRADE_TABLE[s].chest}
                          </td>
                          <td className="num border-b-hair border-ink/15 py-2.5 font-mono text-[12px]">
                            {GRADE_TABLE[s].length}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {tab === 'care' && (
                <p className="measure text-[15px] leading-relaxed text-graphite">{product.fabricCare}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
