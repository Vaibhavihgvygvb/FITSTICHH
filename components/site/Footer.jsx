'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { CATEGORIES, GENDERS, GENDER_LABELS } from '@/lib/draft';
import { RuleInput, CutButton } from '@/components/draft/controls';
import { TitleBlock, GrainArrow } from '@/components/draft/marks';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function subscribe(e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('That address is not complete');
      return;
    }
    setBusy(true);
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error();
      toast.success('On the list');
      setEmail('');
    } catch {
      toast.error('Could not add you. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="cloth on-cloth border-t-cut border-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <span className="font-display text-4xl leading-none tracking-[-0.05em] text-chalk" style={{ fontWeight: 900 }}>
              FITSTICH
            </span>
            <p className="measure mt-6 text-[15px] leading-relaxed text-chalk-dim">
              We cut and sew our own knitwear in India. Every piece on this site states its yarn, its
              weight in GSM, and the fit it was drafted to — on the pattern, not in the caption.
            </p>
            <GrainArrow className="mt-8 text-chalk-dim" label="Grain runs lengthwise" />
          </div>

          <nav aria-label="Shop">
            <span className="annot mb-5 block text-chalk">Shop</span>
            <ul className="flex flex-col gap-3">
              {[GENDERS.MEN, GENDERS.WOMEN].map((g) => (
                <li key={g}>
                  <Link href={`/shop/${g}`} className="text-sm text-chalk-dim transition-colors hover:text-chalk">
                    {GENDER_LABELS[g]}
                  </Link>
                </li>
              ))}
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <Link
                    href={`/shop/men?category=${c.key}`}
                    className="text-sm text-chalk-dim transition-colors hover:text-chalk"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support">
            <span className="annot mb-5 block text-chalk">Support</span>
            <ul className="flex flex-col gap-3">
              {[
                ['Track an order', '/orders'],
                ['Account', '/account'],
                ['Shipping', '/shipping'],
                ['Returns', '/returns'],
                ['Terms', '/terms'],
                ['Privacy', '/privacy'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-chalk-dim transition-colors hover:text-chalk">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <span className="annot mb-5 block text-chalk">Next drop</span>
            <p className="mb-5 text-sm leading-relaxed text-chalk-dim">
              One note when a new block is cut. Nothing else.
            </p>
            <form onSubmit={subscribe} className="flex flex-col gap-4">
              <RuleInput
                tone="chalk"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                required
              />
              <CutButton tone="chalk" type="submit" disabled={busy}>
                {busy ? 'Adding…' : 'Join'}
              </CutButton>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-8 border-t-hair border-chalk/20 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <TitleBlock
            tone="chalk"
            className="w-full max-w-md"
            rows={[
              ['Drawn by', 'FITSTICH · In-house'],
              ['Cut in', 'India'],
              ['Sheet', `FS-${new Date().getFullYear()}`],
            ]}
          />
          <p className="annot text-chalk-dim">© {new Date().getFullYear()} FITSTICH</p>
        </div>
      </div>
    </footer>
  );
}
