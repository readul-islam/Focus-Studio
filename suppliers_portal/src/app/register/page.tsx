'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { registerSupplier } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    password: '',
    phone: '',
    website: '',
    country: '',
    city: '',
    description: '',
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerSupplier(form);
      toast.success('Application submitted. You can sign in while we review your account.');
      router.push('/login');
    } catch (error: any) {
      const message =
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.non_field_errors?.[0] ||
        'Could not submit application';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Apply to join as a supplier</CardTitle>
          <CardDescription>
            List your trade products on Focuspilot and receive orders from interior design studios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company_name">Company name *</Label>
              <Input id="company_name" required value={form.company_name} onChange={e => update('company_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact name</Label>
              <Input id="contact_name" value={form.contact_name} onChange={e => update('contact_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" minLength={8} required value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" value={form.website} onChange={e => update('website', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={e => update('country', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">About your company</Label>
              <Textarea id="description" value={form.description} onChange={e => update('description', e.target.value)} />
            </div>
            <div className="flex items-center justify-between sm:col-span-2">
              <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                Already have an account? Sign in
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting…' : 'Submit application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
