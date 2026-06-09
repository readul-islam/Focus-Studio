import { Link, useLocation, useNavigate } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import useUser from "@/hooks/userUser";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { clearClientSession } from "@/lib/client-session";
import { menuItems } from "@/lib/menuItems";
import { useTranslations } from "next-intl";

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, clearProjects } = useUser();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleResize = () => {
      setIsCollapsed(mediaQuery.matches);
    };

    handleResize();
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const handleLogout = () => {
    clearClientSession();
    clearProjects();
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex-col transition-all duration-300 hidden md:flex",
        isCollapsed ? "w-20" : "w-[220px]"
      )}>
      <div className={cn("p-4 bg-white", isCollapsed && "px-2")}>
        <div className="flex items-center gap-2">
          <img
            src="/brand/Logo.png"
            alt={tc("brand")}
            className={cn(isCollapsed ? "w-8 h-8 mx-auto" : "w-8 h-8", "block")}
          />
          {!isCollapsed && (
            <span className="font-semibold text-gray-900">{tc("brand")}</span>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-4 pt-2 pb-1 border-b border-gray-100">
          <ProjectSwitcher />
        </div>
      )}

      <nav
        className={cn(
          "flex-1 space-y-1 bg-white",
          isCollapsed ? "px-2 py-4" : "p-4"
        )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.basePath);
          const label = t(item.labelKey);

          return (
            <div key={item.labelKey}>
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
                    <p>{label}</p>
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
                  {label}
                </Link>
              )}
            </div>
          );
        })}

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
          title={isCollapsed ? tc("expand") : tc("collapse")}>
          {isCollapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              {tc("collapse")}
            </>
          )}
        </Button>
      </nav>

      <div className={cn("p-4 bg-white", isCollapsed && "px-2")}>
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
                    {user?.email || tc("loading")}
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
                          <AvatarFallback className="rounded-lg font-semibold tex-[16px]">
                            {user?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.name}
                          </span>
                          <span className="truncate text-xs">
                            {user?.email || tc("loading")}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Button
                          className="w-full"
                          onClick={() => handleLogout()}>
                          {tc("logout")}
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
