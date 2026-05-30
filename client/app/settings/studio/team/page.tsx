'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsPageHeader } from '@/components/settings/page-header';
import { SettingsSection } from '@/components/settings/section';
// import { StatusBadge } from '@/components/chip';
// import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { gooeyToast as toast } from 'goey-toast';
// import { Check } from 'lucide-react';
import { DeleteDialog } from '@/components/DeleteDialog';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { usePost } from '@/hooks/usePost';
import usePatch from '@/hooks/usePatch';
import { useQueryClient } from '@tanstack/react-query';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';

type Member = {
  id: string | number;
  name: string;
  email: string;
  title?: string;
  role?: 'admin' | 'manager' | 'member';
  status?: 'Active' | 'Pending';
  photoURL?: string;
  pay_per_hour?: number;
};

type WageType = 'Hourly' | 'Monthly' | 'Annual';

function TeamPageContent() {
  const t = useTranslations('settingsTeamPage');
  const tc = useTranslations('common');
  const { user, isLoading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const {can} = usePermissions()
  const teamsDeletePermission = can('team.delete')
  const [showAddMemberPopover, setShowAddMemberPopover] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [selectedTeammates, setSelectedTeammates] = useState<Member[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  // Track wage type and amount for each member
  const [wageTypes, setWageTypes] = useState<Record<string | number, WageType>>({});
  const [wageAmounts, setWageAmounts] = useState<Record<string | number, string>>({});
  // const { data: membersData = [], isLoading: membersLoading } = useFetch(`/user/studio-users/?studio_id=${user?.studio?.id}`)
  const { data: membersData = [], isLoading: membersLoading } = useFetch(`user/studio/members/`)

  // console.log(membersData)

  const { mutate: changeRole } = usePatch({
    onSuccess: () => {
      toast.success(t('toasts.roleUpdated'));
      queryClient.refetchQueries({ queryKey: ['user/studio/members/'] });
    },
    onError: () => toast.error(t('toasts.roleUpdateFailed')),
  });

  const { mutate: inviteUser, isPending: isInviting } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.invitationSent'));
      setShowAddMemberPopover(false);
      setEmailInput('');
      setInviteRole('member');
      queryClient.refetchQueries({ queryKey: ['user/studio/members/'] });
      // queryClient.invalidateQueries(['studio-users']); // If we had a query key for useFetch, we could invalidate it. 
      // Since useFetch might not use react-query cache in the same way or we don't know the key easily, we might depend on revalidation or just manual update if needed.
      // For now, assuming page reload or manual refetch if useFetch exposes it.
      // useFetch usually returns a mutate/refetch function? The current signature `const { data ... } = useFetch` doesn't show it.
      // We will leave it as is.
    },
    onError: (error) => {

      toast.error(t('toasts.invitationFailed'));
    },
  });

  const { mutate: deleteMember, isPending: isDeleting } = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['user/studio/members/'] });
      setIsDeleteOpen(false);
      toast.info(t('toasts.memberDeleted'));
    },
    onError: () => {
      toast(t('toasts.deleteFailed'));
    },
  });

  const { mutate: updatePayPerHour } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.payRateUpdated'));
      queryClient.refetchQueries({ queryKey: ['user/studio/members/'] });
    },
    onError: () => {
      toast.error(t('toasts.payRateUpdateFailed'));
    },
  });

  const handleInvite = () => {
    if (emailInput && emailInput.includes('@')) {
      inviteUser({ url: '/user/invite/', data: { email: emailInput, role: inviteRole } });
    } else {
      toast.error(t('toasts.invalidEmail'));
    }
  };

  // Resend invite mutation
  // const resendInviteMutation = useMutation({
  //   mutationFn: (userId: string) => resendInvite(userId),
  //   onSuccess: () => {
  //     toast.success('Invitation resent successfully');
  //   },
  //   onError: error => {
  //     console.error(error);
  //     toast.error('Failed to resend invitation');
  //   },
  // });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const openDeleteModal = member => {
    setIsDeleteOpen(true);
    setSelectedTeamMember(member);
  };

  const handleDelete = id => {
    if (!teamsDeletePermission) {
      toast.error(t('toasts.noDeletePermission'));
      return;
    }
    if (!id) return;
    deleteMember({ url: 'user/studio/members/', data: { user_id: id } });
  };

  // Get wage type for a member (default to Hourly if they have a pay_per_hour value)
  const getWageType = (memberId: string | number): WageType => {
    if (wageTypes[memberId]) return wageTypes[memberId];
    return 'Hourly';
  };

  // Get wage amount for a member
  const getWageAmount = (member: Member): string => {
    if (wageAmounts[member.id] !== undefined) return wageAmounts[member.id];
    return member.pay_per_hour ? String(member.pay_per_hour) : '';
  };

  // Calculate hourly rate based on wage type and amount
  const calculateHourlyRate = (wageType: WageType, amount: number): number => {
    if (wageType === 'Hourly') return amount;
    if (wageType === 'Monthly') return amount / 173; // 173 hrs/month standard
    if (wageType === 'Annual') return amount / 2080; // 2080 hrs/year standard
    return amount;
  };

  // Get display hint for monthly/annual selections
  const getHourlyHint = (wageType: WageType, amount: string, currencyCode: string | undefined): string | null => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || wageType === 'Hourly') return null;

    const hourlyRate = calculateHourlyRate(wageType, numAmount);
    const symbol = getCurrencySymbol(currencyCode);
    return t('hourlyHint', { symbol, rate: hourlyRate.toFixed(2) });
  };

  // Import getCurrencySymbol helper
  const getCurrencySymbol = (code: string | undefined | null): string => {
    // This is a simple helper - you might want to use the actual getCurrencySymbol from your lib
    const symbols: Record<string, string> = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€',
    };
    return symbols[code || ''] || '$';
  };

  // Handle wage type change
  const handleWageTypeChange = (memberId: string | number, newType: WageType) => {
    setWageTypes(prev => ({ ...prev, [memberId]: newType }));
  };

  // Handle wage amount change
  const handleWageAmountChange = (memberId: string | number, value: string) => {
    setWageAmounts(prev => ({ ...prev, [memberId]: value }));
  };

  // Handle save (on blur or explicit save)
  const handleSavePayRate = (member: Member) => {
    const wageType = getWageType(member.id);
    const amount = parseFloat(getWageAmount(member)) || 0;

    if (amount === 0) return;

    const hourlyRate = calculateHourlyRate(wageType, amount);

    updatePayPerHour({
      url: '/user/update-pay-per-hour/',
      data: {
        user_id: member.id,
        pay_per_hour: hourlyRate
      }
    });
  };

  if (userLoading || membersLoading) {
    return <div>{tc('loading')}</div>;
  }

  const wageTypeLabel = (type: WageType) => {
    if (type === 'Hourly') return t('wageTypes.hourly');
    if (type === 'Monthly') return t('wageTypes.monthly');
    return t('wageTypes.annual');
  };

  return (
    <>
      <SettingsPageHeader title={t('title')} description={t('description')} />

      <SettingsSection
        title={t('membersTitle')}
        description={t('membersDescription')}
        action={
          <div className="relative">
            <Button
              size="sm"
              className="bg-clay-600 text-white hover:bg-clay-700"
              onClick={() => setShowAddMemberPopover(!showAddMemberPopover)}
            // disabled={inviteMutation.isLoading}
            >
              {t('addMember')}
            </Button>
            {showAddMemberPopover && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">{t('inviteTitle')}</h3>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('emailAddress')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInvite();
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleInvite}
                        disabled={isInviting}
                        className="bg-clay-600 text-white hover:bg-clay-700">
                        {isInviting ? t('sending') : t('invite')}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('role')}
                    </label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'manager' | 'member')}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                        <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                        <SelectItem value="member">{t('roles.member')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          {/* Desktop / tablet: proper table */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-stone-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-[240px]">{t('table.member')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-[130px]">{t('table.role')}</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground w-[100px]">{t('table.status')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('table.payRate')}</th>
                {teamsDeletePermission && <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground w-[90px]">{t('table.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membersData?.map((m: Member) => {
                const wageType = getWageType(m.id);
                const wageAmount = getWageAmount(m);
                const hint = getHourlyHint(wageType, wageAmount, user?.studio?.default_currency);
                return (
                  <tr key={m.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={m?.photoURL} alt={m?.name} />
                          <AvatarFallback className="text-xs">{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{m.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user?.role === 'admin' && m.id !== user?.id ? (
                        <Select value={m.role} onValueChange={(newRole) => changeRole({ url: 'user/studio/members/', data: { user_id: m.id, role: newRole } })}>
                          <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                            <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                            <SelectItem value="member">{t('roles.member')}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-gray-600 capitalize">{m.role || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500 capitalize">{m.status || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="flex border border-gray-200 rounded-md overflow-hidden">
                            {(['Hourly', 'Monthly', 'Annual'] as WageType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleWageTypeChange(m.id, type)}
                                className={`px-2 py-1 text-xs font-medium transition-colors ${wageType === type ? 'bg-clay-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} ${type !== 'Hourly' ? 'border-l border-gray-200' : ''}`}
                              >
                                {wageTypeLabel(type)}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <ViewCurrencySymbol code={user?.studio?.default_currency} />
                            <Input
                              type="number"
                              value={wageAmount}
                              onChange={(e) => handleWageAmountChange(m.id, e.target.value)}
                              onBlur={() => handleSavePayRate(m)}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                              placeholder="0"
                              className="h-8 w-20 text-sm text-center px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                        {hint && <div className="text-xs text-gray-500">{hint}</div>}
                      </div>
                    </td>
                    {teamsDeletePermission && (
                      <td className="px-4 py-3 text-right">
                        <Button disabled={!teamsDeletePermission} variant="ghost" size="sm" onClick={() => openDeleteModal(m)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          {t('remove')}
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile: card list */}
          <ul className="md:hidden divide-y divide-gray-100">
            {membersData?.map((m: Member) => {
              const wageType = getWageType(m.id);
              const wageAmount = getWageAmount(m);
              const hint = getHourlyHint(wageType, wageAmount, user?.studio?.default_currency);
              return (
                <li key={m.id} className="bg-white px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={m?.photoURL} alt={m?.name} />
                        <AvatarFallback className="text-xs">{getInitials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{m.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 capitalize">{m.status || '-'}</span>
                      {user?.role === 'admin' && m.id !== user?.id ? (
                        <Select value={m.role} onValueChange={(newRole) => changeRole({ url: 'user/studio/members/', data: { user_id: m.id, role: newRole } })}>
                          <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                            <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                            <SelectItem value="member">{t('roles.member')}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-gray-600 capitalize">{m.role || '-'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="flex border border-gray-200 rounded-md overflow-hidden">
                          {(['Hourly', 'Monthly', 'Annual'] as WageType[]).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleWageTypeChange(m.id, type)}
                              className={`px-2 py-1 text-xs font-medium transition-colors ${wageType === type ? 'bg-clay-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} ${type !== 'Hourly' ? 'border-l border-gray-200' : ''}`}
                            >
                              {wageTypeLabel(type)}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <ViewCurrencySymbol code={user?.studio?.default_currency} />
                          <Input
                            type="number"
                            value={wageAmount}
                            onChange={(e) => handleWageAmountChange(m.id, e.target.value)}
                            onBlur={() => handleSavePayRate(m)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                            placeholder="0"
                            className="h-8 w-20 text-sm text-center px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      {hint && <div className="text-xs text-gray-500">{hint}</div>}
                    </div>
                    {teamsDeletePermission && (
                      <Button disabled={!teamsDeletePermission} variant="ghost" size="sm" onClick={() => openDeleteModal(m)} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                        {t('remove')}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => handleDelete(selectedTeamMember?.id)}
            title={t('removeMemberTitle')}
            confirmText={t('remove')}
            description={t('removeMemberDescription', { name: selectedTeamMember?.name ?? '' })}
            itemName={selectedTeamMember?.name}
            requireConfirmation={true} // 👈 disables the typing step
          />
        </div>
      </SettingsSection>

      {/* Backdrop for closing popover when clicking outside */}
      {showAddMemberPopover && <div className="fixed inset-0 z-0" onClick={() => setShowAddMemberPopover(false)} />}
    </>
  );
}

export default function TeamPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <TeamPageContent />
    </PermissionGuard>
  );
}
