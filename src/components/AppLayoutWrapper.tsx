'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Panels that have their own dedicated sidebar and top panel header
  const isDashboardPanel =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/creator-studio') ||
    pathname.startsWith('/dashboard') ||
    pathname === '/chat';

  if (isDashboardPanel) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

