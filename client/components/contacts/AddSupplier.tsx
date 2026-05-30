'use client';

import { Button } from '@/components/ui/button';
import { gooeyToast as toast } from 'goey-toast';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

const initialValue = {
  name: '',
  company_name: '',
  email: '',
  contact_type: 'SP',
  status: 'NE',
  phone: '',
  surname: '',
  address: '',
};

const AddSupplier = ({
  refetchSupplier,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  renderTrigger = true,
}: {
  refetchSupplier: unknown;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderTrigger?: boolean;
}) => {
  const t = useTranslations('addSupplier');
  const tc = useTranslations('contactFormModal');
  const tCommon = useTranslations('common');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (setControlledOpen) {
      setControlledOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  const queryClient = useQueryClient();
  const { user } = useUser();

  const { mutate: createContact, isPending: isCreating } = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['crm/studio-contacts/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
      toast(t('createdSuccess'));
      setOpen(false);
    },
    onError: () => {
      toast(t('createFailed'));
    },
  });

  const [defaultValue, setDefaultValue] = useState(initialValue);

  const updateTask = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
      const { name, value } = e.target;
      setDefaultValue(prevTask => ({
        ...prevTask,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (defaultValue.name.length < 2) {
      toast.error(t('firstNameRequired'));
      return;
    }
    if (defaultValue.company_name.length < 1) {
      toast.error(t('companyRequired'));
      return;
    }

    const payload = {
      ...defaultValue,
      studio: user?.studio?.id,
    };

    createContact({ url: 'crm/clients/', data: payload });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {renderTrigger && (
        <DialogTrigger asChild>
          <button className="text-sm w-full border-t px-2 py-3 text-center hover:bg-stone-100 transition-colors font-medium text-blue-600">
            {t('trigger')}
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px] z-[10000]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 ">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{tCommon('name')}</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.name}
                className="bg-white rounded-lg"
                id="name"
                name="name"
                placeholder={tc('placeholders.fullName')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">{tCommon('surname')}</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.surname}
                className="bg-white rounded-lg"
                id="surname"
                name="surname"
                placeholder={tc('placeholders.surname')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{tCommon('email')}</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.email}
                className="bg-white rounded-lg"
                id="email"
                name="email"
                type="email"
                placeholder={tc('placeholders.email')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{tCommon('phone')}</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.phone}
                className="bg-white rounded-lg"
                id="phone"
                name="phone"
                placeholder={tc('placeholders.phone')}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className={`space-y-2 col-span-2`}>
              <Label htmlFor="status">{tCommon('status')}</Label>
              <Select
                value={defaultValue.status}
                onValueChange={value => {
                  updateTask({
                    target: {
                      name: 'status',
                      value: value,
                    },
                  });
                }}
              >
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder={tc('selectStatus')} />
                </SelectTrigger>
                <SelectContent className="bg-white z-[9999]">
                  <SelectItem value="NE">{tc('statusNew')}</SelectItem>
                  <SelectItem value="AC">{tc('statusActive')}</SelectItem>
                  <SelectItem value="QA">{tc('statusQualified')}</SelectItem>
                  <SelectItem value="NG">{tc('statusNegotiation')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="company">{tCommon('company')}</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.company_name}
                className="bg-white rounded-lg"
                id="company_name"
                name="company_name"
                placeholder={tc('placeholders.companyName')}
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="address">{tc('addressLine1')}</Label>
            <Textarea
              onChange={updateTask}
              value={defaultValue?.address}
              className="bg-white rounded-lg"
              id="address"
              name="address"
              placeholder={t('addressPlaceholder')}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit} disabled={isCreating}>
              {tCommon('add')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplier;
