import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingPage } from '@/components/landing/landing-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landingPage');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  };
}

export default function HomePage() {
  return <LandingPage />;
}
