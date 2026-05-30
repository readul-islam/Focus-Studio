'use client';

import { useMediaQuery } from '@/hooks/use-media-query';
import { usePermissions } from '@/hooks/usePermissions';
import useUser from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronRight,
  DollarSign,
  FolderOpen,
  Home,
  Mail,
  MoreHorizontal,
  Palette,
  Settings,
  Users,
  Users2
} from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

// Sidebar dimension
const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 220;

type Item = {
  label: string;
  icon: any;
  href: string;
  basePath: string;
  permission?: string; // permission key from /user/studio/roles/ — if set, item is hidden when user lacks it
  tourId?: string;
};

const buildPersonalSidebarItems = (t: ReturnType<typeof useTranslations>): Item[] => [
  { label: t('sidebar.home'), icon: Home, href: '/home/dashboard', basePath: '/home/dashboard', tourId: 'nav-home' },
  { label: t('sidebar.inbox'), icon: Mail, href: '/ai/inbox', basePath: '/ai/inbox', tourId: 'nav-inbox' },
  { label: t('sidebar.myTasks'), icon: CheckSquare, href: '/home/tasks', basePath: '/home/tasks', permission: 'tasks.view' },
  { label: t('sidebar.calendar'), icon: Calendar, href: '/calendar', basePath: '/calendar' },
  { label: t('sidebar.projects'), icon: FolderOpen, href: '/projects', basePath: '/projects', permission: 'projects.view', tourId: 'nav-projects' }
];

const buildStudioSidebarItems = (t: ReturnType<typeof useTranslations>): Item[] => [
  { label: t('sidebar.crm'), icon: Users, href: '/crm/contacts', basePath: '/crm', permission: 'clients.view', tourId: 'nav-crm' },
  { label: t('sidebar.library'), icon: BookOpen, href: '/library/products', basePath: '/library/products', permission: 'library.view' },
  { label: t('sidebar.team'), icon: Users2, href: '/teams', basePath: '/teams', permission: 'team.view' },
  { label: t('sidebar.finance'), icon: DollarSign, href: '/finance', basePath: '/finance', permission: 'finance.view' },
  { label: t('sidebar.reports'), icon: BarChart3, href: '/reports', basePath: '/reports', permission: 'reports.view' },
  { label: t('sidebar.design'), icon: Palette, href: '/design', basePath: '/design', permission: 'design.view', tourId: 'nav-design' },
  { label: t('sidebar.aiActivity'), icon: Activity, href: '/ai/activity', basePath: '/ai/activity' }
];

const buildExtraSidebarItems = (t: ReturnType<typeof useTranslations>) => [
  {
    label: t('sidebar.helpCenter'),
    href: '/help',
    icon: (props: any) => (
      <svg {...props} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: t('sidebar.settings'),
    href: '/settings/user/profile',
    icon: Settings,
    tourId: 'nav-settings',
  },
];

// Framer Motion variants
const sidebarVariants = {
  expanded: {
    width: EXPANDED_WIDTH,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
  },
  collapsed: {
    width: COLLAPSED_WIDTH,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
  },
};

const labelVariants = {
  expanded: {
    opacity: 1,
    width: 'auto',
    marginLeft: 12,
    transition: {
      opacity: { duration: 0.2, delay: 0.1 },
      width: { type: 'spring' as const, stiffness: 300, damping: 30 },
      marginLeft: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  },
  collapsed: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    transition: {
      opacity: { duration: 0.15 },
      width: { type: 'spring' as const, stiffness: 300, damping: 30 },
      marginLeft: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  },
};

const logoTextVariants = {
  expanded: {
    opacity: 1,
    width: 'auto',
    transition: {
      opacity: { duration: 0.2, delay: 0.15 },
      width: { type: 'spring', stiffness: 300, damping: 30 },
    },
  },
  collapsed: {
    opacity: 0,
    width: 0,
    transition: {
      opacity: { duration: 0.1 },
      width: { type: 'spring', stiffness: 300, damping: 30 },
    },
  },
};

function NavItem({ item, isActive, isCollapsed }: { item: Item; isActive: boolean; isCollapsed: boolean }) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      data-tour={item.tourId}
      className={cn(
        'relative flex  items-center py-2 rounded-md text-sm font-medium h-9 px-[8px] transition-colors duration-150',
        !isActive && 'hover:bg-sidebar-accent',
        !isCollapsed && isActive && 'bg-sidebar-accent',
      )}
    >
      {/* Animated active background - only when collapsed */}
      {isCollapsed && isActive && (
        <motion.span
          layoutId="sidebar-nav-active"
          className="absolute inset-0 bg-sidebar-accent rounded-md"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {/* Fixed icon container */}
      <div
        className={cn(
          'relative z-10 w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors duration-150',
          isActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground',
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      {/* Animated label */}
      <motion.span
        variants={labelVariants}
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className={cn(
          'relative z-10 whitespace-nowrap overflow-hidden transition-colors duration-150',
          isActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground',
        )}
      >
        {item.label}
      </motion.span>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function AppSidebar() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const personalSidebarItems = useMemo(() => buildPersonalSidebarItems(t), [t]);
  const studioSidebarItems = useMemo(() => buildStudioSidebarItems(t), [t]);
  const extraSidebarItems = useMemo(() => buildExtraSidebarItems(t), [t]);

  const { theme, resolvedTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [hasMounted, setHasMounted] = useState(false);
  const { user } = useUser();
  const { can, isLoading: permLoading } = usePermissions();
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isShortScreen = useMediaQuery('(max-height: 600px)');
  const router = useRouter();

  // Decide if the sidebar theme is dark/custom to toggle filters
  const isDarkSidebar = hasMounted && 
    theme !== 'light' && 
    (theme === 'dark' || theme === 'system' ? resolvedTheme === 'dark' : true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet && hasMounted) {
      setIsCollapsed(true);
    }
  }, [isTablet, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, hasMounted]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sidebarCollapsed' && e.newValue !== null) {
        setIsCollapsed(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Sign out functionality
  const signOutBtn = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Even if the request fails, redirect — cookies will expire naturally
    }
    window.location.href = '/login';
  };

  const allowedPersonalItems = useMemo(() => {
    if (permLoading) return [];
    return personalSidebarItems.filter(item =>
      !item.permission || can(item.permission)
    );
  }, [permLoading, can]);

  const allowedStudioItems = useMemo(() => {
    if (permLoading) return [];
    return studioSidebarItems.filter(item =>
      !item.permission || can(item.permission)
    );
  }, [permLoading, can]);

  // Handle overflow menu
  const { visibleStudioItems, overflowItems } = useMemo(() => {
    if (isShortScreen && allowedStudioItems.length > 2) {
      return {
        visibleStudioItems: allowedStudioItems.slice(0, 2),
        overflowItems: allowedStudioItems.slice(2),
      };
    }
    return { visibleStudioItems: allowedStudioItems, overflowItems: [] };
  }, [isShortScreen, allowedStudioItems]);

  const isMoreActive = useMemo(() => {
    return overflowItems.some(item => pathname.startsWith(item.basePath));
  }, [overflowItems, pathname]);

  return (
    <>
      <AnimatePresence>
        {isTablet && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {isTablet && (
        <div className="flex-shrink-0 h-screen bg-transparent w-[64px]" />
      )}

      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        className={cn(
          "border-r border-sidebar-border h-screen flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden",
          isTablet ? "fixed inset-y-0 left-0 z-50" : "",
          isTablet && !isCollapsed ? "shadow-2xl" : "",
          !hasMounted && "opacity-0",
        )}
      >
        {/* Logo Section */}
        <div className="p-3 bg-sidebar relative">
          <div className="flex items-center h-11">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Image
                  width={35}
                  height={35}
                  src="/brand/Logo.png"
                  alt="Focuspilot"
                  className={cn(
                    "w-8 h-8 pl-1 object-contain",
                    isDarkSidebar ? "invert mix-blend-screen" : "mix-blend-multiply"
                  )}
                />
              </div>
              <motion.span
                variants={logoTextVariants}
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                className="font-semibold text-sidebar-foreground whitespace-nowrap overflow-hidden ml-3"
              >
                Focuspilot
              </motion.span>
            </div>
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="py-1.5 text-gray-400 hover:text-gray-600 hover:bg-stone-50 rounded-lg transition-colors flex-shrink-0 ml-7"
              title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-3.5 space-y-1 bg-sidebar overflow-hidden">
          {/* Personal Group */}
          <div className="space-y-0">
            {allowedPersonalItems.map((item, index) => (
              <NavItem
                key={`personal-${index}`}
                item={item}
                isActive={pathname.startsWith(item.basePath)}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          {/* Divider Section */}
          <div className="h-8 flex items-center px-3 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isCollapsed ? (
                <motion.div
                  key="line"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-px bg-stone-200"
                />
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                >
                  {t('sidebar.studio')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Studio Group */}
          <div className="space-y-1">
            {visibleStudioItems.map((item, index) => (
              <NavItem
                key={`studio-${index}`}
                item={item}
                isActive={pathname.startsWith(item.basePath)}
                isCollapsed={isCollapsed}
              />
            ))}

            {overflowItems.length > 0 && (
              <DropdownMenu>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center rounded-md text-sm font-medium transition-colors duration-150 w-full h-10 px-3.5",
                          isMoreActive
                            ? "bg-white text-gray-900"
                            : "text-gray-600 hover:text-gray-900 hover:bg-stone-50",
                        )}
                      >
                        {isCollapsed && isMoreActive && (
                          <motion.span
                            layoutId="sidebar-nav-active"
                            className="absolute inset-0 bg-white rounded-md"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <div className="relative z-10 w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <motion.span
                          variants={labelVariants}
                          initial={false}
                          animate={isCollapsed ? "collapsed" : "expanded"}
                          className="relative z-10 whitespace-nowrap overflow-hidden ml-3"
                        >
                          {t('sidebar.more')}
                        </motion.span>
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" sideOffset={12}>
                      <p>{t('sidebar.more')}</p>
                    </TooltipContent>
                  )}
                </Tooltip>

                <DropdownMenuContent
                  align="start"
                  side="right"
                  className="w-56 bg-white"
                  sideOffset={8}
                >
                  {overflowItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.basePath);
                    return (
                      <DropdownMenuItem key={index} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex w-full items-center gap-2 cursor-pointer",
                            isActive && "bg-stone-100",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3.5 pb-3 bg-sidebar space-y-0">
          {extraSidebarItems.map((item, index) => (
            <NavItem
              key={`extra-${index}`}
              item={{ ...item, basePath: item.href } as Item}
              isActive={pathname.startsWith(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}
