import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { addDays, addMonths, addYears, isBefore, isAfter, format, differenceInDays } from 'date-fns';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  interval_count: number;
  is_active: boolean;
  features: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'pending' | 'overdue' | 'cancelled' | 'expired' | 'paused';
  payment_method: 'pix' | 'credit_card' | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  grace_period_end: string | null;
  created_at: string;
  plan?: SubscriptionPlan;
  // Pause fields
  paused_at?: string | null;
  pause_until?: string | null;
  pause_count_this_cycle?: number;
  // Scheduled change fields
  scheduled_plan_id?: string | null;
  scheduled_change_type?: 'upgrade' | 'downgrade' | null;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'expired';
  payment_method: 'pix' | 'credit_card' | null;
  pix_code: string | null;
  pix_qr_code_url: string | null;
  pix_expires_at: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id: string | null;
  payment_id: string | null;
  invoice_number: string;
  amount_cents: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
  created_at: string;
}

// Format price in BRL
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// Get status label and color
export function getStatusInfo(status: Subscription['status']) {
  const statusMap = {
    active: { label: 'Ativo', color: 'bg-green-500', textColor: 'text-green-600' },
    pending: { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    overdue: { label: 'Atrasado', color: 'bg-red-500', textColor: 'text-red-600' },
    cancelled: { label: 'Cancelado', color: 'bg-gray-500', textColor: 'text-gray-600' },
    expired: { label: 'Expirado', color: 'bg-gray-500', textColor: 'text-gray-600' },
    paused: { label: 'Pausado', color: 'bg-orange-500', textColor: 'text-orange-600' },
  };
  return statusMap[status] || statusMap.pending;
}

// Hook to fetch subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
}

// Hook to fetch user's current subscription
export function useUserSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans!subscriptions_plan_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as (Subscription & { plan: SubscriptionPlan }) | null;
    },
    enabled: !!user,
  });
}

// Hook to fetch user's payment history
export function usePaymentHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });
}

// Hook to fetch user's invoices
export function useInvoices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user,
  });
}

// Hook to create/subscribe to a plan (mock mode)
export function useCreateSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      planId, 
      paymentMethod 
    }: { 
      planId: string; 
      paymentMethod: 'pix' | 'credit_card';
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Calculate period end based on interval
      const now = new Date();
      const periodEnd = plan.interval === 'yearly' 
        ? addYears(now, 1) 
        : addMonths(now, 1);

      // Create the subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: paymentMethod === 'pix' ? 'pending' : 'active',
          payment_method: paymentMethod,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create a mock payment
      const pixExpiresAt = addDays(now, 1);
      const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          amount_cents: plan.price_cents,
          currency: plan.currency,
          status: paymentMethod === 'pix' ? 'pending' : 'paid',
          payment_method: paymentMethod,
          pix_code: paymentMethod === 'pix' ? `PIX${Date.now()}${Math.random().toString(36).substring(7)}` : null,
          pix_expires_at: paymentMethod === 'pix' ? pixExpiresAt.toISOString() : null,
          card_last_four: paymentMethod === 'credit_card' ? '4242' : null,
          card_brand: paymentMethod === 'credit_card' ? 'Visa' : null,
          paid_at: paymentMethod === 'credit_card' ? now.toISOString() : null,
        })
        .select()
        .single();

      if (payError) throw payError;

      // Generate invoice number
      const invoiceNumber = `INV-${format(now, 'yyyyMM')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create an invoice
      const { error: invError } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          subscription_id: subscription.id,
          payment_id: payment.id,
          invoice_number: invoiceNumber,
          amount_cents: plan.price_cents,
          currency: plan.currency,
          status: paymentMethod === 'credit_card' ? 'paid' : 'open',
          due_date: format(addDays(now, 3), 'yyyy-MM-dd'),
          paid_at: paymentMethod === 'credit_card' ? now.toISOString() : null,
        }]);

      if (invError) throw invError;

      return { subscription, payment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Hook to cancel subscription
export function useCancelSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
  });
}

// Hook to reactivate subscription
export function useReactivateSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          cancelled_at: null,
          status: 'active',
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
  });
}

// Hook to simulate Pix payment (mock mode)
export function useSimulatePixPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Update payment to paid
      const { data: payment, error: payError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (payError) throw payError;

      // Update subscription to active
      if (payment.subscription_id) {
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', payment.subscription_id)
          .eq('user_id', user.id);

        if (subError) throw subError;
      }

      // Update invoice to paid
      const { error: invError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('payment_id', paymentId)
        .eq('user_id', user.id);

      if (invError) throw invError;

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Hook to fetch subscription settings (admin controls)
export function useSubscriptionSettings() {
  return useQuery({
    queryKey: ['subscription-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_settings')
        .select('*');

      if (error) throw error;
      
      // Convert to a more usable format
      const settings: Record<string, any> = {};
      data?.forEach((setting: any) => {
        settings[setting.setting_key] = setting.setting_value;
      });
      return settings;
    },
  });
}

// Hook to upgrade subscription (monthly → annual)
export function useUpgradeSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId,
      newPlanId,
      prorationAmount,
    }: { 
      subscriptionId: string;
      newPlanId: string;
      prorationAmount: number;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const now = new Date();
      const newPeriodEnd = addYears(now, 1);

      // Get old plan info
      const { data: oldSub } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('id', subscriptionId)
        .single();

      // Update subscription to new plan
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          current_period_start: now.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
          scheduled_plan_id: null,
          scheduled_change_type: null,
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (subError) throw subError;

      // Create payment for the prorated amount
      if (prorationAmount > 0) {
        const { error: payError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            subscription_id: subscriptionId,
            amount_cents: prorationAmount,
            currency: 'BRL',
            status: 'paid',
            payment_method: 'credit_card',
            paid_at: now.toISOString(),
          });

        if (payError) throw payError;
      }

      // Log the change
      const { error: logError } = await supabase
        .from('subscription_changes')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          change_type: 'upgrade',
          from_plan_id: oldSub?.plan_id,
          to_plan_id: newPlanId,
          amount_charged_cents: prorationAmount,
          effective_at: now.toISOString(),
        });

      if (logError) throw logError;

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-changes'] });
    },
  });
}

// Hook to schedule downgrade (annual → monthly)
export function useDowngradeSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId,
      newPlanId,
    }: { 
      subscriptionId: string;
      newPlanId: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Get current subscription
      const { data: currentSub } = await supabase
        .from('subscriptions')
        .select('current_period_end, plan_id')
        .eq('id', subscriptionId)
        .single();

      if (!currentSub) throw new Error('Assinatura não encontrada');

      // Schedule the downgrade for end of current period
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .update({
          scheduled_plan_id: newPlanId,
          scheduled_change_type: 'downgrade',
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (subError) throw subError;

      // Log the scheduled change
      const { error: logError } = await supabase
        .from('subscription_changes')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          change_type: 'downgrade',
          from_plan_id: currentSub.plan_id,
          to_plan_id: newPlanId,
          scheduled_for: currentSub.current_period_end,
          effective_at: currentSub.current_period_end,
        });

      if (logError) throw logError;

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-changes'] });
    },
  });
}

// Hook to pause subscription
export function usePauseSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId,
      pauseDays,
    }: { 
      subscriptionId: string;
      pauseDays: number;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const now = new Date();
      const pauseUntil = addDays(now, pauseDays);

      // Update subscription to paused
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'paused',
          paused_at: now.toISOString(),
          pause_until: pauseUntil.toISOString(),
          pause_count_this_cycle: 1, // Increment (simplified - should be atomic)
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (subError) throw subError;

      // Log the pause
      const { error: logError } = await supabase
        .from('subscription_changes')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          change_type: 'pause',
          effective_at: now.toISOString(),
          scheduled_for: pauseUntil.toISOString(),
          notes: `Pausa de ${pauseDays} dias`,
        });

      if (logError) throw logError;

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-changes'] });
    },
  });
}

// Hook to resume subscription
export function useResumeSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const now = new Date();

      // Resume subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          paused_at: null,
          pause_until: null,
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (subError) throw subError;

      // Log the resume
      const { error: logError } = await supabase
        .from('subscription_changes')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          change_type: 'resume',
          effective_at: now.toISOString(),
        });

      if (logError) throw logError;

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-changes'] });
    },
  });
}

// Hook to cancel scheduled plan change
export function useCancelScheduledChange() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .update({
          scheduled_plan_id: null,
          scheduled_change_type: null,
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (subError) throw subError;

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
  });
}

// Hook to fetch subscription changes history
export function useSubscriptionChanges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription-changes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('subscription_changes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Calculate proration for upgrade
export function calculateUpgradeProration(
  subscription: Subscription & { plan: SubscriptionPlan },
  newPlan: SubscriptionPlan
): { creditCents: number; chargeAmount: number; remainingDays: number } {
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  const periodStart = new Date(subscription.current_period_start);
  const totalDays = differenceInDays(periodEnd, periodStart);
  const remainingDays = Math.max(0, differenceInDays(periodEnd, now));
  
  const dailyRate = subscription.plan.price_cents / totalDays;
  const creditCents = Math.round(dailyRate * remainingDays);
  const chargeAmount = Math.max(0, newPlan.price_cents - creditCents);
  
  return { creditCents, chargeAmount, remainingDays };
}

// Check if user has active access
export function useHasActiveAccess() {
  const { data: subscription, isLoading } = useUserSubscription();

  if (isLoading) return { hasAccess: true, isLoading: true };

  if (!subscription) return { hasAccess: false, isLoading: false };

  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  const gracePeriodEnd = subscription.grace_period_end 
    ? new Date(subscription.grace_period_end) 
    : addDays(periodEnd, 7);

  // Paused subscription - limited access
  if (subscription.status === 'paused') {
    return { hasAccess: true, isLoading: false, isPaused: true };
  }

  // Active subscription
  if (subscription.status === 'active' && isAfter(periodEnd, now)) {
    return { hasAccess: true, isLoading: false };
  }

  // In grace period (7 days after period end)
  if (['overdue', 'cancelled'].includes(subscription.status) && isAfter(gracePeriodEnd, now)) {
    return { hasAccess: true, isLoading: false, inGracePeriod: true, gracePeriodEnd };
  }

  return { hasAccess: false, isLoading: false };
}
