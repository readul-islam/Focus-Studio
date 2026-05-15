'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, ExternalLink, Calendar, Building2, DollarSign, Plus, UserPlus, Pencil, Trash2, Loader2, Check, X, KeyRound, Copy, Eye, EyeOff, Link2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import useProposalsStore from '@/store/useProposalsStore';
import { postData, patchData, deleteData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';

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
  email: string;
  type: string;
  contact_type?: string;
  connection: string;
  find: string;
  budget: number;
  project: string;
  status: string;
  phone: string;
  address: string;
  products?: any[];
  docs?: any[];
  client_notes?: ClientNote[];
  trade_login_url?: string;
  supplier_user_id?: string;
  supplier_password?: string;
};

export type ContactDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactDetails;
};

const STATUS_CONFIG = {
  NE: {
    label: "New",
    class: "bg-blue-100 text-blue-800",
  },
  AC: {
    label: "Active",
    class: "bg-green-100 text-green-800",
  },
  QA: {
    label: "Qualified",
    class: "bg-purple-100 text-purple-800",
  },
  NG: {
    label: "Negotiation",
    class: "bg-yellow-100 text-yellow-800",
  },
};


function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-greige-500/30 bg-stone-50 p-4', className)}>
      <div className="text-xs font-medium text-neutral-500">{label}</div>
      <div className="mt-1 flex items-center text-sm font-semibold text-neutral-900">
        {icon && <span className="mr-2">{icon}</span>}
        {value || 'Not Available'}
      </div>
    </div>
  );
}

export function ContactDetailSheet({ open, onOpenChange, contact }: ContactDetailSheetProps) {
  const data = contact;
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

  // Sync notes from contact prop
  useEffect(() => {
    if (data?.client_notes) {
      setNotes(data.client_notes);
    }
  }, [data?.client_notes]);

  if (!data) {
    return null;
  }

  const handleCreateLead = () => {
    setLeadPreFillData({
      full_name: `${data.name} ${data.surname}`.trim(),
      email: data.email,
      phone: data.phone,
    });
    onOpenChange(false);
    router.push('/crm/pipeline?createLead=true');
  };

  const addNote = async () => {
    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const noteText = newNote.trim();
    try {
      const response = await postData({
        url: `/crm/clients/${data.id}/notes/`,
        data: { note: noteText },
      });
      // Create note object - use the note text we sent if response doesn't have it
      const now = new Date().toISOString();
      const newNoteObj: ClientNote = {
        id: response.id || response.note_id || Date.now(),
        note: response.note || noteText,
        created_by: response.created_by || 0,
        created_at: response.created_at || now,
        updated_at: response.created_at || now, // Use created_at for new notes to avoid "(edited)"
      };
      setNotes(prev => [newNoteObj, ...prev]);
      setNewNote('');
      setIsAddingNote(false);
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNote = async (noteId: number) => {
    if (!editingNoteText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await patchData({
        url: `/crm/clients/${data.id}/notes/${noteId}/`,
        data: { note: editingNoteText },
      });
      setNotes(notes.map(n => n.id === noteId ? { ...n, note: editingNoteText, updated_at: new Date().toISOString() } : n));
      setEditingNoteId(null);
      setEditingNoteText('');
      toast.success('Note updated');
    } catch (error) {
      toast.error('Failed to update note');
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
      await deleteData({
        url: `/crm/clients/${data.id}/notes/${noteId}/delete/`,
      });
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const startEditing = (note: ClientNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };
  // Format budget with currency symbol
  const formatBudget = (budget: number) => {
    if (!budget) return 'Not Specified';
    return `$${budget.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl md:max-w-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <SheetTitle className="text-xl font-semibold text-neutral-900">
                    {data.name} {data.surname}
                  </SheetTitle>
                  <Badge
  className={cn(
    "ml-2",
    STATUS_CONFIG[data.status]?.class || "bg-stone-100 text-gray-800"
  )}
>
  {STATUS_CONFIG[data.status]?.label || data.status}
</Badge>

                </div>
                {data.company ? <div className="text-sm text-neutral-600">{data.company}</div> : null}
              </div>
            </div>
          </SheetHeader>

          <Separator className="mt-4" />

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-6 p-6">
              {/* Contact information */}
              <section aria-label="Contact information">
                <h3 className="mb-4 text-base font-semibold text-neutral-900">Contact Information</h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="Email"
                    value={
                    data.email ?  <a href={`mailto:${data.email}`} className="hover:underline">
                        {data.email}
                      </a> : 'Not Available'
                    }
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <StatCard
                    label="Phone"
                    value={
                      data.phone ? <a href={`tel:${data.phone}`} className="hover:underline">
                        {data.phone}
                      </a> : 'Not Available'
                    }
                    icon={<Phone className="h-4 w-4" />}
                  />
                  {data.address && (
                    <StatCard
                      label="Address"
                      value={data.address.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                      icon={<MapPin className="h-4 w-4" />}
                      className="sm:col-span-2"
                    />
                  )}
                  {data.company_name && (
                    <StatCard
                      label="Company Name"
                      value={data.company_name}
                      icon={<Building2 className="h-4 w-4" />}
                      className="sm:col-span-2"
                    />
                  )}
                </div>
              </section>

              {/* Additional details */}
              <section aria-label="Additional details">
                <h3 className="mb-4 text-base font-semibold text-neutral-900">Additional Details</h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Connection" value={data.connection} />
                  <StatCard label="Found Via" value={data.find} />
                  <StatCard label="Budget" value={formatBudget(data.budget)} />
                  <StatCard label="Contact Type" value={data.type} />
                  <StatCard label="Created Date" value={formatDate(data.created_at)} icon={<Calendar className="h-4 w-4" />} />
                 {data.currency && <StatCard label="Currency" value={data.currency} icon={<DollarSign className="h-4 w-4" />} />}
                </div>
              </section>

              {/* Project information */}
              {/* <section aria-label="Project information">
                <h3 className="mb-4 text-base font-semibold text-neutral-900">Project Information</h3>

                <div className="rounded-lg border border-greige-500/30 bg-stone-50 p-4">
                  <div className="text-xs font-medium text-neutral-500">Project Name</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {projectsData.find(p => p.id === data.project)?.name || 'Unknown Project'}
                  </div>
                  <Link href={`/projects/${data.project}`} passHref>
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <span>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Project
                      </span>
                    </Button>
                  </Link>
                </div>
              </section> */}

              {/* Trade Portal — SP only */}
              {data.contact_type === 'SP' && (data.trade_login_url || data.supplier_user_id || data.supplier_password) && (
                <section aria-label="Trade portal">
                  <h3 className="mb-4 text-base font-semibold text-neutral-900">Trade Portal</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.trade_login_url && (
                      <div className="rounded-lg border border-greige-500/30 bg-stone-50 p-4 sm:col-span-2">
                        <div className="text-xs font-medium text-neutral-500">Login URL</div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Link2 className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                            <a
                              href={data.trade_login_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-neutral-900 hover:underline truncate"
                            >
                              {data.trade_login_url}
                            </a>
                          </div>
                          <button
                            onClick={() => { navigator.clipboard.writeText(data.trade_login_url!); toast.success('URL copied'); }}
                            className="p-1.5 rounded-md hover:bg-stone-200 text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
                            title="Copy URL"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {data.supplier_user_id && (
                      <div className="rounded-lg border border-greige-500/30 bg-stone-50 p-4">
                        <div className="text-xs font-medium text-neutral-500">Username / User ID</div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <KeyRound className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-neutral-900 truncate">{data.supplier_user_id}</span>
                          </div>
                          <button
                            onClick={() => { navigator.clipboard.writeText(data.supplier_user_id!); toast.success('Username copied'); }}
                            className="p-1.5 rounded-md hover:bg-stone-200 text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
                            title="Copy username"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {data.supplier_password && (
                      <div className="rounded-lg border border-greige-500/30 bg-stone-50 p-4">
                        <div className="text-xs font-medium text-neutral-500">Password</div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <KeyRound className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-neutral-900 font-mono">
                              {showPassword ? data.supplier_password : '••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setShowPassword(p => !p)}
                              className="p-1.5 rounded-md hover:bg-stone-200 text-neutral-400 hover:text-neutral-600 transition-colors"
                              title={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => { navigator.clipboard.writeText(data.supplier_password!); toast.success('Password copied'); }}
                              className="p-1.5 rounded-md hover:bg-stone-200 text-neutral-400 hover:text-neutral-600 transition-colors"
                              title="Copy password"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy all */}
                  <button
                    onClick={() => {
                      const parts = [
                        data.trade_login_url && `URL: ${data.trade_login_url}`,
                        data.supplier_user_id && `Username: ${data.supplier_user_id}`,
                        data.supplier_password && `Password: ${data.supplier_password}`,
                      ].filter(Boolean).join('\n');
                      navigator.clipboard.writeText(parts);
                      toast.success('Trade portal credentials copied');
                    }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    Copy all credentials
                  </button>
                </section>
              )}

              {/* Documents section */}
              {data.docs && data.docs.length > 0 && (
                <section aria-label="Documents">
                  <h3 className="mb-4 text-base font-semibold text-neutral-900">Documents</h3>

                  <div className="rounded-lg border border-greige-500/30 bg-stone-50 p-4">
                    <div className="text-sm text-neutral-600">{data.docs.length} document(s) attached</div>
                    <Button variant="outline" size="sm" className="mt-3">
                      View Documents
                    </Button>
                  </div>
                </section>
              )}

              {/* Notes section */}
              <section aria-label="Notes">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-neutral-900">Notes</h3>
                  {!isAddingNote && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingNote(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </Button>
                  )}
                </div>

                {isAddingNote && (
                  <div className="mb-4 p-4 rounded-lg border border-greige-500/30 bg-stone-50">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a note about this contact..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.metaKey) {
                            addNote();
                          } else if (e.key === 'Escape') {
                            setIsAddingNote(false);
                            setNewNote('');
                          }
                        }}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addNote} disabled={isSubmitting || !newNote.trim()}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Add Note
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
                  </div>
                )}

                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-lg border border-greige-500/30 bg-white group"
                      >
                        {editingNoteId === note.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.metaKey) {
                                  updateNote(note.id);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateNote(note.id)} disabled={isSubmitting || !editingNoteText.trim()}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-neutral-700 whitespace-pre-wrap flex-1">{note.note}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditing(note)}
                                  className="p-1.5 rounded-md hover:bg-stone-100 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Edit note"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmDialog({ open: true, noteId: note.id })}
                                  disabled={deletingNoteId === note.id}
                                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete note"
                                >
                                  {deletingNoteId === note.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">
                              {new Date(note.created_at).toLocaleString()}
                              {note.updated_at && note.created_at && new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 1000 && ' (edited)'}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-neutral-500">
                    No notes yet. Add a note to keep track of important information.
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Sticky footer actions */}
          <div className="border-t border-greige-500/30 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600">Actions for {data.name}</div>
              <div className="flex gap-2 flex-wrap">
                {/* Create Lead */}
            {data?.contact_type === 'CL' &&    <Button
                  onClick={handleCreateLead}
                  variant="outline"
                  className="gap-2 border-greige-500/30"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Lead
                </Button>}

                {/* Send Email */}
               {data.email && <Link href={`mailto:${data?.email || 'someone@example.com'}`} passHref>
                  <Button asChild variant="outline" className="border-greige-500/30">
                    <span>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </span>
                  </Button>
                </Link>}

                {/* Call Now */}
                {data.phone && <Link href={`tel:${data?.phone || '+880123456789'}`} passHref>
                  <Button asChild className="bg-clay-600 text-white hover:bg-clay-700">
                    <span>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </span>
                  </Button>
                </Link>}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Delete Note Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => setDeleteConfirmDialog({ open, noteId: open ? deleteConfirmDialog.noteId : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false, noteId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
