import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserSubscription } from '@/hooks/useSubscription';

// Routes that don't require subscription (auth and billing pages)
const PUBLIC_ROUTES = ['/', '/auth', '/subscription', '/onboarding'];

interface RequireSubscriptionProps {
  children: ReactNode;
}

export function RequireSubscription({ children }: RequireSubscriptionProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: subscription, isLoading: subLoading } = useUserSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = authLoading || subLoading;
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Check if user has active subscription
  const hasActiveSubscription = subscription && 
    (subscription.status === 'active' || subscription.status === 'paused');

  useEffect(() => {
    // Don't redirect if still loading, on public route, or admin route
    if (isLoading || isPublicRoute || isAdminRoute) return;

    // If user is logged in but doesn't have active subscription, redirect to billing
    if (user && !hasActiveSubscription) {
      navigate('/subscription', { replace: true });
    }
  }, [user, hasActiveSubscription, isLoading, isPublicRoute, isAdminRoute, navigate]);

  // Show loading while checking subscription
  if (isLoading && !isPublicRoute && !isAdminRoute && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary text-lg">Verificando assinatura...</div>
      </div>
    );
  }

  // If on protected route and no active subscription, don't render
  if (!isPublicRoute && !isAdminRoute && user && !hasActiveSubscription && !isLoading) {
    return null;
  }

  return <>{children}</>;
}

// Hook to check subscription status
export function useSubscriptionStatus() {
  const { user } = useAuth();
  const { data: subscription, isLoading } = useUserSubscription();
  
  const hasActiveSubscription = subscription && 
    (subscription.status === 'active' || subscription.status === 'paused');

  return {
    hasActiveSubscription,
    subscription,
    isLoading,
    user,
    status: subscription?.status || 'none',
  };
}
