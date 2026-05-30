import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { Providers } from '@/lib/Providers';
import GoeyToasterClient from '@/components/GoeyToasterClient';
import UserbackWidget from '@/components/userBack/UserbackWidget';
import { RootLayoutWrapper } from '@/components/layout/RootLayoutWrapper';
import { AppUpdateChecker } from '@/components/app-update-checker';
import { ThemeScript } from '@/components/theme-script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Focuspilot",
  description: "Focuspilot Web Application",
};

function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar-AE' ? 'rtl' : 'ltr';
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={getTextDirection(locale)} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <UserbackWidget />
        <AppUpdateChecker />
        <GoeyToasterClient />
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <RootLayoutWrapper>{children}</RootLayoutWrapper>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
