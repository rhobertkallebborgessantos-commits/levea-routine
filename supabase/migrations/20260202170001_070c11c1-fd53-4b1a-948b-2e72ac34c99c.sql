-- Add pause fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pause_until timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pause_count_this_cycle integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_plan_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS scheduled_change_type text DEFAULT NULL;

-- Add foreign key for scheduled_plan_id
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_scheduled_plan_id_fkey 
FOREIGN KEY (scheduled_plan_id) REFERENCES public.subscription_plans(id);

-- Create subscription_changes table to log all changes
CREATE TABLE public.subscription_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id),
  change_type text NOT NULL, -- 'upgrade', 'downgrade', 'pause', 'resume', 'cancel', 'reactivate'
  from_plan_id uuid REFERENCES public.subscription_plans(id),
  to_plan_id uuid REFERENCES public.subscription_plans(id),
  amount_charged_cents integer DEFAULT 0,
  amount_credited_cents integer DEFAULT 0,
  effective_at timestamp with time zone NOT NULL DEFAULT now(),
  scheduled_for timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid -- admin who made the change, null if self-service
);

-- Enable RLS
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_changes
CREATE POLICY "Users can view their own subscription changes"
ON public.subscription_changes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription changes"
ON public.subscription_changes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscription changes"
ON public.subscription_changes
FOR ALL
USING (is_admin(auth.uid()));

-- Create subscription_settings table for admin controls
CREATE TABLE public.subscription_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.subscription_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_settings
CREATE POLICY "Anyone can view subscription settings"
ON public.subscription_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage subscription settings"
ON public.subscription_settings
FOR ALL
USING (is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.subscription_settings (setting_key, setting_value, description) VALUES
('allow_downgrades', '{"enabled": true}'::jsonb, 'Allow users to downgrade plans'),
('allow_pauses', '{"enabled": true, "max_days": 30, "max_per_cycle": 1}'::jsonb, 'Allow users to pause subscriptions'),
('proration_enabled', '{"enabled": true}'::jsonb, 'Enable prorated billing for upgrades');

-- Create index for faster queries
CREATE INDEX idx_subscription_changes_user_id ON public.subscription_changes(user_id);
CREATE INDEX idx_subscription_changes_subscription_id ON public.subscription_changes(subscription_id);
CREATE INDEX idx_subscription_changes_change_type ON public.subscription_changes(change_type);
CREATE INDEX idx_subscription_changes_created_at ON public.subscription_changes(created_at DESC);