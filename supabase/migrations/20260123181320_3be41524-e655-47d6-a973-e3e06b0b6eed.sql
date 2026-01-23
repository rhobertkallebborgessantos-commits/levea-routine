-- Add goal column to motivational_messages table
ALTER TABLE public.motivational_messages 
ADD COLUMN goal public.user_goal;

-- Create index for faster queries by goal
CREATE INDEX idx_motivational_messages_goal ON public.motivational_messages(goal);