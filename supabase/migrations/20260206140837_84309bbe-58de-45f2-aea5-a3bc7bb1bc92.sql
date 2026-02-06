-- Create achievements table (all possible badges)
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'general',
  tier TEXT NOT NULL DEFAULT 'bronze',
  points INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table (unlocked achievements per user)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Add total_points to profiles for gamification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (public read)
CREATE POLICY "Anyone can view active achievements" 
ON public.achievements 
FOR SELECT 
USING (is_active = true);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (slug, name, description, icon, category, tier, points, requirement_type, requirement_value) VALUES
-- Streak achievements
('streak_7', 'Semana Completa', 'Mantenha uma sequência de 7 dias', 'flame', 'streak', 'bronze', 50, 'streak_days', 7),
('streak_30', 'Mês Dedicado', 'Mantenha uma sequência de 30 dias', 'flame', 'streak', 'silver', 200, 'streak_days', 30),
('streak_100', 'Centenário', 'Mantenha uma sequência de 100 dias', 'flame', 'streak', 'gold', 500, 'streak_days', 100),

-- Meals achievements
('first_meal', 'Primeira Refeição', 'Registre sua primeira refeição', 'utensils', 'meals', 'bronze', 10, 'meals_logged', 1),
('meals_10', 'Alimentação Consciente', 'Registre 10 refeições', 'utensils', 'meals', 'bronze', 30, 'meals_logged', 10),
('meals_50', 'Chef em Formação', 'Registre 50 refeições', 'utensils', 'meals', 'silver', 100, 'meals_logged', 50),
('meals_100', 'Mestre da Nutrição', 'Registre 100 refeições', 'utensils', 'meals', 'gold', 250, 'meals_logged', 100),

-- Tea achievements
('first_tea', 'Primeiro Chá', 'Registre seu primeiro chá', 'coffee', 'tea', 'bronze', 10, 'teas_logged', 1),
('teas_10', 'Apreciador de Chás', 'Registre 10 chás', 'coffee', 'tea', 'bronze', 30, 'teas_logged', 10),
('teas_50', 'Chá Sommelier', 'Registre 50 chás', 'coffee', 'tea', 'silver', 100, 'teas_logged', 50),

-- Weight achievements
('first_weight', 'Na Balança', 'Registre seu primeiro peso', 'scale', 'weight', 'bronze', 10, 'weight_logged', 1),
('weight_10', 'Monitoramento Ativo', 'Registre 10 pesagens', 'scale', 'weight', 'silver', 50, 'weight_logged', 10),
('goal_reached', 'Meta Alcançada', 'Atinja seu peso objetivo', 'target', 'weight', 'gold', 500, 'goal_reached', 1),

-- Checkin achievements
('first_checkin', 'Primeiro Check-in', 'Complete seu primeiro check-in semanal', 'clipboard-check', 'checkin', 'bronze', 20, 'checkins_completed', 1),
('checkins_4', 'Mês de Reflexão', 'Complete 4 check-ins semanais', 'clipboard-check', 'checkin', 'silver', 100, 'checkins_completed', 4),

-- Photo achievements
('first_photo', 'Primeiro Registro Visual', 'Envie sua primeira foto de progresso', 'camera', 'photos', 'bronze', 20, 'photos_uploaded', 1),
('photos_10', 'Documentando a Jornada', 'Envie 10 fotos de progresso', 'camera', 'photos', 'silver', 100, 'photos_uploaded', 10);

-- Function to calculate user level based on points
CREATE OR REPLACE FUNCTION calculate_user_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(points / 50.0)) + 1)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update points and level when achievement is unlocked
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
DECLARE
  achievement_points INTEGER;
BEGIN
  -- Get achievement points
  SELECT points INTO achievement_points 
  FROM achievements 
  WHERE id = NEW.achievement_id;
  
  -- Update user profile
  UPDATE profiles 
  SET 
    total_points = COALESCE(total_points, 0) + achievement_points,
    level = calculate_user_level(COALESCE(total_points, 0) + achievement_points)
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_achievement_unlocked
AFTER INSERT ON user_achievements
FOR EACH ROW
EXECUTE FUNCTION update_user_points();