'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2, Search, Users } from 'lucide-react';
import { TypeChip } from '@/components/chip';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';


interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (data: EmailFormData) => void;
  title?: string;
  description?: string;
  projectId?: string | number;
  clientId?: string | number;
  isSendingEmail?: boolean;
}

export interface EmailFormData {
  cc: any[];
  bcc: any[];
  message: string;
}

export function InviteClientDialog({
  open,
  onOpenChange,
  onSend,
  title = 'Invite Client',
  description = 'Send invitation email to client',
  projectId,
  clientId,
  isSendingEmail
}: SendEmailDialogProps) {
  const { user } = useUser();
  const { data: usersData } = useFetch(`user/studio-users?studio_id=${user?.studio?.id}`);

  const [formData, setFormData] = useState<EmailFormData>({
    cc: [],
    bcc: [],
    message: '',
  });

  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const isInternalUpdate = React.useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);


  // Load the client invitation email template
  React.useEffect(() => {
    if (open && !formData.message && projectId && clientId) {
      setIsLoadingTemplate(true);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/client_portal/fetch-client-email-html/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          client_id: clientId,
        }),
      })
        .then(response => {
          if (!response.ok) throw new Error('Template not found');
          return response.text();
        })
        .then(html => {
          setTemplateHtml(html);
          setFormData(prev => ({ ...prev, message: html }));
          const preview = document.getElementById('emailPreview') as HTMLDivElement;
          if (preview) preview.innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading email template:', error);
          // Fallback to default template
          const defaultTemplate = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #111827 0%, #1F1D1A 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0;">Welcome to Focuspilot!</h1>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 8px 0 0;">Get ready for something amazing</p>
              </div>
              <div style="padding: 40px; background: white;">
                <h2 style="color: #111827; margin: 0 0 16px;">Hello,</h2>
                <p style="color: #374151; line-height: 1.7;">You have been invited to join Focuspilot!</p>
              </div>
            </div>
          `;
          setTemplateHtml(defaultTemplate);
          setFormData(prev => ({ ...prev, message: defaultTemplate }));
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
  }, [open, formData.message, projectId, clientId]);

  const handleSend = () => {
    if (!formData.message) {
      return;
    }

    onSend?.(formData);
  };

  const handleClose = () => {
    setFormData({
      cc: [],
      bcc: [],
      message: '',
    });
    onOpenChange(false);
  };

  function initialsOf(name: string): string {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }

  function toggleBccMember(member: any) {
    setFormData(prev => {
      const alreadySelected = prev.bcc.some((a: any) => a.id === member.id);

      return {
        ...prev,
        bcc: alreadySelected
          ? prev.bcc.filter((a: any) => a.id !== member.id)
          : [...prev.bcc, member],
      };
    });
  }

  function BccMultiSelect({ users }: { users: any[] }) {
    const [openPop, setOpenPop] = React.useState(false);

    const selected = React.useMemo(() => {
      if (!formData?.bcc || !users) return [];
      return formData.bcc
        .map((a: any) => {
          if (typeof a === 'object' && a.id) return a;
          if (typeof a === 'number') return users.find((u: any) => u.id === a);
          return null;
        })
        .filter(Boolean);
    }, [formData?.bcc, users]);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={openPop} onOpenChange={setOpenPop}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openPop}
                className="w-full justify-between bg-white h-10 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <span className="flex items-center gap-2 overflow-hidden">
                  {selected?.length > 0 ? (
                    <>
                      <div className="flex -space-x-2">
                        {selected.slice(0, 4).map((m: any) => (
                          <Avatar key={m.id} className="h-6 w-6 ring-2 ring-white">
                            <AvatarImage src={(m as any).photoURL || ''} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="truncate text-sm text-gray-600">
                        {selected.length} selected
                        {selected.length > 4 ? ' +' + (selected.length - 4) : ''}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-500">
                      <Search className="h-4 w-4" />
                      Search users for CC…
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md" align="start">
              <Command>
                <CommandInput
                  placeholder="Search users…"
                  className="focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
                />
                <CommandEmpty>No users found</CommandEmpty>
                <CommandList className="max-h-64">
                  <CommandGroup>
                    {users?.map(m => {
                      const checked = formData?.bcc?.some((a: any) =>
                        typeof a === 'number' ? a === m.id : a.id === m.id
                      );
                      return (
                        <CommandItem key={m.id} value={m.name} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleBccMember(m)}
                            className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.photoURL || ''} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{m.name}</span>
                          {checked && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selected?.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setFormData(prev => ({
                  ...prev,
                  bcc: [],
                }))
              }
            >
              Clear
            </Button>
          )}
        </div>

        {formData?.bcc?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected?.map((m: any) => (
              <span key={m.id} onClick={() => toggleBccMember(m)}>
                <TypeChip label={m.name} className="cursor-pointer" />
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Update preview container when message changes
  React.useEffect(() => {
    if (!open) return;
    setFormData((prev) => ({
      ...prev,
      cc: [],
      bcc: [],
    }))

    setTimeout(() => {
      const preview = document.getElementById('emailPreview');
      if (preview && formData.message) {
        preview.innerHTML = formData.message;
      }
    }, 1000)
  }, [open]);

  // React.useEffect(() => {
  //   console.log('Full HTML Content:', formData.message);
  // }, [open]);

  // console.log({ formData: formData.message });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[calc(100vh-50px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* CC Field - Multi-Select */}
          {/* <div className="space-y-2">
            <Label htmlFor="cc" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              CC
            </Label>
            <BccMultiSelect users={usersData || []} />
          </div> */}

          {/* HTML Template Visual Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Email Template Preview
              </Label>
            </div>

            {/* Preview Container */}
            <div className="" id='something'></div>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">

              <div
                id='emailPreview'
                ref={previewRef}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onInput={(e) => {
                  const target = e.target as HTMLDivElement;
                  isInternalUpdate.current = true; // Mark as internal update
                  setFormData(prev => ({ ...prev, message: target.innerHTML }));
                }}
                className="min-h-[500px] max-h-[600px] overflow-y-auto p-0 focus:outline-none focus:ring-2 focus:ring-gray-900 flex items-center justify-center h-full pt-[160px]"
                style={{
                  lineHeight: '1.6',
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Click inside to edit the template content
              </span>
            </div>
          </div>


        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-gray-300 hover:bg-stone-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!formData.message || isSendingEmail}
            className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSendingEmail ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
