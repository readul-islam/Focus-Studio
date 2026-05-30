'use client';

import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { usePost } from '@/hooks/usePost';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const passwordStrength = (pw: string) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[@$!%*?&]/.test(pw)) score++;
  return score;
};

export default function Register() {
  const t = useTranslations('auth.register');
  const tv = useTranslations('auth.register.validation');
  const ts = useTranslations('auth.register.strength');

  const validateName = (v: string) => {
    if (!v) return tv('nameRequired');
    if (!/^[A-Za-z\s'-]{2,}$/.test(v)) return tv('nameInvalid');
  };

  const validateEmail = (v: string) => {
    if (!v) return tv('emailRequired');
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return tv('emailInvalid');
  };

  const validatePassword = (v: string) => {
    if (!v) return tv('passwordRequired');
    if (v.length < 8) return tv('passwordMinLength');
    if (!/[A-Z]/.test(v)) return tv('passwordUppercase');
    if (!/[a-z]/.test(v)) return tv('passwordLowercase');
    if (!/\d/.test(v)) return tv('passwordNumber');
    if (!/[@$!%*?&]/.test(v)) return tv('passwordSpecial');
  };

  const validateConfirm = (v: string, pw: string) => {
    if (!v) return tv('confirmRequired');
    if (v !== pw) return tv('confirmMismatch');
  };

  const validateAll = (d: FormData): FormErrors => ({
    name: validateName(d.name),
    email: validateEmail(d.email),
    password: validatePassword(d.password),
    confirmPassword: validateConfirm(d.confirmPassword, d.password),
  });

  const strengthLabel = (s: number) => {
    if (s <= 1) return { label: ts('weak'), color: 'bg-red-400' };
    if (s <= 3) return { label: ts('fair'), color: 'bg-amber-400' };
    if (s === 4) return { label: ts('good'), color: 'bg-blue-400' };
    return { label: ts('strong'), color: 'bg-emerald-400' };
  };
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { mutateAsync } = usePost();

  const handleChange = (field: keyof FormData, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (touched[field]) {
      setErrors(validateAll(next));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validateAll(formData));
  };

  const isValid = () => {
    const e = validateAll(formData);
    return !e.name && !e.email && !e.password && !e.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const errs = validateAll(formData);
    setErrors(errs);
    if (errs.name || errs.email || errs.password || errs.confirmPassword) return;

    setIsLoading(true);
    try {
      await mutateAsync({
        url: '/user/register/',
        data: { name: formData.name, email: formData.email, password: formData.password },
      });
      router.push('/verify-otp');
    } catch (error: any) {
      const data = error.response?.data;
      const emailError = Array.isArray(data?.email) ? data.email[0] : undefined;
      if (emailError) {
        setErrors(prev => ({ ...prev, email: emailError }));
        setTouched(prev => ({ ...prev, email: true }));
      } else {
  
        const msg = data?.message || data?.detail || t('errors.registrationFailed');
        setErrors(prev => ({ ...prev, form: msg }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = passwordStrength(formData.password);
  const { label: strengthText, color: strengthColor } = strengthLabel(pwStrength);

  const inputClass = (field: keyof FormData) =>
    `w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
    }`;

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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">{t('title')}</h1>
            <p className="text-sm text-gray-500">
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder={t('fullNamePlaceholder')}
                  className={inputClass("name")}
                />
              </div>
              {errors.name && touched.name && (
                <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder={t('emailPlaceholder')}
                  className={inputClass("email")}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.email.charAt(0).toUpperCase() + errors.email.slice(1)}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder={t('passwordPlaceholder')}
                  className={`${inputClass("password")} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Strength meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthColor : "bg-gray-100"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strengthText}</p>
                </div>
              )}
              {errors.password && touched.password && (
                <p className="text-xs text-red-600 mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={`${inputClass("confirmPassword")} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Form-level error */}
            {errors.form && (
              <p className="text-xs capitalize text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                {errors.form}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !isValid()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('creatingAccount')}
                </>
              ) : (
                <>
                  {t('createAccount')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('alreadyHaveAccount')}{" "}
            <Link
              href="/login"
              className="font-medium text-gray-900 hover:underline"
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>

      <AuthBrandPanel />
    </div>
  );
}
