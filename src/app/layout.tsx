import type { Metadata } from 'next';
import './globals.css';
import AgeGateModal from '@/components/AgeGateModal';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'The Mirage | Real People. Exclusive Content. Your World.',
  description:
    'The Mirage is a premium creator subscription platform connecting verified creators with subscribers. 85/15 creator revenue split, real-time messaging, and exclusive content.',
  icons: {
    icon: '/assets/the_mirage_logo.png',
    apple: '/assets/the_mirage_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/assets/the_mirage_logo.png" />
        <link rel="stylesheet" href="/output.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#08080a] text-[#f8f9fa] min-h-screen flex flex-col antialiased selection:bg-[#d4af37]/30 selection:text-white bg-black">
        <AgeGateModal />
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
