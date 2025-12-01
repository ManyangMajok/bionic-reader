import { Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useRoutes,
  useLocation,
} from "react-router-dom";
//import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";

import Success from "./components/pages/success";
import Home from "./components/pages/home";

// --- CORRECTED IMPORT PATHS ---
import BionicReaderPage from "./components/pages/BionicReaderPage"; // Updated path
// ------------------------

import UserAccount from "./components/pages/UserAccount";
import { AuthProvider, useAuth } from "../supabase/auth";
import { Toaster } from "./components/ui/toaster";
import { LoadingScreen, LoadingSpinner } from "./components/ui/loading-spinner";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative">
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/50">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        </div>
      )}
      <div
        className={`transition-opacity duration-150 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />

        <Route
          path="/processor"
          element={
            <PrivateRoute>
              {/* --- ROUTE WITH CORRECT COMPONENT --- */}
              <BionicReaderPage />
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route
          path="/bionic-reader"
          element={
            <PrivateRoute>
              {/* --- ROUTE WITH CORRECT COMPONENT --- */}
              <BionicReaderPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <UserAccount />
            </PrivateRoute>
          }
        />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen text="Loading application..." />}>
        <AppRoutes />
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;