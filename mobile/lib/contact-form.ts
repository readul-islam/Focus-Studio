import type { AppUser, ContactType, CrmContact } from '@focuspilot/shared';

export type ContactFormValues = {
  contactType: ContactType | '';
  name: string;
  surname: string;
  companyName: string;
  email: string;
  phone: string;
  currency: string;
};

export type ContactFormErrors = {
  contactType?: string;
  name?: string;
  companyName?: string;
  email?: string;
};

export const CONTACT_TYPE_OPTIONS: { key: ContactType; label: string }[] = [
  { key: 'CL', label: 'Client' },
  { key: 'SP', label: 'Supplier' },
  { key: 'CN', label: 'Contractor' },
];

export const DEFAULT_CONTACT_FORM: ContactFormValues = {
  contactType: 'CL',
  name: '',
  surname: '',
  companyName: '',
  email: '',
  phone: '',
  currency: 'GBP',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.contactType) {
    errors.contactType = 'Select a contact type';
  }

  const name = values.name.trim();
  const company = values.companyName.trim();

  if (values.contactType === 'CL') {
    if (!name && !company) {
      errors.name = 'Enter a name or company';
    }
  } else if (!company) {
    errors.companyName = 'Company name is required';
  } else if (!name) {
    errors.name = 'Contact name is required';
  }

  const email = values.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  return errors;
}

export function hasContactFormErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildContactPayload(values: ContactFormValues, user: AppUser): Record<string, unknown> {
  return {
    contact_type: values.contactType,
    name: values.name.trim(),
    surname: values.surname.trim(),
    company_name: values.companyName.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    currency: values.currency,
    status: 'NE',
    studio: user.studio?.id ?? null,
  };
}

export function contactToFormValues(contact: CrmContact): ContactFormValues {
  return {
    contactType: (contact.contact_type as ContactType) || 'CL',
    name: contact.name ?? '',
    surname: contact.surname ?? '',
    companyName: contact.company_name ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    currency: contact.currency ?? 'GBP',
  };
}

export function buildContactUpdatePayload(values: ContactFormValues): Record<string, unknown> {
  return {
    contact_type: values.contactType,
    name: values.name.trim(),
    surname: values.surname.trim(),
    company_name: values.companyName.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    currency: values.currency,
  };
}
