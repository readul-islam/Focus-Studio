'use client';

import { Section } from '@/components/settings/section';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useUser from '@/hooks/useUser';
import { patchData, patchFormData } from '@/lib/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { gooeyToast as toast } from 'goey-toast';
import { UploadCloud, X } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { useTranslations } from 'next-intl';

interface StudioData {
  name: string;
  support_email: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  default_currency: string;
  default_tax_rate: number;
}

const EMPTY: StudioData = {
  name: '',
  support_email: '',
  phone_number: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  county: '',
  postcode: '',
  country: '',
  default_currency: '',
  default_tax_rate: 0,
};

const BRANDING_URL = '/user/studio/branding/';

function StudioGeneralPageContent() {
  const t = useTranslations('settingsStudioGeneralPage');
  const tc = useTranslations('common');
  const logoSlots = [
    { key: 'primary', label: t('primaryLogo'), description: t('primaryLogoDescription') },
    { key: 'monochrome', label: t('monochromeLogo'), description: t('monochromeLogoDescription') },
  ];
  const [studioData, setStudioData] = useState<StudioData>(EMPTY);
  const queryClient = useQueryClient();
  const { user, isLoading } = useUser();

  // Logo state
  const [logos, setLogos] = useState<Record<string, string | null>>({ primary: null, monochrome: null });
  const fileRefs = useRef<Record<string, File | null>>({ primary: null, monochrome: null });
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { data: brandingData } = useFetch(BRANDING_URL);
  const { mutateAsync: saveBranding, isPending: isSavingLogo } = useMutation({
    mutationFn: (fd: FormData) => patchFormData({ url: BRANDING_URL, data: fd }),
  });

  useEffect(() => {
    if (brandingData) {
      const d = brandingData as { primary_logo: string | null; monochrome_logo: string | null };
      setLogos({ primary: d.primary_logo, monochrome: d.monochrome_logo });
    }
  }, [brandingData]);

  function handleFile(key: string, file: File) {
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      toast.error(t('toasts.unsupportedFile'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('toasts.fileTooLarge'));
      return;
    }
    fileRefs.current[key] = file;
    const reader = new FileReader();
    reader.onload = e => setLogos(prev => ({ ...prev, [key]: e.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSaveLogo() {
    const fd = new FormData();
    if (fileRefs.current.primary) fd.append('primary_logo', fileRefs.current.primary);
    if (fileRefs.current.monochrome) fd.append('monochrome_logo', fileRefs.current.monochrome);
    toast.promise(saveBranding(fd), {
      loading: t('toasts.uploading'),
      success: t('toasts.uploaded'),
      error: t('toasts.uploadFailed'),
    });
  }

  useEffect(() => {
    if (isLoading || !user?.studio) return;
    const s = user.studio;
    setStudioData({
      name: s.name ?? '',
      support_email: s.support_email ?? '',
      phone_number: s.phone_number ?? '',
      address_line_1: s.address_line_1 ?? '',
      address_line_2: s.address_line_2 ?? '',
      city: s.city ?? '',
      county: s.county ?? '',
      postcode: s.postcode ?? '',
      country: s.country ?? '',
      default_currency: s.default_currency ?? '',
      default_tax_rate: s.default_tax_rate ?? 0,
    });
  }, [user?.email, isLoading]);

  const mutation = useMutation({
    mutationFn: (data: StudioData) => patchData({ url: 'user/studios/update/', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['/public_profiles/me/'] });
      toast.success(t('toasts.settingsUpdated'));
    },
    onError: () => toast.error(t('toasts.saveFailed')),
  });

  const set = (field: keyof StudioData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setStudioData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(studioData);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('description')}
        </p>
      </div>

      <Section
        title={t('generalTitle')}
        description={t('generalDescription')}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">{t('studioName')}</Label>
            <Input
              id="name"
              value={studioData.name}
              onChange={set("name")}
              placeholder={t('placeholders.studioName')}
            />
          </div>

          <div>
            <Label htmlFor="support_email">{t('supportEmail')}</Label>
            <Input
              id="support_email"
              type="email"
              value={studioData.support_email}
              onChange={set("support_email")}
              placeholder={t('placeholders.supportEmail')}
            />
          </div>

          <div>
            <Label htmlFor="phone_number">{t('phone')}</Label>
            <Input
              id="phone_number"
              value={studioData.phone_number}
              onChange={set("phone_number")}
              placeholder={t('placeholders.phone')}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address_line_1">{t('addressLine1')}</Label>
            <Input
              id="address_line_1"
              value={studioData.address_line_1}
              onChange={set("address_line_1")}
              placeholder={t('placeholders.addressLine1')}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address_line_2">{t('addressLine2')}</Label>
            <Input
              id="address_line_2"
              value={studioData.address_line_2}
              onChange={set("address_line_2")}
              placeholder={t('placeholders.addressLine2')}
            />
          </div>

          <div>
            <Label htmlFor="city">{t('city')}</Label>
            <Input
              id="city"
              value={studioData.city}
              onChange={set("city")}
              placeholder={t('placeholders.city')}
            />
          </div>

          <div>
            <Label htmlFor="county">{t('county')}</Label>
            <Input
              id="county"
              value={studioData.county}
              onChange={set("county")}
              placeholder={t('placeholders.county')}
            />
          </div>

          <div>
            <Label htmlFor="postcode">{t('postcode')}</Label>
            <Input
              id="postcode"
              value={studioData.postcode}
              onChange={set("postcode")}
              placeholder={t('placeholders.postcode')}
            />
          </div>

          <div>
            <Label htmlFor="country">{t('country')}</Label>
            <Input
              id="country"
              value={studioData.country}
              onChange={set("country")}
              placeholder={t('placeholders.country')}
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? tc('saving') : tc('save')}
            </Button>
          </div>
        </form>
      </Section>

      <Section
        title={t('logoSectionTitle')}
        description={t('logoSectionDescription')}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {logoSlots.map((slot) => (
            <div key={slot.key} className="space-y-2">
              <Label>{slot.label}</Label>
              <p className="text-xs text-muted-foreground">
                {slot.description}
              </p>
              <div
                className="relative flex items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-lg bg-stone-50 cursor-pointer hover:border-gray-300 transition-colors overflow-hidden"
                onClick={() => inputRefs.current[slot.key]?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(slot.key, f);
                }}
              >
                {logos[slot.key] ? (
                  <>
                    <img
                      src={logos[slot.key]!}
                      alt={slot.label}
                      className="max-h-full max-w-full object-contain p-3"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogos((prev) => ({ ...prev, [slot.key]: null }));
                        fileRefs.current[slot.key] = null;
                      }}
                      className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow border border-gray-200"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-400 pointer-events-none">
                    <UploadCloud className="w-6 h-6" />
                    <span className="text-xs">{t('uploadHint')}</span>
                    <span className="text-[10px] text-gray-300">
                      {t('uploadFormats')}
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={(el) => {
                  inputRefs.current[slot.key] = el;
                }}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(slot.key, f);
                }}
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button onClick={handleSaveLogo} disabled={isSavingLogo}>
              {isSavingLogo ? tc('saving') : t('saveLogo')}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function StudioGeneralPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <StudioGeneralPageContent />
    </PermissionGuard>
  );
}
