'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Users2,
    BarChart3,
    Calendar,
    UserPlus,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useFetch from '@/hooks/useFetch';
import { useAdmin } from '@/hooks/useAdmin';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isSameWeek,
    addMonths,
    subMonths,
    format,
    parseISO,
    differenceInDays,
    addWeeks,
    addYears,
    subYears,
    endOfDay,
} from 'date-fns';
import { TeamSummaryDashboard } from '@/components/teams/TeamSummaryDashboard';
import { usePost } from '@/hooks/usePost';
import { gooeyToast as toast } from 'goey-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteDialog } from '@/components/DeleteDialog';
import useUser from '@/hooks/useUser';

export default function TeamsPage() {
    const router = useRouter();
    const { isAdmin, userLoading } = useAdmin();
    const { can, isLoading: permLoading } = usePermissions();
    const {user} = useUser()
    const teamsPermission = can('team.edit');
    const teamsDeletePermission = can('team.delete');
    
    const queryClient= useQueryClient()
    const [showAddMemberPopover, setShowAddMemberPopover] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member');
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const [selectedTeamMember, setSelectedTeamMember] = useState(null);

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'year' | 'quarter' | 'month'>('quarter');
    const [mode, setMode] = useState<'workload' | 'timeline'>('workload');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch team members and their phases
    const { data: membersData, isLoading: membersLoading } = useFetch('projects/studio-members-phases/');

    React.useEffect(() => {
        if (!permLoading && !can('team.view')) {
            router.push('/');
        }
    }, [permLoading, can, router]);
    
      const { mutate: deleteMember, isPending: isDeleting } = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['user/studio/members/'] });
      queryClient.refetchQueries({ queryKey: ['projects/studio-members-phases/'] });
      setIsDeleteOpen(false);
      toast.info("Member removed successfully");
    },
    onError: () => {
      toast('Error! Try again');
    },
  });
    
    
      const { mutate: inviteUser, isPending: isInviting } = usePost({
        onSuccess: () => {
          toast.success('Invitation sent successfully');
          setShowAddMemberPopover(false);
          setEmailInput('');
          setInviteRole('member');
          queryClient.refetchQueries({ queryKey: ['user/studio/members/'] });
          queryClient.refetchQueries({ queryKey: ['projects/studio-members-phases/'] });
        },
        onError: (error) => {
    
          toast.error('Failed to send invitation');
        },
      });

      
      
        const handleInvite = () => {
          if (emailInput && emailInput.includes('@')) {
            inviteUser({ url: '/user/invite/', data: { email: emailInput, role: inviteRole } });
          } else {
            toast.error('Please enter a valid email address');
          }
        };
        
     const handleDelete = id => {
    if(!teamsDeletePermission){
      toast.error("You don't have permission to perform this action")
      return;
    }
    if (!id) return;
    deleteMember({ url: 'user/studio/members/', data: { user_id: id } });

  };
      
    

    // Handlers
    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'quarter') setCurrentDate(subMonths(currentDate, 3));
        else setCurrentDate(subYears(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'quarter') setCurrentDate(addMonths(currentDate, 3));
        else setCurrentDate(addYears(currentDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Helper to place items in rows for spanning visualization
    const getLayoutRows = (items: any[], rangeStart: Date, rangeEnd: Date, granularity: 'day' | 'week' | 'month' = 'day') => {
        const sorted = [...items].sort((a, b) => {
            const startDiff = a.startDate.getTime() - b.startDate.getTime();
            if (startDiff !== 0) return startDiff;
            const durA = differenceInDays(a.endDate, a.startDate);
            const durB = differenceInDays(b.endDate, b.startDate);
            return durB - durA;
        });

        const rows: any[][] = [];

        sorted.forEach(item => {
            const itemStart = item.startDate < rangeStart ? rangeStart : item.startDate;
            const itemEnd = item.endDate > rangeEnd ? rangeEnd : item.endDate;

            if (item.endDate < rangeStart || item.startDate > rangeEnd) return;

            let rowIndex = 0;
            while (true) {
                if (!rows[rowIndex]) {
                    rows[rowIndex] = [];
                }

                const hasCollision = rows[rowIndex].some(existing => {
                    let existingStart = existing.startDate < rangeStart ? rangeStart : existing.startDate;
                    let existingEnd = existing.endDate > rangeEnd ? rangeEnd : existing.endDate;

                    let checkItemStart = itemStart;
                    let checkItemEnd = itemEnd;

                    if (granularity === 'month') {
                        existingStart = startOfMonth(existingStart);
                        existingEnd = endOfMonth(existingEnd);
                        checkItemStart = startOfMonth(checkItemStart);
                        checkItemEnd = endOfMonth(checkItemEnd);
                    } else if (granularity === 'week') {
                        existingStart = startOfWeek(existingStart);
                        existingEnd = endOfWeek(existingEnd);
                        checkItemStart = startOfWeek(checkItemStart);
                        checkItemEnd = endOfWeek(checkItemEnd);
                    }

                    return (checkItemStart <= existingEnd && checkItemEnd >= existingStart);
                });

                if (!hasCollision) {
                    rows[rowIndex].push(item);
                    break;
                }
                rowIndex++;
            }
        });

        return rows;
    };

    const getPhaseColor = (id: number, rowIdx: number) => {
        const colors = [
            'bg-[#8fa58f] border-[#8fa58f]',
            'bg-[#d9d5cc] border-[#d9d5cc] !text-[#5c5750]',
            'bg-[#e07a57] border-[#e07a57] !text-[#e7e7e7]',
        ];
        return colors[id % colors.length];
    };

    // Calculate utilisation for each team member
    const teamWorkload = useMemo(() => {
        if (!Array.isArray(membersData)) return [];

        return membersData.map((member: any) => {
            let totalPhases = 0;
            let activeProjects: string[] = [];

            (member.projects || []).forEach((proj: any) => {
                const activePhases = (proj.phases || []).filter((ph: any) => {
                    const pStart = ph?.start_date ? parseISO(ph?.start_date) : null;
                    const pEnd = ph?.end_date ? parseISO(ph?.end_date) : null;
                    if (!pStart || !pEnd) return false;
                    const now = new Date();
                    return pStart <= now && pEnd >= now;
                });

                if (activePhases.length > 0) {
                    activeProjects.push(proj.project_name);
                    totalPhases += activePhases.length;
                }
            });

            // Calculate utilisation based on active projects (max 5 = 100%)
            const utilisation = Math.min((activeProjects.length / 5) * 100, 100);

            return {
                ...member,
                activeProjects,
                totalPhases,
                utilisation: Math.round(utilisation),
            };
        }).filter((m: any) => {
            if (!searchQuery) return true;
            return m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.activeProjects.some((p: string) => p.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    }, [membersData, searchQuery]);
    
      const openDeleteModal = member => {
    setIsDeleteOpen(true);
    setSelectedTeamMember(member);
  };

    // Get utilisation color - using app's earthy palette
    const getWorkloadColor = (utilisation: number) => {
        if (utilisation >= 90) return 'bg-[#e07a57]';
        if (utilisation >= 70) return 'bg-[#d9d5cc]';
        return 'bg-[#8fa58f]';
    };

    const getWorkloadStatus = (utilisation: number) => {
        if (utilisation >= 90) return { label: 'Stretched', bgClass: 'bg-[#e07a57]/20', textClass: 'text-[#c45a3a]' };
        if (utilisation >= 70) return { label: 'Stretched', bgClass: 'bg-[#e07a57]/10', textClass: 'text-[#c45a3a]' };
        if (utilisation >= 30) return { label: 'Healthy', bgClass: 'bg-[#8fa58f]/20', textClass: 'text-[#5a6f5a]' };
        return { label: 'Available', bgClass: 'bg-white', textClass: 'text-gray-600' };
    };

    // Render Workload View
    const renderWorkloadView = () => {
        if (membersLoading) {
            return (
                <div className="flex flex-col gap-4">
                    <TeamSummaryDashboard teamMembers={[]} isLoading={true} />
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        Loading team data...
                    </div>
                </div>
            );
        }

        if (teamWorkload.length === 0) {
            return (
                <div className="flex flex-col gap-4">
                    <TeamSummaryDashboard teamMembers={[]} />
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Users2 className="w-12 h-12 mb-3 opacity-20" />
                        <p>No team members found.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-4">
                {/* Summary Dashboard */}
                <TeamSummaryDashboard teamMembers={teamWorkload} />
                {/* Team Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Team Members</h3>
                        <div className="relative">
                            
                          {teamsPermission &&  <Popover>
                                <PopoverTrigger>
                                    <Button  variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                            <UserPlus className="w-3.5 h-3.5" />
                            Invite Member
                        </Button>
                                </PopoverTrigger>
                                <PopoverContent side='left' className="w-80 p-4">
                                  <h3 className="font-medium text-gray-900 mb-3">Invite Team Member</h3>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email address
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="email"
                                      placeholder="Enter email address"
                                      className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                      value={emailInput}
                                      onChange={(e) => setEmailInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleInvite();
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={handleInvite}
                                      disabled={isInviting}
                                      className="bg-clay-600 text-white hover:bg-clay-700">
                                      {isInviting ? 'Sending...' : 'Invite'}
                                    </Button>
                                  </div>
                                  <label className="block text-sm font-medium text-gray-700 mt-3 mb-1.5">
                                    Role
                                  </label>
                                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'manager' | 'member')}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                      <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </PopoverContent>
                            </Popover>}
                            
           
            </div>
                    </div>

                    {/* Table Header — hidden on mobile */}
                    <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-3 bg-white border-b border-gray-100 text-sm font-medium text-gray-600">
                        <div className="col-span-4">Team Member</div>
                        <div className="col-span-2">
                            <TooltipProvider>
                                <Tooltip delayDuration={500}>
                                    <TooltipTrigger className="cursor-help">
                                        Active Projects
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                        <p>Number of projects with phases currently in progress. A project is considered active if it has at least one phase where today falls between the start and end date.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="col-span-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                        Workload
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                        <p>Percentage of capacity being used, calculated based on active projects. Each active project adds 20% to workload (5 projects = 100% capacity).</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className={`flex justify-center ${teamsDeletePermission ? 'col-span-2' : 'col-span-3'}`}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                        Status
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                        <p><strong>Available:</strong> Less than 30% workload — ready for new projects.<br />
                                        <strong>Healthy:</strong> 30-70% workload — balanced capacity.<br />
                                        <strong>Stretched:</strong> Over 70% workload — near or at full capacity.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {teamsDeletePermission && <div className="col-span-1 flex justify-center">Action</div>}
                    </div>

                    {/* Team Members */}
                    <div className="divide-y divide-gray-100">
                        {teamWorkload.map((member: any) => {
                            const status = getWorkloadStatus(member.utilisation);
                            return (
                                <div key={member.id} className="hover:bg-stone-50/50 transition-colors">
                                    {/* Desktop row */}
                                    <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-3 items-center">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <Avatar className="h-9 w-9 shrink-0">
                                                <AvatarFallback className="bg-white text-gray-600 text-sm font-medium">
                                                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 text-sm truncate">{member.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{member.title || 'Team Member'}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            {member.activeProjects.length > 0 ? (
                                                <div className="text-sm text-gray-600">
                                                    {member.activeProjects.length} project{member.activeProjects.length !== 1 ? 's' : ''}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </div>
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getWorkloadColor(member.utilisation)} transition-all`}
                                                        style={{ width: `${member.utilisation}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 w-8 text-right">
                                                    {member.utilisation}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`flex justify-center items-center ${teamsDeletePermission ? 'col-span-2' : 'col-span-3'}`}>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        {teamsDeletePermission && (
                                            <div className="col-span-1 flex justify-center items-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteModal(member)}
                                                    className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile card */}
                                    <div className="md:hidden px-4 py-3 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 shrink-0">
                                                    <AvatarFallback className="bg-white text-gray-600 text-sm font-medium">
                                                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 text-sm truncate">{member.name}</div>
                                                    <div className="text-xs text-gray-500 truncate">{member.title || 'Team Member'}</div>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getWorkloadColor(member.utilisation)} transition-all`}
                                                    style={{ width: `${member.utilisation}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 w-8 text-right shrink-0">
                                                {member.utilisation}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {member.activeProjects.length > 0
                                                    ? `${member.activeProjects.length} active project${member.activeProjects.length !== 1 ? 's' : ''}`
                                                    : 'No active projects'}
                                            </span>
                                            {teamsDeletePermission && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteModal(member)}
                                                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Render Timeline View - redesigned for clarity
    const renderTimelineView = () => {
        const now = new Date();
        let rangeStart: Date, rangeEnd: Date, columns: { label: React.ReactNode, date: Date, width: number }[] = [];
        let daysPerCol = 1;

        if (view === 'month') {
            // Month view: Shows single month with day columns
            rangeStart = startOfMonth(currentDate);
            rangeEnd = endOfMonth(currentDate);
            const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
            columns = days.map(d => ({
                label: (
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-400">{format(d, 'EEE')}</span>
                        <span className="text-sm font-medium text-gray-600">{format(d, 'd')}</span>
                    </div>
                ),
                date: d,
                width: 40
            }));
            daysPerCol = 1;
        } else if (view === 'quarter') {
            // Quarter view: Shows 3 months with week columns
            const quarterStart = startOfMonth(currentDate);
            const quarterEnd = endOfMonth(addMonths(currentDate, 2));
            rangeStart = startOfWeek(quarterStart);
            rangeEnd = endOfWeek(quarterEnd);

            let weekNum = 1;
            let iter = rangeStart;

            while (iter <= rangeEnd) {
                const weekStart = iter;
                columns.push({
                    label: (
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] text-gray-400">W{weekNum}</span>
                            <span className="text-xs font-medium text-gray-600">{format(weekStart, 'MMM d')}</span>
                        </div>
                    ),
                    date: iter,
                    width: 80
                });
                iter = addWeeks(iter, 1);
                weekNum++;
            }
            daysPerCol = 7;
        } else {
            // Year view: Shows 12 months
            rangeStart = new Date(currentDate.getFullYear(), 0, 1);
            rangeEnd = new Date(currentDate.getFullYear(), 11, 31);

            for (let i = 0; i < 12; i++) {
                const d = new Date(currentDate.getFullYear(), i, 1);
                columns.push({
                    label: (
                        <span className="text-xs font-medium text-gray-600">{format(d, 'MMM')}</span>
                    ),
                    date: d,
                    width: 100
                });
            }
            daysPerCol = 30.44;
        }

        const totalGridWidth = columns.reduce((sum, col) => sum + col.width, 0);

        const members = (membersData || []).map((m: any) => {
            const validPhases: any[] = [];
            (m.projects || []).forEach((proj: any) => {
                (proj.phases || []).forEach((ph: any) => {
                    const pName = ph.name?.toLowerCase() || '';
                    const projName = proj.project_name?.toLowerCase() || '';
                    const query = searchQuery.toLowerCase();
                    if (searchQuery && !pName.includes(query) && !projName.includes(query)) return;

                    const pStart = ph?.start_date ? parseISO(ph?.start_date) : null;
                    const pEnd = ph?.end_date ? parseISO(ph?.end_date) : null;
                    if (!pStart || !pEnd) return;

                    validPhases.push({
                        ...ph,
                        startDate: pStart,
                        endDate: endOfDay(pEnd),
                        project_name: proj.project_name,
                        project_id: proj.id
                    });
                });
            });

            const phasesInRange = validPhases.filter(p =>
                (p.startDate <= rangeEnd && p.endDate >= rangeStart)
            );

            const granularity = view === 'year' ? 'month' : view === 'quarter' ? 'week' : 'day';
            const layoutRows = getLayoutRows(phasesInRange, rangeStart, rangeEnd, granularity);

            if (phasesInRange.length === 0 && searchQuery) return null;

            return { ...m, layoutRows };
        }).filter(Boolean);

        const ROW_HEIGHT = 22;
        const ROW_GAP = 6;
        const MEMBER_COL_WIDTH = 200;

        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-auto relative">
                    <div style={{ minWidth: `${totalGridWidth + MEMBER_COL_WIDTH}px` }}>
                        {/* Header */}
                        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex h-14 shadow-sm">
                            <div
                                className="sticky left-0 z-50 bg-white border-r border-gray-200 flex items-center px-4 font-semibold text-sm text-gray-700 shadow-sm"
                                style={{ width: `${MEMBER_COL_WIDTH}px`, minWidth: `${MEMBER_COL_WIDTH}px` }}
                            >
                                Team Members
                            </div>
                            <div className="flex w-fit relative">
                                {columns.map((col, i) => {
                                    let isCurrent = false;
                                    if (view === 'month') isCurrent = isSameDay(col.date, now);
                                    else if (view === 'quarter') isCurrent = isSameWeek(col.date, now);
                                    else isCurrent = isSameMonth(col.date, now);

                                    return (
                                        <div
                                            key={i}
                                            className={`border-r border-gray-100 flex items-center justify-center ${isCurrent ? 'bg-[#8fa58f]/10' : 'bg-white'}`}
                                            style={{ width: col.width }}
                                        >
                                            {col.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Member Rows */}
                        {members.map((member: any) => {
                            const rowCount = Math.max(member.layoutRows.length, 1);
                            const contentHeight = (rowCount * (ROW_HEIGHT + ROW_GAP)) - ROW_GAP;
                            const rowMinHeight = 64;
                            const totalRowHeight = Math.max(contentHeight + 24, rowMinHeight);

                            return (
                                <div key={member.id} className="flex border-b border-gray-100 group hover:bg-gray-50/50 transition-colors">
                                    <div
                                        className="sticky left-0 z-30 bg-white border-r border-gray-200 px-4 flex items-center gap-3 transition-colors group-hover:bg-gray-50"
                                        style={{ width: `${MEMBER_COL_WIDTH}px`, minWidth: `${MEMBER_COL_WIDTH}px`, height: `${totalRowHeight}px` }}
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{member.name ? member.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 overflow-hidden">
                                            <div className="text-sm font-semibold text-gray-900 truncate">{member.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{member.title || 'Team Member'}</div>
                                        </div>
                                    </div>

                                    <div className="relative flex-1" style={{ height: `${totalRowHeight}px` }}>
                                        <div className="absolute inset-0 flex pointer-events-none z-0 w-fit">
                                            {columns.map((col, i) => {
                                                let isCurrent = false;
                                                if (view === 'month') isCurrent = isSameDay(col.date, now);
                                                else if (view === 'quarter') isCurrent = isSameWeek(col.date, now);
                                                else isCurrent = isSameMonth(col.date, now);

                                                return (
                                                    <div key={i} className={`border-r border-gray-100 h-full flex-shrink-0 ${isCurrent ? 'bg-[#8fa58f]/5' : ''}`} style={{ width: col.width }} />
                                                );
                                            })}
                                        </div>

                                        <div className="absolute inset-0 top-3 w-full">
                                            {member.layoutRows.map((rowItems: any[], rKey: number) => (
                                                <React.Fragment key={rKey}>
                                                    {rowItems.map((phase: any) => {
                                                        let leftPx = 0, widthPx = 0;

                                                        if (view === 'year') {
                                                            // Year view: position by month
                                                            const phaseStartYear = phase.startDate.getFullYear();
                                                            const phaseStartMonth = phase.startDate.getMonth();
                                                            const phaseEndYear = phase.endDate.getFullYear();
                                                            const phaseEndMonth = phase.endDate.getMonth();

                                                            const rangeYear = rangeStart.getFullYear();

                                                            let startMonthOffset = (phaseStartYear - rangeYear) * 12 + phaseStartMonth;
                                                            let endMonthOffset = (phaseEndYear - rangeYear) * 12 + phaseEndMonth;

                                                            if (startMonthOffset < 0) startMonthOffset = 0;
                                                            if (endMonthOffset > 11) endMonthOffset = 11;

                                                            const monthSpan = endMonthOffset - startMonthOffset + 1;
                                                            const colWidth = columns[0]?.width || 100;
                                                            leftPx = startMonthOffset * colWidth;
                                                            widthPx = monthSpan * colWidth;
                                                        } else {
                                                            // Quarter/Month view: position by days
                                                            const phaseVisibleStart = phase.startDate < rangeStart ? rangeStart : phase.startDate;
                                                            const phaseVisibleEnd = phase.endDate > rangeEnd ? rangeEnd : phase.endDate;

                                                            let diffDaysStart = differenceInDays(phaseVisibleStart, rangeStart);
                                                            let durationDays = differenceInDays(phaseVisibleEnd, phaseVisibleStart) + 1;

                                                            const colWidth = columns[0]?.width || 80;
                                                            leftPx = (diffDaysStart / daysPerCol) * colWidth;
                                                            widthPx = (durationDays / daysPerCol) * colWidth;
                                                        }

                                                        // Only show label if bar is wide enough
                                                        const showLabel = widthPx > 60;

                                                        return (
                                                            <TooltipProvider key={`${phase.id}-${rKey}`}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div
                                                                            className={`absolute rounded-sm px-2 text-[10px] font-medium flex items-center text-white cursor-pointer shadow-sm transition-all hover:shadow-md hover:brightness-105 ${getPhaseColor(phase.id, rKey)}`}
                                                                            style={{
                                                                                left: `${leftPx}px`,
                                                                                width: `${Math.max(widthPx, 20)}px`,
                                                                                height: `${ROW_HEIGHT}px`,
                                                                                top: `${rKey * (ROW_HEIGHT + ROW_GAP)}px`,
                                                                                zIndex: 10 + rKey
                                                                            }}
                                                                        >
                                                                            {showLabel && (
                                                                                <span className="truncate">
                                                                                    {phase.project_name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="z-50">
                                                                        <div className="font-bold">{phase.project_name}</div>
                                                                        <div className="text-sm">{phase.name}</div>
                                                                        <div className="text-xs opacity-70 mt-1">
                                                                            {format(phase.startDate, 'MMM d, yyyy')} - {format(phase.endDate, 'MMM d, yyyy')}
                                                                        </div>
                                                                        <div className="text-xs mt-1">Progress: {phase.progress}%</div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {members.length === 0 && (
                            <div className="p-12 text-center text-gray-400 bg-gray-50/50">
                                No team members found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (userLoading) {
        return (
            <div className="flex-1 bg-stone-50 p-6 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Access denied (should redirect, but fallback UI)
    // TODO: Re-enable once isAdmin is properly set in user data
    // if (!isAdmin) {
    //     return (
    //         <div className="flex-1 bg-stone-50 p-6 flex items-center justify-center">
    //             <div className="text-center">
    //                 <Users2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
    //                 <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h2>
    //                 <p className="text-gray-500">You don't have permission to view this page.</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="flex-1 bg-stone-50 p-6 flex flex-col overflow-hidden">
            <div className="max-w-7xl w-full mx-auto flex flex-col h-full gap-4">
                {/* Top Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Mode Toggle */}
                        <div className="bg-white border border-gray-200 p-1 rounded-lg flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode('workload')}
                                className={`h-8 px-3 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${mode === 'workload' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Workload
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode('timeline')}
                                className={`h-8 px-3 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${mode === 'timeline' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                            >
                                <Calendar className="h-4 w-4" />
                                Timeline
                            </Button>
                        </div>

                        {/* View Buttons - Only show in Timeline mode */}
                        {mode === 'timeline' && (
                            <div className="bg-white border border-gray-200 p-1 rounded-lg flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('year')}
                                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'year' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                                >
                                    Year
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('quarter')}
                                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'quarter' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                                >
                                    Quarter
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('month')}
                                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'month' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                                >
                                    Month
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Timeline Navigation */}
                    {mode === 'timeline' && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-semibold w-36 text-center select-none">
                                    {view === 'month' ? format(currentDate, 'MMMM yyyy')
                                        : view === 'quarter' ? `${format(currentDate, 'MMM')} - ${format(addMonths(currentDate, 2), 'MMM yyyy')}`
                                            : format(currentDate, 'yyyy')}
                                </span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="h-9 w-40 sm:w-64 pl-9 bg-white border-gray-200"
                                placeholder="Search team members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {mode === 'workload' ? renderWorkloadView() : renderTimelineView()}
                </div>

            </div>
            
                                   <DeleteDialog
                            isOpen={isDeleteOpen}
                            onClose={() => setIsDeleteOpen(false)}
                            onConfirm={() => handleDelete(selectedTeamMember?.id)}
                            title="Remove Member"
                            confirmText="Remove"
                            description={`Are you sure you want to remove ${selectedTeamMember?.name} from this studio? Removing this member will revoke their access to all projects and tasks associated with this studio.`}
                            itemName={selectedTeamMember?.name}
                            requireConfirmation={true} 
                          />
            
        </div>
    );
}
