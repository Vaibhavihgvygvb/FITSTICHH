import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <Link href="/" className="text-xs text-neutral-400 hover:text-black uppercase tracking-widest">← Back to store</Link>
      <h1 className="font-display font-black text-4xl tracking-tight mt-8 mb-8">Returns & Exchanges</h1>
      <div className="prose prose-neutral max-w-none text-sm leading-relaxed space-y-4">
        <h2 className="text-xl font-bold mt-8">7-Day Return Policy</h2>
        <p>We accept returns within 7 days of delivery for unworn, unwashed items with all tags attached. This includes trying on only — no makeup stains, deodorant marks, or signs of wear.</p>
        <h2 className="text-xl font-bold mt-8">How to Return</h2>
        <p>Email us at <span className="font-medium">returns@fitstich.com</span> with your order number and reason for return. We'll share a return label. Pack the item securely with the original packaging and tags.</p>
        <h2 className="text-xl font-bold mt-8">Refunds</h2>
        <p>Refunds are processed within 5-7 business days of receiving the return. The amount is credited to the original payment method. Shipping charges are non-refundable.</p>
        <h2 className="text-xl font-bold mt-8">Exchanges</h2>
        <p>We currently do not offer direct exchanges. Please return the item and place a new order for the correct size or product.</p>
        <h2 className="text-xl font-bold mt-8">Damaged or Incorrect Items</h2>
        <p>If you receive a damaged or incorrect item, contact us within 48 hours of delivery at <span className="font-medium">support@fitstich.com</span> with photos. We'll arrange a free replacement or full refund.</p>
        <h2 className="text-xl font-bold mt-8">Non-Returnable Items</h2>
        <p>Final sale items, innerwear, and accessories (including socks and masks) cannot be returned for hygiene reasons.</p>
      </div>
    </div>
  );
}
