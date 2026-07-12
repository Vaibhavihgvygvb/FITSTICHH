import Link from 'next/link';

export default function ShippingPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <Link href="/" className="text-xs text-neutral-400 hover:text-black uppercase tracking-widest">← Back to store</Link>
      <h1 className="font-display font-black text-4xl tracking-tight mt-8 mb-8">Shipping Policy</h1>
      <div className="prose prose-neutral max-w-none text-sm leading-relaxed space-y-4">
        <h2 className="text-xl font-bold mt-8">Delivery Timeline</h2>
        <p>Orders are processed within 1-2 business days. Standard delivery takes 3-5 business days pan-India. Metro cities may receive orders in 2-3 business days.</p>
        <h2 className="text-xl font-bold mt-8">Shipping Charges</h2>
        <p>Free shipping on all orders above ₹1,499. A flat ₹99 shipping fee applies to orders below ₹1,499.</p>
        <h2 className="text-xl font-bold mt-8">Order Tracking</h2>
        <p>Once shipped, you'll receive a tracking link via email. You can also track your order on our <Link href="/orders" className="underline underline-offset-4">Order Tracking</Link> page using your order ID and email.</p>
        <h2 className="text-xl font-bold mt-8">Cash on Delivery (COD)</h2>
        <p>COD is available on all orders. A nominal convenience fee may apply. Pay in cash at the time of delivery.</p>
        <h2 className="text-xl font-bold mt-8">Shipping Areas</h2>
        <p>We ship across India including all metro cities, tier-2, and tier-3 towns. International shipping is coming soon.</p>
        <h2 className="text-xl font-bold mt-8">Delayed Orders</h2>
        <p>If your order is delayed beyond 7 business days, contact us at <span className="font-medium">support@fitstich.com</span> and we'll prioritize resolution.</p>
      </div>
    </div>
  );
}
