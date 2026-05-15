'use client';

import useUser from '@/hooks/useUser';
import { patchFormData, postData } from '@/lib/Api';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { gooeyToast as toast } from 'goey-toast';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  LayoutList,
  Loader2,
  Mail,
  Palette,
  PenLine,
  Phone,
  Sparkles,
  Upload,
  UserPlus, X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

const TITLE_OPTIONS = [
  { value: 'Studio Owner',       Icon: Briefcase,  desc: 'Running the business' },
  { value: 'Principal Designer', Icon: PenLine,    desc: 'Leading design direction' },
  { value: 'Project Manager',    Icon: LayoutList, desc: 'Managing projects & timelines' },
  { value: 'Associate Designer', Icon: Palette,    desc: 'Designing & delivering work' },
] as const;

type InviteEntry = { email: string; role: 'admin' | 'manager' | 'member' };

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = ['Your Role', 'Studio Setup', 'Branding', 'Invite Team'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-sm mx-auto">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  done
                    ? 'bg-gray-900 text-white'
                    : active
                    ? 'bg-gray-900 text-white ring-4 ring-gray-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-2 mb-4 transition-colors ${done ? 'bg-gray-900' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Role ─────────────────────────────────────────────────────────────

function StepRole({ onNext }: { onNext: (title: string) => void }) {
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useUser();

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await postData({ url: '/user/self/update/', data: { title: selected } });
      onNext(selected);
    } catch {
      toast.error('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          {user?.name ? `Hi ${user.name.split(' ')[0]}, what's your role?` : "What's your role?"}
        </h1>
        <p className="text-sm text-gray-500">We'll tailor your workspace to how you work.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {TITLE_OPTIONS.map(opt => {
          const active = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 transition-colors ${
                active
                  ? 'border-gray-900 bg-gray-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                active ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <opt.Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div>
                <div className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>{opt.value}</div>
                <div className={`text-xs mt-0.5 ${active ? 'text-gray-300' : 'text-gray-400'}`}>{opt.desc}</div>
              </div>
              <AnimatePresence>
                {active && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-gray-900" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected || saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

// ─── Step 2: Studio Setup ─────────────────────────────────────────────────────

function StepStudio({ onNext, onBack }: { onNext: (studioId: number) => void; onBack: () => void }) {
  const [form, setForm] = useState({ name: '', address: '', support_email: '', phone_number: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.support_email.trim()) e.support_email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.support_email)) e.support_email = 'Invalid email';
    if (!form.phone_number.trim()) e.phone_number = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res: any = await postData({ url: '/user/studios/', data: form });
      onNext(res?.id);
    } catch {
      toast.error('Failed to create studio. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    type = 'text',
  ) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          id={id}
          type={type}
          value={form[id]}
          onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors ${
            errors[id] ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'
          }`}
        />
      </div>
      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-lg w-full mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Tell us about your studio.</h1>
        <p className="text-sm text-gray-500">This info appears on proposals, invoices, and client communications.</p>
      </div>

      <div className="space-y-4 mb-8">
        {field('name', 'Studio Name', 'e.g. Studio Saif', <Building2 className="w-4 h-4" />)}
        {field('address', 'Address', '7 Design Street, London', <Building2 className="w-4 h-4" />)}
        {field('support_email', 'Contact Email', 'hello@studio.com', <Mail className="w-4 h-4" />, 'email')}
        {field('phone_number', 'Phone Number', '+44 20 1234 5678', <Phone className="w-4 h-4" />, 'tel')}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: Branding ─────────────────────────────────────────────────────────

function StepBranding({ onNext, onBack, onSkip }: { onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!logoFile) { onNext(); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('primary_logo', logoFile);
      await patchFormData({ url: '/user/studio/branding/', data: fd });
      onNext();
    } catch {
      toast.error('Upload failed. You can add branding later in Settings.');
      onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Add your logo.</h1>
        <p className="text-sm text-gray-500">Appears on proposals and client-facing documents. You can always update this later.</p>
      </div>

      <div className="mb-8">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} className="hidden" />
        {logoPreview ? (
          <div className="relative w-full aspect-[3/1] rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            <img src={logoPreview} alt="Logo preview" className="max-h-24 max-w-[70%] object-contain" />
            <button
              type="button"
              onClick={() => { setLogoFile(null); setLogoPreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Upload className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-sm font-medium text-gray-700">Click to upload logo</div>
            <div className="text-xs text-gray-400">PNG, JPG, SVG — max 2MB</div>
          </button>
        )}
        {logoPreview && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2">
            Change logo
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button type="button" onClick={handleUpload} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{logoFile ? 'Upload & Continue' : 'Continue'} <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
      <button type="button" onClick={onSkip} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Skip for now
      </button>
    </div>
  );
}

// ─── Step 4: Invite Team ──────────────────────────────────────────────────────

function StepInvite({ onFinish, onBack, onSkip }: { onFinish: () => void; onBack: () => void; onSkip: () => void }) {
  const [invites, setInvites] = useState<InviteEntry[]>([{ email: '', role: 'member' }]);
  const [saving, setSaving] = useState(false);

  const addRow = () => setInvites(p => [...p, { email: '', role: 'member' }]);
  const removeRow = (i: number) => setInvites(p => p.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof InviteEntry, value: string) =>
    setInvites(p => p.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const handleSend = async () => {
    const valid = invites.filter(r => r.email.trim() && /^\S+@\S+\.\S+$/.test(r.email));
    if (!valid.length) { onFinish(); return; }
    setSaving(true);
    try {
      await Promise.all(valid.map(r => postData({ url: '/user/invite/', data: { email: r.email, role: r.role } })));
      toast.success(`${valid.length} invite${valid.length > 1 ? 's' : ''} sent`);
      onFinish();
    } catch {
      toast.error('Some invites failed. You can retry from Settings → Team.');
      onFinish();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Who's on your team?</h1>
        <p className="text-sm text-gray-500">Add colleagues now or later from Settings → Team.</p>
      </div>

      <div className="space-y-3 mb-4">
        {invites.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="email"
              value={row.email}
              onChange={e => update(i, 'email', e.target.value)}
              placeholder="colleague@studio.com"
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-900 transition-colors"
            />
            <select
              value={row.role}
              onChange={e => update(i, 'role', e.target.value as InviteEntry['role'])}
              className="px-2.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-900 transition-colors"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
            {invites.length > 1 && (
              <button type="button" onClick={() => removeRow(i)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {invites.length < 5 && (
        <button type="button" onClick={addRow}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <UserPlus className="w-3.5 h-3.5" /> Add another
        </button>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button type="button" onClick={handleSend} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Send invites & finish</>}
        </button>
      </div>
      <button type="button" onClick={onSkip} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Skip for now
      </button>
    </div>
  );
}

// ─── Step 5: Completion screen ───────────────────────────────────────────────

const SETUP_MESSAGES = [
  'Setting up your studio...',
  'Configuring your workspace...',
  'Almost ready...',
];
const REDIRECT_DELAY = 4500;
const MESSAGE_INTERVAL = 1400;

function StepComplete({ onDone }: { onDone: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, SETUP_MESSAGES.length - 1));
    }, MESSAGE_INTERVAL);
    const redirect = setTimeout(onDone, REDIRECT_DELAY);
    return () => { clearInterval(msgTimer); clearTimeout(redirect); };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center gap-8 py-16 text-center max-w-sm mx-auto"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-gray-900/10"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center shadow-lg"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.25 }}
          >
            <Check className="w-9 h-9 text-white" strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h1>
        <p className="text-sm text-gray-500">Your TechStyles studio is ready to go.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2.5 text-sm text-gray-400"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {SETUP_MESSAGES[msgIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const finish = () => setStep(4);

  const redirect = () => {
    queryClient.invalidateQueries({ queryKey: ['user/self/'] });
    router.push('/home/dashboard');
  };
  
  // Block browser refresh/close while onboarding is in progress
  useEffect(() => {
    if (step === 4) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [step]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/Logo.png"
            alt="Focuspilot"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Focuspilot
          </span>
        </div>
        {step < 4 && (
          <span className="text-xs text-gray-400">
            {step + 1} of {STEPS.length}
          </span>
        )}
      </header>

      <div className="h-0.5 bg-gray-100">
        <div
          className="h-full bg-gray-900 transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step < 4 && (
          <div className="w-full max-w-lg mb-10">
            <StepBar current={step} />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full"
          >
            {step === 0 && <StepRole onNext={() => setStep(1)} />}
            {step === 1 && (
              <StepStudio onNext={() => setStep(2)} onBack={() => setStep(0)} />
            )}
            {step === 2 && (
              <StepBranding
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
                onSkip={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepInvite
                onFinish={finish}
                onBack={() => setStep(2)}
                onSkip={finish}
              />
            )}
            {step === 4 && <StepComplete onDone={redirect} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
