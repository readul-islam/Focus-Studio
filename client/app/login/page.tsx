'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/useLogin';
import { postData } from '@/lib/Api';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    login(
      { email, password },
      {
        onSuccess: () => {
          const next = searchParams.get('next');
          router.push(next && next.startsWith('/') ? next : '/home/dashboard');
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

  const features = [
    'Project & task management',
    'Client communication hub',
    'Finance & invoicing',
    'AI-powered inbox',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Image
              src="/brand/Logo.png"
              alt="TechStyles"
              width={44}
              height={44}
              className="object-contain"
            />
            <span className="text-base font-semibold text-gray-900 tracking-tight">
              Focuspilot
            </span>
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

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-col justify-center w-[52%] bg-[#1a2e2a] px-14 py-10 relative overflow-hidden gap-12">
        {/* Background texture */}
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
            Now in early access
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            The operating system
            <br />
            for interior designers
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Manage projects, clients, finances, and team communication — all in
            one place.
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

        {/* Testimonial */}
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
