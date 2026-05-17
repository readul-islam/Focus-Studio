'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, UploadCloud, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { SettingsPageHeader } from '@/components/settings/page-header';
import { SettingsSection } from '@/components/settings/section';
import { useEffect, useState } from 'react';
import { postData, postFormData } from '@/lib/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useUser from '@/hooks/useUser';
import Link from 'next/link';

interface UserData {
  id?: number;
  email?: string;
  name?: string;
  phone_number?: string;
  photoURL?: string;
  profile_picture?: string;
  title?: string;
}

export default function UserProfilePage() {
  const { user, isLoading } = useUser();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    setCurrentUser(user);
  }, [user?.email, isLoading]);
  

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
      toast.success('Profile Updated');
    },
    onError: error => {

      toast.error('Error! Try again');
    },
  });

  const handleUpdate = e => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  

  // validation extracted into a helper
  const validateImageFile = (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowed.includes(file.type)) return { ok: false, message: 'Unsupported file type. Use PNG, JPG or WEBP.' };
    if (file.size > maxSize) return { ok: false, message: 'File too large. Maximum 5MB.' };
    return { ok: true };
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area) => {
    const createImage = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', error => reject(error));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url;
      });

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

    return canvas.toDataURL('image/png');
  };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.name?.trim()) {
      toast.error('Name is required');
      return;
    }

    mutation.mutate(currentUser as UserData);
  }

  return (
    <>
      <SettingsPageHeader title="Profile" description="Update your personal information." />

      {/* Profile Picture Upload Section (modern minimal) */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="relative w-28 h-28 group"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (!file) return;
            const v = validateImageFile(file);
            if (!v.ok) return toast.error(v.message);
            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onload = ev => {
              const url = ev.target?.result as string;
              setProfilePic(url);
              setTimeout(() => setShowCrop(true), 50);
            };
            reader.readAsDataURL(file);
          }}
        >
          <div className="absolute inset-0 rounded-full p-0.5 bg-gradient-to-tr from-indigo-400 via-sky-400 to-emerald-400 shadow-md"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border">
            {profilePic ? (
              <img src={profilePic} alt="Profile preview" className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="text-2xl bg-stone-100">
                      {user?.name?.slice(0, 1)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}

            <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
              <label className=" inline-flex items-center gap-2 bg-black/80 backdrop-blur-sm text-[10px] text-white px-9 py-1.5 cursor-pointer shadow">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const v = validateImageFile(file);
                    if (!v.ok) return toast.error(v.message);

                    setProfilePicFile(file);
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const url = ev.target?.result as string;
                      setProfilePic(url);
                      setTimeout(() => setShowCrop(true), 50);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                Change
              </label>
            </div>
          </div>

          {(profilePic || user?.profile_picture) && (
            <button
              type="button"
              onClick={async () => {
                if (profilePic && !user?.profile_picture) {
                  // Just clearing local preview before upload
                  setProfilePic(null);
                  setProfilePicFile(null);
                } else {
                  // Remove from server
                  try {
                    await postData({
                      url: '/user/self/update/',
                      data: { profile_picture: null },
                    });
                    setProfilePic(null);
                    setProfilePicFile(null);
                    queryClient.invalidateQueries({ queryKey: ['user/self/'] });
                    toast.success('Profile picture removed');
                  } catch {
                    toast.error('Failed to remove profile picture');
                  }
                }
              }}
              aria-label="Remove profile picture"
              className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>

        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-900">Profile photo</div>
          <div className="text-xs text-gray-500">PNG, JPG up to 5MB · Recommended 400×400px</div>
        </div>
      </div>

      {/* Crop Modal (react-easy-crop) */}
      <Dialog open={showCrop && !!profilePic} onOpenChange={(open) => !open && setShowCrop(false)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Crop profile photo</DialogTitle>
          </DialogHeader>
          <div className="w-full h-80 bg-stone-100 rounded-lg overflow-hidden relative">
            <Cropper
              image={profilePic || ''}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={c => setCrop(c)}
              onZoomChange={z => setZoom(z)}
              onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Slider min={1} max={3} step={0.01} value={[zoom]} onValueChange={val => setZoom(val[0])} className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => setShowCrop(false)} disabled={isUploadingPhoto}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isUploadingPhoto}
              onClick={async () => {
                if (!croppedAreaPixels || !profilePic) return;

                setIsUploadingPhoto(true);
                try {
                  const dataUrl = await getCroppedImg(profilePic, croppedAreaPixels);

                  const dataURLToFile = (dataurl: string, filename: string) => {
                    const arr = dataurl.split(',');
                    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                      u8arr[n] = bstr.charCodeAt(n);
                    }
                    return new File([u8arr], filename, { type: mime });
                  };

                  const fileToUpload = dataURLToFile(dataUrl, `profile-${Date.now()}.png`);

                  const formData = new FormData();
                  formData.append('profile_picture', fileToUpload);

                  const res = await postFormData({
                    url: '/user/self/update/',
                    data: formData,
                  });

                  setProfilePic(dataUrl);
                  setCurrentUser(prev => ({ ...(prev || {}), profile_picture: res.profile_picture }));
                  queryClient.invalidateQueries({ queryKey: ['user/self/'] });
                  setShowCrop(false);
                  toast.success('Profile picture updated!');
                } catch (err: any) {
                  console.error(err);
                  toast.error(err?.message || 'Could not upload the image');
                } finally {
                  setIsUploadingPhoto(false);
                }
              }}
            >
              {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {isUploadingPhoto ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SettingsSection title="Basic information" description="This will be visible to your team.">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => handleSubmit(e)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              value={currentUser?.name}
              onChange={value => {
                const e = {
                  target: {
                    name: 'name',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              id="name"
              placeholder="Jane Designer"
            />
          </div>
              <div className="space-y-2">
            <Label htmlFor="title">Designation</Label>
            <Input
              onChange={value => {
                const e = {
                  target: {
                    name: 'title',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              value={currentUser?.title}
              id="title"
              placeholder="Designer"
            />
          </div>
          <div className="space-y-2 md:col-span-2 ">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              onChange={value => {
                const e = {
                  target: {
                    name: 'phone_number',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              value={currentUser?.phone_number}
              id="phone_number"
              placeholder="01772324838"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input disabled readOnly value={currentUser?.email} id="email" type="email" placeholder="jane@focuspilot.io" />
            <p className="text-xs ml-2 opacity-70 text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input disabled readOnly value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} id="role" placeholder="Member" />
            <p className="text-xs ml-2 opacity-70 text-muted-foreground">Managed by your studio admin</p>
          </div>
            <div className="sm:col-span-2 flex justify-end">
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </SettingsSection>
      
    </>
  );
}
