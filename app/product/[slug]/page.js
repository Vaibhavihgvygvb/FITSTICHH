import { notFound } from 'next/navigation';
import { getProductBySlug, getRelated, getAllSlugs } from '@/lib/products';
import { gsmOf, inr } from '@/lib/draft';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import ProductDetail from '@/components/shop/ProductDetail';
import PieceCard from '@/components/draft/PieceCard';
import { SheetRule } from '@/components/draft/marks';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const gsm = gsmOf(product.material);
  return {
    title: product.name,
    description: `${product.description} ${gsm ? `${gsm} GSM. ` : ''}${product.fit} fit, ${inr(product.price)}.`,
    openGraph: {
      title: `${product.name} — FITSTICH`,
      description: product.description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelated(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    material: product.material,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-5 pb-20 lg:px-10 lg:pb-28">
            <SheetRule label="Cut from the same block" />
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {related.map((p) => (
                <PieceCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
