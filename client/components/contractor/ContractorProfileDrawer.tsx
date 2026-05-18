'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, FileText, AlertCircle, Loader2, RefreshCw, Trash2, Copy, Check } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { patchData, patchFormData } from '@/lib/Api';
import { TRADE_OPTIONS } from '@/lib/contractor/types';

interface ContractorProfileDrawerProps {
  contractorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  projectId: string;
}

// Calculate insurance status
function getInsuranceStatus(insurance_expiry?: string): {
  status: 'valid' | 'expiring' | 'expired' | 'not_uploaded';
  color: string;
  dotColor: string;
} {
  if (!insurance_expiry) {
    return {
      status: 'not_uploaded',
      color: 'text-neutral-600',
      dotColor: 'bg-stone-400',
    };
  }

  const expiryDate = new Date(insurance_expiry);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      color: 'text-red-700',
      dotColor: 'bg-red-500',
    };
  }

  if (diffDays < 30) {
    return {
      status: 'expiring',
      color: 'text-amber-700',
      dotColor: 'bg-amber-500',
    };
  }

  return {
    status: 'valid',
    color: 'text-green-700',
    dotColor: 'bg-green-500',
  };
}

export function ContractorProfileDrawer({
  contractorId,
  isOpen,
  onClose,
  onSaved,
  projectId,
}: ContractorProfileDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    company_name: '',
    email: '',
    phone: '',
    trade: '',
    insurance_expiry: '',
    insurance_document: '',
    trade_cert: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  });

  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [tradeCertFile, setTradeCertFile] = useState<File | null>(null);
  const [accessCodeCopied, setAccessCodeCopied] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: profileApi, isLoading, refetch } = useFetch(
    isOpen && contractorId ? `contractor_portal/contractor/${contractorId}/` : null,
    { enabled: isOpen && !!contractorId }
  );

  useEffect(() => {
    if (!profileApi) return;
    const p = profileApi as Record<string, string | null>;
    setFormData({
      name: p.name || '',
      surname: p.surname || '',
      company_name: p.company_name || '',
      email: p.email || '',
      phone: p.phone || '',
      trade: p.trade || '',
      insurance_expiry: p.insurance_expiry || '',
      insurance_document: p.insurance_document || '',
      trade_cert: p.trade_cert || '',
      emergency_contact_name: p.emergency_contact_name || '',
      emergency_contact_phone: p.emergency_contact_phone || '',
      notes: p.notes || '',
    });
    setAccessCode(p.access_code || '');
    setInsuranceFile(null);
    setTradeCertFile(null);
  }, [profileApi]);

  const { mutate: regenerateCode, isPending: isRegenerating } = usePost({
    onSuccess: (data: { access_code?: string }) => {
      setAccessCode(data?.access_code || '');
      toast.success(`New access code: ${data?.access_code || ''}`);
      onSaved?.();
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to regenerate code');
    },
  });

  const { mutate: removeFromProject, isPending: isRemoving } = usePost({
    onSuccess: () => {
      toast.success('Contractor removed from project');
      onSaved?.();
      onClose();
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to remove contractor');
    },
  });

  const handleSave = async () => {
    if (!contractorId) return;
    setIsSaving(true);
    const url = `contractor_portal/contractor/${contractorId}/`;
    try {
      if (insuranceFile || tradeCertFile) {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => fd.append(key, value ?? ''));
        if (insuranceFile) fd.append('insurance_document', insuranceFile);
        if (tradeCertFile) fd.append('trade_cert', tradeCertFile);
        await patchFormData({ url, data: fd });
      } else {
        await patchData({ url, data: formData });
      }
      toast.success('Profile saved');
      refetch();
      onSaved?.();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateAccessCode = () => {
    if (!contractorId) return;
    regenerateCode({
      url: `contractor_portal/contractor/${contractorId}/regenerate-code/`,
      data: {},
    });
  };

  const handleRemoveFromProject = () => {
    if (!contractorId) return;
    if (!confirm('Remove this contractor from the project? They will lose portal access to this project.')) {
      return;
    }
    removeFromProject({
      url: `contractor_portal/contractor/${contractorId}/remove-from-project/`,
      data: { project_id: parseInt(projectId) },
    });
  };

  const handleCopyAccessCode = () => {
    const code = accessCode || '';
    if (code) {
      navigator.clipboard.writeText(code);
      setAccessCodeCopied(true);
      toast.success('Access code copied to clipboard');
      setTimeout(() => setAccessCodeCopied(false), 2000);
    }
  };

  const insuranceStatus = getInsuranceStatus(formData.insurance_expiry);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl z-50 transform transition-transform overflow-y-auto"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Contractor Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
          {!isLoading && (
          <>
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-gray-700">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="surname" className="text-sm text-gray-700">
                Surname
              </Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="border-gray-200"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <Label htmlFor="company_name" className="text-sm text-gray-700">
              Company Name
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="border-gray-200"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-gray-200"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm text-gray-700">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border-gray-200"
            />
          </div>

          {/* Trade */}
          <div className="space-y-1.5">
            <Label htmlFor="trade" className="text-sm text-gray-700">
              Trade <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.trade}
              onValueChange={(value) => setFormData({ ...formData, trade: value })}
            >
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Select trade" />
              </SelectTrigger>
              <SelectContent>
                {TRADE_OPTIONS.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Insurance Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Insurance & Certification</h3>

            {/* Insurance Expiry */}
            <div className="space-y-1.5 mb-4">
              <Label htmlFor="insurance_expiry" className="text-sm text-gray-700">
                Insurance Expiry Date
              </Label>
              <Input
                id="insurance_expiry"
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                className="border-gray-200"
              />
              {formData.insurance_expiry && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${insuranceStatus.dotColor}`} />
                  <span className={`text-xs ${insuranceStatus.color}`}>
                    {insuranceStatus.status === 'valid' && 'Valid'}
                    {insuranceStatus.status === 'expiring' && 'Expiring soon'}
                    {insuranceStatus.status === 'expired' && 'Expired'}
                  </span>
                </div>
              )}
            </div>

            {/* Insurance Document Upload */}
            <div className="space-y-1.5 mb-4">
              <Label className="text-sm text-gray-700">Insurance Document</Label>
              {formData.insurance_document && (
                <div className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-gray-200 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {formData.insurance_document.split('/').pop()}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-200"
                onClick={() => document.getElementById('insurance-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.insurance_document ? 'Replace Document' : 'Upload Document'}
              </Button>
              <input
                id="insurance-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setInsuranceFile(file);
                }}
              />
              <p className="text-xs text-gray-500">PDF or image files only</p>
            </div>

            {/* Trade Certificate Upload */}
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">Trade Certificate</Label>
              {formData.trade_cert && (
                <div className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-gray-200 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {formData.trade_cert.split('/').pop()}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-200"
                onClick={() => document.getElementById('cert-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.trade_cert ? 'Replace Certificate' : 'Upload Certificate'}
              </Button>
              <input
                id="cert-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setTradeCertFile(file);
                }}
              />
              <p className="text-xs text-gray-500">PDF or image files only</p>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Emergency Contact</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_name" className="text-sm text-gray-700">
                  Name
                </Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact_name: e.target.value })
                  }
                  className="border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_phone" className="text-sm text-gray-700">
                  Phone
                </Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact_phone: e.target.value })
                  }
                  className="border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm text-gray-700">
                Notes
              </Label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any additional notes about this contractor..."
              />
            </div>
          </div>

          {/* Access Code Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Access Code</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-stone-50 rounded border border-gray-200 font-mono text-lg text-gray-900">
                {accessCode || 'N/A'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAccessCode}
                className="border-gray-200"
                disabled={!accessCode}
              >
                {accessCodeCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateAccessCode}
                disabled={isRegenerating}
                className="border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This code allows the contractor to access the portal
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-red-200">
            <h3 className="text-sm font-medium text-red-900 mb-2">Danger Zone</h3>
            <Button
              variant="outline"
              onClick={handleRemoveFromProject}
              disabled={isRemoving}
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Project
            </Button>
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-200">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.name || !formData.email || !formData.trade}
            className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
