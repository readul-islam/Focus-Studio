import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PricingContent } from '@/components/pricing/pricing-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricingPage');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function PricingPage() {
  return <PricingContent />;
}
