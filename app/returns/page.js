import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import { SheetStamp } from '@/components/draft/marks';

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="sheet-fine tooth min-h-[70vh]">
        <div className="relative mx-auto max-w-[820px] px-5 py-14 lg:px-10 lg:py-20">
      <SheetStamp className="absolute right-5 top-6 hidden lg:inline-flex">Specification</SheetStamp>
      <h1 className="display mb-10 text-[clamp(2.1rem,6vw,3.2rem)]">Returns & Exchanges</h1>
      <div className="doc">
        <h2>7-Day Return Policy</h2>
        <p>We accept returns within 7 days of delivery for unworn, unwashed items with all tags attached. This includes trying on only — no makeup stains, deodorant marks, or signs of wear.</p>
        <h2>How to Return</h2>
        <p>Email us at <span className="font-medium">returns@fitstich.com</span> with your order number and reason for return. We'll share a return label. Pack the item securely with the original packaging and tags.</p>
        <h2>Refunds</h2>
        <p>Refunds are processed within 5-7 business days of receiving the return. The amount is credited to the original payment method. Shipping charges are non-refundable.</p>
        <h2>Exchanges</h2>
        <p>We currently do not offer direct exchanges. Please return the item and place a new order for the correct size or product.</p>
        <h2>Damaged or Incorrect Items</h2>
        <p>If you receive a damaged or incorrect item, contact us within 48 hours of delivery at <span className="font-medium">support@fitstich.com</span> with photos. We'll arrange a free replacement or full refund.</p>
        <h2>Non-Returnable Items</h2>
        <p>Final sale items, innerwear, and accessories (including socks and masks) cannot be returned for hygiene reasons.</p>
      </div>
      </div>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
