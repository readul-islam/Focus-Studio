'use client';

import { Section } from '@/components/settings/section';
import { PermissionGuard } from '@/components/PermissionGuard';
import { IntegrationStatusProvider, useIntegrationStatusContext } from '@/components/settings/integration-status-context';
import XeroIntegration from '@/components/settings/XeroIntegration';
import QuickBooksIntegration from '@/components/settings/QuickBooksIntegration';
import GmailIntegration from '@/components/settings/GmailIntegration';
import GoogleCalendarIntegration from '@/components/settings/GoogleCalendarIntegration';
import NotionIntegration from '@/components/settings/NotionIntegration';
import ZapierIntegration from '@/components/settings/ZapierIntegration';
import { useTranslations } from 'next-intl';

function IntegrationsPageContent() {
  const t = useTranslations('settingsIntegrationsPage');
  const { status, isLoading, isFetching } = useIntegrationStatusContext();

  const pageLoading = isLoading && !status.gmail_connected && !status.notion_connected;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600 mt-0.5">{t('description')}</p>
      </div>

      <Section title={t('appsTitle')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <XeroIntegration
            isLoading={pageLoading}
            isConnected={!!status.xero_connected}
            isSyncing={isFetching}
          />

          <QuickBooksIntegration
            isLoading={pageLoading}
            isConnected={!!status.quickbooks_connected}
            isSyncing={isFetching}
          />

          <GmailIntegration
            isLoading={pageLoading}
            isConnected={!!status.gmail_connected}
            isSyncing={isFetching}
          />

          <GoogleCalendarIntegration
            isLoading={pageLoading}
            isConnected={!!status.calendar_connected}
            gmailConnected={!!status.gmail_connected}
            isSyncing={isFetching}
          />

          <NotionIntegration
            isLoading={pageLoading}
            isConnected={!!status.notion_connected}
            isSyncing={isFetching}
          />

          <ZapierIntegration
            isLoading={pageLoading}
            isConfigured={!!status.zapier_configured}
          />
        </div>
      </Section>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <IntegrationStatusProvider>
        <IntegrationsPageContent />
      </IntegrationStatusProvider>
    </PermissionGuard>
  );
}
