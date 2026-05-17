'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  Building2,
  DollarSign,
  Plus,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Globe,
  User,
  Key,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import useProposalsStore from '@/store/useProposalsStore';
import { postData, patchData, deleteData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import useFetch from '@/hooks/useFetch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { TypeChip } from '@/components/chip';
import { CrmNav } from '@/components/crm-nav';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { useEditGuard } from '@/hooks/useEditGuard';
import { useQueryClient } from '@tanstack/react-query';

export type ClientNote = {
  id: number;
  note: string;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type ContactDetails = {
  id: string;
  created_at: string;
  name: string;
  surname: string;
  company?: string;
  company_name?: string;
  email: string;
  type: string;
  contact_type: string;
  connection: string;
  find: string;
  budget: number;
  project: string;
  status: string;
  phone: string;
  address?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  currency?: string;
  products?: any[];
  docs?: any[];
  client_notes?: ClientNote[];
  trade_login_url?: string;
  supplier_user_id?: string;
  supplier_password?: string;
  additional_contacts?: Array<{
    name: string;
    relationship: string;
    email: string;
    phone: string;
  }>;
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  NE: { label: 'New', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  AC: { label: 'Active', class: 'bg-green-100 text-green-700 border-green-200' },
  QA: { label: 'Qualified', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  NG: { label: 'Negotiation', class: 'bg-amber-100 text-amber-700 border-amber-200' },
};

// Clean field row — label on left, value on right, icon optional
function FieldRow({
  label,
  value,
  icon,
  href,
  external,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  external?: boolean;
}) {
  const displayValue = value || <span className="text-gray-400">—</span>;
  const linked = href ? (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="text-clay-600 hover:underline flex items-center gap-1"
    >
      {value}
      {external && <ExternalLink className="w-3 h-3" />}
    </a>
  ) : (
    displayValue
  );

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {icon && <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 font-medium">{linked}</div>
      </div>
    </div>
  );
}

// Card wrapper
function Card({
  title,
  children,
  className,
  actions,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

function ContactDetailPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { setLeadPreFillData } = useProposalsStore();
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; noteId: number | null }>({ open: false, noteId: null });
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const { guard } = useEditGuard('clients.edit');

  // Inline editing state
  const [editingSection, setEditingSection] = useState<null | 'contact' | 'details' | 'trade'>(null);
  const [editValues, setEditValues] = useState<Partial<ContactDetails>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const { data: rawData, isLoading, refetch } = useFetch(`crm/clients/${params.id}/`);
  const data: ContactDetails | null = (rawData as ContactDetails) || null;

  useEffect(() => {
    if (data?.client_notes) setNotes(data.client_notes);
  }, [data?.client_notes]);

  useEffect(() => {
    if (data?.name) document.title = `${data.name} ${data.surname || ''} | Contacts | Focuspilot`;
  }, [data?.name, data?.surname]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <CrmNav />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 p-6">
        <CrmNav />
        <div className="max-w-7xl mx-auto mt-6 text-center py-24">
          <p className="text-gray-500 mb-4">Contact not found.</p>
          <Button variant="outline" onClick={() => router.push('/crm/contacts')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateLead = () => {
    setLeadPreFillData({ full_name: `${data.name} ${data.surname}`.trim(), email: data.email, phone: data.phone });
    router.push('/crm/pipeline?createLead=true');
  };

  const addNote = async () => {
    if (!newNote.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const noteText = newNote.trim();
    try {
      const response = await postData({ url: `/crm/clients/${data.id}/notes/`, data: { note: noteText } });
      const now = new Date().toISOString();
      setNotes(prev => [
        {
          id: response.id || Date.now(),
          note: response.note || noteText,
          created_by: response.created_by || 0,
          created_at: response.created_at || now,
          updated_at: response.created_at || now,
        },
        ...prev,
      ]);
      setNewNote('');
      setIsAddingNote(false);
      toast.success('Note added');
      refetch();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNote = async (noteId: number) => {
    if (!editingNoteText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await patchData({ url: `/crm/clients/${data.id}/notes/${noteId}/`, data: { note: editingNoteText } });
      setNotes(notes.map(n => (n.id === noteId ? { ...n, note: editingNoteText, updated_at: new Date().toISOString() } : n)));
      setEditingNoteId(null);
      setEditingNoteText('');
      toast.success('Note updated');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteNote = async () => {
    if (!deleteConfirmDialog.noteId) return;
    const noteId = deleteConfirmDialog.noteId;
    setDeletingNoteId(noteId);
    setDeleteConfirmDialog({ open: false, noteId: null });
    try {
      await deleteData({ url: `/crm/clients/${data.id}/notes/${noteId}/delete/` });
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const mapContactType = (type: string) => ({ CL: 'Client', SP: 'Supplier', CN: 'Contractor', CT: 'Contractor' })[type] || type;
  const displayType = mapContactType(data.contact_type);
  const isSupplier = data.contact_type === 'SP';

  const formatBudget = (b: number) => (b ? `$${b.toLocaleString()}` : null);
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  const addressLines = [data.address_line_1, data.address_line_2, data.city, data.county, data.postcode, data.country].filter(
    Boolean,
  ) as string[];

  // Inline editing handlers
  const enterEditMode = guard((section: 'contact' | 'details' | 'trade') => {
    setEditingSection(section);
    if (section === 'contact') {
      setEditValues({
        contact_type: data.contact_type || '',
        company_name: data.company_name || '',
        name: data.name || '',
        surname: data.surname || '',
        email: data.email || '',
        phone: data.phone || '',
        address_line_1: data.address_line_1 || '',
        address_line_2: data.address_line_2 || '',
        city: data.city || '',
        county: data.county || '',
        postcode: data.postcode || '',
        country: data.country || '',
      });
    } else if (section === 'details') {
      setEditValues({
        connection: data.connection || '',
        find: data.find || '',
        budget: data.budget || 0,
        currency: data.currency || '',
        status: data.status || 'NE',
      });
    } else if (section === 'trade') {
      setEditValues({
        trade_login_url: data.trade_login_url || '',
        supplier_user_id: data.supplier_user_id || '',
        supplier_password: data.supplier_password || '',
      });
    }
  });

  const cancelEdit = () => {
    setEditingSection(null);
    setEditValues({});
    setShowEditPassword(false);
  };

  const saveEdit = async () => {
    if (!editingSection || isSaving) return;
    setIsSaving(true);

    try {
      let payload: any = {};

      if (editingSection === 'contact') {
        payload = {
          contact_type: editValues.contact_type,
          company_name: editValues.company_name,
          name: editValues.name,
          surname: editValues.surname,
          email: editValues.email,
          phone: editValues.phone,
          address_line_1: editValues.address_line_1,
          address_line_2: editValues.address_line_2,
          city: editValues.city,
          county: editValues.county,
          postcode: editValues.postcode,
          country: editValues.country,
        };
      } else if (editingSection === 'details') {
        payload = {
          connection: editValues.connection,
          find: editValues.find,
          budget: editValues.budget,
          currency: editValues.currency,
          status: editValues.status,
        };
      } else if (editingSection === 'trade') {
        payload = {
          trade_login_url: editValues.trade_login_url,
          supplier_user_id: editValues.supplier_user_id,
          supplier_password: editValues.supplier_password,
        };
      }

      await patchData({ url: `crm/clients/${data.id}/`, data: payload });
      toast.success('Contact updated');
      refetch();
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
      // Refresh data by triggering router refresh
      router.refresh();

      setEditingSection(null);
      setEditValues({});
      setShowEditPassword(false);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1  p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <CrmNav />
      </div>

      <div className="max-w-7xl mx-auto mt-6 space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/crm/contacts')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Contacts
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.name} {data.surname}
              </h1>
              {data.status && (
                <Badge className={cn('text-xs border', STATUS_CONFIG[data.status]?.class || 'bg-gray-100 text-gray-700 border-gray-200')}>
                  {STATUS_CONFIG[data.status]?.label || data.status}
                </Badge>
              )}
              <TypeChip label={displayType} />
            </div>
            {data.company_name && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <Building2 className="w-3.5 h-3.5" />
                {data.company_name}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {data.contact_type === 'CL' && (
              <Button variant="outline" size="sm" onClick={handleCreateLead} className="gap-1.5">
                <UserPlus className="w-4 h-4" /> Create Lead
              </Button>
            )}
            {data.email && (
              <Link href={`mailto:${data.email}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Mail className="w-4 h-4" /> Email
                </Button>
              </Link>
            )}
            {data.phone && (
              <Link href={`tel:${data.phone}`}>
                <Button size="sm" className="bg-clay-600 hover:bg-clay-700 text-white gap-1.5">
                  <Phone className="w-4 h-4" /> Call
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main grid: 2/3 left + 1/3 right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card
              title="Contact Information"
              actions={
                editingSection === 'contact' ? (
                  <>
                    <Button size="sm" onClick={saveEdit} disabled={isSaving} className="bg-clay-600 hover:bg-clay-700 text-white">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isSaving}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => enterEditMode('contact')}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                )
              }
            >
              {editingSection === 'contact' ? (
                <div className="space-y-4 py-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Contact Type</label>
                    <Select value={editValues.contact_type || ''} onValueChange={value => setEditValues({ ...editValues, contact_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CL">Client</SelectItem>
                        <SelectItem value="SP">Supplier</SelectItem>
                        <SelectItem value="CN">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Company Name</label>
                    <Input
                      value={editValues.company_name || ''}
                      onChange={e => setEditValues({ ...editValues, company_name: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">First Name</label>
                      <Input
                        value={editValues.name || ''}
                        onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
                      <Input
                        value={editValues.surname || ''}
                        onChange={e => setEditValues({ ...editValues, surname: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email</label>
                    <Input
                      type="email"
                      value={editValues.email || ''}
                      onChange={e => setEditValues({ ...editValues, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                    <Input
                      type="tel"
                      value={editValues.phone || ''}
                      onChange={e => setEditValues({ ...editValues, phone: e.target.value })}
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Address Line 1</label>
                    <Input
                      value={editValues.address_line_1 || ''}
                      onChange={e => setEditValues({ ...editValues, address_line_1: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Address Line 2</label>
                    <Input
                      value={editValues.address_line_2 || ''}
                      onChange={e => setEditValues({ ...editValues, address_line_2: e.target.value })}
                      placeholder="Apt, suite, etc (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">City</label>
                      <Input
                        value={editValues.city || ''}
                        onChange={e => setEditValues({ ...editValues, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">County</label>
                      <Input
                        value={editValues.county || ''}
                        onChange={e => setEditValues({ ...editValues, county: e.target.value })}
                        placeholder="County"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Postcode</label>
                      <Input
                        value={editValues.postcode || ''}
                        onChange={e => setEditValues({ ...editValues, postcode: e.target.value })}
                        placeholder="Postcode"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Country</label>
                      <Input
                        value={editValues.country || ''}
                        onChange={e => setEditValues({ ...editValues, country: e.target.value })}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <FieldRow
                    label="Email"
                    value={data.email}
                    icon={<Mail className="w-4 h-4" />}
                    href={data.email ? `mailto:${data.email}` : undefined}
                  />
                  <FieldRow
                    label="Phone"
                    value={data.phone}
                    icon={<Phone className="w-4 h-4" />}
                    href={data.phone ? `tel:${data.phone}` : undefined}
                  />
                  {/* Address — each line separate */}
                  <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                    <div className="mt-0.5 text-gray-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">Address</div>
                      {addressLines.length > 0 ? (
                        <div className="space-y-0.5">
                          {addressLines.map((line, i) => (
                            <div key={i} className="text-sm text-gray-900 font-medium">
                              {line}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">—</div>
                      )}
                    </div>
                  </div>

                  {/* Additional Contacts */}
                  {data.additional_contacts && data.additional_contacts.length > 0 && (
                    <div className="py-3 border-b border-gray-100 last:border-0">
                      <div className="text-xs text-gray-500 mb-3 font-semibold">Additional Contacts</div>
                      <div className="space-y-4">
                        {data.additional_contacts.map((contact: any, index: number) => (
                          <div key={index} className="pl-4 border-l-2 border-gray-200 space-y-2">
                            <div className="flex items-baseline gap-2">
                              <div className="text-sm font-medium text-gray-900">{contact.name || '—'}</div>
                              {contact.relationship && <div className="text-xs text-gray-500 italic">({contact.relationship})</div>}
                            </div>
                            {contact.email && (
                              <div className="text-xs text-gray-600">
                                <Mail className="w-3 h-3 inline mr-1" />
                                <a href={`mailto:${contact.email}`} className="text-clay-600 hover:underline">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="text-xs text-gray-600">
                                <Phone className="w-3 h-3 inline mr-1" />
                                <a href={`tel:${contact.phone}`} className="text-clay-600 hover:underline">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Additional Details */}
            <Card
              title="Additional Details"
              actions={
                editingSection === 'details' ? (
                  <>
                    <Button size="sm" onClick={saveEdit} disabled={isSaving} className="bg-clay-600 hover:bg-clay-700 text-white">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isSaving}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => enterEditMode('details')}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                )
              }
            >
              {editingSection === 'details' ? (
                <div className="space-y-4 py-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Connection</label>
                    <Input
                      value={editValues.connection || ''}
                      onChange={e => setEditValues({ ...editValues, connection: e.target.value })}
                      placeholder="How did you meet?"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Found Via</label>
                    <Input
                      value={editValues.find || ''}
                      onChange={e => setEditValues({ ...editValues, find: e.target.value })}
                      placeholder="Where did you find them?"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Budget</label>
                    <Input
                      type="number"
                      value={editValues.budget || ''}
                      onChange={e => setEditValues({ ...editValues, budget: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Currency</label>
                    <CurrencySelector
                      value={editValues.currency || ''}
                      data={{ currency: editValues.currency || '' }}
                      onChange={(val: any) => setEditValues({ ...editValues, currency: val.currency?.code || val.currency || '' })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                    <Select value={editValues.status || 'NE'} onValueChange={value => setEditValues({ ...editValues, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NE">New</SelectItem>
                        <SelectItem value="AC">Active</SelectItem>
                        <SelectItem value="QA">Qualified</SelectItem>
                        <SelectItem value="NG">Negotiation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <>
                  <FieldRow label="Connection" value={data.connection || undefined} />
                  <FieldRow label="Found Via" value={data.find || undefined} />
                  {formatBudget(data.budget) && (
                    <FieldRow label="Budget" value={formatBudget(data.budget)!} icon={<DollarSign className="w-4 h-4" />} />
                  )}
                  <FieldRow label="Currency" value={data.currency || undefined} icon={<DollarSign className="w-4 h-4" />} />
                  <FieldRow label="Added" value={formatDate(data.created_at)} icon={<Calendar className="w-4 h-4" />} />
                </>
              )}
            </Card>

            {/* Supplier Trade Portal */}
            {isSupplier && (
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-gray-900">Trade Portal Access</h2>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Studio credentials — keep secure
                    </div>
                  </div>
                  {editingSection === 'trade' ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={isSaving} className="bg-clay-600 hover:bg-clay-700 text-white">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isSaving}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => enterEditMode('trade')}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="px-6 py-2">
                  {editingSection === 'trade' ? (
                    <div className="space-y-4 py-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Website / Trade Portal URL</label>
                        <Input
                          value={editValues.trade_login_url || ''}
                          onChange={e => setEditValues({ ...editValues, trade_login_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Login Username</label>
                        <Input
                          value={editValues.supplier_user_id || ''}
                          onChange={e => setEditValues({ ...editValues, supplier_user_id: e.target.value })}
                          placeholder="Username"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Login Password</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showEditPassword ? 'text' : 'password'}
                            value={editValues.supplier_password || ''}
                            onChange={e => setEditValues({ ...editValues, supplier_password: e.target.value })}
                            placeholder="Password"
                            className="flex-1"
                          />
                          <button
                            onClick={() => setShowEditPassword(p => !p)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                          >
                            {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FieldRow
                        label="Website / Trade Portal URL"
                        value={data.trade_login_url || undefined}
                        icon={<Globe className="w-4 h-4" />}
                        href={data.trade_login_url || undefined}
                        external
                      />
                      <FieldRow label="Login Username" value={data.supplier_user_id || undefined} icon={<User className="w-4 h-4" />} />
                      {/* Password with show/hide */}
                      <div className="flex items-start gap-3 py-3">
                        <div className="mt-0.5 text-gray-400 shrink-0">
                          <Key className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-0.5">Login Password</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 font-medium font-mono">
                              {data.supplier_password ? (
                                showPassword ? (
                                  data.supplier_password
                                ) : (
                                  '••••••••••'
                                )
                              ) : (
                                <span className="text-gray-400 font-sans">—</span>
                              )}
                            </span>
                            {data.supplier_password && (
                              <button
                                onClick={() => setShowPassword(p => !p)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <Card title="Notes">
              <div className="pt-2 pb-1">
                {!isAddingNote && (
                  <Button variant="outline" size="sm" onClick={() => setIsAddingNote(true)} className="gap-1.5 mb-3">
                    <Plus className="w-4 h-4" /> Add Note
                  </Button>
                )}

                {isAddingNote && (
                  <div className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.metaKey) addNote();
                        if (e.key === 'Escape') {
                          setIsAddingNote(false);
                          setNewNote('');
                        }
                      }}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={addNote}
                        disabled={isSubmitting || !newNote.trim()}
                        className="bg-clay-600 hover:bg-clay-700 text-white"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                        Save Note
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNote('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {notes.length === 0 && !isAddingNote ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No notes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notes.map(note => (
                      <div key={note.id} className="p-3 rounded-lg border border-gray-100 bg-white group">
                        {editingNoteId === note.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editingNoteText}
                              onChange={e => setEditingNoteText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && e.metaKey) updateNote(note.id);
                                if (e.key === 'Escape') {
                                  setEditingNoteId(null);
                                  setEditingNoteText('');
                                }
                              }}
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateNote(note.id)}
                                disabled={isSubmitting || !editingNoteText.trim()}
                                className="bg-clay-600 hover:bg-clay-700 text-white"
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingNoteId(null);
                                  setEditingNoteText('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{note.note}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteText(note.note);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmDialog({ open: true, noteId: note.id })}
                                  disabled={deletingNoteId === note.id}
                                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                >
                                  {deletingNoteId === note.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(note.created_at).toLocaleString('en-GB')}
                              {new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 1000 && ' (edited)'}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right column (1/3) — quick summary */}
          <div className="space-y-6">
            <Card title="Summary">
              <FieldRow label="Type" value={displayType} />
              <FieldRow
                label="Email"
                value={data.email}
                icon={<Mail className="w-4 h-4" />}
                href={data.email ? `mailto:${data.email}` : undefined}
              />
              <FieldRow
                label="Phone"
                value={data.phone}
                icon={<Phone className="w-4 h-4" />}
                href={data.phone ? `tel:${data.phone}` : undefined}
              />
              {data.company_name && <FieldRow label="Company" value={data.company_name} icon={<Building2 className="w-4 h-4" />} />}
              <FieldRow label="Status" value={STATUS_CONFIG[data.status]?.label || data.status} />
              <FieldRow label="Added" value={formatDate(data.created_at)} icon={<Calendar className="w-4 h-4" />} />
            </Card>

            {isSupplier && (
              <Card title="Quick Access">
                {data.supplier_url ? (
                  <FieldRow
                    label="Trade Portal"
                    value="Open website"
                    icon={<Globe className="w-4 h-4" />}
                    href={data.supplier_url}
                    external
                  />
                ) : (
                  <p className="text-xs text-gray-400 py-3">No trade portal URL set.</p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={deleteConfirmDialog.open}
        onOpenChange={open => setDeleteConfirmDialog({ open, noteId: open ? deleteConfirmDialog.noteId : null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false, noteId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="clients.view" redirectTo="/">
      <ContactDetailPageContent params={params} />
    </PermissionGuard>
  );
}
