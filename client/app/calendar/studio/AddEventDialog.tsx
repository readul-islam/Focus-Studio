'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { fetchData, patchData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getUserTimezone, toGoogleCalendarDateTime } from '@/lib/google-calendar';

type CalendarMode = 'all-projects' | 'single-project' | 'my-calendar';

interface AddEventDialogProps {
    onEventCreated?: () => void;
    mode?: CalendarMode;
    projectId?: string | null;
    projectName?: string | null;
    projects?: { id: string | number; project_name: string }[];
}

export default function AddEventDialog({
    onEventCreated,
    mode = 'all-projects',
    projectId = null,
    projectName = null,
    projects = [],
}: AddEventDialogProps) {
    const [open, setOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState<Date | undefined>(undefined);
    const [attendees, setAttendees] = useState('');
    const [selectedProject, setSelectedProject] = useState<string>(projectId ? String(projectId) : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useUser();
    const { mutate, isPending } = usePost();

    const reset = () => {
        setSummary('');
        setLocation('');
        setDescription('');
        setStartTime(undefined);
        setEndTime(undefined);
        setAttendees('');
        setSelectedProject(projectId ? String(projectId) : '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!summary || !startTime || !endTime) {
            toast.warning('Summary, Start Time, and End Time are required.');
            return;
        }

        if (mode === 'all-projects' && !selectedProject) {
            toast.warning('Please select a project.');
            return;
        }

        if (endTime <= startTime) {
            toast.warning('End time must be after start time.');
            return;
        }

        const attendeesList = attendees.split(',').map(a => a.trim()).filter(a => a);

        const googleEventPayload = {
            summary,
            location,
            description,
            start_time: toGoogleCalendarDateTime(startTime),
            end_time: toGoogleCalendarDateTime(endTime),
            timezone: getUserTimezone(),
            attendees: attendeesList,
        };

        const refetchGoogleEvents = () => {
            queryClient.invalidateQueries({
                predicate: (q) =>
                    typeof q.queryKey[0] === 'string' && String(q.queryKey[0]).includes('gmail/calendar/events'),
            });
        };

        const refetchProjectCalendar = (pid: string | number) => {
            queryClient.invalidateQueries({ queryKey: ['projects/studio-phases/'] });
            queryClient.invalidateQueries({ queryKey: [`projects/project-phases/?project_id=${pid}`] });
        };

        const dateOnly = (d: Date) => format(d, 'yyyy-MM-dd');

        // My Calendar — post to Google Calendar
        if (mode === 'my-calendar') {
            mutate({
                url: 'gmail/calendar/create-event/',
                data: googleEventPayload,
            }, {
                onSuccess: (res: { link?: string }) => {
                    toast.success(
                        res?.link
                            ? 'Event added — check Google Calendar or refresh the grid.'
                            : 'Event added to Google Calendar.'
                    );
                    setOpen(false);
                    reset();
                    refetchGoogleEvents();
                    onEventCreated?.();
                },
                onError: (error: any) => {
                    const msg =
                        error?.response?.data?.error ||
                        error?.response?.data?.message ||
                        'Failed to create event.';
                    toast.error(msg);
                },
            });
            return;
        }

        // Project calendar — create a phase on the project (shown in All Projects / project filter views)
        const pid = mode === 'single-project' ? projectId : selectedProject;
        if (!pid) {
            toast.warning('Please select a project.');
            return;
        }

        const notes = [description, location && `Location: ${location}`].filter(Boolean).join('\n\n');

        setIsSubmitting(true);
        try {
            const phase = await postData({
                url: 'projects/phases/',
                data: {
                    name: summary,
                    description: notes || '',
                    progress: 0,
                    start_date: dateOnly(startTime),
                    end_date: dateOnly(endTime),
                    studio: user?.studio?.id,
                    created_by: user?.id,
                    updated_by: user?.id,
                },
            });

            if (!phase?.id) {
                throw new Error('Phase was not created');
            }

            const project = await fetchData(`projects/projects/${pid}/`);
            const existingIds: number[] = Array.isArray(project?.phases)
                ? project.phases.map((p: number | { id: number }) =>
                    typeof p === 'object' && p !== null ? p.id : Number(p)
                )
                : [];

            await patchData({
                url: `projects/projects/${pid}/`,
                data: { phases: [...existingIds, phase.id] },
            });

            toast.success('Event added to project calendar.');
            setOpen(false);
            reset();
            refetchProjectCalendar(pid);
            onEventCreated?.();
        } catch (error: any) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to add event to project calendar.';
            toast.error(typeof msg === 'string' ? msg : 'Failed to add event to project calendar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const dialogTitle = mode === 'my-calendar'
        ? 'Add to My Calendar'
        : mode === 'single-project'
        ? `Add Event — ${projectName || 'Project'}`
        : 'Add Event';

    const dialogDesc = mode === 'my-calendar'
        ? 'Creates an event on your personal Google Calendar.'
        : mode === 'single-project'
        ? `Adds a schedule entry for ${projectName || 'this project'} (visible when My Calendar is off).`
        : 'Adds a schedule entry to the selected project (visible in All Projects and project filters).';

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) reset(); }}>
            <DialogTrigger asChild>
                <Button className="h-9 gap-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl px-4 text-xs font-semibold shadow-sm">
                    <Plus className="w-4 h-4" />
                    Add Event
                </Button>
            </DialogTrigger>
            <DialogContent 
                overlayClassName="bg-background/35 backdrop-blur-[8px]"
                className="sm:max-w-[520px] bg-card border border-border/40 shadow-[0_20px_60px_rgba(0,0,0,0.65)] hover:border-primary/25 transition-colors duration-300 max-h-[92vh] flex flex-col overflow-hidden rounded-2xl text-foreground p-0 gap-0"
            >
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-card flex-shrink-0">
                    <DialogTitle className="text-[16px] font-bold text-foreground tracking-tight">{dialogTitle}</DialogTitle>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{dialogDesc}</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-5 scrollbar-thin scrollbar-thumb-rounded pr-2 bg-card">

                    {/* Project selector — only in all-projects mode */}
                    {mode === 'all-projects' && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-foreground/90">Project <span className="text-red-500">*</span></Label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] font-medium transition-colors hover:border-primary/40 focus:ring-0 focus:outline-none focus:border-primary/40">
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent className="bg-card z-[9999] rounded-xl border-border/80 shadow-2xl">
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)} className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40">{p.project_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="summary" className="text-sm font-medium text-foreground/90">Title <span className="text-red-500">*</span></Label>
                        <Input 
                            id="summary" 
                            value={summary} 
                            onChange={e => setSummary(e.target.value)} 
                            placeholder="e.g. Site visit, Client review" 
                            required 
                            className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-foreground/90">Start <span className="text-red-500">*</span></Label>
                            <DateTimePicker value={startTime} onChange={setStartTime} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-foreground/90">End <span className="text-red-500">*</span></Label>
                            <DateTimePicker value={endTime} onChange={setEndTime} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="location" className="text-sm font-medium text-foreground/90">Location</Label>
                        <Input 
                            id="location" 
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            placeholder="Zoom / Office / Site address" 
                            className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                        />
                    </div>

                    {mode === 'my-calendar' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="attendees" className="text-sm font-medium text-foreground/90">Attendees <span className="text-xs text-muted-foreground font-semibold">(comma separated emails)</span></Label>
                            <Input 
                                id="attendees" 
                                value={attendees} 
                                onChange={e => setAttendees(e.target.value)} 
                                placeholder="guest@example.com, guest2@example.com" 
                                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-sm font-medium text-foreground/90">Notes</Label>
                        <Textarea 
                            id="description" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Any additional details..." 
                            className="rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors resize-none"
                            rows={3}
                        />
                    </div>
                </form>
                <DialogFooter className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40 bg-card">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setOpen(false)}
                        className="h-10 px-5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        form="add-event-form"
                        onClick={handleSubmit}
                        disabled={isPending || isSubmitting}
                        className="h-10 px-6 rounded-xl text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {(isPending || isSubmitting) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Create Event
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
