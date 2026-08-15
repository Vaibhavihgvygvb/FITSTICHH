import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import { SheetStamp } from '@/components/draft/marks';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="sheet-fine tooth min-h-[70vh]">
        <div className="relative mx-auto max-w-[820px] px-5 py-14 lg:px-10 lg:py-20">
      <SheetStamp className="absolute right-5 top-6 hidden lg:inline-flex">Specification</SheetStamp>
      <h1 className="display mb-10 text-[clamp(2.1rem,6vw,3.2rem)]">Privacy Policy</h1>
      <div className="doc">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide when placing an order: name, email, phone, shipping address, and payment details. We also collect browsing data via cookies for analytics and site improvement.</p>
        <h2>2. How We Use Your Information</h2>
        <p>To process and fulfill orders, send order updates, respond to inquiries, improve our store, and send marketing emails (only with your consent).</p>
        <h2>3. Payment Information</h2>
        <p>We use Razorpay and Stripe for payment processing. We do not store full credit/debit card numbers. Payment data is handled directly by our secure payment partners.</p>
        <h2>4. Data Sharing</h2>
        <p>We share data only with service providers necessary to fulfill orders (shipping carriers, payment processors). We never sell your personal data.</p>
        <h2>5. Your Rights</h2>
        <p>You can request access to, correction of, or deletion of your data at any time by emailing us. You can unsubscribe from marketing emails at any time.</p>
        <h2>6. Contact</h2>
        <p>For privacy-related inquiries, contact us at <span className="font-medium">privacy@fitstich.com</span>.</p>
      </div>
      </div>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
