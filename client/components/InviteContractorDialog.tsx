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
import { Loader2 } from 'lucide-react';

interface InviteContractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (data: ContractorEmailFormData) => void;
  title?: string;
  description?: string;
  projectId?: string | number;
  contractorId?: string | number;
  isSendingEmail?: boolean;
}

export interface ContractorEmailFormData {
  message: string;
}

export function InviteContractorDialog({
  open,
  onOpenChange,
  onSend,
  title = 'Invite Contractor',
  description = 'Send invitation email to contractor',
  projectId,
  contractorId,
  isSendingEmail
}: InviteContractorDialogProps) {
  const [formData, setFormData] = useState<ContractorEmailFormData>({
    message: '',
  });

  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const lastContractorIdRef = useRef<string | number | undefined>(undefined);
  const isUserEditingRef = useRef(false);

  // Reset form data and preview when contractorId changes
  React.useEffect(() => {
    if (contractorId !== lastContractorIdRef.current) {
      setFormData({ message: '' });
      lastContractorIdRef.current = contractorId;
      // Clear the preview container
      const preview = document.getElementById('contractorEmailPreview');
      if (preview) {
        preview.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        `;
      }
    }
  }, [contractorId]);

  React.useEffect(() => {
    if (open && projectId && contractorId && !formData.message) {
      setIsLoadingTemplate(true);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/contractor_portal/fetch-contractor-email-html/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          contractor_id: contractorId,
        }),
      })
        .then(response => {
          if (!response.ok) throw new Error('Template not found');
          return response.text();
        })
        .then(html => {
          setFormData(prev => ({ ...prev, message: html }));
          const preview = document.getElementById('contractorEmailPreview') as HTMLDivElement;
          if (preview) preview.innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading email template:', error);
          // Fallback to default template
          const defaultTemplate = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #111827 0%, #1F1D1A 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0;">Welcome to Focuspilot Contractor Portal!</h1>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 8px 0 0;">Access your project information</p>
              </div>
              <div style="padding: 40px; background: white;">
                <h2 style="color: #111827; margin: 0 0 16px;">Hello,</h2>
                <p style="color: #374151; line-height: 1.7;">You have been invited to the contractor portal!</p>
              </div>
            </div>
          `;
          setFormData(prev => ({ ...prev, message: defaultTemplate }));
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
  }, [open, projectId, contractorId, formData.message]);

  const handleSend = () => {
    if (!formData.message) {
      return;
    }

    onSend?.(formData);
  };

  const handleClose = () => {
    setFormData({
      message: '',
    });
    onOpenChange(false);
  };

  // Update preview container when formData.message changes (only if not user editing)
  React.useEffect(() => {
    if (!open || !formData.message || isUserEditingRef.current) return;

    const preview = document.getElementById('contractorEmailPreview');
    if (preview) {
      preview.innerHTML = formData.message;
    }
  }, [open, formData.message]);

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
          {/* HTML Template Visual Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Email Template Preview
              </Label>
            </div>

            {/* Preview Container */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <div
                id='contractorEmailPreview'
                ref={previewRef}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onFocus={() => {
                  isUserEditingRef.current = true;
                }}
                onBlur={() => {
                  isUserEditingRef.current = false;
                }}
                onInput={(e) => {
                  const target = e.target as HTMLDivElement;
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
    </Dialog>
  );
}
