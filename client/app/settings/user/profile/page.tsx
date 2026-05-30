'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { SettingsPageHeader } from '@/components/settings/page-header';
import { SettingsSection } from '@/components/settings/section';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useUser from '@/hooks/useUser';
import { postData, postFormData } from '@/lib/Api';
import {
  dataUrlToFile,
  getCroppedImageDataUrl,
  validateRasterImageFile,
} from '@/lib/image-crop';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface UserData {
  id?: number;
  email?: string;
  name?: string;
  phone_number?: string;
  photoURL?: string;
  profile_picture?: string;
  cover_image?: string;
  title?: string;
}

type CropTarget = 'profile' | 'cover' | null;

export default function UserProfilePage() {
  const t = useTranslations('settingsProfilePage');
  const tc = useTranslations('common');
  const tImage = useTranslations('imageCropUpload');
  const { user, isLoading } = useUser();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    setCurrentUser(user);
  }, [user, isLoading]);

  const mutation = useMutation({
    mutationFn: async (userData: UserData) => {
      return await postData({
        url: '/user/self/update/',
        data: {
          name: userData?.name,
          phone_number: userData?.phone_number,
          title: userData?.title,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/self/'] });
      toast.success(t('profileUpdatedToast'));
    },
    onError: () => {
      toast.error(tc('errorTryAgain'));
    },
  });

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const pickImage = (file: File, target: 'profile' | 'cover') => {
    const v = validateRasterImageFile(file);
    if (!v.ok) {
      toast.error(v.code === 'unsupportedType' ? tImage('unsupportedFileType') : tImage('fileTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setCropImage(url);
      setCropTarget(target);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const profileDisplayUrl = profilePreview || user?.profile_picture;
  const coverDisplayUrl = coverPreview || user?.cover_image;
  const displayName = currentUser?.name?.trim() || user?.name || t('yourName');
  const displayTitle = currentUser?.title?.trim() || user?.title || t('addDesignation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.name?.trim()) {
      toast.error(t('nameRequired'));
      return;
    }
    mutation.mutate(currentUser as UserData);
  };

  const clearImageOnServer = async (field: 'profile_picture' | 'cover_image') => {
    await postData({
      url: '/user/self/update/',
      data: { [field]: null },
    });
    if (field === 'profile_picture') setProfilePreview(null);
    else setCoverPreview(null);
    queryClient.invalidateQueries({ queryKey: ['user/self/'] });
  };

  const cropAspect = cropTarget === 'cover' ? 4 : 1;
  const cropTitle = cropTarget === 'cover' ? t('cropCover') : t('cropProfile');

  return (
    <>
      <SettingsPageHeader title={t('title')} description={t('description')} />

      {/* LinkedIn-style profile header */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Cover banner */}
        <div className="group relative h-36 sm:h-44 md:h-48">
          {coverDisplayUrl ? (
            <img
              src={coverDisplayUrl}
              alt={t('altProfileCover')}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600"
              aria-hidden
            />
          )}

          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

          <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/30 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70">
              <Camera className="size-3.5" />
              {coverDisplayUrl ? t('changeCover') : t('addCover')}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) pickImage(file, 'cover');
                  e.target.value = '';
                }}
              />
            </label>
            {coverDisplayUrl && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await clearImageOnServer('cover_image');
                    toast.success(t('coverRemoved'));
                  } catch {
                    toast.error(t('coverRemoveFailed'));
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-red-900/70"
                aria-label={t('removeCoverAria')}
              >
                <Trash2 className="size-3.5" />
                {tc('remove')}
              </button>
            )}
          </div>
        </div>

        {/* Avatar + name row (overlapping cover) */}
        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div
              className="group/avatar relative -mt-14 sm:-mt-16"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer?.files?.[0];
                if (file) pickImage(file, 'profile');
              }}
            >
              <div className="relative size-28 shrink-0 sm:size-32">
                <div className="size-full overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-1 ring-gray-200">
                  {profileDisplayUrl ? (
                    <img
                      src={profileDisplayUrl}
                      alt={t('altProfilePhoto')}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Avatar className="size-full rounded-full">
                      <AvatarFallback className="bg-stone-100 text-2xl sm:text-3xl">
                        {displayName.slice(0, 1).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full',
                    'bg-black/50 opacity-0 transition-opacity group-hover/avatar:pointer-events-auto group-hover/avatar:opacity-100',
                  )}
                >
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-white/25">
                    <Camera className="size-3.5" />
                    {profileDisplayUrl ? tc('change') : tc('upload')}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) pickImage(file, 'profile');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {profileDisplayUrl && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (profilePreview && !user?.profile_picture) {
                          setProfilePreview(null);
                          return;
                        }
                        try {
                          await clearImageOnServer('profile_picture');
                          toast.success(t('profileRemoved'));
                        } catch {
                          toast.error(t('profileRemoveFailed'));
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-red-700"
                      aria-label={t('deleteProfilePictureAria')}
                    >
                      <Trash2 className="size-3.5" />
                      {tc('delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 pb-0 sm:pb-1">
              <h2 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
                {displayName}
              </h2>
              {displayTitle ? (
                <p className="truncate text-sm text-muted-foreground">{displayTitle}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t('addDesignation')}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <ImageIcon className="size-3.5" />
              {t('coverHint')}
            </span>
            <span>{t('photoHint')}</span>
          </div>
        </div>
      </div>

      {/* Crop modal */}
      <Dialog
        open={!!cropTarget && !!cropImage}
        onOpenChange={(open) => {
          if (!open) {
            setCropTarget(null);
            setCropImage(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{cropTitle}</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-lg bg-stone-100',
              cropTarget === 'cover' ? 'h-56' : 'h-80',
            )}
          >
            <Cropper
              image={cropImage || ''}
              crop={crop}
              zoom={zoom}
              aspect={cropAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setCroppedAreaPixels(area)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCropTarget(null);
                setCropImage(null);
              }}
              disabled={isUploadingImage}
            >
              {tc('cancel')}
            </Button>
            <Button
              size="sm"
              disabled={isUploadingImage}
              onClick={async () => {
                if (!croppedAreaPixels || !cropImage || !cropTarget) return;

                setIsUploadingImage(true);
                try {
                  const dataUrl = await getCroppedImageDataUrl(cropImage, croppedAreaPixels);
                  const field =
                    cropTarget === 'cover' ? 'cover_image' : 'profile_picture';
                  const file = dataUrlToFile(
                    dataUrl,
                    `${field}-${Date.now()}.png`,
                  );

                  const formData = new FormData();
                  formData.append(field, file);

                  const res = await postFormData({
                    url: '/user/self/update/',
                    data: formData,
                  });

                  if (cropTarget === 'cover') {
                    setCoverPreview(res.cover_image);
                  } else {
                    setProfilePreview(dataUrl);
                  }
                  setCurrentUser((prev) => ({ ...(prev || {}), ...res }));
                  queryClient.invalidateQueries({ queryKey: ['user/self/'] });
                  setCropTarget(null);
                  setCropImage(null);
                  toast.success(
                    cropTarget === 'cover'
                      ? t('coverUpdated')
                      : t('profileUpdated'),
                  );
                } catch (err: unknown) {
                  console.error(err);
                  toast.error(t('uploadFailed'));
                } finally {
                  setIsUploadingImage(false);
                }
              }}
            >
              {isUploadingImage ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : null}
              {isUploadingImage ? tc('uploading') : tc('upload')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SettingsSection title={t('basicInfoTitle')} description={t('basicInfoDescription')}>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">{tc('name')}</Label>
            <Input
              value={currentUser?.name ?? ''}
              onChange={(value) => {
                handleUpdate({
                  target: { name: 'name', value: value.target.value },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              id="name"
              placeholder={t('placeholders.name')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t('designation')}</Label>
            <Input
              onChange={(value) => {
                handleUpdate({
                  target: { name: 'title', value: value.target.value },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              value={currentUser?.title ?? ''}
              id="title"
              placeholder={t('placeholders.designation')}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone_number">{t('phoneNumber')}</Label>
            <Input
              onChange={(value) => {
                handleUpdate({
                  target: { name: 'phone_number', value: value.target.value },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              value={currentUser?.phone_number ?? ''}
              id="phone_number"
              placeholder="01772324838"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{tc('email')}</Label>
            <Input
              disabled
              readOnly
              value={currentUser?.email ?? ''}
              id="email"
              type="email"
              placeholder="jane@focuspilot.io"
            />
            <p className="ml-2 text-xs text-muted-foreground opacity-70">
              {t('emailCannotChange')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('role')}</Label>
            <Input
              disabled
              readOnly
              value={
                user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : ''
              }
              id="role"
              placeholder={t('placeholders.role')}
            />
            <p className="ml-2 text-xs text-muted-foreground opacity-70">
              {t('managedByAdmin')}
            </p>
          </div>
          <div className="flex justify-end sm:col-span-2">
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? tc('saving') : tc('save')}
            </Button>
          </div>
        </form>
      </SettingsSection>
    </>
  );
}
