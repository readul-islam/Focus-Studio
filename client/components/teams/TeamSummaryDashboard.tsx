'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Users, Clock, TrendingUp, Info } from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    utilisation: number;
    activeProjects: string[];
}

interface TeamSummaryDashboardProps {
    teamMembers: TeamMember[];
    isLoading?: boolean;
}

export function TeamSummaryDashboard({ teamMembers, isLoading }: TeamSummaryDashboardProps) {
    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-24 bg-white rounded-lg"></div>
            </div>
        );
    }

    // Calculate team statistics
    const totalMembers = teamMembers.length;
    const avgUtilisation = totalMembers > 0
        ? Math.round(teamMembers.reduce((sum, m) => sum + m.utilisation, 0) / totalMembers)
        : 0;

    const healthyCount = teamMembers.filter(m => m.utilisation >= 30 && m.utilisation < 70).length;
    const availableCount = teamMembers.filter(m => m.utilisation < 30).length;
    const stretchedCount = teamMembers.filter(m => m.utilisation >= 70 && m.utilisation < 90).length;
    const overloadedCount = teamMembers.filter(m => m.utilisation >= 90).length;

    // Calculate if anyone has active projects
    const hasActiveProjects = teamMembers.some(m => m.activeProjects.length > 0);

    // Determine insight message - contextual based on team state
    const getInsight = () => {
        // No team members yet
        if (totalMembers === 0) {
            return {
                type: 'info' as const,
                message: `Add team members to start tracking workload.`,
            };
        }

        // Team exists but no active projects
        if (!hasActiveProjects) {
            return {
                type: 'info' as const,
                message: `No active projects assigned. Your team is available for new work.`,
            };
        }

        // Team is overloaded
        if (avgUtilisation > 80) {
            return {
                type: 'warning' as const,
                message: `Team is approaching maximum capacity. Consider redistributing workload.`,
            };
        }

        // Some members are stretched
        if (overloadedCount > 0) {
            return {
                type: 'warning' as const,
                message: `${overloadedCount} team member${overloadedCount > 1 ? 's are' : ' is'} stretched. Consider redistributing their projects.`,
            };
        }

        // Well balanced
        return {
            type: 'success' as const,
            message: `Team workload is well balanced.`,
        };
    };

    const insight = getInsight();

    // Circular progress calculations
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (avgUtilisation / 100) * circumference;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-6">
                {/* Circular Progress */}
                <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                            />
                            {/* Progress circle - using app's earthy palette */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke={avgUtilisation >= 80 ? '#e07a57' : avgUtilisation >= 60 ? '#d9d5cc' : '#8fa58f'}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{avgUtilisation}%</span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 font-medium">Team Utilisation</span>
                </div>

                {/* Stat Cards - using app's earthy palette */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-xs font-medium">Total</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{totalMembers}</div>
                        <div className="text-xs text-gray-400">Members</div>
                    </div>

                    <div className="bg-[#8fa58f]/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-[#5a6f5a] mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Healthy</span>
                        </div>
                        <div className="text-xl font-bold text-[#3a4b3a]">{healthyCount}</div>
                        <div className="text-xs text-[#5a6f5a]">30-70%</div>
                    </div>

                    <div className="bg-[#d9d5cc]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-[#5c5750] mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Available</span>
                        </div>
                        <div className="text-xl font-bold text-[#3d3a35]">{availableCount}</div>
                        <div className="text-xs text-[#5c5750]">&lt;30%</div>
                    </div>

                    <div className="bg-[#e07a57]/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-[#c45a3a] mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium">Stretched</span>
                        </div>
                        <div className="text-xl font-bold text-[#a04028]">{stretchedCount + overloadedCount}</div>
                        <div className="text-xs text-[#c45a3a]">&gt;70%</div>
                    </div>
                </div>
            </div>

            {/* Insight Banner */}
            <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                insight.type === 'warning'
                    ? 'bg-[#e07a57]/10 text-[#c45a3a]'
                    : insight.type === 'info'
                        ? 'bg-white text-gray-600'
                        : 'bg-[#8fa58f]/10 text-[#5a6f5a]'
            }`}>
                {insight.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : insight.type === 'info' ? (
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{insight.message}</p>
            </div>
        </div>
    );
}
