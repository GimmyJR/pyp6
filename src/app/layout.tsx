import { cn } from '@/lib/utils';
import Providers from '@/providers/provider';
import type { Metadata } from 'next';
import { Caveat, Space_Grotesk } from 'next/font/google';
import 'swiper/css';
import 'swiper/css/navigation';

import './globals.css';

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500'],
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Social Media',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <head>
        <link rel='preload' as='image' href='/1.png' fetchPriority='high' />
      </head>
      <body
        className={cn(
          space_grotesk.variable,
          space_grotesk.className,
          caveat.variable,
          'antialiased'
        )}
      >
        <Providers>
          <div className='bg-gradient-image fixed inset-0'>
            <div className='relative h-screen overflow-y-auto'>{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
