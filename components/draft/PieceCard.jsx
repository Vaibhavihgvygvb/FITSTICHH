'use client';

import Link from 'next/link';
import { cx, inr, gsmOf, discountPct, stockState, CATEGORY_LABEL } from '@/lib/draft';
import { Notch } from './marks';
import PieceImage from './PieceImage';

/**
 * A product drawn as a pattern piece on the sheet.
 *
 * Rank is cell size in the marker layout, never a bigger heading — `span`
 * promotes a piece by giving it more of the sheet, and the type never changes.
 * Stock reads as line form: solid stocked, dashed made-to-order, hairline+struck cut out.
 */
export default function PieceCard({ product, span = 1, priority = false }) {
  const gsm = gsmOf(product.material);
  const off = discountPct(product);
  const state = stockState(product.stock);
  const out = state.key === 'out';

  return (
    <article
      className={cx(
        'group relative flex flex-col',
        // Rank is cell size in the marker — a promoted piece takes two columns
        // and two rows, so the layout nests tight and leaves no waste.
        span === 2 && 'sm:col-span-2 sm:row-span-2 sm:h-full',
        out && 'opacity-70'
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-1 flex-col outline-offset-4"
        aria-label={`${product.name} — ${inr(product.price)}`}
      >
        {/* Punched window. Photography is a slot; the frame is the design. */}
        <div
          className={cx(
            'zoom-parent relative overflow-hidden border-thin bg-paper-2',
            state.cls,
            span === 2 ? 'aspect-[4/5] sm:aspect-auto sm:min-h-0 sm:flex-1' : 'aspect-[4/5]'
          )}
        >
          <PieceImage
            src={product.images?.[0]}
            alt={product.name}
            eager={priority}
            width={span === 2 ? 1100 : 620}
            className="zoom-child"
          />

          {/* Register notches — top and bottom centre, as on a real piece */}
          <Notch className="absolute left-1/2 top-0 -translate-x-1/2 text-ink/70" dir="down" />
          <Notch className="absolute bottom-0 left-1/2 -translate-x-1/2 text-ink/70" dir="up" />

          {off > 0 && !out && (
            <span className="absolute left-0 top-0 bg-ink px-2.5 py-1.5 annot text-paper">−{off}%</span>
          )}

          {/* Escalation is a change of frame, never red text. */}
          {state.key === 'low' && (
            <span className="absolute inset-0 border-cut border-ink" aria-hidden="true" />
          )}
          {out && (
            <span className="absolute inset-0 flex items-center justify-center bg-paper/72">
              <span className="annot-lg border-thin border-ink px-3 py-2">Cut out</span>
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="piece-name font-display text-[15px] font-semibold leading-tight tracking-[-0.02em]">
              {product.name}
            </h3>
            <span className="shrink-0 font-mono text-[13px] tnum">{inr(product.price)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="annot text-graphite">
              {CATEGORY_LABEL[product.category] || product.category} · {product.fit}
            </span>
            {product.compareAt > product.price && (
              <span className="annot text-graphite line-through tnum">{inr(product.compareAt)}</span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 border-t-hair border-ink/15 pt-2.5">
            {gsm && <span className="annot text-graphite tnum">{gsm} GSM</span>}
            <span className="h-2.5 w-px bg-ink/20" />
            <span className="annot text-graphite">{state.label}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
