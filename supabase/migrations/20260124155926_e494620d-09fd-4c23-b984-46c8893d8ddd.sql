-- Add structured preparation columns to teas table
ALTER TABLE public.teas 
ADD COLUMN IF NOT EXISTS preparation_ingredients text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preparation_steps text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS infusion_time text,
ADD COLUMN IF NOT EXISTS preparation_notes text;

-- Update existing teas with sample preparation data
UPDATE public.teas SET
  preparation_ingredients = ARRAY['1 colher de chá de ervas', '200ml de água filtrada'],
  preparation_steps = ARRAY['Ferva a água até 90°C', 'Adicione as ervas', 'Deixe em infusão pelo tempo indicado', 'Coe e sirva'],
  infusion_time = '5-7 minutos'
WHERE preparation_ingredients IS NULL OR preparation_ingredients = '{}';