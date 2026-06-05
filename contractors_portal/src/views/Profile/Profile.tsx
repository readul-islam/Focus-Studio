import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import { patchData, patchFormData } from '@/lib/Api';
import { useTranslations } from 'next-intl';

type ProfileResponse = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  company_name: string;
  trade: string;
  insurance_expiry: string | null;
  insurance_document: string | null;
  trade_cert: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
};

export default function Profile() {
  const { user } = useUser();
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const { data: profileData, isLoading, refetch } = useFetch<ProfileResponse>(
    'contractor_portal/me/',
    { enabled: !!user }
  );

  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    company_name: '',
    trade: '',
    insurance_expiry: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  });
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [tradeCert, setTradeCert] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profileData) return;
    setForm({
      name: profileData.name || '',
      surname: profileData.surname || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      company_name: profileData.company_name || '',
      trade: profileData.trade || '',
      insurance_expiry: profileData.insurance_expiry || '',
      emergency_contact_name: profileData.emergency_contact_name || '',
      emergency_contact_phone: profileData.emergency_contact_phone || '',
      notes: profileData.notes || '',
    });
  }, [profileData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (insuranceDocument || tradeCert) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
        if (insuranceDocument) fd.append('insurance_document', insuranceDocument);
        if (tradeCert) fd.append('trade_cert', tradeCert);
        await patchFormData({ url: 'contractor_portal/me/', data: fd });
      } else {
        await patchData({ url: 'contractor_portal/me/', data: form });
      }
      toast.success(t('updated'));
      setInsuranceDocument(null);
      setTradeCert(null);
      refetch();
    } catch {
      toast.error(t('updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('pageTitle')}</title>
      </Helmet>

      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('title')}</h1>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-200">
          <section className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('firstName')}</Label>
              <Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>{t('surname')}</Label>
              <Input className="mt-1" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} />
            </div>
            <div>
              <Label>{t('email')}</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>{t('phone')}</Label>
              <Input className="mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>{t('company')}</Label>
              <Input className="mt-1" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>{t('trade')}</Label>
              <Input className="mt-1" value={form.trade} onChange={e => setForm({ ...form, trade: e.target.value })} />
            </div>
          </section>

          <section className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">{t('insurance')}</h2>
            <div>
              <Label>{t('expiryDate')}</Label>
              <Input
                className="mt-1"
                type="date"
                value={form.insurance_expiry}
                onChange={e => setForm({ ...form, insurance_expiry: e.target.value })}
              />
            </div>
            {profileData?.insurance_document && (
              <p className="text-xs text-gray-500">{tc('current', { name: profileData.insurance_document.split('/').pop() })}</p>
            )}
            <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('ins-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {t('uploadInsurance')}
            </Button>
            <input
              id="ins-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => setInsuranceDocument(e.target.files?.[0] || null)}
            />
          </section>

          <section className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">{t('tradeCertificate')}</h2>
            {profileData?.trade_cert && (
              <p className="text-xs text-gray-500">{tc('current', { name: profileData.trade_cert.split('/').pop() })}</p>
            )}
            <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('cert-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {t('uploadTradeCert')}
            </Button>
            <input
              id="cert-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => setTradeCert(e.target.files?.[0] || null)}
            />
          </section>

          <section className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-sm font-semibold text-gray-900 md:col-span-2">{t('emergencyContact')}</h2>
            <div>
              <Label>{t('name')}</Label>
              <Input
                className="mt-1"
                value={form.emergency_contact_name}
                onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('phone')}</Label>
              <Input
                className="mt-1"
                value={form.emergency_contact_phone}
                onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })}
              />
            </div>
          </section>

          <section className="p-5">
            <Label>{t('notes')}</Label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </section>

          <div className="p-5 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-gray-900 text-white hover:bg-gray-800">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
