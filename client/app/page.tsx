import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata: Metadata = {
  title: 'Focuspilot — Operating system for interior design studios',
  description:
    'Unify projects, CRM, finance, and AI-powered inbox for your studio. Fewer tools, clearer margins, calmer delivery.',
  openGraph: {
    title: 'Focuspilot — Operating system for interior design studios',
    description:
      'Unify projects, CRM, finance, and AI-powered inbox for your studio. Fewer tools, clearer margins, calmer delivery.',
    type: 'website',
  },
};

export default function HomePage() {
  return <LandingPage />;
}
