-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  interval text NOT NULL CHECK (interval IN ('monthly', 'yearly')),
  interval_count integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'overdue', 'cancelled', 'expired')),
  payment_method text CHECK (payment_method IN ('pix', 'credit_card')),
  current_period_start timestamp with time zone NOT NULL DEFAULT now(),
  current_period_end timestamp with time zone NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancelled_at timestamp with time zone,
  grace_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'expired')),
  payment_method text CHECK (payment_method IN ('pix', 'credit_card')),
  pix_code text,
  pix_qr_code_url text,
  pix_expires_at timestamp with time zone,
  card_last_four text,
  card_brand text,
  failure_reason text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  pdf_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies (public read, admin write)
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON public.subscription_plans FOR ALL
USING (is_admin(auth.uid()));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (is_admin(auth.uid()));

-- Payments policies
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (is_admin(auth.uid()));

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, price_cents, interval, features) VALUES
('Mensal', 'monthly', 'Acesso completo ao LEVEA por 1 mês', 4990, 'monthly', '["Acesso a todos os recursos", "Acompanhamento personalizado", "Chás recomendados diários", "Rotinas adaptativas", "Suporte por chat"]'::jsonb),
('Anual', 'yearly', 'Acesso completo ao LEVEA por 1 ano (2 meses grátis)', 49900, 'yearly', '["Tudo do plano mensal", "Economia de 2 meses", "Acesso prioritário a novidades", "Relatórios avançados de progresso"]'::jsonb);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('invoice_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TRIGGER set_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_invoice_number();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_payments_timestamp
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_plans_timestamp
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_subscription_updated_at();