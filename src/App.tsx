import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";

// Lazy-load route components for bundle splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen gradient-hero flex items-center justify-center">
    <div className="w-12 h-12 rounded-xl skeleton-shimmer" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineBanner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
                <Route path="/student-login" element={<ErrorBoundary><StudentLogin /></ErrorBoundary>} />
                <Route path="/admin-login" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
                <Route path="/student/dashboard" element={<ErrorBoundary><ProtectedRoute><StudentDashboard /></ProtectedRoute></ErrorBoundary>} />
                <Route path="/admin/dashboard" element={<ErrorBoundary><ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
