import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

// Dashboard KPIs
export function useAdminDashboardKPIs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-dashboard-kpis'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
      const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active users (last 7 days)
      const { count: activeUsers7d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', weekAgo);

      // Users online now (last 5 minutes approximation via analytics)
      const { count: onlineNow } = await supabase
        .from('user_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('is_online', true);

      // Inactive users by period
      const { count: inactive7d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('last_login_at', weekAgo)
        .gte('last_login_at', twoWeeksAgo);

      const { count: inactive14d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('last_login_at', twoWeeksAgo)
        .gte('last_login_at', monthAgo);

      const { count: inactive30d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('last_login_at', monthAgo);

      // Cancellations
      const { count: cancellationsToday } = await supabase
        .from('cancellation_logs')
        .select('*', { count: 'exact', head: true })
        .gte('cancelled_at', today);

      const { count: cancellationsWeek } = await supabase
        .from('cancellation_logs')
        .select('*', { count: 'exact', head: true })
        .gte('cancelled_at', weekStart);

      const { count: cancellationsMonth } = await supabase
        .from('cancellation_logs')
        .select('*', { count: 'exact', head: true })
        .gte('cancelled_at', monthStart);

      // Retention calculations
      const usersCreatedWeekAgo = await supabase
        .from('profiles')
        .select('user_id', { count: 'exact' })
        .lte('created_at', weekAgo);

      const usersActiveAfter7Days = await supabase
        .from('profiles')
        .select('user_id', { count: 'exact' })
        .lte('created_at', weekAgo)
        .gte('last_login_at', weekAgo);

      const retention7d = usersCreatedWeekAgo.count 
        ? Math.round(((usersActiveAfter7Days.count || 0) / usersCreatedWeekAgo.count) * 100)
        : 0;

      return {
        totalUsers: totalUsers || 0,
        activeUsers7d: activeUsers7d || 0,
        onlineNow: onlineNow || 0,
        inactive7d: inactive7d || 0,
        inactive14d: inactive14d || 0,
        inactive30d: inactive30d || 0,
        cancellationsToday: cancellationsToday || 0,
        cancellationsWeek: cancellationsWeek || 0,
        cancellationsMonth: cancellationsMonth || 0,
        retention7d,
        retention14d: 0, // Would need similar calculation
        retention30d: 0,
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

// All users for user management
export function useAdminUsers(filters?: {
  status?: string;
  inactiveDays?: number;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_preferences (
            goal,
            current_weight,
            target_weight
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status === 'cancelled') {
        query = query.not('cancelled_at', 'is', null);
      } else if (filters?.status === 'active') {
        query = query.is('cancelled_at', null);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%`);
      }

      if (filters?.inactiveDays) {
        const cutoff = format(subDays(new Date(), filters.inactiveDays), 'yyyy-MM-dd');
        query = query.lt('last_login_at', cutoff);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Churn analytics
export function useChurnAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-churn-analytics'],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      // Get cancellation logs with reasons
      const { data: cancellations } = await supabase
        .from('cancellation_logs')
        .select('*')
        .gte('cancelled_at', thirtyDaysAgo)
        .order('cancelled_at', { ascending: false });

      // Group by reason
      const byReason = (cancellations || []).reduce((acc, c) => {
        const reason = c.reason_category || 'other';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by day
      const byDay = (cancellations || []).reduce((acc, c) => {
        const day = format(new Date(c.cancelled_at), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalCancellations: cancellations?.length || 0,
        byReason,
        byDay,
        cancellations: cancellations || [],
      };
    },
    enabled: !!user,
  });
}

// Engagement analytics
export function useEngagementAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-engagement-analytics'],
    queryFn: async () => {
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      const { data: analytics } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('date', weekAgo);

      // Calculate averages
      const totalSessions = analytics?.reduce((sum, a) => sum + (a.session_count || 0), 0) || 0;
      const totalDuration = analytics?.reduce((sum, a) => sum + (a.total_session_duration_seconds || 0), 0) || 0;
      const uniqueUsers = new Set(analytics?.map(a => a.user_id)).size;

      // Module access frequency
      const moduleAccess: Record<string, number> = {};
      analytics?.forEach(a => {
        (a.modules_accessed || []).forEach((m: string) => {
          moduleAccess[m] = (moduleAccess[m] || 0) + 1;
        });
      });

      return {
        avgSessionsPerUser: uniqueUsers ? Math.round(totalSessions / uniqueUsers) : 0,
        avgSessionDuration: totalSessions ? Math.round(totalDuration / totalSessions / 60) : 0, // in minutes
        totalSessions,
        uniqueActiveUsers: uniqueUsers,
        moduleAccess,
      };
    },
    enabled: !!user,
  });
}

// Risk flags
export function useRiskFlags() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-risk-flags'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_risk_flags')
        .select(`
          *,
          profiles:user_id (
            full_name,
            last_login_at
          )
        `)
        .eq('is_resolved', false)
        .order('risk_score', { ascending: false });

      return data || [];
    },
    enabled: !!user,
  });
}

// Admin alerts
export function useAdminAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return data || [];
    },
    enabled: !!user,
  });
}

// Acknowledge alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    },
  });
}

// Send message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      recipientId?: string;
      isBroadcast?: boolean;
      title: string;
      content: string;
      messageType?: string;
    }) => {
      const { error } = await supabase.from('admin_messages').insert({
        sender_admin_id: user?.id,
        recipient_user_id: data.recipientId || null,
        is_broadcast: data.isBroadcast || false,
        title: data.title,
        content: data.content,
        message_type: data.messageType || 'info',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
  });
}

// Admin messages history
export function useAdminMessages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      return data || [];
    },
    enabled: !!user,
  });
}

// Content management - motivational messages
export function useMotivationalMessagesAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-motivational-messages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('motivational_messages')
        .select('*')
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!user,
  });
}

// Daily tips admin
export function useDailyTipsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-daily-tips'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_tips')
        .select('*')
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!user,
  });
}

// Re-engagement campaigns
export function useReengagementCampaigns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-reengagement-campaigns'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reengagement_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!user,
  });
}

// LGPD/GDPR - Data access requests
export function useDataAccessRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-data-access-requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('data_access_requests')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!user,
  });
}

// Admin allowlist
export function useAdminAllowlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-allowlist'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_allowlist')
        .select('*')
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!user,
  });
}

// Add admin to allowlist
export function useAddAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { email: string; role: 'master_admin' | 'operational_admin' }) => {
      const { error } = await supabase.from('admin_allowlist').insert({
        email: data.email,
        role: data.role,
        added_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-allowlist'] });
    },
  });
}

// Remove admin from allowlist
export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('admin_allowlist')
        .delete()
        .eq('id', adminId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-allowlist'] });
    },
  });
}

// Access logs
export function useAccessLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-access-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      return data || [];
    },
    enabled: !!user,
  });
}
