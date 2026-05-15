import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/Providers';
import GoeyToasterClient from '@/components/GoeyToasterClient';
import UserbackWidget from '@/components/userBack/UserbackWidget';
import { RootLayoutWrapper } from '@/components/layout/RootLayoutWrapper';
import { AppUpdateChecker } from '@/components/app-update-checker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Focuspilot",
  description: "Focuspilot Web Application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white min-h-screen text-gray-900 antialiased`}>
        <UserbackWidget />
        <AppUpdateChecker />
        <GoeyToasterClient />
        <Providers>
          <RootLayoutWrapper>{children}</RootLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
