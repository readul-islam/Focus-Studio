import { useDispatch } from 'react-redux';
import { UserInfo } from './topbar/UserInfo';
import { useNavigate } from 'react-router-dom';
import useUser from '@/hooks/userUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';

export function TopBar() {
  const navigate = useNavigate();
  const { user ,project } = useUser();

  const handleLogoutClick = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <div className="w-full px-4 py-3 md:py-5 bg-white md:bg-transparent border-b md:border-b-0 border-gray-200">
      <div className="flex items-center justify-between">
        {/* Mobile: Logo on left */}
        <div className="md:hidden flex items-center gap-2">
          <img
            src="/techstyles-t-logo.png"
            alt="Techstyles logo"
            className="w-8 h-8"
          />
          <span className="font-semibold text-gray-900">Techstyles</span>
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
                  <AvatarFallback className="rounded-full bg-gray-900 text-white font-semibold text-sm">
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
                    <AvatarFallback className="rounded-lg bg-gray-900 text-white font-semibold text-xs">
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
