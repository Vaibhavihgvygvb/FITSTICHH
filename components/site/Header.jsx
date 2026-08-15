'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, User, Menu, X } from 'lucide-react';
import { CATEGORIES, GENDERS, GENDER_LABELS, cx } from '@/lib/draft';
import { useCart } from './CartProvider';
import SearchSheet from './SearchSheet';

const TICKER = [
  'In-house manufactured · Cut and sewn in India',
  'Free shipping over ₹1,499',
  'Every piece states its weight in GSM',
  'Graded XS to XXL on every block',
];

/** A ruled edge — the measuring rule the whole sheet registers against. */
function Rule() {
  return (
    <div className="relative h-2 border-b-hair border-ink/20" aria-hidden="true">
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 41 }).map((_, i) => (
          <span key={i} className={cx('w-px bg-ink/25', i % 5 === 0 ? 'h-2' : 'h-1 self-start')} />
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { totalQty, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const link = 'annot text-graphite transition-colors duration-200 hover:text-ink';

  return (
    <>
      {/* Cutting-table ticker */}
      <div className="overflow-hidden bg-ink py-2.5 text-paper">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...TICKER, ...TICKER, ...TICKER].map((m, i) => (
            <span key={i} className="annot mx-10 opacity-85">
              {m}
            </span>
          ))}
        </div>
      </div>

      <header
        className={cx(
          'sticky top-0 z-40 w-full bg-paper transition-shadow duration-500',
          scrolled && 'shadow-[0_1px_0_0_rgba(11,11,11,0.14),0_10px_28px_-18px_rgba(11,11,11,0.3)]'
        )}
      >
        <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
          <div className="flex h-[68px] items-center justify-between gap-6 lg:h-[76px]">
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <Link href="/" className="font-display text-[26px] font-900 leading-none tracking-[-0.05em] lg:text-[30px]" style={{ fontWeight: 900 }}>
              FITSTICH
            </Link>

            <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
              <span className="flex items-center gap-5 border-r-hair border-ink/20 pr-8">
                {[GENDERS.MEN, GENDERS.WOMEN].map((g) => (
                  <Link
                    key={g}
                    href={`/shop/${g}`}
                    className={cx(link, pathname === `/shop/${g}` && 'text-ink')}
                  >
                    {GENDER_LABELS[g]}
                  </Link>
                ))}
              </span>
              {CATEGORIES.map((c) => (
                <Link key={c.key} href={`/shop/men?category=${c.key}`} className={link}>
                  {c.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <button onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search className="h-5 w-5 transition-opacity hover:opacity-55" strokeWidth={1.5} />
              </button>
              <Link href="/account" aria-label="Account" className="hidden sm:block">
                <User className="h-5 w-5 transition-opacity hover:opacity-55" strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2"
                aria-label={`Bag, ${totalQty} pieces`}
              >
                <span className="annot hidden sm:inline">Bag</span>
                <span
                  className={cx(
                    'flex h-7 min-w-7 items-center justify-center border-thin px-1.5 font-mono text-[11px] tnum transition-colors',
                    totalQty > 0 ? 'border-ink bg-ink text-paper' : 'border-ink/35 text-graphite'
                  )}
                >
                  {String(totalQty).padStart(2, '0')}
                </span>
              </button>
            </div>
          </div>
        </div>
        <Rule />
      </header>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setMobileOpen(false)} />
          <div className="sheet tooth absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto border-r-cut border-ink bg-paper p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-2xl tracking-[-0.05em]" style={{ fontWeight: 900 }}>
                FITSTICH
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <span className="annot mb-3 text-graphite">Block</span>
            <div className="mb-8 grid grid-cols-2 gap-2">
              {[GENDERS.MEN, GENDERS.WOMEN].map((g) => (
                <Link
                  key={g}
                  href={`/shop/${g}`}
                  className="flex h-12 items-center justify-center border-thin border-ink font-mono text-[11px] uppercase tracking-[0.18em]"
                >
                  {GENDER_LABELS[g]}
                </Link>
              ))}
            </div>

            <span className="annot mb-3 text-graphite">Pieces</span>
            <nav className="flex flex-col">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.key}
                  href={`/shop/men?category=${c.key}`}
                  className="flex items-center justify-between border-b-hair border-ink/15 py-4 font-display text-lg tracking-[-0.02em]"
                >
                  {c.label}
                  <span className="annot text-graphite">{c.code}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-3">
              <Link href="/orders" className="annot text-graphite">
                Track an order
              </Link>
              <Link href="/account" className="annot text-graphite">
                Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
