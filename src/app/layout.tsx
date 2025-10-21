import type { Metadata } from 'next';
import { Figtree, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code-pro',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500'],
});

export const metadata: Metadata = {
  title: 'Pegazzo',
  description: 'The management dashboard for Pegazzo',
};

export const viewport = {
  themeColor: '#0a192b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.className} ${figtree.variable} ${sourceCodePro.className} ${sourceCodePro.variable} typo-text`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
