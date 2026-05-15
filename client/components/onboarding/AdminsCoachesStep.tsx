import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Plus, Trash2, ArrowRight, Mail, Loader2 } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { gooeyToast as toast } from 'goey-toast';

interface Admin {
  name: string;
  email: string;
  role: 'admin' | 'coach';
}

interface AdminsCoachesStepProps {
  data: Admin[];
  onUpdate: (data: Admin[]) => void;
  onNext: () => void;
  onSkip: () => void;
}

const AdminsCoachesStep = ({ data, onUpdate, onNext, onSkip }: AdminsCoachesStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<Admin[]>([]);
  const [newAdmin, setNewAdmin] = useState<Admin>({
    name: '',
    email: '',
  });
  const {mutate} = usePost({
    onSuccess: () => {
      setInvitedMembers((prev) => [...prev, { ...newAdmin }]);
      setNewAdmin({ name: '', email: '' });
      setIsLoading(false);
      toast.success('Member invited successfully');
    },
    onError: () => {
      setIsLoading(false);
      toast.error('Failed to invite member');
    }
  })

  const addAdmin = () => {
    setIsLoading(true);
    if (newAdmin.name.trim() && newAdmin.email.trim() && newAdmin.email.includes('@')) {
      mutate({
        url: '/user/invite/',
        data: {email: newAdmin.email},
      });
      // setNewAdmin({ name: '', email: '' }); // Moved to onSuccess
    }
  };

  const removeAdmin = (index: number) => {
    // const updated = data.filter((_, i) => i !== index);
    // onUpdate(updated);
    setInvitedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'coach':
        return 'Coach';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'coach':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-stone-100 text-gray-800';
    }
  };

  return (
    <Card className="border-0 mt-[120px] shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-team-red" />
          Invite Studio Members
        </CardTitle>
        <p className="text-sm text-gray-600">
          Invite other administrators and coaches to help manage your studio. They'll receive email invitations.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing admins */}
        {invitedMembers.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Invited Members</h4>
            {invitedMembers.map((admin, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{admin.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {admin.email}
                  </p>
                </div>
                {/* <Button variant="ghost" size="sm" onClick={() => removeAdmin(index)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button> */}
              </div>
            ))}
          </div>
        )}

        {/* Add new admin */}
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium text-sm mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                value={newAdmin.name}
                onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Sarah Johnson"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Email Address</Label>
              <Input
                type="email"
                value={newAdmin.email}
                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="sarah@example.com"
                className="mt-1"
              />
            </div>
{/* 
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Role</Label>
              <Select value={newAdmin.role} onValueChange={(value: 'admin' | 'coach') => setNewAdmin({ ...newAdmin, role: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {newAdmin.role === 'admin'
                  ? 'Full access to all club features and settings'
                  : 'Access to assigned teams, scheduling, and messaging'}
              </p>
            </div> */}
          </div>
<Button
  onClick={addAdmin}
  className="mt-3 w-full transition-all"
  variant="outline"
  disabled={
    isLoading ||
    !newAdmin.name.trim() ||
    !newAdmin.email.trim() ||
    !newAdmin.email.includes('@')
  }
>
  {isLoading ? (
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  ) : (
    <Plus className="w-4 h-4 mr-2" />
  )}
  {isLoading ? "Inviting..." : "Invite Member"}
</Button>

        </div>

        {invitedMembers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can modify the member role once they accept the invitation.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onSkip}>
            Skip for Now
          </Button>

          <Button onClick={onNext}  className="bg-[#111827] text-white flex items-center" >
                       Continue <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminsCoachesStep;
