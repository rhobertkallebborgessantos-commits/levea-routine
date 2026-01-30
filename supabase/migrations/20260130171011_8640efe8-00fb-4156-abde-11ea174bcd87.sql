-- Create admin role enum
CREATE TYPE public.admin_role AS ENUM ('master_admin', 'operational_admin');

-- Admin allowlist table (authorized admin emails)
CREATE TABLE public.admin_allowlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role admin_role NOT NULL DEFAULT 'operational_admin',
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin access logs
CREATE TABLE public.admin_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User analytics snapshots (for tracking engagement over time)
CREATE TABLE public.user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_count INTEGER DEFAULT 0,
    total_session_duration_seconds INTEGER DEFAULT 0,
    modules_accessed TEXT[] DEFAULT '{}',
    is_online BOOLEAN DEFAULT false,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

-- User risk flags (churn prediction)
CREATE TABLE public.user_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    risk_type TEXT NOT NULL,
    risk_score INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cancellation reasons tracking
CREATE TABLE public.cancellation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    reason_category TEXT,
    feedback TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin messages (for in-app communications)
CREATE TABLE public.admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_admin_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_user_id UUID REFERENCES auth.users(id),
    is_broadcast BOOLEAN DEFAULT false,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Re-engagement campaigns
CREATE TABLE public.reengagement_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_hours INTEGER NOT NULL,
    message_title TEXT NOT NULL,
    message_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System alerts for admins
CREATE TABLE public.admin_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'warning',
    title TEXT NOT NULL,
    description TEXT,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User consent tracking (LGPD/GDPR)
CREATE TABLE public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    is_granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, consent_type)
);

-- Data access requests (LGPD/GDPR)
CREATE TABLE public.data_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reengagement_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_allowlist a
    JOIN auth.users u ON u.email = a.email
    WHERE u.id = _user_id
  )
$$;

-- Function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id UUID)
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.role FROM public.admin_allowlist a
  JOIN auth.users u ON u.email = a.email
  WHERE u.id = _user_id
  LIMIT 1
$$;

-- RLS Policies for admin_allowlist
CREATE POLICY "Only master admins can view allowlist"
ON public.admin_allowlist FOR SELECT
USING (public.get_admin_role(auth.uid()) = 'master_admin');

CREATE POLICY "Only master admins can manage allowlist"
ON public.admin_allowlist FOR ALL
USING (public.get_admin_role(auth.uid()) = 'master_admin');

-- RLS Policies for admin_access_logs
CREATE POLICY "Admins can view access logs"
ON public.admin_access_logs FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert access logs"
ON public.admin_access_logs FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for user_analytics (admins can view all)
CREATE POLICY "Admins can view all user analytics"
ON public.user_analytics FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert user analytics"
ON public.user_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update user analytics"
ON public.user_analytics FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_risk_flags
CREATE POLICY "Admins can manage risk flags"
ON public.user_risk_flags FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for cancellation_logs
CREATE POLICY "Users can insert their cancellation"
ON public.cancellation_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view cancellation logs"
ON public.cancellation_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- RLS Policies for admin_messages
CREATE POLICY "Admins can manage messages"
ON public.admin_messages FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their messages"
ON public.admin_messages FOR SELECT
USING (auth.uid() = recipient_user_id OR is_broadcast = true);

CREATE POLICY "Users can mark messages as read"
ON public.admin_messages FOR UPDATE
USING (auth.uid() = recipient_user_id)
WITH CHECK (auth.uid() = recipient_user_id);

-- RLS Policies for reengagement_campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.reengagement_campaigns FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for admin_alerts
CREATE POLICY "Admins can manage alerts"
ON public.admin_alerts FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for user_consents
CREATE POLICY "Users can manage their consents"
ON public.user_consents FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view consents"
ON public.user_consents FOR SELECT
USING (public.is_admin(auth.uid()));

-- RLS Policies for data_access_requests
CREATE POLICY "Users can create their requests"
ON public.data_access_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their requests"
ON public.data_access_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests"
ON public.data_access_requests FOR ALL
USING (public.is_admin(auth.uid()));

-- Add platform and subscription fields to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON public.user_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON public.user_analytics(date);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin ON public.admin_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_recipient ON public.admin_messages(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_logs_date ON public.cancellation_logs(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_user_risk_flags_user ON public.user_risk_flags(user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_admin_allowlist_updated_at
BEFORE UPDATE ON public.admin_allowlist
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_risk_flags_updated_at
BEFORE UPDATE ON public.user_risk_flags
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reengagement_campaigns_updated_at
BEFORE UPDATE ON public.reengagement_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
BEFORE UPDATE ON public.user_consents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();