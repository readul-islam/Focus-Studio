'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Hash,
  Home,
  Mail,
  Percent,
  Plus,
  Search,
  Store,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CurrencySelector } from '../ui/CurrencySelector';
import { gooeyToast as toast } from 'goey-toast';
import useUser from '@/hooks/useUser';
import TeammateSearchPopover from './teammateSearch';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { DateRangePicker } from '../ui/DateRangePicker';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectData {
  name: string;
  projectCode: string;
  projectType: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: any;
  paymentSchedule: string;
  ffne: number;
  vt_rate: number;
  phases: Array<{
    name: string;
    duration: string;
    description: string;
    color: string;
    startDate?: string;
    endDate?: string;
    tasks?: string[];
  }>;
  // Delivery address
  delivery_address_line_1?: string;
  delivery_address_line_2?: string;
  delivery_city?: string;
  delivery_county?: string;
  delivery_postcode?: string;
  delivery_country?: string;
  // Billing address
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_county?: string;
  billing_postcode?: string;
  billing_country?: string;
  // Logistics address
  logistics_address_line_1?: string;
  logistics_address_line_2?: string;
  logistics_city?: string;
  logistics_county?: string;
  logistics_postcode?: string;
  logistics_country?: string;
}

// Validation schema
const projectValidationSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  projectType: z.string().min(1, 'Please select a project type'),
  client: z.string().min(1, 'Please select a client'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  ffne: z.number().min(0).max(100, 'FF&E must be between 0 and 100'),
  vt_rate: z.number().min(0).max(100, 'VAT rate must be between 0 and 100'),
});

const projectTypes = [
  {
    id: 'RS',
    name: 'Residential',
    icon: Home,
    description: 'Homes, apartments, and living spaces',
  },
  {
    id: 'CM',
    name: 'Commercial',
    icon: Building2,
    description: 'Offices, retail, and business spaces',
  },
  {
    id: 'HS',
    name: 'Hospitality',
    icon: Store,
    description: 'Hotels, restaurants, and entertainment',
  },
];

const paymentSchedules = [
  {
    id: 'FF',
    name: '50/50 Split',
    description: '50% upfront, 50% on completion',
  },
  {
    id: 'TP',
    name: 'Three Payments',
    description: '33% upfront, 33% midway, 34% completion',
  },
  {
    id: 'PF',
    name: 'Per Phase',
    description: 'Payment aligned with project phases',
  },
  {
    id: 'M',
    name: 'Monthly',
    description: 'Equal monthly payments over project duration',
  },
];

// Animation variants
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Format Date to YYYY-MM-DD in local timezone (not UTC)
function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate project code from project name
 * Examples:
 * - "Test Project" -> "TP-001"
 * - "Chelsea Penthouse" -> "CP-001"
 * - "test" -> "TE-001"
 * - "A" -> "A-001"
 */
function generateProjectCode(name: string, existingCodes: string[] = []): string {
  if (!name || name.trim().length === 0) return '';

  const cleanName = name.trim();
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);

  let prefix: string;

  if (words.length >= 2) {
    // Take first letter of first two words
    prefix = (words[0][0] + words[1][0]).toUpperCase();
  } else if (cleanName.length >= 2) {
    // Single word: take first two letters
    prefix = cleanName.substring(0, 2).toUpperCase();
  } else {
    // Single character
    prefix = cleanName.toUpperCase();
  }

  // Find the next available number
  let counter = 1;
  let code = `${prefix}-${String(counter).padStart(3, '0')}`;

  while (existingCodes.includes(code) && counter < 999) {
    counter++;
    code = `${prefix}-${String(counter).padStart(3, '0')}`;
  }

  return code;
}

// Format number with commas
function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Parse formatted number back to number
function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Label rail with small icon + label
function Labeled({
  icon,
  label,
  children,
  alignTop = false,
  error,
  required = false,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
  error?: string;
  required?: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col space-y-2 text-sm font-medium text-ink"
      variants={fadeInUp}
    >
      <div className={cn('flex items-center gap-2', alignTop && 'self-start pt-1')}>
        {icon && <span className="text-ink-muted">{icon}</span>}
        <span className="truncate">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </div>
      <div>{children}</div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-500"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Number Input with formatting
function NumberInput({
  value,
  onChange,
  placeholder = '0',
  prefix,
  suffix,
  min = 0,
  max,
  className,
  id,
  allowDecimals = true,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  allowDecimals?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? formatNumber(value) : '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatNumber(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty, digits, commas, and optionally decimal point
    const regex = allowDecimals ? /^[\d,]*\.?\d*$/ : /^[\d,]*$/;
    if (!regex.test(rawValue) && rawValue !== '') return;

    setDisplayValue(rawValue);
    const numValue = parseFormattedNumber(rawValue);

    if (max !== undefined && numValue > max) {
      onChange(max);
      setDisplayValue(formatNumber(max));
    } else if (numValue < min) {
      onChange(min);
    } else {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value > 0) {
      setDisplayValue(formatNumber(value));
    } else {
      setDisplayValue('');
    }
  };

  return (
    <div className="relative">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={cn(
          'bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors',
          prefix && 'pl-9',
          suffix && 'pr-9',
          className
        )}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  );
}

// Client Select with Command search
function ClientSelect({
  clients,
  selectedClientId,
  onSelect,
  error,
}: {
  clients: any[];
  selectedClientId: string | number | null | undefined;
  onSelect: (clientId: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedClient = clients?.find((c: any) => String(c.id) === String(selectedClientId));

  const getClientDisplayName = (client: any) => {
    const fullName = [client?.name, client?.surname].filter(Boolean).join(' ');
    return fullName || client?.company_name || 'Unnamed Client';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white border-borderSoft focus:ring-0 focus:border-clay-300 h-10 transition-colors",
            error && "border-red-300 focus:border-red-400"
          )}
        >
          <span className="flex items-center gap-2 overflow-hidden">
            {selectedClient ? (
              <span className="truncate">{getClientDisplayName(selectedClient)}</span>
            ) : (
              <span className="flex items-center gap-2 text-gray-500">
                <Search className="h-4 w-4" />
                Search clients…
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-lg overflow-hidden" align="start">
        <Command className="max-h-[400px]">
          <CommandInput
            placeholder="Search clients…"
            className="focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
          />
          <CommandEmpty>No clients found</CommandEmpty>
          <CommandList
            className="max-h-[300px] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandGroup>
              {clients?.map((client: any) => {
                const isSelected = String(client.id) === String(selectedClientId);
                const displayName = getClientDisplayName(client);
                return (
                  <CommandItem
                    key={client.id}
                    value={`${displayName} ${client?.email || ''}`}
                    onSelect={() => {
                      onSelect(client.id);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-1.5 cursor-pointer py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex pl-4 items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{displayName}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div className="flex flex-col gap-1 pl-4 text-xs text-gray-500">
                      {client?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />
                          {client.email}
                        </span>
                      )}
                      {client?.currency && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-2.5 w-2.5" />
                          {client.currency}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Progress Step Component
function ProgressStep({
  stepNumber,
  currentStep,
  label
}: {
  stepNumber: number;
  currentStep: number;
  label: string;
}) {
  const isActive = stepNumber === currentStep;
  const isCompleted = stepNumber < currentStep;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
          isActive && 'bg-clay-600 text-white shadow-md',
          isCompleted && 'bg-sage-500 text-white',
          !isActive && !isCompleted && 'bg-greige-200 text-ink-muted'
        )}
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
       
      </motion.div>
      <span className={cn(
        'text-xs font-medium transition-colors',
        isActive ? 'text-ink' : 'text-ink-muted'
      )}>
        {label}
      </span>
    </div>
  );
}

const initialProject: ProjectData = {
  name: '',
  projectCode: '',
  projectType: '',
  client: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: 0,
  currency: null,
  paymentSchedule: '',
  ffne: 0,
  vt_rate: 0,
  phases: [],
};

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const { user, isLoading: userLoading } = useUser();
  const [data, setData] = useState<ProjectData>(initialProject);
  const [expandedSections, setExpandedSections] = useState({
    phases: false,
    budget: true,
  });
  const [selectedTeammates, setSelectedTeammates] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);

  // Get clients
  const { data: clientData, isLoading: clientLoading } = useFetch('crm/studio-clients/');
  const { data: usersData, isLoading: usersLoading } = useFetch(`user/studio-users?studio_id=${user?.studio?.id}`);
  const { data: existingProjects } = useFetch('projects/user-projects/');
  const { mutate } = usePost();

  const { data: studioTemplates } = useFetch('user/studio/templates/');
  const { mutateAsync: postPhaseAsync } = usePost();

  const queryClient = useQueryClient();

  // Extract existing project codes
  const existingCodes = useMemo(() => {
    if (!existingProjects) return [];
    return existingProjects.map((p: any) => p.project_code).filter(Boolean);
  }, [existingProjects]);

  // Auto-generate project code when name changes
  useEffect(() => {
    if (data.name && data.name.trim().length > 0) {
      const generatedCode = generateProjectCode(data.name, existingCodes);
      setData(prev => ({ ...prev, projectCode: generatedCode }));
    } else {
      setData(prev => ({ ...prev, projectCode: '' }));
    }
  }, [data.name, existingCodes]);

  const applyTemplate = useCallback((templateId: number | null) => {
    setSelectedTemplateId(templateId);
    if (!templateId || !studioTemplates) {
      setData(prev => ({ ...prev, phases: [] }));
      return;
    }
    const template = (studioTemplates as any[]).find((t: any) => t.id === templateId);
    if (!template) return;
    const phases = (template.phases ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((phase: any) => ({
        name: phase.name,
        color: phase.color || '#9CA3AF',
        description: '',
        duration: '',
        tasks: (phase.default_tasks ?? [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((t: any) => t.title),
      }));
    setData(prev => ({ ...prev, phases }));
  }, [studioTemplates]);

  // Scroll to top when step changes
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const updateData = useCallback((updates: Partial<ProjectData>) => {
    setData(prev => ({ ...prev, ...updates }));

    // Clear errors for updated fields
    const errorUpdates: Record<string, string> = {};
    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        errorUpdates[key] = '';
      }
    });
    if (Object.keys(errorUpdates).length > 0) {
      setErrors(prev => ({ ...prev, ...errorUpdates }));
    }
  }, [errors]);

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateStep = useCallback((stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!data.name || data.name.trim().length < 2) {
        newErrors.name = 'Project name must be at least 2 characters';
      }
      if (!data.projectType) {
        newErrors.projectType = 'Please select a project type';
      }
      if (!data.client) {
        newErrors.client = 'Please select a client';
      }
    }

    // Step 2 (Address) has no required fields

    if (stepNum === 3) {
      if (!data.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!data.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (stepNum === 4) {
      if (data.ffne < 0 || data.ffne > 100) {
        newErrors.ffne = 'FF&E must be between 0 and 100';
      }
      if (data.vt_rate < 0 || data.vt_rate > 100) {
        newErrors.vt_rate = 'VAT rate must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClose = () => {
    setExpandedSections({ phases: false, budget: true });
    onOpenChange(false);
    setStep(1);
    setDirection(0);
    setData(initialProject);
    setErrors({});
    setTouched({});
    setSelectedTeammates([]);
    setSelectedTemplateId(null);
    setTemplatePopoverOpen(false);
  };

  const handleNext = () => {
    if (validateStep(step) && step < 4) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleCreate = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      // 1. Create phases first
      const phaseIds: number[] = [];

      if (data.phases && data.phases.length > 0) {
        const phasePromises = data.phases.map(phase => {
          const phasePayload = {
            name: phase.name,
            description: phase.description || "",
            color: phase.color || '#9CA3AF',
            progress: 0,
            pre_loaded_tasks: Array.isArray(phase.tasks) && phase.tasks.length > 0
              ? phase.tasks.join('\n')
              : "",
            start_date: phase.startDate || data.startDate || new Date().toISOString().split('T')[0],
            end_date: phase.endDate || data.endDate || new Date().toISOString().split('T')[0],
            studio: user?.studio?.id,
            created_by: user?.id,
            updated_by: user?.id
          };
          return postPhaseAsync({ url: 'projects/phases/', data: phasePayload });
        });

        const createdPhases = await Promise.all(phasePromises);
        createdPhases.forEach((p: any) => {
          if (p && p.id) phaseIds.push(p.id);
        });
      }

      // 2. Create project with phase IDs
      const finalData = {
        project_name: data.name,
        project_type: data.projectType,
        project_status: 'AC',
        project_description: data.description,
        delivery_address_line_1: data.delivery_address_line_1 || '',
        delivery_address_line_2: data.delivery_address_line_2 || '',
        delivery_city: data.delivery_city || '',
        delivery_county: data.delivery_county || '',
        delivery_postcode: data.delivery_postcode || '',
        delivery_country: data.delivery_country || '',
        billing_address_line_1: data.billing_address_line_1 || '',
        billing_address_line_2: data.billing_address_line_2 || '',
        billing_city: data.billing_city || '',
        billing_county: data.billing_county || '',
        billing_postcode: data.billing_postcode || '',
        billing_country: data.billing_country || '',
        logistics_address_line_1: data.logistics_address_line_1 || '',
        logistics_address_line_2: data.logistics_address_line_2 || '',
        logistics_city: data.logistics_city || '',
        logistics_county: data.logistics_county || '',
        logistics_postcode: data.logistics_postcode || '',
        logistics_country: data.logistics_country || '',
        project_code: data.projectCode,
        start_date: data.startDate,
        end_date: data.endDate,
        total_budget: data.budget,
        currency: data.currency?.code || 'USD',
        payment_schedule: data.paymentSchedule,
        client: data.client,
        studio: user?.studio?.id,
        assignees: [...selectedTeammates.map((t: any) => t.id), user?.id],
        phases: phaseIds,
        ffne: data.ffne,
        vt_rate: data.vt_rate,
      };

      mutate(
        { url: 'projects/projects/', data: finalData },
        {
          onSuccess: () => {
            toast.success('Project created successfully');
            queryClient.refetchQueries({ queryKey: ['projects/user-projects/'] });
            handleClose();
          },
          onError: () => {
            toast.error('Failed to create project');
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Error creating project or phases:", error);
      toast.error('Failed to create project phases');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.name && data.name.trim().length >= 2 && data.projectType && data.client;
      case 2: {
        const addressPrefixes = ['delivery', 'billing', 'logistics'] as const;
        const addressFields = ['address_line_1', 'city', 'postcode', 'country'] as const;
        return addressPrefixes.every(prefix =>
          addressFields.every(field => {
            const val = (data as any)[`${prefix}_${field}`];
            return val && val.trim().length > 0;
          })
        );
      }
      case 3:
        return data.startDate && data.endDate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepLabels = ['Details', 'Address', 'Timeline', 'Budget & Team'];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div className="space-y-2" variants={fadeInUp}>
                <Label htmlFor="name" className="text-sm font-medium text-ink">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Chelsea Penthouse Renovation"
                  value={data.name}
                  onChange={e => updateData({ name: e.target.value })}
                  onBlur={() => markTouched('name')}
                  className={cn(
                    "bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors",
                    touched.name && errors.name && "border-red-300 focus:border-red-400"
                  )}
                />
                <AnimatePresence>
                  {touched.name && errors.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1.5 text-xs text-red-500"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div className="space-y-2" variants={fadeInUp}>
                <Label htmlFor="projectCode" className="text-sm font-medium text-ink flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-ink-muted" />
                  Project Code
                </Label>
                <Input
                  id="projectCode"
                  value={data.projectCode}
                  onChange={e => updateData({ projectCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., TP-001"
                  className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <p className="text-xs text-ink-muted">Auto-generated, but you can customize it</p>
              </motion.div>
            </div>

            <motion.div className="space-y-2" variants={fadeInUp}>
              <Label className="text-sm font-medium text-ink">
                Project Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {projectTypes.map(type => {
                  const IconComponent = type.icon;
                  const isSelected = data.projectType === type.id;
                  return (
                    <motion.div
                      key={type.id}
                      // whileHover={{ scale: 1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={cn(
                          'cursor-pointer transition-all duration-200',
                          isSelected
                            ? 'border-clay-600 bg-clay-50 shadow-sm'
                            : 'border-borderSoft bg-white hover:bg-greige-50 hover:border-clay-300'
                        )}
                        onClick={() => updateData({ projectType: type.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                              isSelected ? 'bg-clay-600 text-white' : 'bg-greige-100 text-ink-muted'
                            )}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-medium text-ink">{type.name}</h4>
                              <p className="text-xs text-ink-muted mt-0.5">{type.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <AnimatePresence>
                {errors.projectType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-500"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.projectType}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-medium text-ink">
                  Client <span className="text-red-500">*</span>
                </Label>
                <ClientSelect
                  clients={clientData || []}
                  selectedClientId={data.client}
                  onSelect={(clientId) => updateData({ client: clientId })}
                  error={errors.client}
                />
                <AnimatePresence>
                  {errors.client && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1.5 text-xs text-red-500"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.client}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={fadeInUp}>
              <Label htmlFor="description" className="text-sm font-medium text-ink">
                Project Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the project scope and objectives..."
                value={data.description}
                onChange={e => updateData({ description: e.target.value })}
                className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px] resize-none"
              />
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <p className="text-sm text-ink-muted mb-4">Add delivery, billing, and logistics addresses for this project. You can skip this and fill it in later from project settings.</p>
              <Tabs defaultValue="delivery">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="logistics">Logistics</TabsTrigger>
                </TabsList>
                {(['delivery', 'billing', 'logistics'] as const).map(prefix => (
                  <TabsContent key={prefix} value={prefix}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-ink">Address Line 1</Label>
                        <Input
                          placeholder="Street address"
                          value={(data as any)[`${prefix}_address_line_1`] ?? ''}
                          onChange={e => updateData({ [`${prefix}_address_line_1`]: e.target.value } as any)}
                          className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-ink">Address Line 2</Label>
                        <Input
                          placeholder="Apartment, suite, etc."
                          value={(data as any)[`${prefix}_address_line_2`] ?? ''}
                          onChange={e => updateData({ [`${prefix}_address_line_2`]: e.target.value } as any)}
                          className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-ink">City</Label>
                          <Input
                            placeholder="City"
                            value={(data as any)[`${prefix}_city`] ?? ''}
                            onChange={e => updateData({ [`${prefix}_city`]: e.target.value } as any)}
                            className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-ink">Postcode</Label>
                          <Input
                            placeholder="Postcode"
                            value={(data as any)[`${prefix}_postcode`] ?? ''}
                            onChange={e => updateData({ [`${prefix}_postcode`]: e.target.value } as any)}
                            className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-ink">County</Label>
                          <Input
                            placeholder="County"
                            value={(data as any)[`${prefix}_county`] ?? ''}
                            onChange={e => updateData({ [`${prefix}_county`]: e.target.value } as any)}
                            className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-ink">Country</Label>
                          <Input
                            placeholder="Country"
                            value={(data as any)[`${prefix}_country`] ?? ''}
                            onChange={e => updateData({ [`${prefix}_country`]: e.target.value } as any)}
                            className="bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div className="grid grid-cols-1 gap-4" variants={fadeInUp}>
              <div className="space-y-2">
                <Labeled label="Project Duration" required>
                  <DateRangePicker
                    onUpdate={(values) => {
                      if (values.range.from) {
                        updateData({
                          startDate: formatDateToLocal(values.range.from),
                          endDate: values.range.to ? formatDateToLocal(values.range.to) : formatDateToLocal(values.range.from)
                        });
                      }
                    }}
                    initialDateFrom={data?.startDate || undefined}
                    initialDateTo={data?.endDate || undefined}
                    align='center'
                    locale="en-GB"
                    showCompare={false}
                  />
                </Labeled>
                <AnimatePresence>
                  {(errors.startDate || errors.endDate) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1.5 text-xs text-red-500"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.startDate || errors.endDate}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Template Selector */}
            {studioTemplates && (studioTemplates as any[]).length > 0 && (
              <motion.div variants={fadeInUp}>
                <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200',
                        selectedTemplateId !== null
                          ? 'border-clay-500 bg-clay-50 text-clay-700'
                          : 'border-borderSoft bg-white text-ink-muted hover:border-clay-300 hover:bg-greige-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {selectedTemplateId !== null ? (() => {
                          const tpl = (studioTemplates as any[]).find((t: any) => t.id === selectedTemplateId);
                          const phases: any[] = (tpl?.phases ?? []).sort((a: any, b: any) => a.order - b.order);
                          return (
                            <>
                              <div className="flex -space-x-0.5">
                                {phases.slice(0, 4).map((ph: any, i: number) => (
                                  <span
                                    key={i}
                                    className="w-2.5 h-2.5 rounded-full border border-white"
                                    style={{ backgroundColor: ph.color || '#9CA3AF' }}
                                  />
                                ))}
                              </div>
                              <span className="font-medium truncate">{tpl?.name}</span>
                              <span className="text-clay-500 text-xs flex-shrink-0">
                                {phases.length} phase{phases.length !== 1 ? 's' : ''}
                              </span>
                            </>
                          );
                        })() : (
                          <>
                            <span className="text-ink-muted">Select a template</span>
                            <span className="text-xs text-ink-muted/60">— optional</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {selectedTemplateId !== null && (
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); applyTemplate(null); }}
                            className="text-xs text-clay-500 hover:text-clay-700 px-1.5 py-0.5 rounded hover:bg-clay-100 transition-colors"
                          >
                            Clear
                          </span>
                        )}
                        <ChevronDown className="w-4 h-4 text-ink-muted" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-1.5 w-[--radix-popover-trigger-width] rounded-xl border border-gray-200 shadow-lg"
                    align="start"
                    sideOffset={4}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search templates…"
                        className="text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <CommandList className="max-h-[280px] overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm text-ink-muted">
                          No templates found
                        </CommandEmpty>
                        <CommandGroup>
                          {(studioTemplates as any[]).map((tpl: any) => {
                            const isSelected = selectedTemplateId === tpl.id;
                            const phases: any[] = (tpl.phases ?? []).sort((a: any, b: any) => a.order - b.order);
                            return (
                              <CommandItem
                                key={tpl.id}
                                value={tpl.name}
                                onSelect={() => { applyTemplate(isSelected ? null : tpl.id); setTemplatePopoverOpen(false); }}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="flex -space-x-0.5 flex-shrink-0">
                                    {phases.slice(0, 4).map((ph: any, i: number) => (
                                      <span
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-full border border-white"
                                        style={{ backgroundColor: ph.color || '#9CA3AF' }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-ink truncate">{tpl.name}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-ink-muted">
                                    {phases.length} phase{phases.length !== 1 ? 's' : ''}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-clay-600" />}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </motion.div>
            )}

            {/* Phase List */}
            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink-muted" />
                  <span className="text-sm font-medium text-ink">
                    Project Phases
                    {data.phases.length > 0 && (
                      <span className="ml-1.5 text-ink-muted font-normal">({data.phases.length})</span>
                    )}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-borderSoft bg-white hover:bg-greige-50 gap-1.5"
                  onClick={() => {
                    updateData({
                      phases: [
                        ...data.phases,
                        { name: `Phase ${data.phases.length + 1}`, color: '#9CA3AF', description: '', duration: '', tasks: [] },
                      ],
                    });
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Phase
                </Button>
              </div>

              <AnimatePresence>
                {data.phases.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-ink-muted text-sm border border-dashed border-borderSoft rounded-xl"
                  >
                    No phases yet. Select a template or add phases manually.
                  </motion.div>
                )}
                {data.phases.map((phase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.04 }}
                    className="mb-3"
                  >
                    <Card className="border-borderSoft bg-white">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header row */}
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-greige-50 text-ink-muted border-borderSoft">
                              Phase {index + 1}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = data.phases.filter((_, i) => i !== index);
                                updateData({ phases: updated });
                              }}
                              className="text-ink-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Name + Color picker */}
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="w-8 h-8 rounded-lg border border-borderSoft flex-shrink-0 transition-opacity hover:opacity-80"
                                  style={{ backgroundColor: phase.color || '#9CA3AF' }}
                                  title="Pick phase color"
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3" align="start">
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-ink-muted mb-2">Phase color</p>
                                  <div className="grid grid-cols-6 gap-1.5">
                                    {[
                                      '#9CA3AF','#EF4444','#F97316','#EAB308',
                                      '#22C55E','#14B8A6','#3B82F6','#6366F1',
                                      '#8B5CF6','#EC4899','#F43F5E','#78716C',
                                    ].map(color => (
                                      <button
                                        key={color}
                                        type="button"
                                        className={cn(
                                          'w-6 h-6 rounded-md border-2 transition-transform hover:scale-110',
                                          phase.color === color ? 'border-clay-600' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                          const updated = [...data.phases];
                                          updated[index] = { ...phase, color };
                                          updateData({ phases: updated });
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <input
                                      type="color"
                                      value={phase.color || '#9CA3AF'}
                                      onChange={e => {
                                        const updated = [...data.phases];
                                        updated[index] = { ...phase, color: e.target.value };
                                        updateData({ phases: updated });
                                      }}
                                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-xs text-ink-muted">Custom color</span>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Input
                              value={phase.name}
                              onChange={e => {
                                const updated = [...data.phases];
                                updated[index] = { ...phase, name: e.target.value };
                                updateData({ phases: updated });
                              }}
                              placeholder="Phase name"
                              className="font-medium bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>

                          <Textarea
                            value={phase.description}
                            onChange={e => {
                              const updated = [...data.phases];
                              updated[index] = { ...phase, description: e.target.value };
                              updateData({ phases: updated });
                            }}
                            placeholder="Phase description (optional)"
                            className="text-sm bg-white border-borderSoft focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                            rows={2}
                          />
                          <div className="space-y-1">
                            <DateRangePicker
                              key={`phase-${index}-${phase?.startDate}-${phase?.endDate}-${index > 0 ? data.phases[index - 1]?.endDate : 'first'}`}
                              onUpdate={(values) => {
                                if (values.range.from) {
                                  const updated = [...data.phases];
                                  updated[index] = {
                                    ...phase,
                                    startDate: formatDateToLocal(values.range.from),
                                    endDate: values.range.to ? formatDateToLocal(values.range.to) : formatDateToLocal(values.range.from)
                                  };
                                  updateData({ phases: updated });
                                }
                              }}
                              initialDateFrom={
                                phase?.startDate ||
                                (index > 0 ? data.phases[index - 1]?.endDate : undefined) ||
                                undefined
                              }
                              initialDateTo={phase?.endDate || undefined}
                              align='center'
                              locale="en-GB"
                              showCompare={false}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.p
              className="text-xs text-ink-muted ml-2"
              variants={fadeInUp}
            >
              Tip: You can customize phases later from project settings
            </motion.p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Budget Configuration */}
            <motion.div variants={fadeInUp}>
              <Collapsible open={expandedSections.budget} onOpenChange={() => toggleSection('budget')}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer border-borderSoft bg-white hover:bg-greige-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-ink-muted" />
                          </div>
                          <div>
                            <h4 className="font-medium text-ink">Budget & Payment</h4>
                            <p className="text-sm text-ink-muted">
                              {data.budget > 0
                                ? `${data?.currency?.symbol || '£'}${formatNumber(data.budget)}`
                                : 'Click to configure'}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedSections.budget ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-ink-muted" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-3">
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-sm font-medium text-ink">
                        Total Budget
                      </Label>
                      <NumberInput
                        id="budget"
                        value={data.budget}
                        onChange={(value) => updateData({ budget: value })}
                        placeholder="0"
                        prefix={<DollarSign className="w-4 h-4" />}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-ink">
                        Currency
                      </Label>
                      <CurrencySelector data={data} onChange={updateData} />
                    </div>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="ffne" className="text-sm font-medium text-ink flex items-center gap-2">
                        {/* <Percent className="w-3.5 h-3.5 text-ink-muted" /> */}
                        FF&E (%)
                      </Label>
                      <NumberInput
                        id="ffne"
                        value={data.ffne}
                        onChange={(value) => updateData({ ffne: value })}
                        placeholder="0"
                        suffix={<span className="text-sm">%</span>}
                        min={0}
                        max={100}
                        allowDecimals={true}
                      />
                      <p className="text-xs text-ink-muted">Furniture, Fixtures & Equipment allocation</p>
                      <AnimatePresence>
                        {errors.ffne && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 text-xs text-red-500"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.ffne}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vt_rate" className="text-sm font-medium text-ink flex items-center gap-2">
                        {/* <Percent className="w-3.5 h-3.5 text-ink-muted" /> */}
                        VAT Rate (%)
                      </Label>
                      <NumberInput
                        id="vt_rate"
                        value={data.vt_rate}
                        onChange={(value) => updateData({ vt_rate: value })}
                        placeholder="0"
                        suffix={<span className="text-sm">%</span>}
                        min={0}
                        max={100}
                        allowDecimals={true}
                      />
                      <p className="text-xs text-ink-muted">Value Added Tax rate</p>
                      <AnimatePresence>
                        {errors.vt_rate && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 text-xs text-red-500"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.vt_rate}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label className="text-sm font-medium text-ink">Payment Schedule</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentSchedules.map((schedule, index) => {
                        const isSelected = data.paymentSchedule === schedule.id;
                        return (
                          <motion.div
                            key={schedule.id}
                            // whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + index * 0.05 }}
                          >
                            <Card
                              className={cn(
                                'cursor-pointer transition-all duration-200',
                                isSelected
                                  ? 'border-clay-600 bg-clay-50 shadow-sm'
                                  : 'border-borderSoft bg-white hover:bg-greige-50 hover:border-clay-300'
                              )}
                              onClick={() => updateData({ paymentSchedule: schedule.id })}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-ink text-sm">{schedule.name}</h5>
                                    <p className="text-xs text-ink-muted">{schedule.description}</p>
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    >
                                      <Check className="w-4 h-4 text-clay-600" />
                                    </motion.div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>

            {/* Team Assignment */}
            <motion.div variants={fadeInUp}>
              <Card className="border-borderSoft bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-ink-muted" />
                    </div>
                    <div>
                      <h4 className="font-medium text-ink">Team Assignment</h4>
                      <p className="text-sm text-ink-muted">Assign team members to this project</p>
                    </div>
                  </div>
                  <TeammateSearchPopover
                    users={usersData}
                    selectedTeammates={selectedTeammates}
                    setSelectedTeammates={setSelectedTeammates}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-borderSoft"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-ink">Create New Project</DialogTitle>
          </div>
        </DialogHeader>

        <div>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {[1, 2, 3, 4].map((stepNumber, index) => (
              <div key={stepNumber} className="flex items-center">
                <ProgressStep
                  stepNumber={stepNumber}
                  currentStep={step}
                  label={stepLabels[index]}
                />
          
              </div>
            ))}
          </div>

          {/* Step Content with Animation */}
          <div className="min-h-[420px] relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          <Separator className="bg-borderSoft my-6" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-borderSoft bg-white hover:bg-greige-50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {step > 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-borderSoft bg-white hover:bg-greige-50"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step === 2 && (
                <Button
                  variant="ghost"
                  onClick={() => { setDirection(1); setStep(3); }}
                  disabled={isSubmitting}
                  className="border-borderSoft"
                >
                  Skip
                </Button>
              )}
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-clay-600 hover:bg-clay-700 text-white min-w-[100px]"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="bg-clay-600 hover:bg-clay-700 text-white min-w-[140px]"
                >
                  {isSubmitting ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Creating...
                    </motion.div>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
