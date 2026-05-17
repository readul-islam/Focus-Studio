import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Upload, Mail, Phone, ArrowRight, MapPinHouse, Link, Check, Copy } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { toast } from '@/components/ui/use-toast';

interface ClubInfoStepProps {
  phone: string;
  onNext: () => void;
  onSkip: () => void;
}

const ClubInfoStep = ({ phone, onNext, onSkip }: ClubInfoStepProps) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    contactEmail: '',
    phone: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://app.example.com/invite/111';

  const { mutate } = usePost({
    onSuccess: () => {
      setIsLoading(false);
      onNext();
    },
  });

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Error', description: 'Logo must be less than 2MB', variant: 'destructive' });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = event => {
        setForm(prev => ({ ...prev, logo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Studio Name is required.', variant: 'destructive' });
      return false;
    }
    if (!form.address.trim()) {
      toast({ title: 'Error', description: 'Studio Address is required.', variant: 'destructive' });
      return false;
    }
    if (!form.contactEmail.trim()) {
      toast({ title: 'Error', description: 'Support Email is required.', variant: 'destructive' });
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
      toast({ title: 'Error', description: 'Invalid email address.', variant: 'destructive' });
      return false;
    }
    if (!form.phone.trim()) {
      toast({ title: 'Error', description: 'Phone number is required.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    mutate({
      url: '/user/studios/',
      data: {
        name: form.name,
        address: form.address,
        support_email: form.contactEmail,
        phone_number: form.phone,
      },
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="border-0 mt-[250px] shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2 text-team-red" />
          Studio Info
        </CardTitle>
        <p className="text-sm text-gray-600">Set up your organization basic information. This can be updated later in settings.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Studio Name */}
            <div>
              <Label htmlFor="clubName" className="text-sm font-medium">
                Studio Name
              </Label>
              <Input
                id="clubName"
                type="text"
                value={form.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="eg: Focuspilot"
                className="mt-1"
              />
            </div>

            {/* Studio Logo */}
            <div>
              <Label className="text-sm font-medium">Studio Logo</Label>
              <div className="mt-1 flex items-center space-x-4">
                {form.logo ? (
                  <img src={form.logo} alt="Club logo" className="w-16 h-16 rounded-lg object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center border">
                    <Building className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-stone-50"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Studio Address
              </Label>
              <div className="relative mt-1">
                <Input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder="e.g. 7 Waterhouse Lane, UK"
                  className="pl-10"
                />
                <MapPinHouse className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Support Email */}
            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                Support Email
              </Label>
              <div className="relative mt-1">
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={e => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@org.com"
                  className="pl-10"
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                Studio Phone
              </Label>
              <div className="relative mt-1">
                <Input
                  id="phone"
                  onChange={e => handleInputChange('phone', e.target.value)}
                  type="tel"
                  value={form.phone}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Invite Link */}
            {/* <div>
              <Label htmlFor="inviteLink" className="text-sm mb-2 block font-medium">
                Invite Link
              </Label>
              <div className="bg-[#f2f2f2] border rounded-lg px-4 py-2 flex items-center gap-3 group hover:bg-stone-100 transition-colors">
                <Link className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 flex-1   text-sm truncate">{inviteLink}</span>
                <a
                  onClick={handleCopy}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-stone-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 " />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </a>
              </div>
            </div> */}
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-4">
            {/* <Button type="button" variant="outline" onClick={onSkip}>
              Skip for Now
            </Button> */}
            <Button type="submit" className="bg-[#111827] text-white flex items-center" disabled={isLoading}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClubInfoStep;
