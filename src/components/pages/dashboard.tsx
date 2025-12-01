import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import DashboardGrid from "../dashboard/DashboardGrid";
import TaskBoard from "../dashboard/TaskBoard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  // Function to trigger loading state for demonstration
  const handleRefresh = () => {
    setLoading(true);
    // Reset loading after 2 seconds
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSidebarItemClick = (label: string) => {
    setActiveItem(label);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation
        onMenuClick={handleMenuClick}
        showMobileMenu={isMobileMenuOpen}
      />

      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Desktop Sidebar */}
        <Sidebar activeItem={activeItem} onItemClick={handleSidebarItemClick} />

        {/* Mobile Sidebar */}
        <Sidebar
          isMobile={true}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          activeItem={activeItem}
          onItemClick={handleSidebarItemClick}
        />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 pt-4 pb-2 flex justify-end">
            <Button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 sm:px-4 h-9 shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {loading ? "Loading..." : "Refresh Dashboard"}
              </span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
          <div
            className={cn(
              "container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8",
              "transition-all duration-300 ease-in-out",
            )}
          >
            <DashboardGrid isLoading={loading} />
            <TaskBoard isLoading={loading} />
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
