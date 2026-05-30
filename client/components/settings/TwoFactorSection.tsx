'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { fetchData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { Copy, Loader2, Shield, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

type TwoFactorStatus = {
  is_enabled: boolean;
  enabled_at: string | null;
  backup_codes_remaining: number;
};

type SetupPayload = {
  provisioning_uri: string;
  secret: string;
};

export function TwoFactorSection() {
  const t = useTranslations('settingsTwoFactorSection');
  const tc = useTranslations('common');
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'idle' | 'setup' | 'confirm' | 'backup'>('idle');
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = (await fetchData('/user/2fa/status/')) as TwoFactorStatus;
      setStatus(data);
    } catch {
      setStatus({ is_enabled: false, enabled_at: null, backup_codes_remaining: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const startSetup = async () => {
    setIsBusy(true);
    try {
      const data = (await postData({ url: '/user/2fa/setup/', data: {} })) as SetupPayload;
      setSetup(data);
      setConfirmCode('');
      setStep('setup');
    } catch {
      toast.error(t('toasts.setupFailed'));
    } finally {
      setIsBusy(false);
    }
  };

  const confirmSetup = async () => {
    if (confirmCode.length !== 6) return;
    setIsBusy(true);
    try {
      const res = (await postData({
        url: '/user/2fa/confirm/',
        data: { code: confirmCode },
      })) as { backup_codes: string[] };
      setBackupCodes(res.backup_codes || []);
      setStep('backup');
      await loadStatus();
      toast.success(t('toasts.enabled'));
    } catch {
      toast.error(t('toasts.invalidCode'));
    } finally {
      setIsBusy(false);
    }
  };

  const disable2FA = async () => {
    if (!disablePassword || disableCode.trim().length < 6) {
      toast.error(t('toasts.disableCredentialsRequired'));
      return;
    }
    setIsBusy(true);
    try {
      await postData({
        url: '/user/2fa/disable/',
        data: { password: disablePassword, code: disableCode },
      });
      setDisablePassword('');
      setDisableCode('');
      setStep('idle');
      setSetup(null);
      await loadStatus();
      toast.success(t('toasts.disabled'));
    } catch {
      toast.error(t('toasts.disableFailed'));
    } finally {
      setIsBusy(false);
    }
  };

  const copyBackupCodes = () => {
    void navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success(t('toasts.backupCopied'));
  };

  if (loading) {
    return (
      <Section title={t('title')} description={t('descriptionIdle')}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('loading')}
        </div>
      </Section>
    );
  }

  if (step === 'backup') {
    return (
      <Section title={t('backupTitle')} description={t('backupDescription')}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
          <p className="text-sm text-amber-900 font-medium">{t('backupWarning')}</p>
          <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map(code => (
              <li key={code} className="bg-white rounded px-2 py-1 border border-amber-100">
                {code}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyBackupCodes}>
              <Copy className="w-4 h-4 mr-2" /> {t('copyAll')}
            </Button>
            <Button type="button" size="sm" onClick={() => setStep('idle')}>
              {t('done')}
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  if (step === 'setup' || step === 'confirm') {
    return (
      <Section title={t('setupTitle')} description={t('setupDescription')}>
        <div className="space-y-6 max-w-md">
          {setup && (
            <div className="flex flex-col items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white">
              <QRCodeSVG value={setup.provisioning_uri} size={180} level="M" />
              <div className="text-center w-full">
                <p className="text-xs text-gray-500 mb-1">{t('manualKeyHint')}</p>
                <code className="text-xs break-all bg-gray-100 px-2 py-1 rounded">{setup.secret}</code>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t('codeLabel')}</Label>
            <InputOTP maxLength={6} value={confirmCode} onChange={setConfirmCode}>
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="w-10 h-11" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => { setStep('idle'); setSetup(null); }}>
              {tc('cancel')}
            </Button>
            <Button
              type="button"
              disabled={confirmCode.length !== 6 || isBusy}
              onClick={() => void confirmSetup()}
            >
              {isBusy ? t('verifying') : t('enable2fa')}
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  if (status?.is_enabled) {
    return (
      <Section title={t('title')} description={t('descriptionEnabled')}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-900">{t('enabledTitle')}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {t('backupCodesRemaining', { count: status.backup_codes_remaining })}
              </p>
            </div>
          </div>
          <div className="space-y-3 max-w-md border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-900">{t('disableTitle')}</p>
            <div className="space-y-2">
              <Label htmlFor="disable-password">{t('currentPassword')}</Label>
              <Input
                id="disable-password"
                type="password"
                value={disablePassword}
                onChange={e => setDisablePassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-code">{t('authenticatorOrBackup')}</Label>
              <Input
                id="disable-code"
                value={disableCode}
                onChange={e => setDisableCode(e.target.value)}
                placeholder={t('codePlaceholder')}
                className="font-mono"
              />
            </div>
            <Button type="button" variant="destructive" disabled={isBusy} onClick={() => void disable2FA()}>
              {isBusy ? t('disabling') : t('disable2fa')}
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title={t('title')} description={t('descriptionIdle')}>
      <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
        <Shield className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <p className="text-sm text-gray-600">
            {t('idleHint')}
          </p>
          <Button type="button" onClick={() => void startSetup()} disabled={isBusy}>
            {isBusy ? t('starting') : t('enable2fa')}
          </Button>
        </div>
      </div>
    </Section>
  );
}
