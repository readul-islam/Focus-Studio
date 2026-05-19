'use client';

import { Section } from '@/components/settings/section';
import { PermissionGuard } from '@/components/PermissionGuard';
import XeroIntegration from '@/components/settings/XeroIntegration';
import GmailIntegration from '@/components/settings/GmailIntegration';
import GoogleCalendarIntegration from '@/components/settings/GoogleCalendarIntegration';
import NotionIntegration from '@/components/settings/NotionIntegration';
import ZapierIntegration from '@/components/settings/ZapierIntegration';
import useFetch from '@/hooks/useFetch';

function IntegrationsPageContent() {
  const { data: integrations, isLoading: integrationsLoading, refetch } = useFetch(
    'user/integration-status/'
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-600 mt-0.5">Connect Focuspilot Studio to your tools.</p>
      </div>

      <Section title="Apps">
        <div className="grid gap-4 sm:grid-cols-2">
          <XeroIntegration
            isLoading={integrationsLoading}
            isConnected={integrations?.xero_connected}
            refetch={refetch}
          />

          <GmailIntegration
            isLoading={integrationsLoading}
            isConnected={integrations?.gmail_connected}
          />

          <GoogleCalendarIntegration
            isLoading={integrationsLoading}
            isConnected={integrations?.calendar_connected}
            gmailConnected={integrations?.gmail_connected}
          />

          <NotionIntegration
            isLoading={integrationsLoading}
            isConnected={integrations?.notion_connected}
          />

          <ZapierIntegration
            isLoading={integrationsLoading}
            isConfigured={integrations?.zapier_configured}
          />
        </div>
      </Section>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <IntegrationsPageContent />
    </PermissionGuard>
  );
}
