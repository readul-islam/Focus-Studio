'use client';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { fetchData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { ArrowLeft, CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const RESEND_COOLDOWN = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length <= 2 ? local : local[0] + '•'.repeat(local.length - 2) + local[local.length - 1];
  return `${visible}@${domain}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'loading' | 'entry' | 'submitting' | 'success' | 'no-session'>('loading');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Fetch email from backend cookie session
  useEffect(() => {
    fetchData('/user/otp-session/')
      .then((data: any) => {
        if (data?.email) {
          setEmail(data.email);
          setStage('entry');
        } else {
          setStage('no-session');
        }
      })
      .catch(() => setStage('no-session'));
  }, []);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const submitOtp = useCallback(async (value: string) => {
    if (value.length !== 6 || stage === 'submitting') return;
    setStage('submitting');
    setError('');
    try {
      await postData({ url: '/user/verify-otp/', data: { otp: value } });
      setStage('success');
      setTimeout(() => router.push('/onboarding'), 1200);
    } catch (err: any) {
      const msg =
        err?.message?.includes('expired')
          ? 'OTP expired. Request a new one.'
          : err?.message?.includes('invalid') || err?.message?.includes('400')
          ? 'Incorrect code. Please try again.'
          : 'Verification failed. Try again.';
      setError(msg);
      setOtp('');
      setStage('entry');
    }
  }, [stage, router]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && stage === 'entry') {
      submitOtp(otp);
    }
  }, [otp, stage, submitOtp]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      await postData({ url: '/user/resend-otp/', data: {} });
      setResendCooldown(RESEND_COOLDOWN);
      setOtp('');
      toast.success('New code sent to your email');
    } catch {
      toast.error('Failed to resend. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await postData({ url: '/user/logout/', data: {} });
    } catch {}
    router.push('/register');
  };

  // Loading
  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // No session — pending_email cookie missing or expired
  if (stage === 'no-session') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Session expired</h1>
          <p className="text-sm text-gray-500 mb-6">
            Your verification session has expired or is invalid. Please register again.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to registration
          </button>
        </div>
      </div>
    );
  }

  // Success
  if (stage === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Email verified</h1>
          <p className="text-sm text-gray-500">Taking you to your dashboard…</p>
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  // OTP entry (entry | submitting)
  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white overflow-y-auto">
        <div className="w-full max-w-sm mx-auto py-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
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

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              Check your email
            </h1>
            <p className="text-sm text-gray-500">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-gray-800">
                {maskEmail(email)}
              </span>
            </p>
          </div>

          {/* OTP input */}
          <div className="mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={stage === "submitting"}
              autoFocus
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-12 h-12 text-base rounded-lg border border-gray-200 first:rounded-l-lg first:border-l last:rounded-r-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          {/* Submit button (fallback for users who don't auto-trigger) */}
          <button
            onClick={() => submitOtp(otp)}
            disabled={otp.length !== 6 || stage === "submitting"}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {stage === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify email"
            )}
          </button>

          {/* Resend */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Didn't receive a code?</p>
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend in{" "}
                <span className="font-medium text-gray-600 tabular-nums">
                  0:{String(resendCooldown).padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:underline disabled:opacity-50"
              >
                {isResending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Resend code
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="pt-5 border-t border-gray-100 text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Use a different account
            </button>
          </div>
        </div>
      </div>

      {/* Right — brand panel (matches register page) */}
      <div className="hidden lg:flex flex-col justify-center w-[52%] bg-[#1a2e2a] px-14 py-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            One step away
            <br />
            from your studio
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Confirm your email to unlock all features and get started managing
            your design projects.
          </p>
        </div>
      </div>
    </div>
  );
}
