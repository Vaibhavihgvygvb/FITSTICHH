'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, ALL_SIZES, cx, inr, gsmOf, CATEGORY_LABEL } from '@/lib/draft';
import PieceCard from '@/components/draft/PieceCard';
import { DraftButton } from '@/components/draft/controls';
import { SheetRule } from '@/components/draft/marks';

const SORTS = [
  { key: 'featured', label: 'As laid out' },
  { key: 'price-low', label: 'Price ↑' },
  { key: 'price-high', label: 'Price ↓' },
  { key: 'weight', label: 'Heaviest cloth' },
  { key: 'popular', label: 'Most reviewed' },
];

export default function ShopBoard({ products, gender, initialCategory = '', initialTag = '' }) {
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [sizes, setSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const ceiling = useMemo(
    () => Math.max(2500, ...products.map((p) => p.price || 0)),
    [products]
  );
  const cap = maxPrice ?? ceiling;

  const shown = useMemo(() => {
    let list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (tag && !p.tags?.includes(tag)) return false;
      if (sizes.length && !sizes.some((s) => p.sizes?.includes(s))) return false;
      if (p.price > cap) return false;
      return true;
    });
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'popular') list = [...list].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    else if (sort === 'weight')
      list = [...list].sort((a, b) => (gsmOf(b.material) || 0) - (gsmOf(a.material) || 0));
    return list;
  }, [products, category, tag, sizes, cap, sort]);

  const toggleSize = (s) => setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const active = Boolean(category || tag || sizes.length || maxPrice);
  const reset = () => {
    setCategory('');
    setTag('');
    setSizes([]);
    setMaxPrice(null);
  };

  const Filters = ({ inSheet = false }) => (
    <div className={cx('flex flex-col gap-9', inSheet && 'pb-8')}>
      <div>
        <span className="annot mb-4 block text-graphite">Piece</span>
        <div className="flex flex-col gap-2.5">
          <FilterLine label="Everything" active={!category} onClick={() => setCategory('')} count={products.length} />
          {CATEGORIES.map((c) => (
            <FilterLine
              key={c.key}
              label={c.label}
              active={category === c.key}
              onClick={() => setCategory(category === c.key ? '' : c.key)}
              count={products.filter((p) => p.category === c.key).length}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="annot mb-4 block text-graphite">Marked</span>
        <div className="flex flex-col gap-2.5">
          {[
            ['new', 'Just cut'],
            ['best-seller', 'Best sellers'],
          ].map(([k, label]) => (
            <FilterLine
              key={k}
              label={label}
              active={tag === k}
              onClick={() => setTag(tag === k ? '' : k)}
              count={products.filter((p) => p.tags?.includes(k)).length}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="annot mb-4 block text-graphite">Size in the nest</span>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={cx(
                'h-10 min-w-[52px] border-thin px-2 font-mono text-[11px] tracking-[0.12em] transition-colors',
                sizes.includes(s) ? 'border-ink bg-ink text-paper' : 'border-ink/30 hover:border-ink'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="annot mb-4 block text-graphite">Up to {inr(cap)}</span>
        <input
          type="range"
          min={500}
          max={ceiling}
          step={100}
          value={cap}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-ink"
          aria-label="Maximum price"
        />
      </div>

      {active && (
        <button onClick={reset} className="annot self-start text-graphite underline underline-offset-4 hover:text-ink">
          Clear the board
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-14">
      <SheetRule
        label={`${gender === 'men' ? 'Men' : 'Women'} · ${String(shown.length).padStart(2, '0')} ${
          shown.length === 1 ? 'piece' : 'pieces'
        }`}
        action={
          <div className="flex items-center gap-4">
            <label className="hidden items-center gap-2 sm:flex">
              <span className="annot text-graphite">Order</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border-b-hair border-ink/40 bg-transparent py-1 font-mono text-[11px] uppercase tracking-[0.12em] outline-none focus:border-ink"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => setFiltersOpen(true)} className="annot flex items-center gap-2 lg:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
              Filter
            </button>
          </div>
        }
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[210px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <Filters />
          </div>
        </aside>

        <div>
          {shown.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-start justify-center gap-5 border-thin border-dashed border-ink/40 p-10">
              <p className="font-display text-2xl tracking-[-0.03em]">Nothing on the board</p>
              <p className="measure text-[15px] text-graphite">
                No piece matches that combination of size, weight and price.
              </p>
              <DraftButton onClick={reset}>Clear the board</DraftButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:gap-x-8">
              {shown.map((p, i) => (
                <PieceCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setFiltersOpen(false)} />
          <div className="sheet tooth absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto border-t-cut border-ink bg-paper p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="annot-lg">Filter the board</span>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="mb-8">
              <span className="annot mb-4 block text-graphite">Order</span>
              <div className="flex flex-wrap gap-2">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSort(s.key)}
                    className={cx(
                      'h-10 border-thin px-3 font-mono text-[10px] uppercase tracking-[0.14em]',
                      sort === s.key ? 'border-ink bg-ink text-paper' : 'border-ink/30'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <Filters inSheet />
            <DraftButton className="w-full" onClick={() => setFiltersOpen(false)}>
              Show {shown.length} {shown.length === 1 ? 'piece' : 'pieces'}
            </DraftButton>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterLine({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'group flex items-baseline justify-between gap-3 border-b-hair pb-2 text-left transition-colors',
        active ? 'border-ink' : 'border-ink/15 hover:border-ink/50'
      )}
    >
      <span className={cx('text-sm tracking-[-0.01em]', active ? 'font-semibold text-ink' : 'text-graphite')}>
        {label}
      </span>
      <span className="annot text-graphite tnum">{String(count).padStart(2, '0')}</span>
    </button>
  );
}
