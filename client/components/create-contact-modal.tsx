'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CurrencySelector } from './ui/CurrencySelector';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { patchData } from '@/lib/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import useFetch from '@/hooks/useFetch';
import { useTranslations } from 'next-intl';

const initialValue = {
  name: '',
  company_name: '',
  email: '',
  contact_type: '',
  connection: '',
  find: '',
  budget: 0,
  project: '',
  status: '',
  phone: '',
  surname: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  postcode: '',
  county: '',
  country: '',
  currency: { code: 'GBP', symbol: '£', name: 'British Pound' },
  additional_contacts: [],
  address: '',
  currency: {},
  trade_login_url: '',
  supplier_user_id: '',
  supplier_password: '',
};

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
  refetch?: () => void;
}

export function ContactFormModal({ refetch, open, onOpenChange, contact }: ContactFormModalProps) {
  const t = useTranslations('contactFormModal');
  const tc = useTranslations('common');
  const [formValues, setFormValues] = React.useState(contact ? contact : initialValue);
  const [isClient, setIsClient] = React.useState(contact?.contact_type === 'CL' ? true : false);
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Update form values when contact prop changes
  React.useEffect(() => {
    if (contact) {
      setFormValues({ ...initialValue, ...contact });
      setIsClient(contact.contact_type === 'CL');
    } else {
      setFormValues(initialValue);
      setIsClient(false);
    }
  }, [contact]);

  const { data: projectsData = [], isLoading: projectsLoading } = useFetch('projects/projects/');
  const projects = Array.isArray(projectsData) ? projectsData : projectsData?.data || [];

  const { mutate: createContact, isPending: isCreating } = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['crm/studio-contacts/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
      toast(t('createdSuccess'));
      refetch?.();
      handleClose(false);
    },
    onError: () => {
      toast(tc('errorTryAgain'));
    },
  });

  const { mutate: updateContactMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) => patchData({ url: `crm/clients/${contact.id}/`, data }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['crm/studio-contacts/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
      toast.success(t('updatedSuccess'));
      refetch?.();
      handleClose(false);
    },
    onError: () => {
      toast.error(tc('errorTryAgain'));
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'contact_type') {
      setIsClient(value === 'CL');
      if (value !== 'SP') {
        setFormValues((prev: any) => ({
          ...prev,
          trade_login_url: '',
          supplier_user_id: '',
          supplier_password: '',
        }));
      }
    }
  };

  // New handler for currency changes
  const handleCurrencyChange = (currencyData: { currency: any }) => {
    setFormValues(prev => ({
      ...prev,
      currency: currencyData.currency,
    }));
  };

  // console.log(user?.studio?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currencyCode = formValues.currency?.code || formValues.currency;
    if (!currencyCode) {
      toast.error(t('selectCurrency'));
      return;
    }
    const isSupplier = formValues.contact_type === 'SP';
    const { trade_login_url, supplier_user_id, supplier_password, ...baseValues } = formValues;

    const payload = {
      ...baseValues,
      ...(isSupplier && { trade_login_url, supplier_user_id, supplier_password }),
      studio: user?.studio?.id,
      currency: currencyCode,
    };

    if (contact) {
      updateContactMutation(payload);
    } else {
      createContact({ url: 'crm/clients/', data: payload });
    }
  };

  const handleClose = e => {
    onOpenChange(e);
    setFormValues(initialValue);
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        overlayClassName="bg-background/35 backdrop-blur-[8px]"
        className="max-w-3xl bg-card border border-border/40 shadow-[0_20px_60px_rgba(0,0,0,0.65)] hover:border-primary/25 transition-colors duration-300 max-h-[92vh] flex flex-col overflow-hidden rounded-2xl text-foreground p-0 gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-card flex-shrink-0">
          <DialogTitle className="text-[16px] font-bold text-foreground tracking-tight">
            {contact ? t('editTitle') : t('addTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {contact ? t('editDescription') : t('addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden m-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-rounded pr-2 bg-card space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contact_type">{t('contactType')}</Label>
            <Select onValueChange={value => handleSelectChange('contact_type', value)} value={formValues.contact_type || ''}>
              <SelectTrigger className="h-10 rounded-xl border border-border/20 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors w-full px-3 py-[10px]">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent className="border border-border/20 bg-card text-foreground z-[999]">
                <SelectItem value="CL">{tc('client')}</SelectItem>
                <SelectItem value="SP">{tc('supplier')}</SelectItem>
                <SelectItem value="CN">{tc('contractor')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">
              {tc('company')}{' '}
              {(isClient || contact?.contact_type === 'CL') && (
                <span className="text-xs text-gray-500">({tc('optional')})</span>
              )}
            </Label>
            <Input
              onChange={handleInputChange}
              value={formValues.company_name}
              className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              id="company_name"
              name="company_name"
              placeholder={t('placeholders.companyName')}
              required={isClient || contact?.contact_type === 'CL' ? false : true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{tc('name')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.name}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="name"
                name="name"
                placeholder={t('placeholders.fullName')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">{tc('surname')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.surname}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="surname"
                name="surname"
                placeholder={t('placeholders.surname')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{tc('email')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.email}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="email"
                name="email"
                type="email"
                placeholder={t('placeholders.email')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{tc('phone')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.phone}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="phone"
                name="phone"
                placeholder={t('placeholders.phone')}
              />
            </div>
          </div>

          {(isClient || contact?.contact_type === 'CL') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connection">{tc('connection')}</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.connection}
                  className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  id="connection"
                  name="connection"
                  placeholder={t('placeholders.connection')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="find">{t('howDidTheyFindUs')}</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.find}
                  className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  id="find"
                  name="find"
                  placeholder={t('placeholders.findVia')}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {(isClient || contact?.contact_type === 'CL') && (
              <div className="space-y-2">
                <Label htmlFor="budget">{tc('budget')}</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.budget}
                  className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder={t('placeholders.budget')}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">{tc('status')}</Label>
              <Select onValueChange={value => handleSelectChange('status', value)} value={formValues.status || ''}>
                <SelectTrigger className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors w-full px-3 py-[10px]">
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent className="border border-border/85 bg-card text-foreground z-[999]">
                  <SelectItem value="NE">{t('statusNew')}</SelectItem>
                  <SelectItem value="AC">{t('statusActive')}</SelectItem>
                  <SelectItem value="QA">{t('statusQualified')}</SelectItem>
                  <SelectItem value="NG">{t('statusNegotiation')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* {(isClient || contact?.contact_type === 'CL') && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select onValueChange={value => handleSelectChange('project', value)} value={formValues.project || ''}>
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {projects.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}

          <div className="space-y-2">
            <Label htmlFor="currency">
              {tc('currency')} <span className="text-red-500">*</span>
            </Label>
            <CurrencySelector value={formValues.currency} onChange={handleCurrencyChange} data={formValues} />
          </div>

          {formValues.contact_type === 'SP' && (
            <div className="space-y-4 rounded-lg border border-dashed border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('tradePortal')}</p>
              <div className="space-y-2">
                <Label htmlFor="trade_login_url">{t('loginUrl')}</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.trade_login_url || ''}
                  className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  id="trade_login_url"
                  name="trade_login_url"
                  type="url"
                  placeholder={t('placeholders.loginUrl')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_user_id">{t('usernameUserId')}</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_user_id || ''}
                    className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    id="supplier_user_id"
                    name="supplier_user_id"
                    placeholder={t('placeholders.username')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_password">{tc('password')}</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_password || ''}
                    className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    id="supplier_password"
                    name="supplier_password"
                    type="password"
                    placeholder={t('placeholders.password')}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address_line_1">{t('addressLine1')}</Label>
            <Input
              onChange={handleInputChange}
              value={formValues.address_line_1}
              className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              id="address_line_1"
              name="address_line_1"
              placeholder={t('placeholders.street')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line_2">{t('addressLine2')}</Label>
            <Input
              onChange={handleInputChange}
              value={formValues.address_line_2}
              className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              id="address_line_2"
              name="address_line_2"
              placeholder={t('placeholders.addressLine2')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{tc('city')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.city}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="city"
                name="city"
                placeholder={t('placeholders.city')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode">{tc('postcode')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.postcode}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="postcode"
                name="postcode"
                placeholder={t('placeholders.postcode')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">{tc('county')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.county}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="county"
                name="county"
                placeholder={t('placeholders.county')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{tc('country')}</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.country}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                id="country"
                name="country"
                placeholder={t('placeholders.country')}
              />
            </div>
          </div>

          {/* Additional Contacts Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">{t('additionalContacts')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormValues(prev => ({
                    ...prev,
                    additional_contacts: [...(prev.additional_contacts || []), { name: '', relationship: '', email: '', phone: '' }],
                  }));
                }}
                className="gap-1.5"
              >
                {t('addAdditionalContact')}
              </Button>
            </div>

            {formValues.additional_contacts && formValues.additional_contacts.length > 0 && (
              <div className="space-y-4">
                {formValues.additional_contacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-border/40 rounded-xl bg-muted/20 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setFormValues(prev => ({
                          ...prev,
                          additional_contacts: prev.additional_contacts.filter((_, i) => i !== index),
                        }));
                      }}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_name_${index}`}>{tc('name')}</Label>
                        <Input
                          value={contact.name}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], name: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          id={`additional_contact_name_${index}`}
                          placeholder={t('placeholders.contactName')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_relationship_${index}`}>{t('relationship')}</Label>
                        <Input
                          value={contact.relationship}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], relationship: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          id={`additional_contact_relationship_${index}`}
                          placeholder={t('placeholders.relationship')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_email_${index}`}>{tc('email')}</Label>
                        <Input
                          value={contact.email}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], email: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          id={`additional_contact_email_${index}`}
                          type="email"
                          placeholder={t('placeholders.additionalEmail')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_phone_${index}`}>{tc('phone')}</Label>
                        <Input
                          value={contact.phone}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], phone: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          id={`additional_contact_phone_${index}`}
                          placeholder={t('placeholders.phone')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {formValues.contact_type === 'SP' && (
            <div className="space-y-4 rounded-xl border border-dashed border-border/40 p-4 bg-muted/10">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('tradePortal')}</p>
              <div className="space-y-2">
                <Label htmlFor="trade_login_url">{t('loginUrl')}</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.trade_login_url}
                  className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  id="trade_login_url"
                  name="trade_login_url"
                  type="url"
                  placeholder={t('placeholders.loginUrl')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_user_id">{t('usernameUserId')}</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_user_id}
                    className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    id="supplier_user_id"
                    name="supplier_user_id"
                    placeholder={t('placeholders.username')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_password">{tc('password')}</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_password}
                    className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    id="supplier_password"
                    name="supplier_password"
                    type="text"
                    placeholder={t('placeholders.password')}
                  />
                </div>
              </div>
            </div>
          )}

          </div>
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40 bg-card">
            <Button
              className="h-10 px-5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors border border-border/60 bg-background min-w-[150px]"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc('cancel')}
            </Button>
            <Button
              className="h-10 px-6 rounded-xl text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? tc('processing') : contact ? t('updateContact') : t('createContact')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
