import React from 'react';
import Link from 'next/link';
import { ExternalLink, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { IntegrationCard } from './IntegrationCard';
import { useTranslations } from 'next-intl';

type Props = {
  isConfigured: boolean;
  isLoading: boolean;
};

const ZapierIntegration = ({ isConfigured, isLoading }: Props) => {
  const t = useTranslations('settingsIntegrationsPage.zapier');

  return (
    <IntegrationCard
      icon={<Zap className="h-4 w-4 text-amber-500" />}
      title={t('title')}
      description={t('description')}
      isLoading={isLoading}
      status={isConfigured ? 'configured' : null}
      footer={
        <Button size="sm" asChild>
          <Link href="/settings/studio/api">
            {isConfigured ? t('manageApiWebhooks') : t('setupApiWebhooks')}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      }
    />
  );
};

export default ZapierIntegration;
