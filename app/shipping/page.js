import Link from 'next/link';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import { SheetStamp } from '@/components/draft/marks';

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="sheet-fine tooth min-h-[70vh]">
        <div className="relative mx-auto max-w-[820px] px-5 py-14 lg:px-10 lg:py-20">
      <SheetStamp className="absolute right-5 top-6 hidden lg:inline-flex">Specification</SheetStamp>
      <h1 className="display mb-10 text-[clamp(2.1rem,6vw,3.2rem)]">Shipping Policy</h1>
      <div className="doc">
        <h2>Delivery Timeline</h2>
        <p>Orders are processed within 1-2 business days. Standard delivery takes 3-5 business days pan-India. Metro cities may receive orders in 2-3 business days.</p>
        <h2>Shipping Charges</h2>
        <p>Free shipping on all orders above ₹1,499. A flat ₹99 shipping fee applies to orders below ₹1,499.</p>
        <h2>Order Tracking</h2>
        <p>Once shipped, you'll receive a tracking link via email. You can also track your order on our <Link href="/orders" className="underline underline-offset-4">Order Tracking</Link> page using your order ID and email.</p>
        <h2>Cash on Delivery (COD)</h2>
        <p>COD is available on all orders. A nominal convenience fee may apply. Pay in cash at the time of delivery.</p>
        <h2>Shipping Areas</h2>
        <p>We ship across India including all metro cities, tier-2, and tier-3 towns. International shipping is coming soon.</p>
        <h2>Delayed Orders</h2>
        <p>If your order is delayed beyond 7 business days, contact us at <span className="font-medium">support@fitstich.com</span> and we'll prioritize resolution.</p>
      </div>
      </div>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
