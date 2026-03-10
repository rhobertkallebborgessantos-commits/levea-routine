import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireSubscription } from "@/components/RequireSubscription";
import { CelebrationProvider } from "@/components/achievements/CelebrationProvider";
import { AchievementCelebrationHandler } from "@/components/achievements/AchievementCelebrationHandler";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { PageLoader } from "@/components/PageLoader";

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
const Subscription = lazy(() => import("./pages/Subscription"));
const Achievements = lazy(() => import("./pages/Achievements"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Demo = lazy(() => import("./pages/Demo"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminChurn = lazy(() => import("./pages/admin/AdminChurn"));
const AdminEngagement = lazy(() => import("./pages/admin/AdminEngagement"));
const AdminRisks = lazy(() => import("./pages/admin/AdminRisks"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminCommunications = lazy(() => import("./pages/admin/AdminCommunications"));
const AdminFinancial = lazy(() => import("./pages/admin/AdminFinancial"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminCompliance = lazy(() => import("./pages/admin/AdminCompliance"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));

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
        <Route path="/subscription" element={<PageTransition><Suspense fallback={<PageLoader />}><Subscription /></Suspense></PageTransition>} />
        <Route path="/achievements" element={<PageTransition><Suspense fallback={<PageLoader />}><Achievements /></Suspense></PageTransition>} />
        <Route path="/faq" element={<PageTransition><Suspense fallback={<PageLoader />}><FAQ /></Suspense></PageTransition>} />
        <Route path="/demo" element={<Suspense fallback={<PageLoader />}><Demo /></Suspense>} />
        <Route path="/reset-password" element={<PageTransition><Suspense fallback={<PageLoader />}><ResetPassword /></Suspense></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
        <Route path="/admin/churn" element={<Suspense fallback={<PageLoader />}><AdminChurn /></Suspense>} />
        <Route path="/admin/engagement" element={<Suspense fallback={<PageLoader />}><AdminEngagement /></Suspense>} />
        <Route path="/admin/risks" element={<Suspense fallback={<PageLoader />}><AdminRisks /></Suspense>} />
        <Route path="/admin/content" element={<Suspense fallback={<PageLoader />}><AdminContent /></Suspense>} />
        <Route path="/admin/communications" element={<Suspense fallback={<PageLoader />}><AdminCommunications /></Suspense>} />
        <Route path="/admin/financial" element={<Suspense fallback={<PageLoader />}><AdminFinancial /></Suspense>} />
        <Route path="/admin/reports" element={<Suspense fallback={<PageLoader />}><AdminReports /></Suspense>} />
        <Route path="/admin/compliance" element={<Suspense fallback={<PageLoader />}><AdminCompliance /></Suspense>} />
        <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
        <Route path="/admin/subscriptions" element={<Suspense fallback={<PageLoader />}><AdminSubscriptions /></Suspense>} />
        
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
        <CelebrationProvider>
          <AchievementCelebrationHandler />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RequireSubscription>
              <AnimatedRoutes />
            </RequireSubscription>
          </BrowserRouter>
        </CelebrationProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
