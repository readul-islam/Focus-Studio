'use client';

import React, { useState, useRef } from 'react';
import { emailHeaderInnerHtml } from '@/lib/email-brand';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2, Search, Users, Paperclip, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TypeChip } from '@/components/chip';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (data: EmailFormData) => void;
  title?: string;
  description?: string;
  selectedItem?: any;
  isSendingEmail?: boolean;
}

export interface EmailFormData {
  sentTo: string;
  bcc: any[];
  message: string;
  attachments?: File[];
}

const SENT_TO_OPTIONS = [
  { value: 'client_address', label: 'Client Address' },
  { value: 'logistics_address', label: 'Logistic Address' },
  { value: 'delivery_address', label: 'Delivery Address' },
];

export function SendEmailDialog({
  open,
  onOpenChange,
  onSend,
  title = 'Send Email',
  description = 'Compose and send an email',
  selectedItem,
  isSendingEmail,
}: SendEmailDialogProps) {
  const { user } = useUser();
  const { data: usersData } = useFetch(`user/studio-users?studio_id=${user?.studio?.id}`);
  const { data: addressData } = useFetch(`finance/purchase-orders/${selectedItem?.id}/get-addresses/`, { enabled: !!selectedItem?.id });

  const [formData, setFormData] = useState<EmailFormData>({
    sentTo: '',
    bcc: [],
    message: '',
    attachments: [],
  });

  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const isInternalUpdate = React.useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load the welcome email template
  // Note: Using native fetch for HTML files (useFetch is for JSON API responses)
  React.useEffect(() => {
    if (open && !formData.message) {
      setIsLoadingTemplate(true);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/finance/purchase-orders/${selectedItem.id}/fetch-template/`, {
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) throw new Error('Template not found');
          return response.text();
        })
        .then(html => {
          setTemplateHtml(html);
          setFormData(prev => ({ ...prev, message: html }));
          // console.log(html)
          const preview = document.getElementById('emailPreview') as HTMLDivElement;
          preview.innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading email template:', error);
          // Fallback to default template
          const defaultTemplate = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #111827 0%, #1F1D1A 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                ${emailHeaderInnerHtml({ title: 'Welcome to Focuspilot!', subtitle: 'Get ready for something amazing ✨', align: 'center' })}
              </div>
              <div style="padding: 40px; background: white;">
                <h2 style="color: #111827; margin: 0 0 16px;">Hello [Name],</h2>
                <p style="color: #374151; line-height: 1.7;">Thank you for registering with Focuspilot!</p>
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
  }, [open, formData.message]);

  function formatAddress(addr: any): string {
    if (!addr) return '';
    const line1 = addr.address_line_1 || addr.address_line_2 || '';
    const parts = [line1, addr.city, addr.county, addr.postcode, addr.country];
    return parts.filter(Boolean).join(', ') + (parts.some(Boolean) ? '.' : '');
  }

  // Update template when address selection changes
  React.useEffect(() => {
    if (templateHtml && formData.sentTo && selectedItem) {
      let deliveryAddress = '';

      // Get the appropriate address based on selection
      switch (formData.sentTo) {
        case 'client_address':
          deliveryAddress = formatAddress((addressData as any)?.client_address);
          break;
        case 'logistics_address':
          deliveryAddress = formatAddress((addressData as any)?.logistics_address);
          break;
        case 'delivery_address':
          deliveryAddress = formatAddress((addressData as any)?.delivery_address);
          break;
        default:
          deliveryAddress = '';
      }

      // Update the template HTML with the delivery address
      const updatedHtml = templateHtml.replace(/Delivery Address:[\s\S]*?(<\/p>|<\/div>)/i, `Delivery Address: ${deliveryAddress}$1`);

      // console.log({ updatedHtml })
      // setTemplateHtml(updatedHtml);
      setFormData(prev => ({ ...prev, message: updatedHtml }));

      // Update the DOM directly for visual feedback
      setTimeout(() => {
        const targetAddress = document.querySelector('#emailPreview .details') as HTMLDivElement;
        const lastP = targetAddress?.querySelector('p:last-child');

        if (lastP) {
          lastP.innerHTML = `<strong>Delivery Address:</strong> ${deliveryAddress}`;

          // Wait a bit more for DOM to fully update, then capture
          setTimeout(() => {
            const preview = document.getElementById('emailPreview') as HTMLDivElement;
            if (preview) {
              const updatedFullHtml = preview.innerHTML;
              // console.log({ updatedFullHtml })
              setFormData(prev => ({ ...prev, message: updatedFullHtml }));
            }
          }, 50);
        }
      }, 100);
    }
  }, [formData.sentTo, selectedItem, templateHtml, addressData]);

  const handleSend = () => {
    if (!formData.sentTo || !formData.message) {
      return;
    }

    onSend?.(formData);
    // if (!isSendingEmail) {
    //   handleClose();
    // }
  };

  const handleClose = () => {
    setFormData({
      sentTo: '',
      bcc: [],
      message: '',
      attachments: [],
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
        bcc: alreadySelected ? prev.bcc.filter((a: any) => a.id !== member.id) : [...prev.bcc, member],
      };
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newFiles],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index),
    }));
  };

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
                      Search users for BCC…
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
                      const checked = formData?.bcc?.some((a: any) => (typeof a === 'number' ? a === m.id : a.id === m.id));
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
    setFormData(prev => ({
      ...prev,
      bcc: [],
      sentTo: '',
      attachments: [],
    }));
    // const preview = document.getElementById('something');

    setTimeout(() => {
      // console.log(previewRef.current)
      const preview = document.getElementById('emailPreview');
      if (preview && formData.message) {
        preview.innerHTML = formData.message;
      }
    }, 1000);
  }, [open]);

  // React.useEffect(() => {
  //   console.log('Full HTML Content:', formData.message);
  // }, [open]);

  // console.log({ formData: formData.message });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[calc(100vh-50px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sent To Field */}
          <div className="space-y-2">
            <Label htmlFor="sentTo" className="text-sm font-medium text-gray-700">
              Address
            </Label>
            <Select value={formData.sentTo} onValueChange={value => setFormData(prev => ({ ...prev, sentTo: value }))}>
              <SelectTrigger
                id="sentTo"
                className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <SelectValue placeholder="Select recipient..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {SENT_TO_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="focus:bg-stone-100">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* BCC Field - Multi-Select */}
          <div className="space-y-2">
            <Label htmlFor="bcc" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              CC
            </Label>
            <BccMultiSelect users={usersData || []} />
          </div>

          {/* Attachments Field */}
          <div className="space-y-2">
            <Label htmlFor="attachments" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments
            </Label>
            <div className="grid w-full items-center gap-1.5">
              <Input id="attachments" type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
            </div>
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full text-xs">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HTML Template Visual Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Email Template Preview</Label>
            </div>

            {/* Preview Container */}
            <div className="" id="something"></div>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <div
                id="emailPreview"
                ref={previewRef}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onInput={e => {
                  const target = e.target as HTMLDivElement;
                  isInternalUpdate.current = true; // Mark as internal update
                  setFormData(prev => ({ ...prev, message: target.innerHTML }));
                }}
                className="min-h-[500px] max-h-[600px] overflow-y-auto p-0 focus:outline-none focus:ring-2 focus:ring-gray-900 flex items-center justify-center h-full"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Click inside to edit the template content
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} className="border-gray-300 hover:bg-stone-50">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!formData.sentTo || !formData.message || isSendingEmail}
            className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
