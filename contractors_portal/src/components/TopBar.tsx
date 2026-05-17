import { UserInfo } from './topbar/UserInfo';
import { useNavigate } from 'react-router-dom';
import useUser from '@/hooks/userUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { ChevronsUpDown } from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const { user, project, projects, setSelectedProject } = useUser();

  const handleLogoutClick = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <div className="w-full px-4 py-3 md:py-5 bg-white md:bg-transparent border-b md:border-b-0 border-gray-200">
      <div className="flex items-center justify-between">
        {/* Mobile: Logo + Project switcher on left */}
        <div className="md:hidden flex items-center gap-2 min-w-0">
          <img src="/techstyles-t-logo.png" alt="Techstyles logo" className="w-8 h-8 flex-shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 focus:outline-none min-w-0">
                <span className="font-semibold text-gray-900 text-sm truncate max-w-[140px]">
                  {project?.project_name ?? 'Techstyles'}
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white rounded-lg" align="start" sideOffset={8}>
              <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                Your projects
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((p: any) => (
                <DropdownMenuItem
                  key={p.project_id}
                  onClick={() => setSelectedProject(p)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.project_id === project?.project_id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {p.project_name?.[0]}
                  </div>
                  <span className="text-sm truncate flex-1">{p.project_name}</span>
                  {p.project_id === project?.project_id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/select-project')} className="text-xs text-gray-500 cursor-pointer">
                View all projects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: UserInfo */}
        <div className="hidden md:flex items-center gap-4">
          <UserInfo />
        </div>

        {/* Mobile: Profile on right */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none">
                <Avatar className="h-9 w-9 rounded-full">
                  <AvatarFallback className="rounded-full bg-gray-900 text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 bg-white rounded-lg"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gray-900 text-white font-bold text-xs">
                    <span>{user?.name?.[0]?.toUpperCase()}</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-gray-600">{user?.email || 'Loading..'}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Button
                    className="w-full"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
