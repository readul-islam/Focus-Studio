'use client';

import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { useLogin } from '@/hooks/useLogin';
import { postData } from '@/lib/Api';
import { googleAuthErrorMessage, startGoogleAuth } from '@/lib/google-auth';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = searchParams.get('error');

  const { mutate: login, isPending } = useLogin();

  /** Auth-step paths must not be used as post-login destination unless 2FA is required. */
  const resolvePostLoginPath = (requires2fa: boolean) => {
    const next = searchParams.get('next');
    const authSteps = ['/verify-2fa', '/verify-otp', '/verify-email'];
    if (requires2fa) {
      const after2fa =
        next && next.startsWith('/') && !authSteps.includes(next) ? next : '/home/dashboard';
      const q =
        after2fa !== '/home/dashboard' ? `?next=${encodeURIComponent(after2fa)}` : '';
      return `/verify-2fa${q}`;
    }
    if (next && next.startsWith('/') && !authSteps.includes(next)) {
      return next;
    }
    return '/home/dashboard';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    login(
      { email, password },
      {
        onSuccess: (data: { requires_2fa?: boolean }) => {
          router.push(resolvePostLoginPath(!!data?.requires_2fa));
        },
        onError: () => {
          setFormError('Invalid email or password. Please try again.');
        },
      }
    );
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError('');
    setIsResetting(true);
    try {
      await postData({ url: '/user/forgot-password/', data: { email } });
      setResetSent(true);
    } catch {
      setResetError('Failed to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Image
              src="/brand/Logo.png"
              alt="Focuspilot"
              width={35}
              height={35}
              className="object-contain"
            />
            <motion.span
              className="relative inline-flex flex-col items-stretch select-none pt-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[1.0625rem] font-semibold tracking-[-0.042em] leading-none text-gray-900">
                Focus
                <span className="font-medium text-gray-500">pilot</span>
              </span>
              <svg
                className="mt-1 h-[5px] w-full shrink-0 text-clay-500/55"
                viewBox="0 0 104 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M2 5.25C22 1.5 42 1.5 52 3.25C62 5 82 5 102 1.75"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </motion.span>
          </div>

          {!isResetMode ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-500">
                  Sign in to your account to continue
                </p>
              </div>

              {googleError ? (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                  {googleAuthErrorMessage(googleError)}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => startGoogleAuth('login', searchParams.get('next'))}
                className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFormError("");
                      }}
                      placeholder="you@company.com"
                      className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                        ${
                          formError
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                        }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                        ${
                          formError
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
                </div>

                {/* Inline error */}
                {formError && (
                  <p className="text-xs text-red-600 mt-1.5 mb-0">
                    {formError}
                  </p>
                )}

                {/* Forgot password */}
                <div className="flex justify-end mt-2 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setFormError("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                  {resetSent ? "Check your inbox" : "Reset password"}
                </h1>
                <p className="text-sm text-gray-500">
                  {resetSent
                    ? "Follow the link in your email to set a new password."
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </div>

              {resetSent ? (
                <div className="flex flex-col gap-5 py-2">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-0.5">
                        Reset link sent
                      </p>
                      <p className="text-sm text-gray-600">
                        We emailed a reset link to{" "}
                        <span className="font-medium text-gray-900">
                          {email}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                    <svg
                      className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      This link expires in{" "}
                      <span className="font-semibold">15 minutes</span>. Check
                      your spam folder if you don&apos;t see it.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsResetMode(false);
                      setResetSent(false);
                      setEmail("");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} noValidate>
                  <div className="mb-5">
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setResetError("");
                        }}
                        placeholder="you@company.com"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                          ${
                            resetError
                              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                          }`}
                      />
                    </div>
                    {resetError && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {resetError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>

                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setResetError("");
                      }}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right — Brand panel (matches landing hero background) */}
      <AuthBrandPanel />
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
