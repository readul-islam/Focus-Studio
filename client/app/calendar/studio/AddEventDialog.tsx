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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-9 gap-2 bg-primary text-primary-foreground hover:opacity-90">
                    <Plus className="w-4 h-4" />
                    Add Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{dialogDesc}</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-2">

                    {/* Project selector — only in all-projects mode */}
                    {mode === 'all-projects' && (
                        <div className="grid gap-2">
                            <Label>Project <span className="text-red-500">*</span></Label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.project_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="summary">Title <span className="text-red-500">*</span></Label>
                        <Input id="summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="e.g. Site visit, Client review" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start <span className="text-red-500">*</span></Label>
                            <DateTimePicker value={startTime} onChange={setStartTime} />
                        </div>
                        <div className="grid gap-2">
                            <Label>End <span className="text-red-500">*</span></Label>
                            <DateTimePicker value={endTime} onChange={setEndTime} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Zoom / Office / Site address" />
                    </div>

                    {mode === 'my-calendar' && (
                        <div className="grid gap-2">
                            <Label htmlFor="attendees">Attendees <span className="text-xs text-gray-400">(comma separated emails)</span></Label>
                            <Input id="attendees" value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="guest@example.com, guest2@example.com" />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="description">Notes</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Any additional details..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending || isSubmitting}>
                            {(isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
