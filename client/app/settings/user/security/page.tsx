'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Section } from '@/components/settings/section';
import { TwoFactorSection } from '@/components/settings/TwoFactorSection';
import { Eye, EyeOff } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import { usePost } from '@/hooks/usePost';

export default function UserSecurityPage() {
  const [fields, setFields] = useState({ current: '', new: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const { mutate: changePassword, isPending } = usePost({
    onSuccess: () => {
      toast('Password updated', { description: 'Your password has been changed successfully.' });
      setFields({ current: '', new: '', confirm: '' });
      setErrors({});
    },
    onError: (err: any) => {
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        if (detail.error) {
          toast.error(detail.error);
          return;
        }
        const mapped: Record<string, string> = {};
        if (detail.current_password) mapped.current = detail.current_password[0] ?? 'Invalid current password.';
        if (detail.new_password) mapped.new = detail.new_password[0] ?? 'Invalid new password.';
        if (detail.confirm_new_password) mapped.confirm = detail.confirm_new_password[0] ?? 'Passwords do not match.';
        if (Object.keys(mapped).length) { setErrors(mapped); return; }
      }
      toast.error('Failed to update password.');
    },
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fields.current) errs.current = 'Current password is required.';
    if (fields.new.length < 8) errs.new = 'New password must be at least 8 characters.';
    if (fields.confirm !== fields.new) errs.confirm = 'Passwords do not match.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    changePassword({
      url: '/user/self/change-password/',
      data: { current_password: fields.current, new_password: fields.new, confirm_new_password: fields.confirm },
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Security</h1>
        <p className="text-sm text-gray-600">Protect your account by updating your password and enabling 2FA.</p>
      </div>

      {/* ---------- Password Section ---------- */}
      <Section title="Password" description="Use a strong password you don’t reuse elsewhere.">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {(['current', 'new', 'confirm'] as const).map(field => (
            <div key={field} className="relative">
              <Label htmlFor={field}>
                {field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm new password'}
              </Label>
              <Input
                id={field}
                name={field}
                value={fields[field]}
                onChange={e => setFields(prev => ({ ...prev, [field]: e.target.value }))}
                type={showPassword[field] ? 'text' : 'password'}
                className="pr-10"
              />
              {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field)}
                className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
              >
                {showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Update password'}</Button>
          </div>
        </form>
      </Section>

      <TwoFactorSection />

      {/* ---------- Active Sessions Section ---------- */}
      {/* <Section title="Active sessions" description="Sign out devices you don’t recognize.">
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { device: 'MacBook Pro • Safari', loc: 'New York, US', last: '2 mins ago' },
                { device: 'iPhone 15 • Mobile Safari', loc: 'New York, US', last: 'Yesterday' },
              ].map(s => (
                <TableRow key={s.device}>
                  <TableCell className="font-medium">{s.device}</TableCell>
                  <TableCell>{s.loc}</TableCell>
                  <TableCell>{s.last}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Sign out
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section> */}
    </div>
  );
}
