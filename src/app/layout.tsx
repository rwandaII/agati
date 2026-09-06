import type { Metadata } from 'next';
import { Montserrat, Lora } from 'next/font/google';
import './globals.css';
import { SITE } from '@/config/brand';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display-loaded',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.mission,
  openGraph: {
    siteName: SITE.name,
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`}>
      <body>
        <a className="skip-link" href="#page-content">
          Skip to the page
        </a>
        {children}
      </body>
    </html>
  );
}
