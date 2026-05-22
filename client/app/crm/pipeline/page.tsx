'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import type React from 'react';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { gooeyToast as toast } from 'goey-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import useDelete from '@/hooks/useDelete';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CrmNav } from '@/components/crm-nav';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import useProposalsStore from '@/store/useProposalsStore';
import { Building2, Users, FileText, Handshake, Trophy, X, CalendarIcon, DollarSign, Plus, Check, ChevronsUpDown, Loader2, Trash2, Pencil } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePermissions } from '@/hooks/usePermissions';

type StageId = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

type Deal = {
  id: string;
  title: string;
  company: string;
  value: number;
  owner: string;
  stage: StageId;
  closeDate?: string;
};

const stages: { id: StageId; label: string; icon: React.ComponentType<{ className?: string }>; chipClass: string }[] = [
  { id: 'new', label: 'New', icon: Building2, chipClass: 'bg-stone-100 text-gray-700 border-gray-200' },
  { id: 'qualified', label: 'Qualified', icon: Users, chipClass: 'bg-sage-300/40 text-olive-700 border-olive-700/20' },
  {
    id: 'proposal',
    label: 'Proposal',
    icon: FileText,
    chipClass: 'bg-ochre-300/20 text-ochre-700 border-ochre-700/20',
  },
  { id: 'negotiation', label: 'Negotiation', icon: Handshake, chipClass: 'bg-clay-50 text-clay-700 border-clay-200' },
  { id: 'won', label: 'Won', icon: Trophy, chipClass: 'bg-sage-300 text-olive-700' },
  {
    id: 'lost',
    label: 'Lost',
    icon: X,
    chipClass: 'bg-terracotta-600/10 text-terracotta-700 border-terracotta-700/20',
  },
];

type Lead = {
  id: string | number;
  title?: string;
  full_name?: string;
  email?: string;
  owner?: string | number;
  stage: StageId;
  stage_updated_at?: string;
  source?: string;
  priority?: string;
  project_type?: string;
  property_type?: string;
  property_size?: number;
  budget_range?: string;
  estimated_value?: string;
  proposal_type?: string;
  proposal_sent_date?: string;
  negotiation_reason?: string;
  revised_value?: string;
  final_value?: string;
  deposit_received?: boolean;
  project_start_date?: string;
  loss_reason?: string;
  notes?: string;
};

const formatValue = (value) => {
  const num = parseFloat(value || 0)
  if (isNaN(num)) return '£0'
  if (num < 1000) return `£${num}`
  return `£${(num / 1000).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`
}

const STAGE_CONFIG: Record<StageId, { fields: string[], required: string[] }> = {
  new: { fields: [], required: [] },
  qualified: { 
    fields: ['project_type', 'property_type', 'property_size', 'budget_range'], 
    required: ['project_type', 'property_type', 'property_size', 'budget_range'] 
  },
  proposal: { 
    fields: ['estimated_value', 'proposal_type', 'proposal_sent_date'], 
    required: ['estimated_value', 'proposal_type', 'proposal_sent_date'] 
  },
  negotiation: { 
    fields: ['negotiation_reason', 'revised_value'], 
    required: ['negotiation_reason', 'revised_value'] 
  },
  won: { 
    fields: ['final_value', 'deposit_received', 'project_start_date'], 
    required: ['final_value', 'deposit_received', 'project_start_date'] 
  },
  lost: { 
    fields: ['loss_reason'], 
    required: ['loss_reason'] 
  },
};

const DealCard = ({ deal, lead, onDragStart, onConvertToProject, onCardClick, userLookup, clientsPermission }: {
  deal: Deal;
  lead: Lead;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onConvertToProject?: (lead: Lead) => void;
  onCardClick?: (lead: Lead) => void;
  userLookup: Record<string, string>;
  clientsPermission: boolean;
}) => {
  const days = lead.stage_updated_at ?
    Math.ceil(Math.abs(new Date().getTime() - new Date(lead.stage_updated_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const colorIndicator = days < 7 ? 'bg-sage-300' : days <= 14 ? 'bg-ochre-500' : 'bg-terracotta-600';

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onCardClick?.(lead)}
    >
      <div
        className={cn(
          lead?.project_created ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        )}
        draggable={!lead?.project_created}
        onDragStart={e => !lead?.project_created && onDragStart(e, deal.id)}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium leading-5 text-gray-900 truncate">
              {lead.full_name || deal.title || 'Unnamed Lead'}
            </div>
            <div className="text-xs text-gray-600 truncate mt-1">{lead.email || deal.company}</div>
          </div>
          <div className="text-sm font-medium text-gray-900 flex-shrink-0 ml-2">
           {lead.stage === 'won'
  ? formatValue(lead?.final_value)
  : formatValue(lead?.estimated_value)
}
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', colorIndicator)} />
              <span className="text-xs text-gray-600">{days} days</span>
            </div>
            {lead.priority && (
              <Badge
                variant={lead.priority === 'High' ? 'destructive' :
                        lead.priority === 'Medium' ? 'default' : 'secondary'}
                className="text-xs h-5"
              >
                {lead.priority}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Owner:</span>
            <span className="text-xs text-gray-700 font-medium">
              {lead.owner ? (userLookup[String(lead.owner)] || 'Unassigned') : 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Create Proposal button for Proposal-stage deals */}
      {lead.stage === 'proposal' && clientsPermission && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/crm/proposals/new?lead=${lead.id}`;
            }}
          >
            Create Proposal
          </Button>
        </div>
      )}

      {/* Convert to Project button for Won deals */}
      {lead.stage === 'won' && onConvertToProject && (
        
        lead?.project_created ?
        
         <div className="mt-3 pt-2 border-t border-gray-100">
           <Button
        size="sm"
        variant="outline"
        className="w-full h-8 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/projects/${lead.project}`;
        }}
      >
        View Project
      </Button> 
         </div>
       : 
       clientsPermission &&  <div className="mt-3 pt-2 border-t border-gray-100">
          <Button
            size="sm"
            className="w-full h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onConvertToProject(lead);
            }}
          >
            Convert to Project
          </Button>
        </div>
      )}
    </div>
  );
};

// --- Schemas & Types ---
const qualifiedSchema = z.object({
  project_type: z.string().min(1, 'Project type is required'),
  property_type: z.string().min(1, 'Property type is required'),
  property_size: z.coerce.number().min(1, 'Property size is required'),
  budget_range: z.string().min(1, 'Budget range is required'),
});

const proposalSchema = z.object({
  estimated_value: z.string().min(1, 'Estimated value is required'),
  proposal_type: z.string().min(1, 'Proposal type is required'),
  proposal_sent_date: z.string().min(1, 'Proposal sent date is required'),
});

const negotiationSchema = z.object({
  negotiation_reason: z.string().min(1, 'Reason is required'),
  revised_value: z.string().min(1, 'Revised value is required'),
});

const wonSchema = z.object({
  final_value: z.string().min(1, 'Final value is required'),
  deposit_received: z.boolean().refine(v => v === true, { message: 'Deposit must be received' }),
  project_start_date: z.string().min(1, 'Start date is required'),
});

const lostSchema = z.object({
  loss_reason: z.string().min(1, 'Loss reason is required'),
});

// Lead creation schema
const leadCreationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  source: z.enum(['Website', 'Referral', 'Instagram', 'LinkedIn', 'Trade Show', 'Facebook', 'Twitter', 'Other'], 'Source required'),
  estimated_value: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  linked_contact: z.string({ required_error: 'Client is required' }).min(1, 'Client is required'),
});

const SCHEMA_MAP = {
  qualified: qualifiedSchema,
  proposal: proposalSchema,
  negotiation: negotiationSchema,
  won: wonSchema,
  lost: lostSchema,
  new: z.object({}),
};

// --- Form Components ---

const QualifiedFormFields = ({ form }: { form: any }) => (
  <div className="space-y-3">
    <FormField
      control={form.control}
      name="project_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Project Type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Hospitality">Hospitality</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="property_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Type</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Apartment, House" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="property_size"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Size (sq ft)</FormLabel>
          <FormControl>
            <Input type="number" placeholder="Property Size" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="budget_range"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Budget Range</FormLabel>
          <FormControl>
            <Input placeholder="Budget Range" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const ProposalFormFields = ({ form }: { form: any }) => (
  <div className="space-y-3">
    <FormField
      control={form.control}
      name="estimated_value"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Estimated Value</FormLabel>
          <FormControl>
            <Input placeholder="Estimated Value" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="proposal_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Proposal Type</FormLabel>
          <FormControl>
            <Input placeholder="Proposal Type" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="proposal_sent_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Proposal Sent Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={d => field.onChange(d ? format(d, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const NegotiationFormFields = ({ form }: { form: any }) => (
  <div className="space-y-3">
    <FormField
      control={form.control}
      name="negotiation_reason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Negotiation Reason</FormLabel>
          <FormControl>
            <Input placeholder="Negotiation Reason" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="revised_value"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Revised Value</FormLabel>
          <FormControl>
            <Input type='number' placeholder="Revised Value" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const WonFormFields = ({ form }: { form: any }) => (
  <div className="space-y-3">
    <FormField
      control={form.control}
      name="final_value"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Final Value</FormLabel>
          <FormControl>
            <Input type='number' placeholder="Final Value" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="deposit_received"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Deposit Received</FormLabel>
          </div>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="project_start_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Project Start Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={d => field.onChange(d ? format(d, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const LostFormFields = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="loss_reason"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Loss Reason</FormLabel>
        <FormControl>
          <Input placeholder="Loss Reason" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

function PipelinePageContent() {
  const { data: leadsData, isLoading, refetch } = useFetch('/crm/leads/');
  const leads = (leadsData as Lead[]) || [];
  const { user } = useUser();
  const { data: usersData } = useFetch(user?.studio?.id ? `/user/studio-users/?studio_id=${user.studio.id}` : null);
  const searchParams = useSearchParams();
  const { leadPreFillData, setLeadPreFillData } = useProposalsStore();

  // Client search state
  const [clientSearch, setClientSearch] = useState('');
  const [debouncedClientSearch, setDebouncedClientSearch] = useState('');
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const { can } = usePermissions();
  const clientsPermission = can('clients.edit');
  const clientsDeletePermission = can('clients.delete');


  // Debounce client search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedClientSearch(clientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch]);

  // Fetch clients with search
  const clientSearchUrl = debouncedClientSearch
    ? `/crm/studio-contacts/?page=1&search=${encodeURIComponent(debouncedClientSearch)}&contact_type=CL`
    : '/crm/studio-contacts/?page=1&contact_type=CL';
  const { data: clientsData, isLoading: isLoadingClients } = useFetch(clientSearchUrl);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [pendingTargetStage, setPendingTargetStage] = useState<StageId | null>(null);

  // Lead creation states
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const leadForm = useForm({
    resolver: zodResolver(leadCreationSchema),
    defaultValues: {
      title: '',
      full_name: '',
      email: '',
      phone: '',
      source: undefined,
      estimated_value: '',
      notes: '',
      priority: undefined,
      linked_contact: '',
    },
  });

  // Lead detail/view states
  const [viewLeadDialogOpen, setViewLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFields, setEditFields] = useState<Partial<Lead>>({});
  const { isOpen: isDeleteOpen, item: deleteItem, openDialog: openDeleteDialog, closeDialog: closeDeleteDialog } = useDeleteDialog();

  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setViewLeadDialogOpen(true);
  };

  // Project conversion states
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [selectedLeadForConversion, setSelectedLeadForConversion] = useState<Lead | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(SCHEMA_MAP[pendingTargetStage || 'new']),
    defaultValues: {},
  });

  // Lead creation mutation
  const { mutate: createLead, isPending: isCreatingLead } = usePost({
    onSuccess: () => {
      toast.success('Lead created successfully');
      setLeadDialogOpen(false);
      leadForm.reset();
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create lead');
    },
  });

  // Project conversion mutation — calls /crm/leads/{id}/convert_to_project/
  const { mutate: createProject, isPending: isCreatingProject } = usePost({
    onSuccess: () => {
      toast.success('Lead converted to project successfully');
      setConversionDialogOpen(false);
      setSelectedLeadForConversion(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to convert lead to project');
    },
  });

  // Re-run resolver when stage changes
  useEffect(() => {
    if (pendingTargetStage) {
      form.clearErrors();
    }
  }, [pendingTargetStage, form]);

  // Check for createLead query parameter and pre-fill data
  useEffect(() => {
    if (searchParams.get('createLead') === 'true' && leadPreFillData) {
      // Pre-fill the form with contact data
      leadForm.setValue('full_name', leadPreFillData.full_name || '');
      leadForm.setValue('email', leadPreFillData.email || '');
      leadForm.setValue('phone', leadPreFillData.phone || '');

      // Open the lead dialog
      setLeadDialogOpen(true);

      // Clear the pre-fill data and remove query parameter
      setLeadPreFillData(null);
      window.history.replaceState({}, '', '/crm/pipeline');
    }
  }, [searchParams, leadPreFillData, leadForm, setLeadPreFillData]);

  const { mutateAsync: patchAsync, isLoading: isPatching } = usePatch({
    onSuccess: () => {
      toast.success('Lead updated successfully');
      setModalOpen(false);
      setPendingLeadId(null);
      setPendingTargetStage(null);
      form.reset();
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update lead');
    },
  });

  const { mutateAsync: patchLeadAsync, isLoading: isPatchingLead } = usePatch({
    onSuccess: () => {
      toast.success('Lead updated successfully');
      setIsEditMode(false);
      setViewLeadDialogOpen(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update lead');
    },
  });

  const { mutate: deleteLead, isLoading: isDeletingLead } = useDelete({
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      setViewLeadDialogOpen(false);
      setModalOpen(false);
      setSelectedLead(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete lead');
    },
  });

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    if (!clientsPermission) {
      e.preventDefault();
      toast.error("You don't have permission to perform this action");
      return;
    }
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, targetStage: StageId) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const lead = leads.find(l => String(l.id) === String(id));
    if (!lead || lead.stage === targetStage) return;

    setPendingLeadId(String(lead.id));
    setPendingTargetStage(targetStage);

    form.reset({
      project_type: lead.project_type || '',
      property_type: lead.property_type || '',
      property_size: lead.property_size ?? undefined,
      budget_range: lead.budget_range || '',
      estimated_value: lead.estimated_value ? String(lead.estimated_value) : '',
      proposal_type: lead.proposal_type || '',
      proposal_sent_date: lead.proposal_sent_date || '',
      negotiation_reason: lead.negotiation_reason || '',
      revised_value: lead.revised_value ? String(lead.revised_value) : '',
      final_value: lead.final_value ? String(lead.final_value) : '',
      deposit_received: lead.deposit_received ?? false,
      project_start_date: lead.project_start_date || '',
      loss_reason: lead.loss_reason || '',
    });
    setModalOpen(true);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  const onSubmit = async (data: any) => {
    if (!pendingLeadId || !pendingTargetStage) return;

    // Build payload using STAGE_CONFIG to only send relevant fields
    const config = STAGE_CONFIG[pendingTargetStage];
    const payload: any = { stage: pendingTargetStage };

    config.fields.forEach(field => {
      let val = data[field];
      // Numeric fields per JSON spec
      if (field === 'property_size' && (val !== undefined && val !== '')) {
        val = Number(val);
      } else if (field === 'deposit_received') {
        val = !!val;
      } else if (val !== undefined && val !== null) {
        // Ensure money values and other strings are sent as strings
        val = String(val);
      }
      payload[field] = val;
    });

    await patchAsync({ url: `/crm/leads/${pendingLeadId}/`, data: payload });
  };

  const handleClientSelect = (client: any) => {
    if (client) {
      setSelectedClient(client);
      leadForm.setValue('linked_contact', client.id.toString());
      leadForm.setValue('full_name', `${client.name || ''} ${client.surname || ''}`.trim());
      leadForm.setValue('email', client.email || '');
      leadForm.setValue('phone', client.phone || '');
      setClientPopoverOpen(false);
    }
  };

  const onCreateLead = (data: any) => {
    const payload = {
      ...data,
      stage: 'new',
      owner: user?.id,
      studio: user?.studio_id,
    };

    // Remove linked_contact from payload as it's not a lead field
    delete payload.linked_contact;

    createLead({ url: '/crm/leads/', data: payload });
  };

  const handleConvertToProject = (lead: Lead) => {
    setSelectedLeadForConversion(lead);
    setConversionDialogOpen(true);
  };

  const convertToProject = () => {
    if (!selectedLeadForConversion) return;
    // POST /crm/leads/{id}/convert_to_project/ — backend handles project creation
    createProject({ url: `/crm/leads/${selectedLeadForConversion.id}/create-project/`, data: {
  "client_email": selectedLeadForConversion?.email,
  "project_name": selectedLeadForConversion?.title,
  "project_type": selectedLeadForConversion?.project_type,
  "location": selectedLeadForConversion?.location,
  "start_date": selectedLeadForConversion?.project_start_date,
  "total_budget": selectedLeadForConversion?.final_value
} });
    setConversionDialogOpen(false);
    setSelectedLeadForConversion(null);
    refetch();
  };

  // Create user lookup map
  const userLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    if (usersData && Array.isArray(usersData)) {
      usersData.forEach((user: any) => {
        lookup[String(user.id)] = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      });
    }
    return lookup;
  }, [usersData]);

  const derivedDeals = useMemo<(Deal & { lead: Lead })[]>(() => {
    return (leads || []).map((l: Lead) => {
      const value = Number(l.estimated_value ?? l.budget_range ?? 0) || 0;
      return {
        id: String(l.id),
        title: l.title || 'Untitled',
        company: l.full_name || '',
        value,
        owner: l.owner ? String(l.owner) : '',
        stage: (l.stage as StageId) || 'new',
        closeDate: undefined,
        lead: l,
      };
    });
  }, [leads]);

  const byStage = useMemo(() => {
    const map: Record<StageId, (Deal & { lead: Lead })[]> = {
      new: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    for (const d of derivedDeals) map[d.stage].push(d);
    return map;
  }, [derivedDeals]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const openDeals = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost');
    const totalPipelineValue = openDeals.reduce((sum, lead) => {
      const value = Number(lead.estimated_value || lead.budget_range || 0);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const wonThisMonth = leads.filter(lead => {
      if (lead.stage !== 'won' || !lead.stage_updated_at) return false;
      const stageDate = new Date(lead.stage_updated_at);
      return stageDate.getMonth() === currentMonth && stageDate.getFullYear() === currentYear;
    }).length;

    return {
      totalPipelineValue,
      openDealsCount: openDeals.length,
      wonThisMonth,
    };
  }, [leads]);

  const closeDialog = () => {
    setModalOpen(false);
    setPendingLeadId(null);
    setPendingTargetStage(null);
    form.reset();
  };

  const handleDeleteLead = (lead: Lead) => {
    openDeleteDialog(lead);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    deleteLead({ url: `/crm/leads/${deleteItem.id}/` });
    closeDeleteDialog();
  };

  const handleEditSave = async () => {
    if (!selectedLead) return;
    await patchLeadAsync({ url: `/crm/leads/${selectedLead.id}/`, data: editFields });
  };

  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditFields({
        title: selectedLead?.title || '',
        full_name: selectedLead?.full_name || '',
        email: selectedLead?.email || '',
        source: selectedLead?.source || '',
        estimated_value: selectedLead?.estimated_value || '',
        priority: selectedLead?.priority || '',
        project_type: selectedLead?.project_type || '',
        notes: selectedLead?.notes || '',
      });
    }
    setIsEditMode(prev => !prev);
  };


  // Format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value) return '£0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '£0';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0 space-y-6">
        <CrmNav activeTab="pipeline" counts={{ leads: leads.length }} />

        {/* Header with view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>

         {clientsPermission &&  <div className="flex items-center gap-2">
            <Button
              onClick={() => setLeadDialogOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>}
        </div>

        {/* Board View */}
        <>
            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sage-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-olive-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(kpiMetrics.totalPipelineValue)}
                    </div>
                    <div className="text-sm text-gray-600">Total Pipeline Value</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-ochre-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-ochre-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {kpiMetrics.openDealsCount}
                    </div>
                    <div className="text-sm text-gray-600">Open Deals</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sage-100 p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-olive-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {kpiMetrics.wonThisMonth}
                    </div>
                    <div className="text-sm text-gray-600">Won This Month</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3 overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <div className="flex gap-3 min-w-max">
            {stages.map(s => (
              <div
                key={s.id}
                className="bg-stone-50 rounded-xl flex flex-col max-h-[75vh] w-64 flex-shrink-0"
                onDrop={e => onDrop(e, s.id)}
                onDragOver={onDragOver}
              >
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <s.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-sm text-gray-900 truncate">{s.label}</span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0', s.chipClass)}>
                      {byStage[s.id].length}
                    </span>
                  </div>
                </div>

                <div className="px-3 pb-3 space-y-2 overflow-auto flex-1">
                  {byStage[s.id].map(d => (
                    <DealCard
                      key={d.id}
                      deal={d}
                      lead={d.lead}
                      onDragStart={onDragStart}
                      onConvertToProject={handleConvertToProject}
                      onCardClick={handleCardClick}
                      userLookup={userLookup}
                      clientsPermission={clientsPermission}
                    />
                  ))}

                  {byStage[s.id].length === 0 && (
                    <div className="text-xs text-gray-500 px-3 py-6 text-center border border-dashed border-gray-300 rounded-lg bg-white/50">
                      Drag a deal here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      </div>

      {/* Lead Creation Dialog */}
      <Dialog open={leadDialogOpen} onOpenChange={(open) => {
        setLeadDialogOpen(open);
        if (!open) {
          setSelectedClient(null);
          setClientSearch('');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new lead to your pipeline.
            </DialogDescription>
          </DialogHeader>

          <Form {...leadForm}>
            <form onSubmit={leadForm.handleSubmit(onCreateLead)} className="space-y-4">
              {/* Link to Client */}
              <FormField
                control={leadForm.control}
                name="linked_contact"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Link to Client <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientPopoverOpen}
                            className={cn(
                              "w-full justify-between",
                              !selectedClient && "text-muted-foreground"
                            )}
                          >
                            {selectedClient
                              ? `${selectedClient.name || ''} ${selectedClient.surname || ''}`.trim() + (selectedClient.email ? ` (${selectedClient.email})` : '')
                              : "Search and select a client..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search clients..."
                            value={clientSearch}
                            onValueChange={setClientSearch}
                          />
                          <CommandList>
                            {isLoadingClients ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>No clients found.</CommandEmpty>
                                <CommandGroup>
                                  {(clientsData as any)?.results?.map((client: any) => (
                                    <CommandItem
                                      key={client.id}
                                      value={client.id.toString()}
                                      onSelect={() => handleClientSelect(client)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{`${client.name || ''} ${client.surname || ''}`.trim()}</span>
                                        {client.email && (
                                          <span className="text-xs text-muted-foreground">{client.email}</span>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <FormField
                  control={leadForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title (Project Name) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Modern Living Room Redesign" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={leadForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={leadForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-gray-500 text-xs">(View Only)</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" readOnly className="bg-mute" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={leadForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Source */}
                <FormField
                  control={leadForm.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Source <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Trade Show">Trade Show</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estimated Value */}
                <FormField
                  control={leadForm.control}
                  name="estimated_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={leadForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={leadForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this lead..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                className='mt-3 sm:mt-0'
                  type="button"
                  variant="outline"
                  onClick={() => setLeadDialogOpen(false)}
                  disabled={isCreatingLead}
                >
                  Cancel
                </Button>
                {clientsPermission && <Button type="submit" disabled={isCreatingLead}>
                  {isCreatingLead ? 'Adding...' : 'Add Lead'}
                </Button>}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Project Conversion Dialog */}
      <Dialog open={conversionDialogOpen} onOpenChange={setConversionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convert Lead to Project</DialogTitle>
            <DialogDescription>
              This lead is ready to be converted into a project. Review the details below.
            </DialogDescription>
          </DialogHeader>

          {selectedLeadForConversion && (
            <div className="space-y-6">
              <div className="bg-sage-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Lead Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client Name:</span>
                    <div className="font-medium">{selectedLeadForConversion.full_name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedLeadForConversion.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Project Type:</span>
                    <div className="font-medium">{selectedLeadForConversion.project_type || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Property Type:</span>
                    <div className="font-medium">{selectedLeadForConversion.property_type || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Final Value:</span>
                    <div className="font-medium">{formatCurrency(selectedLeadForConversion.final_value)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Deposit Received:</span>
                    <div className="font-medium">
                      {selectedLeadForConversion.deposit_received ? (
                        <Badge className="bg-sage-100 text-olive-700">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-ochre-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Proposed Project Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Project Name:</span>
                    <div className="font-medium">
                      {selectedLeadForConversion.property_type} - {selectedLeadForConversion.full_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Project Value:</span>
                    <div className="font-medium">{formatCurrency(selectedLeadForConversion.final_value)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <div className="font-medium">
                      {selectedLeadForConversion.project_start_date || 'To be determined'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="font-medium">Planning</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 rounded-full p-1">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-green-800">Ready for Conversion</div>
                    <div className="text-sm text-green-700 mt-1">
                      This lead will be converted to a project with the details above. The lead will remain in "Won" status for record keeping.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConversionDialogOpen(false)}
              disabled={isCreatingProject}
            >
              Cancel
            </Button>
           {clientsPermission && <Button
              onClick={convertToProject}
              disabled={isCreatingProject}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCreatingProject ? 'Converting...' : 'Convert to Project'}
            </Button> }
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update lead stage</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="text-sm text-gray-700">
                Moving lead to:{' '}
                <span className="font-semibold capitalize text-primary font-bold">{pendingTargetStage}</span>
              </div>

              {pendingTargetStage === 'qualified' && <QualifiedFormFields form={form} />}
              {pendingTargetStage === 'proposal' && <ProposalFormFields form={form} />}
              {pendingTargetStage === 'negotiation' && <NegotiationFormFields form={form} />}
              {pendingTargetStage === 'won' && <WonFormFields form={form} />}
              {pendingTargetStage === 'lost' && <LostFormFields form={form} />}

              <DialogFooter className="mt-6">
                <div className="flex gap-2 justify-end w-full">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  {clientsPermission && (
                    <Button type="submit" disabled={isPatching}>
                      {isPatching ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Dialog */}
      <Dialog open={viewLeadDialogOpen} onOpenChange={(open) => {
        setViewLeadDialogOpen(open);
        if (!open) setIsEditMode(false);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedLead?.full_name || 'Lead Details'}</DialogTitle>
            <DialogDescription>
              {selectedLead?.title || selectedLead?.project_type || ''}
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {isEditMode ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input
                      value={editFields.title || ''}
                      onChange={e => setEditFields(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input
                      value={editFields.full_name || ''}
                      onChange={e => setEditFields(p => ({ ...p, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editFields.email || ''}
                      onChange={e => setEditFields(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Estimated Value</Label>
                    <Input
                      type="text"
                      value={editFields.estimated_value
                        ? parseFloat(editFields.estimated_value).toLocaleString('en-GB')
                        : ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/,/g, '');
                        if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                          setEditFields(p => ({ ...p, estimated_value: raw }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Source</Label>
                    <Select
                      value={editFields.source || ''}
                      onValueChange={v => setEditFields(p => ({ ...p, source: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {['Website','Referral','Instagram','LinkedIn','Trade Show','Facebook','Twitter','Other'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Priority</Label>
                    <Select
                      value={editFields.priority || ''}
                      onValueChange={v => setEditFields(p => ({ ...p, priority: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Project Type</Label>
                    <Select
                      value={editFields.project_type || ''}
                      onValueChange={v => setEditFields(p => ({ ...p, project_type: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Notes</Label>
                    <Textarea
                      value={editFields.notes || ''}
                      onChange={e => setEditFields(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Add notes..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email</span>
                      <div className="font-medium text-gray-900">{selectedLead.email || '—'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <div className="font-medium text-gray-900">{selectedLead.phone || '—'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Stage</span>
                      <div className="font-medium text-gray-900 capitalize">{selectedLead.stage}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Estimated Value</span>
                      <div className="font-medium text-gray-900">{formatCurrency(selectedLead.estimated_value)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Project Type</span>
                      <div className="font-medium text-gray-900">{selectedLead.project_type || '—'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Source</span>
                      <div className="font-medium text-gray-900">{selectedLead.source || '—'}</div>
                    </div>
                  </div>
                  {selectedLead.notes && (
                    <div className="text-sm">
                      <span className="text-gray-500">Notes</span>
                      <div className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedLead.notes}</div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                  {selectedLead.stage === 'proposal' && clientsPermission && !isEditMode && (
                    <Button
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800"
                      onClick={() => {
                        setViewLeadDialogOpen(false);
                        window.location.href = `/crm/proposals/new?lead=${selectedLead.id}`;
                      }}
                    >
                      Create Proposal
                    </Button>
                  )}
                  {selectedLead.stage === 'won' && !selectedLead.project_created && clientsPermission && !isEditMode && (
                    <Button
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800"
                      onClick={() => {
                        setViewLeadDialogOpen(false);
                        handleConvertToProject(selectedLead);
                      }}
                    >
                      Convert to Project
                    </Button>
                  )}
                </div>

               
                  <div className="flex gap-2 ml-auto">
                    {isEditMode ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleEditSave} disabled={isPatchingLead}>
                          {isPatchingLead ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <>
                        {clientsPermission && <Button size="sm" variant="outline" onClick={handleEditToggle}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>}
                        {clientsDeletePermission && <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLead(selectedLead)}
                          disabled={isDeletingLead}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {isDeletingLead ? 'Deleting...' : 'Delete'}
                        </Button>}
                      </>
                    )}
                  </div>
            
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        itemName={deleteItem?.full_name || deleteItem?.title}
        requireConfirmation={false}
      />
    </div>
  );
}

export default function PipelinePage() {
  return (
    <PermissionGuard permission="clients.view" redirectTo="/">
      <PipelinePageContent />
    </PermissionGuard>
  );
}