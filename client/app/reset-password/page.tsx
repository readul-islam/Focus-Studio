'use client';

import { postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const STRENGTH_CHECK_KEYS = ['length', 'uppercase', 'lowercase', 'number', 'special'] as const;
const STRENGTH_TESTS: Record<(typeof STRENGTH_CHECK_KEYS)[number], (p: string) => boolean> = {
  length: (p) => p.length >= 8,
  uppercase: (p) => /[A-Z]/.test(p),
  lowercase: (p) => /[a-z]/.test(p),
  number: (p) => /\d/.test(p),
  special: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
};

function ResetPasswordContent() {
  const t = useTranslations('auth.resetPassword');
  const tv = useTranslations('auth.resetPassword.validation');
  const ts = useTranslations('auth.resetPassword.strengthChecks');
  const tf = useTranslations('auth.resetPassword.features');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidSession(false);
      setIsCheckingSession(false);
      return;
    }
    postData({ url: '/user/validate-reset-token/', data: { token } })
      .then(() => setIsValidSession(true))
      .catch(() => setIsValidSession(false))
      .finally(() => setIsCheckingSession(false));
  }, [token]);

  const strength = STRENGTH_CHECK_KEYS.map(key => ({
    key,
    label: ts(key),
    passed: STRENGTH_TESTS[key](newPassword),
  }));
  const isPasswordStrong = strength.every(c => c.passed);

  const validate = () => {
    const e: typeof errors = {};
    if (!newPassword) e.newPassword = tv('passwordRequired');
    else if (!isPasswordStrong) e.newPassword = tv('passwordRequirements');
    if (!confirmPassword) e.confirmPassword = tv('confirmRequired');
    else if (newPassword !== confirmPassword) e.confirmPassword = tv('confirmMismatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await postData({ url: '/user/reset-password/', data: { token, new_password: newPassword } });
      toast.success(t('toasts.success'));
      router.push('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('toasts.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    tf('projectManagement'),
    tf('clientHub'),
    tf('finance'),
    tf('aiInbox'),
  ];

  const panelContent = (
    <div className="hidden lg:flex flex-col justify-center w-[52%] bg-[#1a2e2a] px-14 py-10 relative overflow-hidden gap-12">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium mb-16">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t('brand.earlyAccess')}
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight mb-5">
          {t('brand.titleLine1')}
          <br />
          {t('brand.titleLine2')}
        </h2>
        <p className="text-white/60 text-base leading-relaxed max-w-sm">
          {t('brand.subtitle')}
        </p>
        <ul className="mt-10 space-y-3">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 text-sm text-white/80"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative z-10 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl py-3 px-4">
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          &ldquo; Focuspilot has completely changed how we run projects. Our
          team spends less time on admin and more time designing. &rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
            S
          </div>
          <div>
            <p className="text-white text-xs font-medium">Roxi Zemaan</p>
            <p className="text-white/50 text-xs">Souq Studio</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">{t('verifying')}</p>
          </div>
        </div>
        {panelContent}
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
          <div className="w-full max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-10">
              <Image
                src="/brand/Logo.png"
                alt="Focuspilot"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-base font-semibold text-gray-900 tracking-tight">
              Focuspilot
              </span>
            </div>
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                  {t('invalidTitle')}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('invalidSubtitle')}
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                {t('invalidHelp')}
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t('backToSignIn')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {panelContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white overflow-y-auto">
        <div className="w-full max-w-sm mx-auto py-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Image
              src="/brand/Logo.png"
              alt="Focuspilot"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-base font-semibold text-gray-900 tracking-tight">
            Focuspilot
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((v) => ({ ...v, newPassword: undefined }));
                  }}
                  placeholder={t('newPasswordPlaceholder')}
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                    ${
                      errors.newPassword
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Strength checklist */}
            {newPassword && (
              <div className="mb-4 space-y-1.5">
                {strength.map((c) => (
                  <div key={c.key} className="flex items-center gap-2">
                    {c.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${c.passed ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((v) => ({ ...v, confirmPassword: undefined }));
                  }}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                    ${
                      errors.confirmPassword
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('updating')}
                </>
              ) : (
                <>
                  {t('updatePassword')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('rememberPassword')}{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-gray-900 hover:underline"
            >
              {t('signIn')}
            </button>
          </p>
        </div>
      </div>

      {/* Right — Brand panel */}
      {panelContent}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
