import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartRail from '@/components/site/CartRail';
import { SheetStamp } from '@/components/draft/marks';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="sheet-fine tooth min-h-[70vh]">
        <div className="relative mx-auto max-w-[820px] px-5 py-14 lg:px-10 lg:py-20">
      <SheetStamp className="absolute right-5 top-6 hidden lg:inline-flex">Specification</SheetStamp>
      <h1 className="display mb-10 text-[clamp(2.1rem,6vw,3.2rem)]">Terms of Service</h1>
      <div className="doc">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <h2>1. General</h2>
        <p>By using FITSTICH, you agree to these terms. If you do not agree, please do not use our services.</p>
        <h2>2. Products & Pricing</h2>
        <p>All prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to modify prices at any time. Product images are for illustration; actual products may vary slightly.</p>
        <h2>3. Orders</h2>
        <p>We reserve the right to cancel or refuse any order. In case of cancellation after payment, a full refund will be issued within 5-7 business days.</p>
        <h2>4. Intellectual Property</h2>
        <p>All content on this site — including logos, designs, text, and images — is the property of FITSTICH and may not be used without permission.</p>
        <h2>5. Limitation of Liability</h2>
        <p>FITSTICH shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        <h2>6. Contact</h2>
        <p>For questions about these terms, contact <span className="font-medium">support@fitstich.com</span>.</p>
      </div>
      </div>
      </main>
      <Footer />
      <CartRail />
    </>
  );
}
