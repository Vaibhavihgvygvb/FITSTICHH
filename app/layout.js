import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'FITSTICH — Wear Confidence. Premium Everyday Essentials.',
  description: 'FITSTICH — Premium in-house manufactured clothing. Oversized tees, joggers, pyjamas. Minimal. Modern. Luxury.',
  keywords: ['fitstich', 'premium clothing', 'oversized t-shirt', 'joggers', 'pyjamas', 'streetwear'],
  openGraph: {
    title: 'FITSTICH — Wear Confidence',
    description: 'Premium everyday essentials. Manufactured in-house.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-black">
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
