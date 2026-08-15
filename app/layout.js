import { Archivo, Spline_Sans_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Providers from './providers';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'FITSTICH — Cut from stated cloth',
    template: '%s — FITSTICH',
  },
  description:
    'FITSTICH manufactures its own knitwear in India. Every piece carries its weight in GSM, its yarn, and its fit — printed on the pattern, not buried in a caption.',
  keywords: ['fitstich', 'oversized tee', 'joggers', 'pyjamas', 'combed cotton', 'GSM', 'made in India'],
  openGraph: {
    title: 'FITSTICH — Cut from stated cloth',
    description: 'In-house manufactured knitwear. Stated weight, stated yarn, stated fit.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0b0b0b',
  width: 'device-width',
  initialScale: 1,
};

/**
 * The direction contract. Emitted as a real HTML comment so it survives the
 * production build and can be audited against the render.
 */
const DIRECTION_CONTRACT = `<!-- impeccable:direction 8faa4d7e
THESIS: The site is the pattern the garment is cut from — FITSTICH makes its own clothes, so the
blueprint is the proof. It refuses the D2C default of a full-bleed model hero over a product grid.
OWN-WORLD: Ink on paper and chalk on cloth. A ruled drafting sheet at fixed 48px pitch, hairline
rules, punched notch corners, grain-line arrows, engineering-gothic display (Archivo), every
measurement in mono. No radius anywhere except the punched notch.
STORY: The visitor sees a garment drawn before it exists, folds it together in 3D, reads its weight
and yarn as drafting annotation, and buys the piece off the sheet.
FIRST VIEWPORT: Full-bleed ruled sheet. Four pattern pieces of one tee in white with black cut
lines, lifting off the sheet and folding into a garment in real WebGL, then settling flat. Wordmark
top-left on the rule; headline "Cut from stated cloth"; spec title-block lower-left; grain-line
arrow pointing right to the primary action, SHOP THE SHEET.
FORM: Pattern drafting sheet — candidate 4 of 7 on the grounded list; seed key 8faa4d7e.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <body className="antialiased">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: false,
            classNames: {
              toast:
                'rounded-none border-[1.5px] border-ink bg-paper text-ink font-mono text-[11px] uppercase tracking-[0.14em]',
            },
          }}
        />
      </body>
    </html>
  );
}
