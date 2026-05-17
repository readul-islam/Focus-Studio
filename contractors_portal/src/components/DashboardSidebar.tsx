import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import useUser from "@/hooks/userUser";
import { menuItems } from "@/lib/menuItems";

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, project, projects, setSelectedProject } = useUser();

  const sidebarItems = useMemo(
    () => menuItems.filter((i) => i.label.toLowerCase() !== "settings"),
    []
  );

  // ✅ Collapse by default on md and smaller screens
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Tailwind md breakpoint

    const handleResize = () => {
      setIsCollapsed(mediaQuery.matches); // collapse if <= md
    };

    handleResize(); // run on mount
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex-col transition-all duration-300 hidden md:flex",
        isCollapsed ? "w-16" : "w-[220px]"
      )}>
      {/* Logo */}
      <div className={cn("p-4 bg-white", isCollapsed && "px-2")}>
        <div className="flex items-center gap-2">
          <img
            src="/techstyles-t-logo.png"
            alt="Techstyles logo mark"
            className={cn(isCollapsed ? "w-8 h-8 mx-auto" : "w-8 h-8", "block")}
          />
          {!isCollapsed && (
            <span className="font-semibold text-gray-900">Techstyles</span>
          )}
        </div>
      </div>

      {/* Project Switcher */}
      <div className={cn("border-b border-gray-100", isCollapsed ? "px-2 py-2" : "px-3 py-2")}>
        {isCollapsed ? (
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/select-project')}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronsUpDown className="w-4 h-4 text-gray-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Switch project</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left focus:outline-none">
                <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold leading-none">
                    {project?.project_name?.[0] ?? 'P'}
                  </span>
                </div>
                <span className="flex-1 text-xs font-semibold text-gray-800 truncate">
                  {project?.project_name ?? 'No project'}
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white rounded-lg"
              side="right"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuLabel className="text-xs text-gray-500 font-normal px-2 py-1.5">
                Your projects
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((p: any) => (
                <DropdownMenuItem
                  key={p.project_id}
                  onClick={() => setSelectedProject(p)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    p.project_id === project?.project_id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {p.project_name?.[0]}
                  </div>
                  <span className="text-sm truncate flex-1">{p.project_name}</span>
                  {p.project_id === project?.project_id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/select-project')}
                className="text-xs text-gray-500 cursor-pointer"
              >
                View all projects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 space-y-1 bg-white",
          isCollapsed ? "px-2 py-4" : "p-4"
        )}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.basePath);

          return (
            <div key={item.label}>
              {isCollapsed ? (
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center duration-300 rounded-lg text-sm font-medium transition-colors",
                        isCollapsed
                          ? "justify-center p-3 w-11 h-11 mx-auto"
                          : "gap-3 px-3 py-2",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}>
                      <Icon className="w-5 h-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center duration-300 rounded-lg text-sm font-medium transition-colors",
                    "gap-3 px-3 py-2",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}

        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors",
            isCollapsed
              ? "justify-center p-3 w-12 h-12 mx-auto"
              : "gap-3 px-3 py-2 w-full justify-start"
          )}
          title={isCollapsed ? "Expand" : "Collapse"}>
          {isCollapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              Collapse
            </>
          )}
        </Button>
      </nav>

      {/* Utility Links + User Profile */}
      <div className={cn("p-4 bg-white", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <div className="space-y-1 mb-4">
            {/* <Link
              to="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Help Center
            </Link> */}
            {/* <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              <Settings className="w-5 h-5" />
              Settings
            </Link> */}
          </div>
        )}

        {/* User Profile Card */}
        <div
          className={cn("bg-gray-900 rounded-xl", isCollapsed ? "p-2" : "p-3")}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "bg-white rounded-full flex items-center justify-center flex-shrink-0",
                isCollapsed ? "w-8 h-8 mx-auto" : "w-10 h-10"
              )}>
              <span
                className={cn(
                  "text-gray-900 font-semibold",
                  isCollapsed ? "text-base" : "text-sm"
                )}>
                {user?.name?.[0]}
              </span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.name}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {user?.email || "Loading.."}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-white rounded-lg"
                    side={"right"}
                    align="end"
                    sideOffset={4}>
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg font-bold tex-[16px]">
                            {user?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.name}
                          </span>
                          <span className="truncate text-xs">
                            {user?.email || "Loading.."}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Button
                          className="w-full"
                          onClick={() => handleLogout()}>
                          Logout
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
