'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchData, postData } from '@/lib/Api';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length <= 2 ? local : local[0] + '•'.repeat(local.length - 2) + local[local.length - 1];
  return `${visible}@${domain}`;
}

export default function Verify2FAPage() {
  const t = useTranslations('verify2faPage');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'loading' | 'entry' | 'submitting' | 'no-session'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData('/user/2fa-session/')
      .then((data: { email?: string }) => {
        if (data?.email) {
          setEmail(data.email);
          setStage('entry');
        } else {
          setStage('no-session');
        }
      })
      .catch(() => setStage('no-session'));
  }, []);

  const submitCode = useCallback(
    async (value: string) => {
      if (value.length < 6 || stage === 'submitting') return;
      setStage('submitting');
      setError('');
      try {
        await postData({ url: '/user/verify-2fa/', data: { code: value } });
        const next = new URLSearchParams(window.location.search).get('next');
        router.push(next && next.startsWith('/') ? next : '/home/dashboard');
      } catch {
        setError(t('invalidCode'));
        setCode('');
        setStage('entry');
      }
    },
    [router, stage, t],
  );

  useEffect(() => {
    if (code.length === 6 && !code.includes('-') && stage === 'entry') {
      void submitCode(code);
    }
  }, [code, stage, submitCode]);

  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (stage === 'no-session') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <p className="text-gray-600 mb-4">{t('noSession')}</p>
        <Link href="/login" className="text-sm font-medium text-gray-900 underline">
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/Logo.png" alt="Focuspilot" width={40} height={40} className="mb-4" />
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-gray-700" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {t('subtitle')}
            {email ? ` ${t('subtitleFor', { email: maskEmail(email) })}` : ''}.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="twofa-code" className="sr-only">
            {t('codeLabel')}
          </Label>
          <Input
            id="twofa-code"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
            placeholder={t('codePlaceholder')}
            className="text-center text-lg tracking-widest font-mono h-12"
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <p className="text-xs text-gray-500 text-center">{t('backupHint')}</p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={code.length < 6 || stage === 'submitting'}
            onClick={() => void submitCode(code)}
            className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
          >
            {stage === 'submitting' ? t('verifying') : t('continue')}
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
