-- Drop the existing status check constraint and add paused
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_status_check;

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'overdue'::text, 'cancelled'::text, 'expired'::text, 'paused'::text]));