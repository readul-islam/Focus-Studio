'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OnboardingWizard } from '@/components/project-settings/onboarding-wizard';
import { computeMissingFields, computeProgressPct } from '@/components/project-settings/utils';
import type { OnboardingData } from '@/components/project-settings/types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings,
  Building2,
  ClipboardList,
  Truck,
  SlidersHorizontal,
  Users,
  Sparkles,
  Calendar as CalendarIcon2,
  DollarSign,
  Building,
  Store,
  Home,
  Clock,
  Plus,
  Search,
  Check,
  Trash,
  Save,
  Rocket,
  Loader2,
  Mail,
  User,
  QrCode,
  Copy,
  Printer,
  CheckSquare,
  X,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import useFetch from '@/hooks/useFetch';
import { patchData } from '@/lib/Api';
import useUser from '@/hooks/useUser';
import { usePost } from '@/hooks/usePost';
import useDeleteData from '@/hooks/useDelete';
import { InviteClientDialog } from '@/components/InviteClientDialog';
import { InviteContractorDialog } from '@/components/InviteContractorDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { getProjectPortalUrl } from '@/lib/contractor-portal-url';


// Format Date to YYYY-MM-DD in local timezone (not UTC)
function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Client Select with Command search
function ClientSelect({
  clients,
  selectedClientId,
  onSelect,
  projectEditPermission
}: {
  clients: any[];
  selectedClientId: string | number | null | undefined;
  onSelect: (clientId: string) => void;
  projectEditPermission: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedClient = clients?.find((c: any) => String(c.id) === String(selectedClientId));

  const getClientDisplayName = (client: any) => {
    const fullName = [client?.name, client?.surname].filter(Boolean).join(' ');
    return fullName || client?.company_name || 'Unnamed Client';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger  asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={!projectEditPermission}
          aria-expanded={open}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed justify-between bg-white border-borderSoft focus:ring-0 focus:border-clay-300 h-10"
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
      <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md overflow-hidden" align="start">
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
                      onSelect(String(client.id));
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

type SectionKey =
  | 'overview'
  | 'people'
  | 'delivery'
  | 'rooms'
  | 'schedule'
  | 'financial'
  | 'settings';

const sections: { key: SectionKey; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: Settings },
  { key: 'people', label: 'People', icon: Users },
  { key: 'delivery', label: 'Delivery & Billing', icon: Truck },
  { key: 'rooms', label: 'Rooms', icon: ClipboardList },
  { key: 'schedule', label: 'Schedule', icon: CalendarIcon2 },
  { key: 'financial', label: 'Financial', icon: DollarSign },
  { key: 'settings', label: 'Preferences', icon: SlidersHorizontal },
];

function initialsOf(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length > 1) {
    // Take first char of first and last word
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  // Only one word -> take first 2 letters
  return name.substring(0, 2).toUpperCase();
}

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params?.id ?? 'project-1';
  const {can} = usePermissions();
  const projectEditPermission = can('projects.edit');
  const projectDeletePermission = can('projects.delete');

  // Get section from URL params, default to 'overview'
  const sectionParam = searchParams.get('section') as SectionKey | null;
  const validSections: SectionKey[] = ['overview', 'people', 'delivery', 'rooms', 'schedule', 'financial', 'settings'];
  const selected: SectionKey = sectionParam && validSections.includes(sectionParam) ? sectionParam : 'overview';

  const setSelected = (section: SectionKey) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('section', section);
    router.push(`/projects/${params?.id}/settings?${newParams.toString()}`, { scroll: false });
  };

  const [wizardOpen, setWizardOpen] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const { user } = useUser();
  const { isOpen, item, openDialog, closeDialog } = useDeleteDialog();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    contacts: { additional: [] },
    property: {},
    rooms: [],
    deliveryBilling: {},
    preferencesConsent: {},
  });
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const queryClient = useQueryClient();
  const [openInviteClientDialog, setOpenInviteClientDialog] = useState(false);

  const { mutate: inviteClientToOnboard, isPending: inviteLoading } = usePost();

  const { data: clientData, isLoading: loadingClient, refetch: refetchClient } = useFetch(`/crm/studio-clients/`);
  const { data: projectData, isLoading: projectLoading } = useFetch(`projects/projects/${params?.id}/`);
  const { data: studioUsers, isLoading: usersLoading } = useFetch(`user/studio-users?studio_id=${user?.studio?.id}`);

  const { mutate: updateProject } = useMutation({
    mutationFn: (data: any) => patchData({ url: `projects/projects/${params?.id}/`, data }),
    onSuccess: () => {
      toast.success('Project Updated');
      queryClient.refetchQueries({ queryKey: [`projects/projects/${params?.id}/`] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error('Error updating project');
    },
  });
  
  // Copy client info - Safari requires clipboard write to start during user gesture
  // We use ClipboardItem with a Promise which Safari supports
  const handleCopyClientInfo = () => {
    // Start the clipboard write immediately during user gesture
    const textPromise = new Promise<string>((resolve, reject) => {
      inviteClientToOnboard(
        { url: '/client_portal/copy-client-credentials/', data: { project_id: params?.id, client_id: projectData?.client?.id } },
        {
          onSuccess: (e) => {
            const text = `Login URL: ${e?.login_url}\nEmail: ${e?.credentials?.email}\nPassword: ${e?.credentials?.password}`;
            resolve(text);
          },
          onError: () => {
            reject(new Error('API error'));
          },
        }
      );
    });

    // Use ClipboardItem with Promise - Safari supports this pattern
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const clipboardItem = new ClipboardItem({
        'text/plain': textPromise.then((text) => new Blob([text], { type: 'text/plain' })),
      });

      navigator.clipboard.write([clipboardItem])
        .then(() => toast.success('Client info copied'))
        .catch(() => toast.error('Failed to copy to clipboard'));
    } else {
      // Fallback for older browsers - wait for API then copy
      textPromise
        .then((text) => {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          toast.success('Client info copied');
        })
        .catch(() => toast.error('Error copying client info'));
    }
  };

  // Copy secondary client info
  const handleCopySecondaryClientInfo = (clientId: string | number) => {
    const textPromise = new Promise<string>((resolve, reject) => {
      inviteClientToOnboard(
        { url: '/client_portal/copy-client-credentials/', data: { project_id: params?.id, client_id: clientId } },
        {
          onSuccess: (e) => {
            const text = `Login URL: ${e?.login_url}\nEmail: ${e?.credentials?.email}\nPassword: ${e?.credentials?.password}`;
            resolve(text);
          },
          onError: () => {
            reject(new Error('API error'));
          },
        }
      );
    });

    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const clipboardItem = new ClipboardItem({
        'text/plain': textPromise.then((text) => new Blob([text], { type: 'text/plain' })),
      });

      navigator.clipboard.write([clipboardItem])
        .then(() => toast.success('Client info copied'))
        .catch(() => toast.error('Failed to copy to clipboard'));
    } else {
      textPromise
        .then((text) => {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          toast.success('Client info copied');
        })
        .catch(() => toast.error('Error copying client info'));
    }
  }

  // Delete Projects
  const { mutate: deleteProjectApi } = useDeleteData();

  useEffect(() => {
    if (projectData) {
      setSelectedProject(projectData);
    }
  }, [projectData]);

  const missing = useMemo(() => computeMissingFields(onboardingData), [onboardingData]);
  const progressPct = useMemo(() => computeProgressPct(missing), [missing]);

  async function handleSave(section: string, payload: any) {
    if (!projectData) return;

    const changes: any = {};
    Object.keys(payload).forEach(key => {
      if (payload[key] !== projectData[key]) {
        changes[key] = payload[key];
      }
    });

    if (Object.keys(changes).length > 0) {
      updateProject(changes);
    } else {
      toast.info('No changes to save');
    }
  }

  const handleArchive = id => {
    if(!projectEditPermission) {
      toast.error('You do not have permission to archive this project');
      return;
    }
    updateProject({ project_status: 'ARC' });
    toast.success('Moved to Archive');
  };

  const handleUnArchive = id => {
    if(!projectEditPermission) {
      toast.error('You do not have permission to unarchive this project');
      return;
    }
    updateProject({ project_status: 'AC' });
    toast.success('Moved to Active');
  };

  const handleDelete = id => {
    if(!projectDeletePermission) {
      toast.error('You do not have permission to delete this project');
      return;
    }
    deleteProjectApi(
      { url: `/projects/projects/${id}/` },
      {
        onSuccess: () => {
          router.push('/projects');
          // Use refetchQueries to immediately refetch the data
          queryClient.refetchQueries({ queryKey: ['projects/user-projects/'] });
          queryClient.refetchQueries({ queryKey: ['projects'] });
          toast.success('Project deleted');
        },
        onError: () => {
          toast.error('Failed to delete project');
        },
      },
    );
  };

 const [isSendingInvite, setIsSendingInvite] = useState(false);

  const onSendInviteClient = (formData: { cc: any[]; bcc: any[]; message: string }) => {
    if (!formData.message) return;
    setIsSendingInvite(true);
    
    inviteClientToOnboard(
      {
        url: '/client_portal/generate-client-login/',
        data: {
          project_id: params?.id,
          client_id: projectData?.client?.id,
          html_content: formData.message,
          // cc: formData.cc?.map((u: any) => u.email || u.id) || [],
          // bcc: formData.bcc?.map((u: any) => u.email || u.id) || [],
        },
      },
      {
        onSuccess: () => {
          toast.success('Invitation sent to client!');
          setOpenInviteClientDialog(false);
          setIsSendingInvite(false);
        },
        onError: () => {
          toast.error('Failed to send invitation');
          setIsSendingInvite(false);
        },
      },
    );
  };

  return (
    <main className="">
      <div className="">
        {/* Header with CTA and onboarding progress */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Project Settings</h1>
            {/* <div className="mt-1 flex items-center gap-2">
              <Badge variant={missing.length === 0 ? 'default' : 'secondary'}>
                {missing.length === 0 ? 'Onboarding complete' : `${missing.length} fields remaining`}
              </Badge>
              <div className="w-40">
                <Progress value={progressPct} />
              </div>
            </div> */}
          </div>
          {projectEditPermission && <Button className="bg-clay-500 hover:bg-clay-600 text-white" onClick={()=> setOpenInviteClientDialog(true)}>
            {/* {inviteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
            {inviteLoading ? 'Inviting...' : 'Invite Client to Onboard'} */}
            Invite Client to Onboard
          </Button>}
          {/* <InviteOnboardDialog projectId={projectId} onStartWizard={() => setWizardOpen(true)} /> */}
        </div>

        {/* Mobile / tablet: horizontal scrollable pill tabs */}
        <div className="lg:hidden mb-4 -mx-1">
          <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
            {sections.map(s => {
              const Icon = s.icon;
              const active = selected === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setSelected(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              );
            })}
            {projectEditPermission && (
              <button
                onClick={() => setOpenArchive(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 bg-white border border-gray-200 text-green-700 hover:bg-green-50 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
                {selectedProject?.project_status === 'ARC' ? 'Unarchive' : 'Archive'}
              </button>
            )}
            {projectDeletePermission && (
              <button
                onClick={() => openDialog(selectedProject?.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sticky Sections nav — desktop only */}
          <aside className="hidden lg:block lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="grid gap-1">
                  {sections.map(s => {
                    const Icon = s.icon;
                    const active = selected === s.key;
                    return (
                      <Button
                        key={s.key}
                        variant={(s?.key as string) == 'delete' ? 'destructive' : 'ghost'}
                        className={`justify-start ${
                          (s?.key as string) == 'delete' ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' : active ? 'bg-stone-100 text-gray-900' : ''
                        }`}
                        onClick={() => setSelected(s.key)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {s.label}
                      </Button>
                    );
                  })}
           {projectEditPermission && <Button
                    className="justify-start bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    onClick={() => setOpenArchive(true)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {selectedProject?.project_status === 'ARC' ? 'Unarchive' : 'Archive'}
                  </Button>}

              {projectDeletePermission && <Button
                    variant={'destructive'}
                    className={`justify-start bg-red-50 text-red-700 hover:bg-red-100 border-red-200`}
                    onClick={() => openDialog(selectedProject?.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Section form */}
          <section className="col-span-1 lg:col-span-9">
            {selected === 'overview' && (
              <div className="space-y-6">
                <OverviewForm
                  value={selectedProject}
                  onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                  onSave={p => handleSave('overview', p)}
                  projectEditPermission={projectEditPermission}
                />
                <PropertyForm
                  value={selectedProject}
                  onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                  onSave={p => handleSave('property', p)}
                  projectEditPermission={projectEditPermission}
                />
              </div>
            )}
            {selected === 'people' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">People</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="clients" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="clients">Clients</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="contractors">Contractors</TabsTrigger>
                    </TabsList>
                    <TabsContent value="clients" className="mt-4">
                      <ContactsForm
                        handleCopyClientInfo={handleCopyClientInfo}
                        projectEditPermission={projectEditPermission}
                        handleCopySecondaryClientInfo={handleCopySecondaryClientInfo}
                        clientData={clientData}
                        value={selectedProject}
                        onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                        onSave={p => handleSave('contacts', {
                          ...p,
                          client: typeof p.client === 'object' ? p.client.id : p.client,
                          secondary_client: p.secondary_client || []
                        })}
                      />
                    </TabsContent>
                    <TabsContent value="team" className="mt-4">
                      <TeamForm
                        value={selectedProject}
                        projectEditPermission={projectEditPermission}
                        users={studioUsers}
                        onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                        onSave={p => handleSave('team', { ...p, assignees: p.assignees?.map((a: any) => a.id) ?? [] })}
                      />
                    </TabsContent>
                    <TabsContent value="contractors" className="mt-4">
                      <div className="space-y-6">
                        <ContractorAccessSection projectData={projectData} />
                        <ContractorsForm
                          projectEditPermission={projectEditPermission}
                          value={selectedProject}
                          onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                          onSave={p => handleSave('contractors', p)}
                          
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
            {selected === 'delivery' && (
              <DeliveryForm
                projectEditPermission={projectEditPermission}
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('delivery', p)}
                
              />
            )}
            {selected === 'rooms' && (
              <RoomsForm
                projectEditPermission={projectEditPermission}
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('type', p)}
              />
            )}
            {selected === 'schedule' && (
              <ScheduleSection
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={(section, p) => handleSave(section, p)}
                projectEditPermission={projectEditPermission}
              />
            )}
            {selected === 'financial' && (
              <FinancialForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('financial', p)}
                projectEditPermission={projectEditPermission}
              />
            )}
            {selected === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preferences" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="preferences">Preferences</TabsTrigger>
                      <TabsTrigger value="automation">Automation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preferences" className="mt-4">
                      <PreferencesForm
                        value={selectedProject}
                        onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                        onSave={p => handleSave('preferences', p)}
                        projectEditPermission={projectEditPermission}
                      />
                    </TabsContent>
                    <TabsContent value="automation" className="mt-4">
                      <AutomationForm onSave={p => handleSave('automation', p)} projectEditPermission={projectEditPermission} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
      
       <InviteClientDialog
        open={openInviteClientDialog}
        onOpenChange={setOpenInviteClientDialog}
        onSend={onSendInviteClient}
        projectId={params?.id}
        clientId={projectData?.client?.id}
        isSendingEmail={isSendingInvite}
      />

      {/* Wizard */}
      <OnboardingWizard
        projectId={projectId}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCompleted={({ missing: m, progressPct: pct }) => {
          // reflect completion in header badges
          // no-op for now; you can hook real data as needed.
        }}
      />

      <DeleteDialog
        isOpen={openArchive}
        onClose={setOpenArchive}
        onConfirm={selectedProject?.project_status === 'ARC' ? handleUnArchive : handleArchive}
        id={selectedProject?.id}
        itemName={selectedProject?.name}
        requireConfirmation={false}
        confirmationText={selectedProject?.name}
        title={selectedProject?.project_status === 'ARC' ? 'Unarchive Project' : 'Archive Project'}
        confirmText={'Confirm'}
        description={`Move  ${selectedProject?.name} to ${selectedProject?.project_status === 'ARC' ? 'Active' : 'Archive'} .`}
        isArchive={true}
      />

      <DeleteDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={handleDelete}
        id={selectedProject?.id}
        itemName={selectedProject?.name}
        requireConfirmation={true}
        confirmationText={selectedProject?.name}
        title="Delete Project"
        description={`This will permanently delete "${selectedProject?.name}" along with all its tasks and related data. This action cannot be undone.`}
      />
    </main>
  );
}

/* Forms — lightweight, aligned to global UI */

function OverviewForm({ value, onChange, onSave, projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void; projectEditPermission: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Project title</Label>
          <Input
            id="title"
            className="mt-1 disabled:opacity-100"
            placeholder="Chelsea Penthouse"
            value={value?.project_name}
            onChange={e => onChange({ project_name: e.target.value })}
            disabled={!projectEditPermission}
          />
        </div>
        <div>
          <Label htmlFor="code">Project code</Label>
          <Input
            id="code"
            className="mt-1 disabled:opacity-100"
            placeholder="LUX-001"
            value={value?.project_code}
            onChange={e => onChange({ project_code: e.target.value })}
            disabled={!projectEditPermission}
          />
          <p className="text-xs text-ink-muted mt-1">Used in file names and POs.</p>
        </div>
        <div>
          <Label htmlFor="type">Project type</Label>
          <Select value={value?.project_type} onValueChange={val => onChange({ project_type: val })} disabled={!projectEditPermission}>
            <SelectTrigger className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft disabled:opacity-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="RS" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Residential
                </div>
              </SelectItem>
              <SelectItem value="CM" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Commercial
                </div>
              </SelectItem>
              <SelectItem value="HS" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Store className="w-4 h-4 mr-2" />
                  Hospitality
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            className="mt-1 disabled:opacity-100"
            rows={4}
            placeholder="Short project summary…"
            value={value?.project_description}
            onChange={e => onChange({ project_description: e.target.value })}
            disabled={!projectEditPermission}
          />
        </div>
      {projectEditPermission &&  <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

function ContactsForm({
  value,
  onChange,
  onSave,
  clientData,
  handleCopyClientInfo,
  handleCopySecondaryClientInfo,
  projectEditPermission
}: {
  value: any;
  onChange: (v: any) => void;
  onSave: (p: any) => void;
  clientData: any;
  handleCopyClientInfo: () => void;
  handleCopySecondaryClientInfo: (clientId: string | number) => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToRemove, setClientToRemove] = useState<number | null>(null);

  const getClientDisplayName = (client: any) => {
    const fullName = [client?.name, client?.surname].filter(Boolean).join(' ');
    return fullName || client?.company_name || 'Unnamed Client';
  };

  const secondaryClients = value?.secondary_client || [];

  const addSecondaryClient = (clientId: string) => {
    if (!secondaryClients.includes(Number(clientId)) && !secondaryClients.includes(clientId)) {
      onChange({ secondary_client: [...secondaryClients, Number(clientId)] });
    }
  };

  const removeSecondaryClient = (clientId: number) => {
    onChange({ secondary_client: secondaryClients.filter((id: number) => id !== clientId) });
    setIsDeleteOpen(false);
    setClientToRemove(null);
  };

  const openRemoveDialog = (clientId: number) => {
    setClientToRemove(clientId);
    setIsDeleteOpen(true);
  };

  const getClientById = (clientId: number) => {
    return clientData?.find((c: any) => c.id === clientId);
  };

  // Filter out primary client and already selected secondary clients from available options
  const availableClients = clientData?.filter((c: any) => {
    const primaryClientId = value?.client?.id ?? value?.client;
    return String(c.id) !== String(primaryClientId) && !secondaryClients.includes(c.id);
  }) || [];

  const clientToRemoveData = clientToRemove ? getClientById(clientToRemove) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contacts & Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client" className="text-sm mb-4 flex items-center justify-between font-medium text-ink">
            <span className="">
              Select Primary Client <span className="text-red-500">*</span>
            </span>
            <button
              onClick={handleCopyClientInfo}
              className="border duration-200 hover:bg-black hover:text-white flex-shrink-0 rounded-xl py-1 text-xs font-medium px-3"
            >
              Copy Portal Info
            </button>
          </Label>
          <ClientSelect
            clients={clientData || []}
            selectedClientId={value?.client?.id ?? value?.client}
            onSelect={(clientId) => onChange({ client: clientId })}
            projectEditPermission={projectEditPermission}
          />
        </div>

        <Separator />

        {/* Secondary Clients Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-ink">Secondary Client</Label>

          {/* Add Secondary Client Select */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ClientSelect
                clients={availableClients}
                selectedClientId={null}
                onSelect={(clientId) => addSecondaryClient(clientId)}
                projectEditPermission={projectEditPermission}
              />
            </div>
          </div>

          {/* List of Secondary Clients */}
          {secondaryClients.length > 0 && (
            <div className="space-y-2 mt-3">
              {secondaryClients.map((clientId: number) => {
                const client = getClientById(clientId);
                if (!client) return null;

                return (
                  <div
                    key={clientId}
                    className="flex items-center justify-between p-3 bg-greige-50 border border-borderSoft rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-clay-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-clay-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{getClientDisplayName(client)}</div>
                        {client.email && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopySecondaryClientInfo(clientId)}
                        className="border duration-200 hover:bg-black hover:text-white flex-shrink-0 rounded-xl py-1 text-xs font-medium px-3"
                      >
                        Copy Portal Info
                      </button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        onClick={() => openRemoveDialog(clientId)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {secondaryClients.length === 0 && (
            <p className="text-sm text-muted-foreground">No secondary clients added. Use the dropdown above to add secondary clients.</p>
          )}
        </div>

        <Separator />
{ projectEditPermission &&
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setClientToRemove(null);
        }}
        onConfirm={() => clientToRemove && removeSecondaryClient(clientToRemove)}
        title="Remove Secondary Client"
        confirmText="Remove"
        description={`Are you sure you want to remove ${clientToRemoveData ? getClientDisplayName(clientToRemoveData) : 'this client'} from secondary clients?`}
        itemName={clientToRemoveData ? getClientDisplayName(clientToRemoveData) : ''}
        requireConfirmation={false}
      />
    </Card>
  );
}

function PropertyForm({ value, onChange, onSave, projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void; projectEditPermission: boolean }) {
  type NominatimPlace = {
    display_name: string;
    lat: string;
    lon: string;
  };

  const [addressQuery, setAddressQuery] = useState<string>(value?.location ?? '');
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimPlace[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAddressQuery(value?.location ?? '');
  }, [value?.location]);

  useEffect(() => {
    if (!addressQuery || addressQuery.trim().length < 2) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(
          addressQuery.trim(),
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json', 'Accept-Language': 'en' },
        });
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const data: NominatimPlace[] = await res.json();
        setAddressSuggestions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setAddressSuggestions([]);
        }
      } finally {
        setAddressLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [addressQuery]);

  const shouldOpenAddressPopover = addressQuery.trim().length >= 2 && (addressLoading || addressSuggestions.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Site address</Label>
          <div className="relative">
            <Input
              className="mt-1 disabled:opacity-100"
              disabled={!projectEditPermission}
              placeholder="Search address…"
              value={addressQuery}
              onChange={e => {
                const next = e.target.value;
                setAddressQuery(next);
                onChange({
                  ...value,
                  location: next,
                });
                setOpen(true);
                
              }}
            />
            {shouldOpenAddressPopover && open && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                <Command>
                  <CommandList>
                    {addressLoading ? (
                      <div className="py-3 text-sm text-muted-foreground text-center">Searching…</div>
                    ) : addressSuggestions.length === 0 ? (
                      <div className="py-3 text-sm text-muted-foreground text-center">No addresses found</div>
                    ) : (
                      <CommandGroup>
                        {addressSuggestions.map(place => (
                          <CommandItem
                            key={`${place.lat}-${place.lon}-${place.display_name}`}
                            value={place.display_name}
                            onSelect={() => {
                              setAddressQuery(place.display_name);
                              onChange({
                                ...value,
                                location: place.display_name,
                              });
                              setOpen(false);
                              setAddressSuggestions([]);
                            }}
                          >
                            {place.display_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Access & parking notes</Label>
            <Textarea
              className="mt-1 disabled:opacity-100"
              disabled={!projectEditPermission}
              rows={3}
              value={value?.property?.accessNotes ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  property: { ...value.property, accessNotes: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Building restrictions</Label>
            <Textarea
              className="mt-1 disabled:opacity-100"
              disabled={!projectEditPermission}
              rows={3}
              value={value?.property?.restrictions ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  property: { ...value.property, restrictions: e.target.value },
                })
              }
            />
          </div>
        </div>
      {projectEditPermission &&  <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

// Individual Room Item component that fetches its own data
function RoomItem({
  roomId,
  onDelete,
  projectEditPermission
}: {
  roomId: number;
  onDelete: (roomId: number) => void;
  projectEditPermission: boolean;
}) {
  const { data: roomData, isLoading } = useFetch(`projects/rooms/${roomId}/`);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-greige-50 border border-borderSoft rounded-lg animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-stone-200 rounded" />
            <div className="h-3 w-32 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-greige-50 border border-borderSoft rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center">
          <Home className="w-5 h-5 text-clay-600" />
        </div>
        <div>
          <div className="text-sm font-medium">{roomData.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarIcon2 className="h-3 w-3" />
            Created {formatDate(roomData.created_at)}
          </div>
        </div>
      </div>
     {projectEditPermission && <Button
        variant="destructive"
        size="sm"
        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
        onClick={() => onDelete(roomId)}
      >
        <Trash className="w-4 h-4" />
      </Button>}
    </div>
  );
}

function RoomsForm({ value, onChange, onSave , projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void ; projectEditPermission: boolean }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { mutate: createRoom, isPending: isCreating } = usePost();
  const { mutate: deleteRoom } = useDeleteData();
  const { isOpen, item, openDialog, closeDialog } = useDeleteDialog();
  const [newRoomName, setNewRoomName] = useState('');

  const handleRemove = (roomId: number) => {
    openDialog(roomId);
  };

  const onConfirmDelete = (roomId: number) => {
    deleteRoom(
      { url: `projects/rooms/${roomId}/` },
      {
        onSuccess: () => {
          const next = [...(value?.rooms ?? [])];
          const idx = next.indexOf(roomId);
          if (idx !== -1) {
            next.splice(idx, 1);
            onChange({ ...value, rooms: next });
          }
          queryClient.invalidateQueries({ queryKey: [`projects/rooms/${roomId}/`] });
          toast.success('Room deleted successfully');
        },
        onError: (error: any) => {
          console.error('Error deleting room:', error);
          toast.error('Failed to delete room');
        },
      },
    );
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    if (!user?.studio?.id || !user?.id) {
      toast.error('User information not available');
      return;
    }

    createRoom(
      {
        url: 'projects/rooms/',
        data: {
          name: newRoomName.trim(),
          studio: user.studio.id,
          created_by: user.id,
        },
      },
      {
        onSuccess: (response: any) => {
          const rooms = [...(value?.rooms ?? []), response.id];
          onChange({ ...value, rooms });
          setNewRoomName('');
          toast.success('Room created successfully');
        },
        onError: (error: any) => {
          console.error('Error creating room:', error);
          toast.error('Failed to create room');
        },
      },
    );
  };

  const rooms = value?.rooms ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Rooms</CardTitle>
          <Badge variant="outline" className="bg-clay-50 text-clay-700 border-clay-200">
            {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new room */}
      {projectEditPermission &&  <div className="flex items-center gap-2">
          <Input
            placeholder="Enter room name..."
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleCreateRoom();
              }
            }}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleCreateRoom}
            disabled={!newRoomName.trim() || isCreating}
            className="bg-clay-600 hover:bg-clay-700 text-white"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Add Room
              </>
            )}
          </Button>
        </div>}

        {/* Room list */}
        <div className="space-y-2">
          {rooms.length > 0 ? (
            rooms.map((roomId: number) => (
              <RoomItem
                key={roomId}
                roomId={roomId}
                onDelete={handleRemove}
                projectEditPermission={projectEditPermission}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-borderSoft rounded-lg">
              <Home className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No rooms added yet.</p>
              <p className="text-xs mt-1">Add rooms to organize your project spaces.</p>
            </div>
          )}
        </div>

        {/* Save */}
       {projectEditPermission && <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave({ rooms: value?.rooms })}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>

      <DeleteDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={onConfirmDelete}
        id={item}
        title="Delete Room"
        description="Are you sure you want to delete this room? This action cannot be undone."
        confirmText="Delete"
        requireConfirmation={false}
      />
    </Card>
  );
}

function AddressAutocomplete({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  type NominatimPlace = { display_name: string; lat: string; lon: string };
  const [query, setQuery] = useState<string>(value ?? '');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => { setQuery(value ?? ''); }, [value]);

  useEffect(() => {
    if (!query || query.trim().length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal, headers: { Accept: 'application/json', 'Accept-Language': 'en' } }
        );
        if (!res.ok) throw new Error();
        const data: NominatimPlace[] = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
    return () => { controller.abort(); clearTimeout(id); };
  }, [query]);

  const shouldOpen = query.trim().length >= 2 && (loading || suggestions.length > 0);

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          className="mt-1"
          placeholder="Search address…"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        />
        {shouldOpen && open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            <Command>
              <CommandList>
                {loading ? (
                  <div className="py-3 text-sm text-muted-foreground text-center">Searching…</div>
                ) : suggestions.length === 0 ? (
                  <div className="py-3 text-sm text-muted-foreground text-center">No addresses found</div>
                ) : (
                  <CommandGroup>
                    {suggestions.map(place => (
                      <CommandItem
                        key={`${place.lat}-${place.lon}`}
                        value={place.display_name}
                        onSelect={() => { setQuery(place.display_name); onChange(place.display_name); setOpen(false); setSuggestions([]); }}
                      >
                        {place.display_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
}

function AddressFields({ prefix, value, onChange,projectEditPermission }: { prefix: string; value: any; onChange: (v: any) => void,projectEditPermission:boolean }) {
  const f = (field: string) => `${prefix}_${field}`;
  const update = (field: string, val: string) => onChange({ ...value, [f(field)]: val });
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Address Line 1</Label>
        <Input disabled={!projectEditPermission} className="bg-white disabled:opacity-100" value={value?.[f('address_line_1')] ?? ''} onChange={e => update('address_line_1', e.target.value)} placeholder="Street address" />
      </div>
      <div className="space-y-2">
        <Label>Address Line 2</Label>
        <Input disabled={!projectEditPermission} className="bg-white disabled:opacity-100" value={value?.[f('address_line_2')] ?? ''} onChange={e => update('address_line_2', e.target.value)} placeholder="Apartment, suite, etc." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input disabled={!projectEditPermission} className="bg-white disabled:opacity-100" value={value?.[f('city')] ?? ''} onChange={e => update('city', e.target.value)} placeholder="City" />
        </div>
        <div className="space-y-2">
          <Label>Postcode</Label>
          <Input disabled={!projectEditPermission} className="bg-white disabled:opacity-100" value={value?.[f('postcode')] ?? ''} onChange={e => update('postcode', e.target.value)} placeholder="Postcode" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>County</Label>
          <Input disabled={!projectEditPermission} className="bg-white disabled:opacity-100" value={value?.[f('county')] ?? ''} onChange={e => update('county', e.target.value)} placeholder="County" />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input disabled={!projectEditPermission} className="bg-white disabled:opacity-100" value={value?.[f('country')] ?? ''} onChange={e => update('country', e.target.value)} placeholder="Country" />
        </div>
      </div>
    </div>
  );
}

function DeliveryForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void,projectEditPermission:boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="delivery">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>
          <TabsContent value="delivery">
            <AddressFields projectEditPermission={projectEditPermission} prefix="delivery" value={value} onChange={onChange} />
          </TabsContent>
          <TabsContent value="billing">
            <AddressFields projectEditPermission={projectEditPermission} prefix="billing" value={value} onChange={onChange} />
          </TabsContent>
          <TabsContent value="logistics">
            <AddressFields projectEditPermission={projectEditPermission} prefix="logistics" value={value} onChange={onChange} />
          </TabsContent>
        </Tabs>
       {projectEditPermission && <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

function PreferencesForm({
  value,
  onChange,
  projectEditPermission,
  onSave,
}: {
  value: OnboardingData;
  onChange: (v: OnboardingData) => void;
  onSave: (p: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferences & Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Style tags</Label>
          <Input
            className="mt-1 disabled:opacity-100 disabled:cursor-not-allowed"
            disabled={!projectEditPermission}
            placeholder="modern, warm minimalism"
            value={value?.preferences?.styleTags ?? ''}
            onChange={e =>
              onChange({
                ...value,
                preferences: {
                  ...value?.preferences,
                  styleTags: e.target.value,
                },
              })
            }
          />
        </div>
        <div>
          <Label>Preferred vendors</Label>
          <Input
            className="mt-1 disabled:opacity-100 disabled:cursor-not-allowed"
            disabled={!projectEditPermission}
            placeholder="Vendor A, Vendor B"
            value={value?.preferences?.preferredVendors ?? ' '}
            onChange={e =>
              onChange({
                ...value,
                preferences: {
                  ...value?.preferences,
                  preferredVendors: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              className="disabled:opacity-100 disabled:cursor-not-allowed"
              disabled={!projectEditPermission}
              checked={!!value?.preferences?.consents}
              onCheckedChange={v =>
                onChange({
                  ...value,
                  preferences: { ...value?.preferences, consents: v },
                })
              }
            />
            <span className="text-sm">Marketing opt‑in</span>
          </div>
          {/* <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.preferencesConsent.consents?.terms}
                onChange={e =>
                  onChange({
                    ...value,
                    preferencesConsent: {
                      ...value.preferencesConsent,
                      consents: { ...value.preferencesConsent.consents, terms: e.target.checked },
                    },
                  })
                }
              />
              <span>
                {'Agree to '}
                <a href="#" className="underline">
                  Terms
                </a>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                // checked={!!value.preferencesConsent.consents?.privacy}
                onChange={e =>
                  onChange({
                    ...value,
                    preferencesConsent: {
                      ...value.preferencesConsent,
                      consents: { ...value.preferencesConsent.consents, privacy: e.target.checked },
                    },
                  })
                }
              />
              <span>
                {'Agree to '}
                <a href="#" className="underline">
                  Privacy
                </a>
              </span>
            </label>
          </div> */}
        </div>
    {projectEditPermission && <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

function TimelineForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  // Format date for display in input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format for input
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="block mb-2">Project Duration</Label>
          <DateRangePicker
            key={`timeline-${value?.start_date}-${value?.end_date}`}
            onUpdate={values => {
              if (values.range.from) {
                onChange({
                  start_date: formatDateToLocal(values.range.from),
                  end_date: values.range.to ? formatDateToLocal(values.range.to) : formatDateToLocal(values.range.from),
                });
              }
            }}
            initialDateFrom={value?.start_date || undefined}
            initialDateTo={value?.end_date || undefined}
            align="end"
            locale="en-GB"
            showCompare={false}
          />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={value?.timezone} onValueChange={val => onChange({ timezone: val })}>
            <SelectTrigger id="timezone" className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="Europe/London" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  London (GMT)
                </div>
              </SelectItem>
              <SelectItem value="America/New_York" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  New York (EST)
                </div>
              </SelectItem>
              <SelectItem value="Europe/Paris" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Paris (CET)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const updateData = updates => {
    const raw = updates?.currency ?? updates;
    const currency = raw?.value ?? raw;
    onChange({
      ...value,
      currency,
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Financial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              disabled={!projectEditPermission}
              className="mt-1 disabled:opacity-100 disabled:cursor-not-allowed"
              placeholder="850000"
              value={value?.total_budget}
              onChange={e => onChange({ total_budget: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="taxRate">Tax/VAT rate (%)</Label>
            <Input
              id="taxRate"
              disabled={!projectEditPermission}
              className="mt-1 disabled:opacity-100 disabled:cursor-not-allowed"
              placeholder="20"
              value={value?.vt_rate}
              onChange={e => onChange({ vt_rate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="">
            <Label htmlFor="ffne" className="text-sm font-medium text-ink">
              FF&E (%)
            </Label>
            <Input
              id="ffne"
              type="number"
              disabled={!projectEditPermission}
              className="mt-1 disabled:opacity-100 disabled:cursor-not-allowed"
              placeholder="0"
              value={value?.ffne}
              onChange={e => onChange({ ffne: e.target.value })}
              className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
            />
            {/* <div className="space-y-2">
            </div> */}
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>

            <CurrencySelector disabled={!projectEditPermission} value={value?.currency} onChange={updateData} />
          </div>
        </div>

     {projectEditPermission &&   <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

function AutomationForm({ onSave, projectEditPermission }: { onSave: (p: any) => void, projectEditPermission: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Automation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium">Kickoff Pack</div>
            <p className="text-sm text-muted-foreground mt-1">{'Auto‑generate tasks when onboarding completes.'}</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium">Notifications</div>
            <p className="text-sm text-muted-foreground mt-1">{'Notify team when clients join the portal.'}</p>
          </div>
        </div>
      {projectEditPermission &&  <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave({})}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

function TeamForm({ value, onChange, onSave, users,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void; users: any,projectEditPermission:boolean }) {
  const [openPop, setOpenPop] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  function toggleAssignee(member: any) {
    const alreadyAssigned = value.assignees.some((a: any) => a.id === member.id);

    const updatedValue = {
      ...value,
      assignees: alreadyAssigned
        ? value.assignees.filter((a: any) => a.id !== member.id) // remove
        : [...value.assignees, member], // add
    };

    onChange(updatedValue);
  }

  const openDeleteModal = member => {
    setIsDeleteOpen(true);
    setSelectedTeamMember(member);

    // setSelectedTeammates(updatedTeammates);
  };

  const handleDelete = id => {
    toggleAssignee(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base mb-5">Team Members</CardTitle>
          {/* <Button onClick={addTeamMember} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Member
          </Button> */}
        </div>
        {/* Add Member option */}
      { projectEditPermission &&  <div className="mt-5">
       <div className="space-y-2">
            <div className="flex items-center gap-2">
            <Popover open={openPop} onOpenChange={setOpenPop}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPop}
                    className="w-full justify-between bg-white h-9 text-sm rounded-xl"
                  >
                    <span className="flex items-center gap-2 overflow-hidden">
                      <span className="flex items-center gap-2 text-gray-500">
                        <Search className="h-4 w-4" />
                        Enter name...
                      </span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search teammates…"
                      className=" focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
                    />
                    <CommandEmpty>No people found.</CommandEmpty>
                    <CommandList className="max-h-64">
                      <CommandGroup>
                        {users?.map(m => {
                          const checked = value?.assignees?.some(a => a.id === m.id);
                          return (
                            <CommandItem key={m.id} value={m.name} className="flex items-center gap-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleAssignee(m)}
                                className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={m?.photoURL || ''} alt={m?.name} />
                                <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate">{m.name}</span>
                              {value?.assignees?.some(a => a.id === m.id) && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>}
      </CardHeader>
      <CardContent className="">
        <div className=" divide-y divide-gray-200 border rounded-lg">
          {(value?.assignees || []).map((member: any, index: number) => (
            <div key={member.id || index} className="flex items-center  gap-4 px-4 py-4 justify-between ">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member?.photoURL || ''} alt={member.name} />
                  <AvatarFallback className="text-xs capitalize">{initialsOf(member?.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{member.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                </div>
              </div>
              { projectEditPermission && <Button
                variant={'destructive'}
                className={`justify-start bg-red-50 text-red-700 hover:bg-red-100 border-red-200`}
                onClick={() => openDeleteModal(member)}
              >
                <Trash className="w-4 h-4" />
              </Button> }
            </div>
          ))}
          {(!value?.assignees || value?.assignees.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">No team members assigned yet. Click "Add Member" to get started.</div>
          )}
        </div>

      { projectEditPermission &&  <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>}
      </CardContent>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedTeamMember)}
        title="Remove Member"
        confirmText="Remove"
        description={`Are you sure you want to remove ${selectedTeamMember?.name} from this studio? Removing this member will revoke their access to all projects and tasks associated with this studio.`}
        itemName={selectedTeamMember?.name}
        requireConfirmation={true} // 👈 disables the typing step
      />
    </Card>
  );
}


// Contractor Access QR Code Section
function ContractorAccessSection({ projectData }: { projectData: any }) {
  const qrRef = useRef<HTMLDivElement>(null);

  // BACKEND NOTE: This component expects 'access_token' field in the project API response.
  // If access_token is missing, a placeholder message is shown to the user.
  // Please ensure GET /projects/projects/{id}/ returns access_token for QR code generation.
  const accessToken = projectData?.access_token;
  const contractorPortalUrl = accessToken
    ? getProjectPortalUrl(accessToken)
    : '';

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `contractor-qr-${projectData?.name || 'project'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyLink = () => {
    if (!contractorPortalUrl) {
      toast.error('Access token not available yet');
      return;
    }
    navigator.clipboard.writeText(contractorPortalUrl);
    toast.success('Link copied to clipboard');
  };

  const handlePrint = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contractor QR — ${projectData?.project_name || 'Project'}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; }
            h2 { font-size: 18px; margin-bottom: 8px; color: #111; }
            p { font-size: 11px; color: #555; margin: 4px 0 16px; word-break: break-all; text-align: center; max-width: 260px; }
            svg { width: 240px; height: 240px; }
            @media print { body { justify-content: flex-start; padding-top: 40px; } }
          </style>
        </head>
        <body>
          <h2>${projectData?.project_name || 'Project'}</h2>
          <p>Scan to access the contractor portal</p>
          ${svgData}
          <p>${contractorPortalUrl}</p>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-clay-600" />
          <CardTitle className="text-base">Contractor Access</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {accessToken ? (
          <>
            <div className="bg-stone-50 border border-neutral-200 rounded-lg p-6">
              <div className="flex flex-col items-center gap-4">
                <div ref={qrRef} className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={contractorPortalUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2 w-full">
                  <p className="text-sm text-neutral-600">
                    Scan this QR code on site to access the contractor portal
                  </p>
                  <div className="bg-white border border-neutral-300 rounded-md p-2 text-xs font-mono text-neutral-700 break-all">
                    {contractorPortalUrl}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <p className="text-xs text-neutral-500 italic">
              Note: Print this QR code and display it on site. Contractors can scan to access their project files.
            </p>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium">Access token pending</p>
            <p className="text-xs mt-1">
              The project access token will be available soon. Contact support if this persists.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContractorsForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void,projectEditPermission:boolean }) {
  const params = useParams<{ id: string }>();
  const [openInviteContractorDialog, setOpenInviteContractorDialog] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Fetch contractors from read-only API
  const { data: contractorsData, isLoading: loadingContractors, refetch } = useFetch(
    params?.id ? `contractor_portal/project/${params.id}/contractors/` : null
  );

  const { mutate: inviteContractorMutate } = usePost();

  // Handle copy contractor portal info - Safari compatible
  const handleCopyContractorInfo = (contractorId: number) => {
    const textPromise = new Promise<string>((resolve, reject) => {
      inviteContractorMutate(
        {
          url: '/contractor_portal/copy-contractor-credentials/',
          data: { project_id: params?.id, contractor_id: contractorId },
        },
        {
          onSuccess: (e) => {
            const text = `Login URL: ${e?.login_url}\nEmail: ${e?.credentials?.email}\nPassword: ${e?.credentials?.password}`;
            resolve(text);
          },
          onError: () => {
            reject(new Error('API error'));
          },
        }
      );
    });

    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const clipboardItem = new ClipboardItem({
        'text/plain': textPromise.then((text) => new Blob([text], { type: 'text/plain' })),
      });

      navigator.clipboard.write([clipboardItem])
        .then(() => toast.success('Contractor info copied'))
        .catch(() => toast.error('Failed to copy to clipboard'));
    } else {
      textPromise
        .then((text) => {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          toast.success('Contractor info copied');
        })
        .catch(() => toast.error('Error copying contractor info'));
    }
  };

  // Handle send invite to contractor
  const onSendInviteContractor = (formData: { message: string }) => {
    if (!formData.message || !selectedContractor) return;
    setIsSendingInvite(true);

    inviteContractorMutate(
      {
        url: '/contractor_portal/generate-contractor-login/',
        data: {
          project_id: params?.id,
          contractor_id: selectedContractor.id,
          html_content: formData.message,
        },
      },
      {
        onSuccess: () => {
          toast.success('Invitation sent to contractor!');
          setOpenInviteContractorDialog(false);
          setSelectedContractor(null);
          setIsSendingInvite(false);
          refetch();
        },
        onError: () => {
          toast.error('Failed to send invitation');
          setIsSendingInvite(false);
        },
      }
    );
  };

  if (loadingContractors) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contractors</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Contractors</CardTitle>
          {/* <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Read Only
          </Badge> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {contractorsData && Array.isArray(contractorsData) && contractorsData.length > 0 ? (
            contractorsData.map((contractor: any) => {
              const fullName = `${contractor.name} ${contractor.surname}`.trim();
              const displayName = fullName || contractor.company_name || 'Unnamed Contractor';
              const hasPortalAccess = contractor.last_login !== null;

              return (
                <Card key={contractor.id} className="border-borderSoft bg-greige-50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-clay-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-clay-600" />
                          </div>
                          <div>
                            <div className="font-medium">{displayName}</div>
                            <div className="text-sm text-muted-foreground">
                              {contractor.company_name && fullName ? contractor.company_name : 'General'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasPortalAccess ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Portal Access
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">
                              No Access
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Name</Label>
                          <div className="mt-1 text-sm font-medium">{displayName}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Email</Label>
                          <div className="mt-1 text-sm font-medium">{contractor.email || '—'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Phone</Label>
                          <div className="mt-1 text-sm font-medium">{contractor.phone || '—'}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Last Login</Label>
                          <div className="mt-1 text-sm font-medium">
                            {contractor.last_login
                              ? new Date(contractor.last_login).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Never'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-borderSoft">
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Shared Items: </span>
                            <span className="font-medium">{contractor.item_count || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Shared Drawings: </span>
                            <span className="font-medium">{contractor.drawing_count || 0}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                         { projectEditPermission && <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContractor(contractor);
                              setOpenInviteContractorDialog(true);
                            }}
                            className="flex-1"
                          >
                            Invite to Portal
                          </Button>}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyContractorInfo(contractor.id)}
                            className="flex-1"
                          >
                            Copy Portal Info
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No contractors assigned yet. Go to the Contractors page to manage contractors.
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Invite Contractor Dialog */}
    <InviteContractorDialog
      open={openInviteContractorDialog}
      onOpenChange={setOpenInviteContractorDialog}
      onSend={onSendInviteContractor}
      projectId={params?.id}
      contractorId={selectedContractor?.id}
      isSendingEmail={isSendingInvite}
      title={`Invite ${selectedContractor?.name || selectedContractor?.company_name || 'Contractor'}`}
      description="Send invitation email to contractor portal"
    />
    </>
  );
}

/* PhaseTaskEditor — inline task list per phase in project schedule */
function PhaseTaskEditor({ phaseId, projectId }: { phaseId: number; projectId: string }) {
  const { data: allTasks, refetch } = useFetch(
    projectId ? `task/user-tasks-project?project_id=${projectId}` : null
  );
  const { mutate: createTask } = usePost();
  const { mutate: deleteTask } = useDeleteData();
  const { user } = useUser();
  const [draft, setDraft] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const phaseTasks = React.useMemo(() => {
    if (!Array.isArray(allTasks)) return [];
    return allTasks.filter((t: any) => String(t.phase?.id ?? t.phase) === String(phaseId));
  }, [allTasks, phaseId]);

  function addTask() {
    const name = draft.trim();
    if (!name) return;
    createTask(
      { url: 'task/tasks/', data: { name, phase: phaseId, project: projectId, status: 'todo', assignees: [] } },
      { onSuccess: () => { refetch(); setDraft(''); inputRef.current?.focus(); }, onError: () => toast.error('Failed to add task') }
    );
  }

  function removeTask(id: number) {
    deleteTask({ url: `task/tasks/${id}/` }, { onSuccess: () => refetch(), onError: () => toast.error('Failed to delete task') });
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-1.5 mb-1">
        <CheckSquare className="h-3.5 w-3.5 text-stone-400" />
        <p className="text-xs font-medium text-stone-500">Tasks</p>
        <span className="ml-auto text-[10px] text-stone-400">{phaseTasks.length} tasks</span>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {phaseTasks.map((task: any) => (
          <div key={task.id} className="flex items-center gap-2 group rounded-lg border border-gray-100 bg-white px-3 py-2 hover:border-gray-200 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-stone-300 flex-shrink-0" />
            <span className="text-sm text-gray-700 flex-1 leading-snug">{task.name}</span>
            <button
              onClick={() => removeTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {phaseTasks.length === 0 && (
          <p className="text-xs text-stone-400 py-2 text-center">No tasks yet — add one below</p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 placeholder:text-stone-300"
          placeholder="Add a task..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
        />
        <button
          onClick={addTask}
          disabled={!draft.trim()}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-stone-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ScheduleSection — split layout matching studio templates style */
function ScheduleSection({
  value,
  onChange,
  onSave,
  projectEditPermission
}: {
  value: any;
  onChange: (v: any) => void;
  onSave: (section: string, p: any) => void;
  projectEditPermission: boolean
}) {
  const [activeNav, setActiveNav] = useState<'phases' | 'timeline'>('phases');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);

  // All phase data + mutations live here, passed down
  const { data: phases, refetch } = useFetch(value?.id ? `projects/project-phases/?project_id=${value.id}` : null);
  const { mutate: postPhase } = usePost();
  const { mutate: deletePhaseApi } = useDeleteData();
  const { mutate: updatePhaseMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => patchData({ url: `projects/phases/${id}/`, data }),
    onSuccess: () => { toast.success('Phase updated'); refetch(); },
    onError: () => toast.error('Failed to update phase'),
  });
  const { mutate: updateProject } = useMutation({
    mutationFn: (data: any) => patchData({ url: `projects/projects/${value?.id}/`, data }),
    onSuccess: () => { refetch(); },
    onError: () => toast.error('Error updating project'),
  });
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<any>(null);

  const phaseList: any[] = Array.isArray(phases) ? phases : [];
  const selectedPhase = phaseList.find(p => p.id === selectedPhaseId) ?? phaseList[0] ?? null;

  React.useEffect(() => {
    if (phaseList.length && !selectedPhaseId) setSelectedPhaseId(phaseList[0].id);
  }, [phaseList.length]);

  function addPhase() {
    postPhase(
      { url: 'projects/phases/', data: { name: 'New Phase', description: '', progress: 0, start_date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0] } },
      { onSuccess: (data: any) => { updateProject({ phases: [...(value?.phases || []), data?.id] }); setSelectedPhaseId(data?.id); }, onError: () => toast.error('Failed to add phase') }
    );
  }

  function confirmDelete(phase: any) { setPhaseToDelete(phase); setIsDeleteOpen(true); }
  function handleDeletePhase() {
    if (!phaseToDelete) return;
    deletePhaseApi(
      { url: `projects/phases/${phaseToDelete.id}/` },
      { onSuccess: () => { toast.success('Phase deleted'); refetch(); setIsDeleteOpen(false); setPhaseToDelete(null); setSelectedPhaseId(null); }, onError: () => toast.error('Failed to delete phase') }
    );
  }

  const [budgetDisplay, setBudgetDisplay] = useState('');
  React.useEffect(() => {
    if (selectedPhase?.total_budget != null) setBudgetDisplay(Number(selectedPhase.total_budget).toLocaleString('en-GB'));
    else setBudgetDisplay('');
  }, [selectedPhase?.id, selectedPhase?.total_budget]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Schedule</h2>
        <p className="text-sm text-gray-500">Manage phases and timeline for this project.</p>
      </div>

      <div className="grid grid-cols-[240px_1fr] rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ minHeight: 640 }}>

        {/* ── Left nav ── */}
        <div className="border-r border-gray-200 flex flex-col bg-white">

          {/* Top-level: Phases / Timeline */}
          <button
            onClick={() => setActiveNav('phases')}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 text-sm transition-colors ${
              activeNav === 'phases' ? 'bg-stone-100 text-gray-900 font-medium' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            Phases
          </button>
          <button
            onClick={() => setActiveNav('timeline')}
            className={`w-full text-left px-4 py-3 border-b border-gray-200 text-sm transition-colors ${
              activeNav === 'timeline' ? 'bg-stone-100 text-gray-900 font-medium' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            Timeline
          </button>

          {/* Phase list */}
          {activeNav === 'phases' && (
            <>
              <div className="px-4 py-2 border-b border-gray-100 bg-stone-50/60 flex items-center justify-between">
                <span className="text-xs text-stone-400">Project phases</span>
               {projectEditPermission && <button onClick={addPhase} className="text-stone-400 hover:text-gray-700 transition-colors" title="Add phase">
                  <Plus className="h-3.5 w-3.5" />
                </button>}
              </div>
              <div className="flex-1 overflow-y-auto">
                {phaseList.map((phase, i) => (
                  <button
                    key={phase.id}
                    onClick={() => setSelectedPhaseId(phase.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 text-sm transition-colors flex items-center justify-between gap-2 group ${
                      selectedPhase?.id === phase.id
                        ? 'bg-white text-gray-900 font-medium border-l-2 border-l-gray-900'
                        : 'text-stone-500 hover:bg-stone-50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className="truncate">{phase.name || `Phase ${i + 1}`}</span>
                   {projectEditPermission && <button
                      onClick={e => { e.stopPropagation(); confirmDelete(phase); }}
                      className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash className="h-3 w-3" />
                    </button>}
                  </button>
                ))}
                {phaseList.length === 0 && (
                  <p className="px-4 py-5 text-xs text-stone-400">No phases yet {projectEditPermission ? '— click + to add one.' : ''}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="overflow-y-auto bg-white">

          {/* Timeline */}
          {activeNav === 'timeline' && (
            <div className="p-6 space-y-5 max-w-xl">
              <p className="text-sm font-medium text-gray-900">Timeline</p>
              <p className="text-xs text-stone-400 -mt-3">Set the overall project start and end dates.</p>

              <div className="space-y-1">
                <Label className="text-sm">Project duration</Label>
                <DateRangePicker
                  key={`timeline-${value?.start_date}-${value?.end_date}`}
                  onUpdate={vals => {
                    if (vals.range.from) onChange({ start_date: formatDateToLocal(vals.range.from), end_date: vals.range.to ? formatDateToLocal(vals.range.to) : formatDateToLocal(vals.range.from) });
                  }}
                  initialDateFrom={value?.start_date || undefined}
                  initialDateTo={value?.end_date || undefined}
                  align="start"
                  locale="en-GB"
                  showCompare={false}
                  disabled={!projectEditPermission}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Timezone</Label>
                <Select value={value?.timezone} onValueChange={val => onChange({ timezone: val })}>
                  <SelectTrigger disabled={!projectEditPermission} className="mt-1 bg-white border-gray-200 focus:ring-0 disabled:opacity-100 disabled:cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Europe/London"><div className="flex items-center gap-2"><Clock className="w-4 h-4" />London (GMT)</div></SelectItem>
                    <SelectItem value="America/New_York"><div className="flex items-center gap-2"><Clock className="w-4 h-4" />New York (EST)</div></SelectItem>
                    <SelectItem value="Europe/Paris"><div className="flex items-center gap-2"><Clock className="w-4 h-4" />Paris (CET)</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

             {projectEditPermission && <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => onSave('timeline', value)}><Save className="w-3.5 h-3.5 mr-1.5" />Save</Button>
              </div>}
            </div>
          )}

          {/* Phase editor */}
          {activeNav === 'phases' && selectedPhase && (
            <div className="p-6 space-y-0 max-w-2xl">

              {/* Phase header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedPhase.name || 'Phase'}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Phase {phaseList.findIndex(p => p.id === selectedPhase.id) + 1} of {phaseList.length}</p>
                </div>
              </div>

              {/* Fields — clean divider-separated rows */}
              <div className="space-y-4">

                <div className="space-y-1">
                  <Label className="text-sm">Phase name</Label>
                  <Input
                  disabled={!projectEditPermission}
                    className="mt-1 bg-white disabled:opacity-100 disabled:cursor-not-allowed"
                    placeholder="e.g. Discovery & Planning"
                    defaultValue={selectedPhase.name}
                    key={`name-${selectedPhase.id}`}
                    onBlur={e => { if (e.target.value !== selectedPhase.name) updatePhaseMutation({ id: selectedPhase.id, data: { name: e.target.value } }); }}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                  disabled={!projectEditPermission}
                    className="mt-1 bg-white disabled:opacity-100 disabled:cursor-not-allowed"
                    rows={2}
                    placeholder="Brief description..."
                    defaultValue={selectedPhase.description}
                    key={`desc-${selectedPhase.id}`}
                    onBlur={e => { if (e.target.value !== selectedPhase.description) updatePhaseMutation({ id: selectedPhase.id, data: { description: e.target.value } }); }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Budget {value?.currency ? `(${value.currency})` : ''}</Label>
                    <Input
                      type="text"
                      disabled={!projectEditPermission}
                    className="mt-1 bg-white disabled:opacity-100 disabled:cursor-not-allowed"
                      placeholder="0"
                      value={budgetDisplay}
                      onChange={e => {
                        const clean = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = clean.split('.');
                        setBudgetDisplay(parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts.length > 1 ? '.' + parts[1] : ''));
                      }}
                      onBlur={() => {
                        const numeric = budgetDisplay.replace(/,/g, '');
                        if (numeric !== String(selectedPhase.total_budget)) updatePhaseMutation({ id: selectedPhase.id, data: { total_budget: numeric } });
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Budgeted hours</Label>
                    <Input
                      type="number"
                      disabled={!projectEditPermission}
                    className="mt-1 bg-white disabled:opacity-100 disabled:cursor-not-allowed"
                      placeholder="0"
                      defaultValue={selectedPhase.hour_budget}
                      key={`hours-${selectedPhase.id}`}
                      onBlur={e => { if (e.target.value !== selectedPhase.hour_budget) updatePhaseMutation({ id: selectedPhase.id, data: { hour_budget: e.target.value } }); }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Phase duration</Label>
                  <div className="mt-1">
                    <DateRangePicker
                    disabled={!projectEditPermission}
                      key={`range-${selectedPhase.id}-${selectedPhase.start_date}-${selectedPhase.end_date}`}
                      onUpdate={vals => {
                        if (vals.range.from) updatePhaseMutation({ id: selectedPhase.id, data: { start_date: formatDateToLocal(vals.range.from), end_date: vals.range.to ? formatDateToLocal(vals.range.to) : formatDateToLocal(vals.range.from) } });
                      }}
                      initialDateFrom={selectedPhase.start_date || undefined}
                      initialDateTo={selectedPhase.end_date || undefined}
                      align="start"
                      locale="en-GB"
                      showCompare={false}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Empty state */}
          {activeNav === 'phases' && phaseList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <CalendarIcon2 className="w-10 h-10 text-stone-200 mb-4" />
              <p className="text-sm font-medium text-stone-500">No phases yet</p>
           { projectEditPermission &&   <p className="text-xs text-stone-400 mt-1 mb-4">Click + in the panel on the left to add your first phase.</p>}
              {projectEditPermission && <Button size="sm" variant="outline" onClick={addPhase}><Plus className="w-3.5 h-3.5 mr-1.5" />Add phase</Button>}
            </div>
          )}
        </div>
      </div>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePhase}
        title="Delete Phase"
        confirmText="Delete"
        description={`Are you sure you want to delete phase "${phaseToDelete?.name}"? This cannot be undone.`}
        itemName={phaseToDelete?.name}
        requireConfirmation={true}
      />
    </div>
  );
}
