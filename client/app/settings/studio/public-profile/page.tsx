'use client';

import { Section } from '@/components/settings/section';
import { ImageCropUpload } from '@/components/settings/image-crop-upload';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { patchData, patchFormData, postData, deleteData } from '@/lib/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { gooeyToast as toast } from 'goey-toast';
import {
  Copy, ExternalLink, Globe, Loader2, Plus, Star, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const PROFILE_URL = '/public_profiles/me/';
const PORTFOLIO_URL = '/public_profiles/me/portfolio/';
const REVIEWS_URL = '/public_profiles/me/reviews/';
const CANDIDATES_URL = '/public_profiles/me/project-candidates/';
const IMPORT_URL = '/public_profiles/me/import-projects/';
const BRANDING_URL = '/user/studio/branding/';

type Profile = {
  id: number;
  slug: string;
  is_published: boolean;
  headline: string;
  tagline: string;
  about: string;
  cover_image_url: string | null;
  logo_url: string | null;
  studio_name: string;
  location_display: string;
  founded_year: number | null;
  team_size_display: string;
  services: string[];
  specialties: string[];
  website_url: string;
  linkedin_url: string;
  instagram_url: string;
  pinterest_url: string;
  houzz_url: string;
  show_team: boolean;
  contact_email_public: string;
  contact_phone_public: string;
  public_url: string;
};

type PortfolioItem = {
  id: number;
  title: string;
  summary: string;
  location: string;
  year: number | null;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  project?: number | null;
};

type Review = {
  id: number;
  author_name: string;
  author_title: string;
  rating: number;
  body: string;
  is_published: boolean;
};

type ProjectCandidate = {
  id: number;
  project_name: string;
  project_status: string;
  location: string;
  image_url: string | null;
  already_in_portfolio: boolean;
};

function parseTags(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Base URL for public profile (e.g. http://localhost:3005/studio) from API public_url */
function publicProfileBase(publicUrl: string | undefined, slug: string | undefined): string {
  if (!publicUrl) {
    return `${process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, '') || 'http://localhost:3005'}/studio`;
  }
  if (slug && publicUrl.endsWith(`/${slug}`)) {
    return publicUrl.slice(0, -(slug.length + 1));
  }
  return publicUrl.replace(/\/[^/]+$/, '') || publicUrl;
}

function PublicProfilePageContent() {
  const t = useTranslations('settingsPublicProfilePage');
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: profile, isLoading } = useFetch(PROFILE_URL) as { data?: Profile; isLoading: boolean };
  const { data: portfolio = [] } = useFetch(PORTFOLIO_URL) as { data?: PortfolioItem[] };
  const { data: reviews = [] } = useFetch(REVIEWS_URL) as { data?: Review[] };
  const { data: candidates = [] } = useFetch(CANDIDATES_URL) as { data?: ProjectCandidate[] };

  const [form, setForm] = useState<Partial<Profile>>({});
  const [servicesText, setServicesText] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [slugCheck, setSlugCheck] = useState<'idle' | 'ok' | 'taken'>('idle');
  const { data: brandingData } = useFetch(BRANDING_URL) as {
    data?: { primary_logo: string | null };
  };

  useEffect(() => {
    if (profile) {
      setForm(profile);
      setServicesText((profile.services || []).join(', '));
      setSpecialtiesText((profile.specialties || []).join(', '));
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: (payload: Record<string, unknown>) => patchData({ url: PROFILE_URL, data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_URL] });
      queryClient.invalidateQueries({ queryKey: ['users', user?.email] });
      toast.success(t('toasts.profileSaved'));
    },
    onError: () => toast.error(t('toasts.profileSaveFailed')),
  });

  const publishProfile = useMutation({
    mutationFn: (is_published: boolean) =>
      postData({ url: '/public_profiles/me/publish/', data: { is_published } }),
    onSuccess: (data: Profile) => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_URL] });
      toast.success(data.is_published ? t('toasts.profilePublished') : t('toasts.profileUnpublished'));
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      toast.error(e?.response?.data?.detail || t('toasts.publishStatusFailed'));
    },
  });

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugCheck('idle');
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/public_profiles/me/slug/check/?slug=${encodeURIComponent(slug)}`,
        { credentials: 'include' },
      );
      const json = await res.json();
      setSlugCheck(json.available ? 'ok' : 'taken');
    } catch {
      setSlugCheck('idle');
    }
  }, []);

  const uploadLogo = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('primary_logo', file);
      return patchFormData({ url: BRANDING_URL, data: fd });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_URL] });
      queryClient.invalidateQueries({ queryKey: [BRANDING_URL] });
      queryClient.invalidateQueries({ queryKey: ['users', user?.email] });
    },
  });

  const uploadCover = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('cover_image', file);
      return patchFormData({ url: PROFILE_URL, data: fd });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_URL] });
    },
  });

  const importProjects = useMutation({
    mutationFn: (project_ids: number[]) => postData({ url: IMPORT_URL, data: { project_ids } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_URL] });
      queryClient.invalidateQueries({ queryKey: [CANDIDATES_URL] });
      toast.success(t('toasts.projectsImported'));
    },
  });

  const deletePortfolio = useMutation({
    mutationFn: (id: number) => deleteData({ url: `${PORTFOLIO_URL}${id}/` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_URL] });
      toast.success(t('toasts.portfolioRemoved'));
    },
  });

  const [newReview, setNewReview] = useState({ author_name: '', author_title: '', rating: 5, body: '' });
  const addReview = useMutation({
    mutationFn: () => postData({ url: REVIEWS_URL, data: newReview }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEWS_URL] });
      setNewReview({ author_name: '', author_title: '', rating: 5, body: '' });
      toast.success(t('toasts.reviewAdded'));
    },
  });

  const deleteReview = useMutation({
    mutationFn: (id: number) => deleteData({ url: `${REVIEWS_URL}${id}/` }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REVIEWS_URL] }),
  });

  function handleSave() {
    saveProfile.mutate({
      studio_name: form.studio_name,
      slug: form.slug,
      headline: form.headline,
      tagline: form.tagline,
      about: form.about,
      location_display: form.location_display,
      founded_year: form.founded_year || null,
      team_size_display: form.team_size_display,
      services: parseTags(servicesText),
      specialties: parseTags(specialtiesText),
      website_url: form.website_url,
      linkedin_url: form.linkedin_url,
      instagram_url: form.instagram_url,
      pinterest_url: form.pinterest_url,
      houzz_url: form.houzz_url,
      show_team: form.show_team,
      contact_email_public: form.contact_email_public,
      contact_phone_public: form.contact_phone_public,
    });
  }

  function copyPublicLink() {
    if (profile?.public_url) {
      navigator.clipboard.writeText(profile.public_url);
      toast.success(t('toasts.linkCopied'));
    }
  }

  const importable = (candidates || []).filter((c) => !c.already_in_portfolio);
  const profileBase = publicProfileBase(profile?.public_url, profile?.slug);
  const profileUrlPrefix = `${profileBase.replace(/^https?:\/\//, '')}/`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('description')}
        </p>
      </div>

      <Section
        title={t('publishTitle')}
        description={profile?.is_published ? t('publishDescriptionLive') : t('publishDescriptionDraft')}
        action={
          <div className="flex items-center gap-2">
            <Switch
              checked={!!profile?.is_published}
              onCheckedChange={(v) => publishProfile.mutate(v)}
              disabled={publishProfile.isPending}
            />
            <span className="text-sm">{profile?.is_published ? t('published') : t('draft')}</span>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyPublicLink} disabled={!profile?.public_url}>
            <Copy className="size-4 mr-1" />
            {t('copyLink')}
          </Button>
          {profile?.public_url && profile.is_published ? (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={profile.public_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4 mr-1" />
                {t('viewLive')}
              </a>
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-mono break-all">{profile?.public_url}</p>
      </Section>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="portfolio">{t('tabs.portfolio')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('tabs.reviews')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-4">
          <Section title={t('urlBrandingTitle')}>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-8">
                <ImageCropUpload
                  label={t('studioLogo')}
                  description={t('studioLogoDescription')}
                  imageUrl={profile?.logo_url || brandingData?.primary_logo}
                  fallbackLetter={form.studio_name || profile?.studio_name || 'S'}
                  aspect={1}
                  previewShape="rounded"
                  onUpload={async (file) => {
                    const res = (await uploadLogo.mutateAsync(file)) as { primary_logo?: string };
                    return res?.primary_logo;
                  }}
                />
                <ImageCropUpload
                  label={t('coverImage')}
                  description={t('coverImageDescription')}
                  imageUrl={profile?.cover_image_url}
                  fallbackLetter=""
                  aspect={3}
                  previewShape="rounded"
                  onUpload={async (file) => {
                    const res = (await uploadCover.mutateAsync(file)) as { cover_image_url?: string };
                    return res?.cover_image_url;
                  }}
                />
              </div>

              <div>
                <Label>{t('publicUrlSlug')}</Label>
                <div className="flex gap-2 mt-1">
                  <span className="text-sm text-muted-foreground py-2 shrink-0">{profileUrlPrefix}</span>
                  <Input
                    value={form.slug || ''}
                    onChange={(e) => {
                      const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setForm((f) => ({ ...f, slug: v }));
                      checkSlug(v);
                    }}
                    className="max-w-xs"
                  />
                </div>
                {slugCheck === 'ok' && <p className="text-xs text-green-600 mt-1">{t('slugAvailable')}</p>}
                {slugCheck === 'taken' && <p className="text-xs text-destructive mt-1">{t('slugTaken')}</p>}
              </div>
            </div>
          </Section>

          <Section title={t('studioStoryTitle')}>
            <div className="space-y-4">
              <div>
                <Label>{t('studioName')}</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                  {t('studioNameHint')}
                </p>
                <Input
                  value={form.studio_name || ''}
                  onChange={(e) => setForm((f) => ({ ...f, studio_name: e.target.value }))}
                  placeholder={t('placeholders.studioName')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('headline')}</Label>
                <Input
                  value={form.headline || ''}
                  onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                  placeholder={t('placeholders.headline')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('tagline')}</Label>
                <Input
                  value={form.tagline || ''}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder={t('placeholders.tagline')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('about')}</Label>
                <Textarea
                  value={form.about || ''}
                  onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
                  rows={6}
                  className="mt-1"
                  placeholder={t('placeholders.about')}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('locationPublic')}</Label>
                  <Input
                    value={form.location_display || ''}
                    onChange={(e) => setForm((f) => ({ ...f, location_display: e.target.value }))}
                    placeholder={t('placeholders.location')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('teamSize')}</Label>
                  <Input
                    value={form.team_size_display || ''}
                    onChange={(e) => setForm((f) => ({ ...f, team_size_display: e.target.value }))}
                    placeholder={t('placeholders.teamSize')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('foundedYear')}</Label>
                  <Input
                    type="number"
                    value={form.founded_year ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        founded_year: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>{t('servicesComma')}</Label>
                <Input value={servicesText} onChange={(e) => setServicesText(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{t('specialtiesComma')}</Label>
                <Input value={specialtiesText} onChange={(e) => setSpecialtiesText(e.target.value)} className="mt-1" />
              </div>
            </div>
          </Section>

          <Section title={t('linksContactTitle')}>
            <div className="grid sm:grid-cols-2 gap-4">
              {(
                [
                  ['website_url', 'website'],
                  ['linkedin_url', 'linkedin'],
                  ['instagram_url', 'instagram'],
                  ['pinterest_url', 'pinterest'],
                  ['houzz_url', 'houzz'],
                ] as const
              ).map(([key, labelKey]) => (
                <div key={key}>
                  <Label>{t(`linkLabels.${labelKey}`)}</Label>
                  <Input
                    value={(form[key] as string) || ''}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="mt-1"
                    placeholder={t('placeholders.url')}
                  />
                </div>
              ))}
              <div>
                <Label>{t('publicEmail')}</Label>
                <Input
                  value={form.contact_email_public || ''}
                  onChange={(e) => setForm((f) => ({ ...f, contact_email_public: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('publicPhone')}</Label>
                <Input
                  value={form.contact_phone_public || ''}
                  onChange={(e) => setForm((f) => ({ ...f, contact_phone_public: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Switch
                checked={form.show_team !== false}
                onCheckedChange={(v) => setForm((f) => ({ ...f, show_team: v }))}
              />
              <Label>{t('showTeamOnProfile')}</Label>
            </div>
          </Section>

          <Button onClick={handleSave} disabled={saveProfile.isPending}>
            {saveProfile.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {t('saveProfile')}
          </Button>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6 mt-4">
          <Section
            title={t('importProjectsTitle')}
            description={t('importProjectsDescription')}
          >
            {importable.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noProjectsToImport')}</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {importable.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2">
                    <span>{p.project_name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => importProjects.mutate([p.id])}
                      disabled={importProjects.isPending}
                    >
                      {t('add')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={t('portfolioItemsTitle')}>
            {portfolio.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noPortfolioItems')}</p>
            ) : (
              <ul className="space-y-3">
                {portfolio.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 items-start border rounded-lg p-3"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="size-16 object-cover rounded shrink-0" />
                    ) : (
                      <div className="size-16 bg-muted rounded shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.title}</p>
                      {item.location ? <p className="text-xs text-muted-foreground">{item.location}</p> : null}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive shrink-0"
                      onClick={() => deletePortfolio.mutate(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6 mt-4">
          <Section title={t('addReviewTitle')}>
            <div className="space-y-3">
              <Input
                placeholder={t('placeholders.clientName')}
                value={newReview.author_name}
                onChange={(e) => setNewReview((r) => ({ ...r, author_name: e.target.value }))}
              />
              <Input
                placeholder={t('placeholders.authorTitle')}
                value={newReview.author_title}
                onChange={(e) => setNewReview((r) => ({ ...r, author_title: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <Label>{t('rating')}</Label>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNewReview((r) => ({ ...r, rating: n }))}
                    className={cn('p-1', n <= newReview.rating ? 'text-amber-500' : 'text-muted-foreground')}
                  >
                    <Star className={cn('size-5', n <= newReview.rating && 'fill-current')} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder={t('placeholders.reviewText')}
                value={newReview.body}
                onChange={(e) => setNewReview((r) => ({ ...r, body: e.target.value }))}
                rows={3}
              />
              <Button
                size="sm"
                onClick={() => addReview.mutate()}
                disabled={!newReview.author_name || !newReview.body || addReview.isPending}
              >
                <Plus className="size-4 mr-1" />
                {t('addReview')}
              </Button>
            </div>
          </Section>

          <Section title={t('publishedReviewsTitle')}>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noReviews')}</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium">{r.author_name}</p>
                        <p className="text-muted-foreground text-xs">{r.author_title}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteReview.mutate(r.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="mt-2 text-muted-foreground line-clamp-3">&ldquo;{r.body}&rdquo;</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function StudioPublicProfileSettingsPage() {
  return (
    <PermissionGuard permission="settings.edit">
      <PublicProfilePageContent />
    </PermissionGuard>
  );
}
