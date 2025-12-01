import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth.tsx"; // Adjust import
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Zap, User } from "lucide-react";

export const BionicReaderHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/30 shadow-sm safe-area-inset-top">
      <div className="responsive-container">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity min-w-0"
            >
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden xs:inline">Bionic Reader</span>
                <span className="xs:hidden">Bionic</span>
              </span>
            </Link>
          </div>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 hover:cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all mobile-tap-target">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.email || ""}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel className="text-xs text-gray-500 truncate">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer mobile-tap-target"
                  onSelect={() => navigate("/account")}
                >
                  <User className="mr-2 h-4 w-4" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 mobile-tap-target"
                  onSelect={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};