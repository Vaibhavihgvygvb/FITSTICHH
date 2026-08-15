import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/products';
import { GENDER_LABELS, CATEGORY_LABEL } from '@/lib/draft';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import ShopBoard from '@/components/shop/ShopBoard';
import { SheetStamp } from '@/components/draft/marks';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ gender: 'men' }, { gender: 'women' }];
}

export async function generateMetadata({ params }) {
  const { gender } = await params;
  const label = GENDER_LABELS[gender];
  if (!label) return {};
  return {
    title: `${label} — every piece, with its weight`,
    description: `FITSTICH ${label.toLowerCase()}'s knitwear: oversized and regular tees, joggers and pyjamas, each stated in GSM and graded XS to XXL.`,
  };
}

export default async function ShopPage({ params, searchParams }) {
  const { gender } = await params;
  const sp = await searchParams;
  if (!GENDER_LABELS[gender]) notFound();

  const products = await getProducts({ gender });
  const category = typeof sp?.category === 'string' ? sp.category : '';
  const tag = typeof sp?.tag === 'string' ? sp.tag : '';

  return (
    <>
      <Header />
      <main>
        <section className="sheet-fine tooth relative border-b-hair border-ink/25">
          <SheetStamp className="absolute right-5 top-6 hidden lg:inline-flex">
            Sheet 02 · {GENDER_LABELS[gender]}
            {category ? ` · ${CATEGORY_LABEL[category] || category}` : ''}
          </SheetStamp>
          <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16">
            <h1 className="display text-[clamp(2.4rem,7vw,4.75rem)]">
              {category ? CATEGORY_LABEL[category] || category : `${GENDER_LABELS[gender]}'s block`}
            </h1>
            <p className="measure mt-6 text-[16px] leading-relaxed text-graphite">
              Laid out the way a cutter lays a marker: every piece flat, its weight and fit stated,
              nothing hidden until you click.
            </p>
          </div>
        </section>

        <ShopBoard products={products} gender={gender} initialCategory={category} initialTag={tag} />
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
