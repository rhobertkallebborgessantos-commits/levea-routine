import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";

// Critical path - load immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const Tea = lazy(() => import("./pages/Tea"));
const Progress = lazy(() => import("./pages/Progress"));
const Meals = lazy(() => import("./pages/Meals"));
const WeeklyCheckin = lazy(() => import("./pages/WeeklyCheckin"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Suspense fallback={<PageLoader />}><Onboarding /></Suspense></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Suspense fallback={<PageLoader />}><Settings /></Suspense></PageTransition>} />
        <Route path="/tea" element={<PageTransition><Suspense fallback={<PageLoader />}><Tea /></Suspense></PageTransition>} />
        <Route path="/progress" element={<PageTransition><Suspense fallback={<PageLoader />}><Progress /></Suspense></PageTransition>} />
        <Route path="/meals" element={<PageTransition><Suspense fallback={<PageLoader />}><Meals /></Suspense></PageTransition>} />
        <Route path="/checkin" element={<PageTransition><Suspense fallback={<PageLoader />}><WeeklyCheckin /></Suspense></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
