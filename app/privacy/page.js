import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <Link href="/" className="text-xs text-neutral-400 hover:text-black uppercase tracking-widest">← Back to store</Link>
      <h1 className="font-display font-black text-4xl tracking-tight mt-8 mb-8">Privacy Policy</h1>
      <div className="prose prose-neutral max-w-none text-sm leading-relaxed space-y-4">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <h2 className="text-xl font-bold mt-8">1. Information We Collect</h2>
        <p>We collect information you provide when placing an order: name, email, phone, shipping address, and payment details. We also collect browsing data via cookies for analytics and site improvement.</p>
        <h2 className="text-xl font-bold mt-8">2. How We Use Your Information</h2>
        <p>To process and fulfill orders, send order updates, respond to inquiries, improve our store, and send marketing emails (only with your consent).</p>
        <h2 className="text-xl font-bold mt-8">3. Payment Information</h2>
        <p>We use Razorpay and Stripe for payment processing. We do not store full credit/debit card numbers. Payment data is handled directly by our secure payment partners.</p>
        <h2 className="text-xl font-bold mt-8">4. Data Sharing</h2>
        <p>We share data only with service providers necessary to fulfill orders (shipping carriers, payment processors). We never sell your personal data.</p>
        <h2 className="text-xl font-bold mt-8">5. Your Rights</h2>
        <p>You can request access to, correction of, or deletion of your data at any time by emailing us. You can unsubscribe from marketing emails at any time.</p>
        <h2 className="text-xl font-bold mt-8">6. Contact</h2>
        <p>For privacy-related inquiries, contact us at <span className="font-medium">privacy@fitstich.com</span>.</p>
      </div>
    </div>
  );
}
