-- Add intensity classification to teas (mild = daily, moderate = regular, occasional = limited use)
ALTER TABLE public.teas ADD COLUMN IF NOT EXISTS intensity TEXT DEFAULT 'mild';

-- Add time of day recommendation (morning, afternoon, evening, any)
ALTER TABLE public.teas ADD COLUMN IF NOT EXISTS time_of_day TEXT[] DEFAULT '{}';

-- Add alternative teas suggestion
ALTER TABLE public.teas ADD COLUMN IF NOT EXISTS alternatives TEXT[];

-- Add a simple one-liner benefit for quick display
ALTER TABLE public.teas ADD COLUMN IF NOT EXISTS main_benefit TEXT;

-- Update existing teas with the new classification
UPDATE public.teas SET 
  intensity = CASE 
    WHEN name IN ('Chá de Cavalinha', 'Chá de Carqueja', 'Chá de Mulungu') THEN 'occasional'
    WHEN name IN ('Chá de Gengibre', 'Chá Verde', 'Chá de Hibisco') THEN 'moderate'
    ELSE 'mild'
  END,
  time_of_day = CASE 
    WHEN best_time = 'morning' THEN ARRAY['morning']
    WHEN best_time = 'afternoon' THEN ARRAY['afternoon']
    WHEN best_time IN ('evening', 'before_bed') THEN ARRAY['evening']
    ELSE ARRAY['any']
  END,
  main_benefit = CASE
    WHEN 'metabolism' = ANY(purpose) THEN 'Acelera o metabolismo'
    WHEN 'digestion' = ANY(purpose) THEN 'Melhora a digestão'
    WHEN 'bloating' = ANY(purpose) THEN 'Reduz inchaço'
    WHEN 'anxiety' = ANY(purpose) THEN 'Acalma e relaxa'
    WHEN 'sleep' = ANY(purpose) THEN 'Melhora o sono'
    ELSE 'Bem-estar geral'
  END;