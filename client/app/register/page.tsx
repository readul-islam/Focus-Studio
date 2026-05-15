'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePost } from '@/hooks/usePost';
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

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

const validateName = (v: string) => {
  if (!v) return 'Name is required';
  if (!/^[A-Za-z\s'-]{2,}$/.test(v)) return 'Please enter a valid name';
};

const validateEmail = (v: string) => {
  if (!v) return 'Email is required';
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return 'Please enter a valid email';
};

const validatePassword = (v: string) => {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Must be at least 8 characters';
  if (!/[A-Z]/.test(v)) return 'Must contain an uppercase letter';
  if (!/[a-z]/.test(v)) return 'Must contain a lowercase letter';
  if (!/\d/.test(v)) return 'Must contain a number';
  if (!/[@$!%*?&]/.test(v)) return 'Must contain a special character (@$!%*?&)';
};

const validateConfirm = (v: string, pw: string) => {
  if (!v) return 'Please confirm your password';
  if (v !== pw) return 'Passwords do not match';
};

const validateAll = (d: FormData): FormErrors => ({
  name: validateName(d.name),
  email: validateEmail(d.email),
  password: validatePassword(d.password),
  confirmPassword: validateConfirm(d.confirmPassword, d.password),
});

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

const strengthLabel = (s: number) => {
  if (s <= 1) return { label: 'Weak', color: 'bg-red-400' };
  if (s <= 3) return { label: 'Fair', color: 'bg-amber-400' };
  if (s === 4) return { label: 'Good', color: 'bg-blue-400' };
  return { label: 'Strong', color: 'bg-emerald-400' };
};

export default function Register() {
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
  
        const msg = data?.message || data?.detail || 'Registration failed. Please try again.';
        setErrors(prev => ({ ...prev, form: msg }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = passwordStrength(formData.password);
  const { label: strengthText, color: strengthColor } = strengthLabel(pwStrength);

  const features = [
    'Project & task management',
    'Client communication hub',
    'Finance & invoicing',
    'AI-powered inbox',
  ];

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
          <div className="flex items-center gap-2.5 mb-10">
            <Image src="/brand/techstyles-t-logo.png" alt="TechStyles" width={32} height={32} className="object-contain" />
            <span className="text-base font-semibold text-gray-900 tracking-tight">TechStyles</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Create your account</h1>
            <p className="text-sm text-gray-500">Start managing your design studio today</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Jane Smith"
                  className={inputClass('name')}
                />
              </div>
              {errors.name && touched.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@company.com"
                  className={inputClass('email')}
                />
              </div>
              {errors.email && touched.email && <p className="text-xs text-red-600 mt-1.5">{errors.email.charAt(0).toUpperCase() + errors.email.slice(1)}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Min. 8 characters"
                  className={`${inputClass('password')} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthColor : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strengthText}</p>
                </div>
              )}
              {errors.password && touched.password && <p className="text-xs text-red-600 mt-1.5">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Repeat your password"
                  className={`${inputClass('confirmPassword')} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-xs text-red-600 mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Form-level error */}
            {errors.form && (
              <p className="text-xs capitalize text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">{errors.form}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !isValid()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-col justify-center w-[52%] bg-[#1a2e2a] px-14 py-10 relative overflow-hidden gap-12">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium mb-16">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now in early access
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            The operating system<br />for interior designers
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Manage projects, clients, finances, and team communication — all in one place.
          </p>

          <ul className="mt-10 space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            &ldquo;TechStyles has completely changed how we run projects. Our team spends less time on admin and more time designing.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
              S
            </div>
            <div>
              <p className="text-white text-xs font-medium">Sarah Mitchell</p>
              <p className="text-white/50 text-xs">Principal Designer, Studio M</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
