import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { usePost } from '@/hooks/usePost';

interface AccountData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AccountSetupStepProps {
  data: AccountData;
  onUpdate: (data: AccountData) => void;
  onNext: () => void;
}

const AccountSetupStep = ({ data, onUpdate, onNext }: AccountSetupStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [number, setNumber] = useState('');
  const { mutate } = usePost({
    onSuccess: data => {
      setIsLoading(false);
      setNumber('');
      onNext();
    },
  });

  const handleInputChange = (field: keyof AccountData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const validateForm = () => {
    if (!data.name.trim()) {
      return false;
    }
    if (isNaN(Number(number))) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid name and phone number.',
      });
      return; // ⛔ STOP submission
    }

    setIsLoading(true);

    try {
      await mutate({
        url: '/user/self/update/',
        data: { phone_number: number },
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2 text-team-red" />
          Create Your Account
        </CardTitle>
        <p className="text-sm text-gray-600">Let's start by setting up your administrator account for Focuspilot.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="fullName"
                  type="text"
                  value={data.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="John Smith"
                  className="pl-10"
                  required
                  readOnly
                  disabled
                />
                <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="john@yourclub.com"
                  className="pl-10"
                  required
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div> */}

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative mt-1">
                <Input
                  id="phone"
                  type="tel"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  required
                />
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pl-10"
                  required
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div> */}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-[#111827] text-white" disabled={isLoading}>
              {isLoading ? 'Saving Info...' : 'Update Info & Continue'}
            </Button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSetupStep;
