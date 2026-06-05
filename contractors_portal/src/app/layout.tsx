import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './providers';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  const app = messages.app as { contractorPortal?: string; pageTitleSuffix?: string; metaDescription?: string };

  return {
    title: `${app?.contractorPortal ?? 'Contractor Portal'} | ${app?.pageTitleSuffix ?? 'Focuspilot'}`,
    description: app?.metaDescription ?? 'Focuspilot contractor portal',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
