'use client';

import { Section } from '@/components/settings/section';
import { PermissionGuard } from '@/components/PermissionGuard';
import XeroIntegration from '@/components/settings/XeroIntegration';
import GmailIntegration from '@/components/settings/GmailIntegration';
import GoogleCalendarIntegration from '@/components/settings/GoogleCalendarIntegration';
import useFetch from '@/hooks/useFetch';
import { Puzzle } from 'lucide-react';

function IntegrationsPageContent() {
  const { data: integrations, isLoading: integrationsLoading ,refetch } = useFetch('user/integration-status/');

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

          {/* Placeholder */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-stone-50 p-8 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-stone-100">
              <Puzzle className="h-4 w-4 text-stone-400" />
            </div>
            <p className="text-xs font-medium text-stone-500">More integrations coming soon</p>
            <p className="mt-1 text-xs text-stone-400">QuickBooks, Notion, Zapier and more.</p>
          </div>
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
