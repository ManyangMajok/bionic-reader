import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  FolderKanban,
  X,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultNavItems: NavItem[] = [
  { icon: <Home size={20} />, label: "Home", isActive: true },
  { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { icon: <FolderKanban size={20} />, label: "Projects" },
  { icon: <Calendar size={20} />, label: "Calendar" },
  { icon: <Users size={20} />, label: "Team" },
];

const defaultBottomItems: NavItem[] = [
  { icon: <Settings size={20} />, label: "Settings" },
  { icon: <HelpCircle size={20} />, label: "Help" },
];

const Sidebar = ({
  items = defaultNavItems,
  activeItem = "Home",
  onItemClick = () => {},
  isMobile = false,
  isOpen = false,
  onClose = () => {},
}: SidebarProps) => {
  const handleItemClick = (label: string) => {
    onItemClick(label);
    if (isMobile) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <div className="h-full bg-white/95 backdrop-blur-md flex flex-col">
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={`${isMobile ? "p-4" : "p-6"}`}>
        {!isMobile && (
          <>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Projects
            </h2>
            <p className="text-sm text-gray-500">
              Manage your projects and tasks
            </p>
          </>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1.5">
          {items.map((item) => (
            <Button
              key={item.label}
              variant={"ghost"}
              className={`w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${item.label === activeItem ? "bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => handleItemClick(item.label)}
            >
              <span
                className={`transition-colors ${item.label === activeItem ? "text-blue-600" : "text-gray-500"}`}
              >
                {item.icon}
              </span>
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-gray-100" />

        <div className="space-y-3">
          <h3 className="text-xs font-medium px-4 py-1 text-gray-500 uppercase tracking-wider">
            Filters
          </h3>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Active
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            High Priority
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
            In Progress
          </Button>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-gray-200">
        {defaultBottomItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 mb-1.5 transition-all duration-200"
            onClick={() => handleItemClick(item.label)}
          >
            <span className="text-gray-500">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 border-r border-gray-200"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-[280px] h-full border-r border-gray-200 hidden lg:flex">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
