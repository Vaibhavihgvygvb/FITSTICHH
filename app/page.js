import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { GENDERS, CATEGORIES, gsmOf } from '@/lib/draft';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import PieceCard from '@/components/draft/PieceCard';
import PatternFold from '@/components/three/PatternFold';
import ChalkMarker from '@/components/draft/ChalkMarker';
import { CutButton, DraftButton } from '@/components/draft/controls';
import { GrainArrow, TitleBlock, SheetRule, Leader, Dimension, Notch, SheetStamp } from '@/components/draft/marks';

export const revalidate = 60;

export const metadata = {
  title: 'FITSTICH — Cut from stated cloth',
  description:
    'In-house manufactured knitwear from India. Oversized and regular tees, joggers and pyjamas — every piece states its yarn, its weight in GSM, and the fit it was drafted to.',
};

export default async function HomePage() {
  const all = await getProducts();
  const men = all.filter((p) => p.gender === GENDERS.MEN);
  const women = all.filter((p) => p.gender === GENDERS.WOMEN);

  const pick = (list, tag, n) => {
    const tagged = list.filter((p) => p.tags?.includes(tag));
    return [...new Map([...tagged, ...list].map((p) => [p.id, p])).values()].slice(0, n);
  };

  const bestMen = pick(men, 'best-seller', 5);
  const bestWomen = pick(women, 'best-seller', 5);
  const fresh = pick(all, 'new', 6);

  const weights = [...new Set(all.map((p) => gsmOf(p.material)).filter(Boolean))].sort((a, b) => a - b);
  const heaviest = weights[weights.length - 1];
  const lightest = weights[0];

  return (
    <>
      <Header />
      <main>
        {/* ==================================================================
            FIRST VIEWPORT — the sheet, with the garment drawn on it
            ================================================================== */}
        <section className="sheet-fine tooth relative overflow-hidden border-b-cut border-ink">
          {/* The sheet reference is stamped in the drawing's margin, as a real
              sheet carries it — not stacked above the headline. */}
          <SheetStamp className="absolute right-5 top-6 z-10 hidden lg:inline-flex">
            Sheet 01 · Drop AW26
          </SheetStamp>

          {/* On a phone the fold sits directly under the headline so the garment
              is in the first viewport; on desktop it takes the right column. */}
          <div className="mx-auto grid max-w-[1440px] items-center gap-y-6 px-5 pb-14 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-6 lg:gap-y-8 lg:px-10 lg:pb-24 lg:pt-16">
            <div className="relative z-10 max-w-[640px] lg:col-start-1 lg:row-start-1">
              <h1 className="display text-[clamp(2.6rem,8.4vw,6rem)]">
                Cut from
                <br />
                stated cloth.
              </h1>
            </div>

            {/* The fold */}
            <div className="relative lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <div className="relative aspect-[4/2.25] w-full sm:aspect-[4/3] lg:aspect-[4/3.9]">
                <PatternFold className="absolute inset-0" />

                <span className="pointer-events-none absolute left-0 top-6 hidden lg:block">
                  <Dimension value="Front × 2" vertical />
                </span>
                <span className="pointer-events-none absolute bottom-8 right-2 hidden lg:block">
                  <Leader side="right" className="text-graphite">
                    Sleeve · cut on fold
                  </Leader>
                </span>
              </div>
              <p className="annot mt-2 text-center text-graphite lg:text-right">
                Four pieces · one tee · assembled
              </p>
            </div>

            <div className="relative z-10 max-w-[640px] lg:col-start-1 lg:row-start-2">
              <p className="measure text-[16px] leading-[1.6] text-graphite lg:text-[17px] lg:leading-[1.65]">
                We draft the pattern, knit the cloth, and sew the piece ourselves. So we can print what
                it actually is — {lightest} to {heaviest} GSM, the yarn, the fit it was graded to —
                instead of asking you to guess from a photograph.
              </p>

              {/* The grain line points at the primary action, which is its whole job. */}
              <div className="mt-7 flex flex-wrap items-center gap-4 lg:mt-9">
                <GrainArrow aim className="text-ink" />
                <CutButton as={Link} href="/shop/men" size="lg">
                  Shop the sheet
                </CutButton>
                <DraftButton as={Link} href="/shop/women" size="lg">
                  Women
                </DraftButton>
              </div>

              <TitleBlock
                className="mt-10 w-full max-w-[430px] lg:mt-14"
                rows={[
                  ['Yarn', '100% combed cotton'],
                  ['Weight', `${lightest}–${heaviest} GSM`],
                  ['Graded', 'XS · S · M · L · XL · XXL'],
                  ['Cut in', 'India · in-house'],
                ]}
              />
            </div>
          </div>
        </section>

        {/* ==================================================================
            THE ARGUMENT — what a stated spec buys you
            ================================================================== */}
        <section className="border-b-hair border-ink/20">
          <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-20">
            <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
              {[
                {
                  n: 'Weight, printed',
                  d: `Every piece carries its GSM. ${heaviest} GSM falls heavy and holds its shape; ${lightest} drapes. You are choosing cloth, not a size chart.`,
                },
                {
                  n: 'Graded, not guessed',
                  d: 'Each style is drafted to a block and graded across six sizes. The nest on every product page is the actual grading, chest and length in inches.',
                },
                {
                  n: 'No middle hands',
                  d: 'Knit, cut, sew, ship — ours. That is the whole reason the price sits where it does and the spec can be this specific.',
                },
              ].map((c, i) => (
                <div key={c.n} className="relative pl-6">
                  <Notch className="absolute left-0 top-1.5 text-ink" dir="right" size={9} />
                  <h2 className="font-display text-[19px] font-bold tracking-[-0.025em]">{c.n}</h2>
                  <p className="measure mt-3 text-[15px] leading-relaxed text-graphite">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            THE MARKER — pieces laid out for cutting. Rank is cell size.
            ================================================================== */}
        <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
          <SheetRule
            label="Men · best sellers"
            action={
              <Link href="/shop/men" className="annot text-graphite underline underline-offset-4 hover:text-ink">
                All men
              </Link>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:auto-rows-fr sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {bestMen.map((p, i) => (
              <PieceCard key={p.id} product={p} span={i === 0 ? 2 : 1} priority={i < 2} />
            ))}
          </div>
        </section>

        {/* ==================================================================
            THE BLOCKS — two entry points, equal weight
            ================================================================== */}
        <section className="cloth on-cloth relative overflow-hidden border-y-cut border-ink">
          {/* The other half of the world: the marker chalked straight onto the
              cloth before it is cut. Drawn, not implied. */}
          <ChalkMarker />
          <div className="relative mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
            <SheetRule label="Blocks" tone="chalk" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:gap-8">
              {[
                { g: GENDERS.MEN, label: 'Men', n: men.length },
                { g: GENDERS.WOMEN, label: 'Women', n: women.length },
              ].map(({ g, label, n }) => (
                <Link
                  key={g}
                  href={`/shop/${g}`}
                  className="group relative flex min-h-[240px] flex-col justify-between border-thin border-chalk/40 p-7 transition-colors duration-400 hover:bg-chalk hover:text-cloth lg:min-h-[300px]"
                >
                  <span className="annot opacity-70">{String(n).padStart(2, '0')} pieces drafted</span>
                  <span>
                    <span className="font-display block text-[clamp(2.4rem,6vw,4.2rem)] leading-none tracking-[-0.045em]" style={{ fontWeight: 900 }}>
                      {label}
                    </span>
                    <span className="annot mt-4 flex items-center gap-3">
                      Open the block
                      <GrainArrow />
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-14 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((c) => {
                const n = all.filter((p) => p.category === c.key).length;
                return (
                  <Link
                    key={c.key}
                    href={`/shop/men?category=${c.key}`}
                    className="flex items-baseline justify-between border-b-hair border-chalk/25 pb-3 transition-colors hover:border-chalk"
                  >
                    <span className="font-display text-[17px] font-semibold tracking-[-0.02em] text-chalk">
                      {c.label}
                    </span>
                    <span className="annot text-chalk-dim tnum">
                      {c.code} · {String(n).padStart(2, '0')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
          <SheetRule
            label="Women · best sellers"
            action={
              <Link href="/shop/women" className="annot text-graphite underline underline-offset-4 hover:text-ink">
                All women
              </Link>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:auto-rows-fr sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {bestWomen.map((p, i) => (
              <PieceCard key={p.id} product={p} span={i === 0 ? 2 : 1} />
            ))}
          </div>
        </section>

        {/* ==================================================================
            JUST CUT — a quiet run after the dense ones
            ================================================================== */}
        <section className="border-t-hair border-ink/20 bg-paper-2">
          <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-20">
            <SheetRule label="Just cut" />
            <div className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-2 lg:gap-8">
              {fresh.map((p) => (
                <div key={p.id} className="w-[68vw] shrink-0 sm:w-[42vw] lg:w-[calc((100%-3*2rem)/4)]">
                  <PieceCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
