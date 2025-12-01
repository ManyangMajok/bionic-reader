import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Apple-style navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30 safe-area-inset-top">
        <div className="responsive-container flex h-12 sm:h-14 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="font-medium text-lg sm:text-xl truncate">
              Bionic Reader
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-7 text-sm font-light">
            <Link to="/" className="hover:text-gray-500 transition-colors">
              Features
            </Link>
            <Link to="/" className="hover:text-gray-500 transition-colors">
              Documentation
            </Link>
            <Link to="/" className="hover:text-gray-500 transition-colors">
              Components
            </Link>
            <Link to="/" className="hover:text-gray-500 transition-colors">
              Examples
            </Link>
            <Link to="/" className="hover:text-gray-500 transition-colors">
              Support
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center pt-12 sm:pt-14 px-4 sm:px-6 lg:px-8 safe-area-inset-bottom">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Bionic Reader
            </h2>
            <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-500 mt-2">
              Sign in to access your account
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
