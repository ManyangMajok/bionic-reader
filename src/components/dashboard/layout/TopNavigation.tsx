import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell, Home, Search, Settings, User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../supabase/auth";

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  notifications?: Array<{ id: string; title: string }>;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

const TopNavigation = ({
  onSearch = () => {},
  notifications = [
    { id: "1", title: "New project assigned" },
    { id: "2", title: "Meeting reminder" },
  ],
  onMenuClick = () => {},
  showMobileMenu = false,
}: TopNavigationProps) => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full h-16 border-b border-gray-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 fixed top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
        >
          {showMobileMenu ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </Button>

        {/* Home Link */}
        <Link
          to="/"
          className="text-gray-900 hover:text-gray-700 transition-colors"
        >
          <Home className="h-5 w-5" />
        </Link>

        {/* Search Bar - Hidden on small screens, shown on medium+ */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-10 rounded-full bg-gray-100 border-0 text-sm focus:ring-2 focus:ring-gray-200 focus-visible:ring-gray-200 focus-visible:ring-offset-0 w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Button - Only shown on small screens */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Search className="h-4 w-4 text-gray-700" />
        </Button>

        {/* Notifications */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-9 w-9 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Bell className="h-4 w-4 text-gray-700" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium border border-white">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl overflow-hidden p-2 border border-gray-200 shadow-lg w-80 sm:w-auto"
                >
                  <DropdownMenuLabel className="text-sm font-medium text-gray-900 px-2">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-100" />
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="rounded-lg text-sm py-2 focus:bg-gray-100"
                    >
                      {notification.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg bg-gray-900 text-white text-xs px-3 py-1.5 hidden sm:block">
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 hover:cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.email || ""}
              />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-none shadow-lg w-56"
          >
            <DropdownMenuLabel className="text-xs text-gray-500 truncate">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => signOut()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavigation;
