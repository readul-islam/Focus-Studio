'use client';

import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, User, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';

function AcceptInvitationContent() {
  const t = useTranslations('auth.acceptInvitation');
  const tv = useTranslations('auth.register.validation');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; password?: string; confirmPassword?: string }>({});

  const validateNewUser = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = tv('nameRequired');
    if (!password) next.password = tv('passwordRequired');
    else if (password.length < 8) next.password = tv('passwordMinLength');
    if (!confirmPassword) next.confirmPassword = tv('confirmRequired');
    else if (password !== confirmPassword) next.confirmPassword = tv('confirmMismatch');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAccept = async (e: React.FormEvent, existingAccount = false) => {
    e.preventDefault();
    if (!token) return;

    if (!existingAccount && !validateNewUser()) return;

    setIsLoading(true);
    try {
      const payload: { token: string; name?: string; password?: string } = { token };
      if (!existingAccount) {
        payload.name = name.trim();
        payload.password = password;
      }

      await postData({ url: '/user/accept-invitation/', data: payload });
      toast.success(t('toasts.success'));
      router.push('/home/dashboard');
    } catch (error: any) {
      const data = error?.response?.data;
      const message =
        data?.token?.[0] ||
        data?.name?.[0] ||
        data?.password?.[0] ||
        data?.error ||
        data?.detail ||
        t('toasts.failed');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('invalidTitle')}</h1>
          <p className="text-sm text-gray-600 mb-6">{t('invalidSubtitle')}</p>
          <Link href="/login" className="text-sm font-medium text-gray-900 hover:underline">
            {t('backToSignIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AuthBrandPanel />
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Image src="/logo.svg" alt="Focuspilot" width={140} height={32} className="h-8 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-sm text-gray-600 mb-8">{t('subtitle')}</p>

          <form onSubmit={(e) => handleAccept(e, false)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? t('hidePassword') : t('showPassword')}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('joining')}
                </>
              ) : (
                <>
                  {t('joinStudio')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">{t('existingAccountHint')}</p>
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleAccept(e, true)}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {isLoading ? t('joining') : t('acceptExisting')}
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            {t('alreadySignedIn')}{' '}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
