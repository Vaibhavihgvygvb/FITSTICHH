import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <Link href="/" className="text-xs text-neutral-400 hover:text-black uppercase tracking-widest">← Back to store</Link>
      <h1 className="font-display font-black text-4xl tracking-tight mt-8 mb-8">Terms of Service</h1>
      <div className="prose prose-neutral max-w-none text-sm leading-relaxed space-y-4">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <h2 className="text-xl font-bold mt-8">1. General</h2>
        <p>By using FITSTICH, you agree to these terms. If you do not agree, please do not use our services.</p>
        <h2 className="text-xl font-bold mt-8">2. Products & Pricing</h2>
        <p>All prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to modify prices at any time. Product images are for illustration; actual products may vary slightly.</p>
        <h2 className="text-xl font-bold mt-8">3. Orders</h2>
        <p>We reserve the right to cancel or refuse any order. In case of cancellation after payment, a full refund will be issued within 5-7 business days.</p>
        <h2 className="text-xl font-bold mt-8">4. Intellectual Property</h2>
        <p>All content on this site — including logos, designs, text, and images — is the property of FITSTICH and may not be used without permission.</p>
        <h2 className="text-xl font-bold mt-8">5. Limitation of Liability</h2>
        <p>FITSTICH shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        <h2 className="text-xl font-bold mt-8">6. Contact</h2>
        <p>For questions about these terms, contact <span className="font-medium">support@fitstich.com</span>.</p>
      </div>
    </div>
  );
}
