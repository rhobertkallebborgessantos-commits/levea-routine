-- Extended user_preferences with all onboarding fields
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS target_weight numeric,
ADD COLUMN IF NOT EXISTS primary_goal text,
ADD COLUMN IF NOT EXISTS dietary_restrictions text[],
ADD COLUMN IF NOT EXISTS medical_notes text,
ADD COLUMN IF NOT EXISTS previous_dieting_experience text,
ADD COLUMN IF NOT EXISTS meals_per_day integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS diagnosis_summary text,
ADD COLUMN IF NOT EXISTS weekly_focus text,
ADD COLUMN IF NOT EXISTS daily_calorie_target integer,
ADD COLUMN IF NOT EXISTS protein_target integer;

-- Foods database table (hybrid: pre-populated + user custom)
CREATE TABLE IF NOT EXISTS public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- proteins, carbs, fats, vegetables, drinks
  calories_per_100g integer,
  protein_per_100g numeric,
  carbs_per_100g numeric,
  fat_per_100g numeric,
  is_low_carb boolean DEFAULT false,
  swap_suggestion text, -- what to use instead
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Anyone can view foods (base + their custom)
CREATE POLICY "Anyone can view foods" ON public.foods
FOR SELECT USING (created_by IS NULL OR auth.uid() = created_by);

-- Users can insert their own custom foods
CREATE POLICY "Users can insert custom foods" ON public.foods
FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Users can delete their own custom foods
CREATE POLICY "Users can delete custom foods" ON public.foods
FOR DELETE USING (auth.uid() = created_by AND is_custom = true);

-- Meal logs for food tracking
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL, -- breakfast, lunch, snack, dinner
  food_id uuid REFERENCES public.foods(id),
  food_name text NOT NULL,
  portion_grams integer,
  calories integer,
  protein numeric,
  is_completed boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal logs" ON public.meal_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs" ON public.meal_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs" ON public.meal_logs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs" ON public.meal_logs
FOR DELETE USING (auth.uid() = user_id);

-- Teas database
CREATE TABLE IF NOT EXISTS public.teas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text[] NOT NULL, -- metabolism, digestion, anxiety, bloating, sleep
  description text,
  preparation text,
  best_time text, -- morning, afternoon, evening, before_bed
  safety_notes text,
  benefits text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teas" ON public.teas
FOR SELECT USING (true);

-- Tea intake tracking
CREATE TABLE IF NOT EXISTS public.tea_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tea_id uuid REFERENCES public.teas(id),
  tea_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  time_consumed timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tea_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tea logs" ON public.tea_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tea logs" ON public.tea_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tea logs" ON public.tea_logs
FOR DELETE USING (auth.uid() = user_id);

-- Weight and body tracking
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weight logs" ON public.weight_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight logs" ON public.weight_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight logs" ON public.weight_logs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight logs" ON public.weight_logs
FOR DELETE USING (auth.uid() = user_id);

-- Body measurements
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  waist numeric,
  hip numeric,
  chest numeric,
  arm numeric,
  thigh numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own measurements" ON public.body_measurements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" ON public.body_measurements
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" ON public.body_measurements
FOR UPDATE USING (auth.uid() = user_id);

-- Progress photos
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  photo_url text NOT NULL,
  photo_type text, -- front, side, back
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own photos" ON public.progress_photos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" ON public.progress_photos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON public.progress_photos
FOR DELETE USING (auth.uid() = user_id);

-- Weekly check-ins and analysis
CREATE TABLE IF NOT EXISTS public.weekly_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  adherence_score integer, -- 0-100
  weight_change numeric,
  meals_completed integer,
  teas_consumed integer,
  analysis_summary text,
  adjustments text[],
  new_calorie_target integer,
  new_focus text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checkins" ON public.weekly_checkins
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins" ON public.weekly_checkins
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily tips content
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text, -- nutrition, mindset, tea, routine
  trigger_context text, -- when to show this tip
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tips" ON public.daily_tips
FOR SELECT USING (is_active = true);

-- Update reminders table to support more categories
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS reminder_type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tone text DEFAULT 'motivational';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tea_logs_user_date ON public.tea_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, date);