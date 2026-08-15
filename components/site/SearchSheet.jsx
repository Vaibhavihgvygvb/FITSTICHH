'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cx, inr, gsmOf, CATEGORY_LABEL , sizedSrc } from '@/lib/draft';

export default function SearchSheet({ open, onClose }) {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQ('');
      return;
    }
    inputRef.current?.focus();
    if (products.length) return;
    fetch('/api/products')
      .then((r) => r.json())
      .then((r) => setProducts(r.products || []))
      .catch(() => {});
  }, [open, products.length]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.fit?.toLowerCase().includes(s) ||
          p.material?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
      )
      .slice(0, 8);
  }, [q, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper">
      <div className="sheet-fine tooth min-h-full">
        <div className="mx-auto max-w-[900px] px-5 pb-24 pt-8 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <span className="annot text-graphite">Find a piece</span>
            <button onClick={onClose} aria-label="Close search">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Oversized, 240 GSM, joggers…"
            className="w-full border-b-cut border-ink bg-transparent pb-5 font-display text-3xl tracking-[-0.03em] outline-none placeholder:text-ink/25 lg:text-5xl"
            style={{ fontWeight: 700 }}
          />

          <div className="mt-10">
            {q.trim() && results.length === 0 && (
              <p className="annot text-graphite">Nothing cut to that spec. Try a weight or a fit.</p>
            )}

            <div className="flex flex-col">
              {results.map((p) => {
                const gsm = gsmOf(p.material);
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-5 border-b-hair border-ink/15 py-4"
                  >
                    <span className="h-16 w-14 shrink-0 overflow-hidden border-hair border-ink/25 bg-paper-2">
                      {p.images?.[0] && (
                        <img src={sizedSrc(p.images[0], 200)} alt="" className="h-full w-full object-cover grayscale" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] font-semibold tracking-[-0.02em]">
                        {p.name}
                      </span>
                      <span className="annot mt-1 block text-graphite">
                        {CATEGORY_LABEL[p.category] || p.category}
                        {gsm ? ` · ${gsm} GSM` : ''} · {p.fit}
                      </span>
                    </span>
                    <span className="font-mono text-[13px] tnum">{inr(p.price)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
