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
      toast('Contact created successfully!');
      refetch?.();
      handleClose(false);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const { mutate: updateContactMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) => patchData({ url: `crm/clients/${contact.id}/`, data }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['crm/studio-contacts/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
      toast.success('Contact updated successfully!');
      refetch?.();
      handleClose(false);
    },
    onError: () => {
      toast.error('Error! Try again');
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
      toast.error('Please select a currency');
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogDescription>
            {contact ? 'Update the contact information below.' : 'Fill in the details to create a new contact.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="contact_type">Contact Type</Label>
            <Select onValueChange={value => handleSelectChange('contact_type', value)} value={formValues.contact_type || ''}>
              <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[999]">
                <SelectItem value="CL">Client</SelectItem>
                <SelectItem value="SP">Supplier</SelectItem>
                <SelectItem value="CN">Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">
              Company {(isClient || contact?.contact_type === 'CL') && <span className="text-xs text-gray-500">(optional)</span>}
            </Label>
            <Input
              onChange={handleInputChange}
              value={formValues.company_name}
              className="bg-white rounded-lg"
              id="company_name"
              name="company_name"
              placeholder="Company Name"
              required={isClient || contact?.contact_type === 'CL' ? false : true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.name}
                className="bg-white rounded-lg"
                id="name"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.surname}
                className="bg-white rounded-lg"
                id="surname"
                name="surname"
                placeholder="Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.email}
                className="bg-white rounded-lg"
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.phone}
                className="bg-white rounded-lg"
                id="phone"
                name="phone"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          {(isClient || contact?.contact_type === 'CL') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connection">Connection</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.connection}
                  className="bg-white rounded-lg"
                  id="connection"
                  name="connection"
                  placeholder="Very strong with john doe.."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="find">How did they find us</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.find}
                  className="bg-white rounded-lg"
                  id="find"
                  name="find"
                  placeholder="e.g. Via Linkedin"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {(isClient || contact?.contact_type === 'CL') && (
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.budget}
                  className="bg-white rounded-lg"
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g. 20000"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={value => handleSelectChange('status', value)} value={formValues.status || ''}>
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[999]">
                  <SelectItem value="NE">New</SelectItem>
                  <SelectItem value="AC">Active</SelectItem>
                  <SelectItem value="QA">Qualified</SelectItem>
                  <SelectItem value="NG">Negotiation</SelectItem>
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
              Currency <span className="text-red-500">*</span>
            </Label>
            <CurrencySelector value={formValues.currency} onChange={handleCurrencyChange} data={formValues} />
          </div>

          {formValues.contact_type === 'SP' && (
            <div className="space-y-4 rounded-lg border border-dashed border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trade Portal</p>
              <div className="space-y-2">
                <Label htmlFor="trade_login_url">Login URL</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.trade_login_url || ''}
                  className="bg-white rounded-lg"
                  id="trade_login_url"
                  name="trade_login_url"
                  type="url"
                  placeholder="https://trade.supplier.com/login"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_user_id">Username / User ID</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_user_id || ''}
                    className="bg-white rounded-lg"
                    id="supplier_user_id"
                    name="supplier_user_id"
                    placeholder="e.g. studio_account"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_password">Password</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_password || ''}
                    className="bg-white rounded-lg"
                    id="supplier_password"
                    name="supplier_password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address_line_1">Address Line 1</Label>
            <Input
              onChange={handleInputChange}
              value={formValues.address_line_1}
              className="bg-white rounded-lg"
              id="address_line_1"
              name="address_line_1"
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line_2">Address Line 2</Label>
            <Input
              onChange={handleInputChange}
              value={formValues.address_line_2}
              className="bg-white rounded-lg"
              id="address_line_2"
              name="address_line_2"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.city}
                className="bg-white rounded-lg"
                id="city"
                name="city"
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.postcode}
                className="bg-white rounded-lg"
                id="postcode"
                name="postcode"
                placeholder="Postcode"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.county}
                className="bg-white rounded-lg"
                id="county"
                name="county"
                placeholder="County"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.country}
                className="bg-white rounded-lg"
                id="country"
                name="country"
                placeholder="Country"
              />
            </div>
          </div>

          {/* Additional Contacts Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Additional Contacts</Label>
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
                Add Contact
              </Button>
            </div>

            {formValues.additional_contacts && formValues.additional_contacts.length > 0 && (
              <div className="space-y-4">
                {formValues.additional_contacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
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
                        <Label htmlFor={`additional_contact_name_${index}`}>Name</Label>
                        <Input
                          value={contact.name}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], name: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="bg-white rounded-lg"
                          id={`additional_contact_name_${index}`}
                          placeholder="Contact name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_relationship_${index}`}>Relationship</Label>
                        <Input
                          value={contact.relationship}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], relationship: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="bg-white rounded-lg"
                          id={`additional_contact_relationship_${index}`}
                          placeholder="e.g. Wife, Director, PA"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_email_${index}`}>Email</Label>
                        <Input
                          value={contact.email}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], email: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="bg-white rounded-lg"
                          id={`additional_contact_email_${index}`}
                          type="email"
                          placeholder="contact@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additional_contact_phone_${index}`}>Phone</Label>
                        <Input
                          value={contact.phone}
                          onChange={e => {
                            const newContacts = [...formValues.additional_contacts];
                            newContacts[index] = { ...newContacts[index], phone: e.target.value };
                            setFormValues(prev => ({ ...prev, additional_contacts: newContacts }));
                          }}
                          className="bg-white rounded-lg"
                          id={`additional_contact_phone_${index}`}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {formValues.contact_type === 'SP' && (
            <div className="space-y-4 rounded-lg border border-dashed border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trade Portal</p>
              <div className="space-y-2">
                <Label htmlFor="trade_login_url">Login URL</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.trade_login_url}
                  className="bg-white rounded-lg"
                  id="trade_login_url"
                  name="trade_login_url"
                  type="url"
                  placeholder="https://trade.supplier.com/login"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_user_id">Username / User ID</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_user_id}
                    className="bg-white rounded-lg"
                    id="supplier_user_id"
                    name="supplier_user_id"
                    placeholder="e.g. studio_account"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_password">Password</Label>
                  <Input
                    onChange={handleInputChange}
                    value={formValues.supplier_password}
                    className="bg-white rounded-lg"
                    id="supplier_password"
                    name="supplier_password"
                    type="text"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button className="bg-white min-w-[150px] rounded-[10px]" type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="min-w-[150px] rounded-[10px]" type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
