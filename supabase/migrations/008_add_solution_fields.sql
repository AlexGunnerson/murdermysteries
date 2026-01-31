-- Add solution fields to cases table for validation
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS correct_killer TEXT,
ADD COLUMN IF NOT EXISTS correct_motive TEXT,
ADD COLUMN IF NOT EXISTS correct_evidence TEXT[],
ADD COLUMN IF NOT EXISTS solution_description TEXT;

-- Update Case 01 with correct solution data
UPDATE public.cases
SET 
    correct_killer = 'Colin Dorsey',
    correct_motive = 'Colin attempted to sell Dorothy Ashcombe''s ring (the most prized family heirloom) on the black market. Reginald discovered this betrayal and kept proof in his safe. Colin went to the study during the gala to swap his blackmail page for a less damaging fake. Reginald confronted him, they struggled, and Reginald fell and died.',
    correct_evidence = ARRAY[
        'fact_white_gloves_safe',
        'fact_study_rug_displaced', 
        'fact_tie_clip_study',
        'fact_colin_swapped_papers'
    ],
    solution_description = 'Colin Dorsey killed Reginald Ashcombe accidentally during a confrontation in the study. Colin had attempted to sell Dorothy Ashcombe''s ring on the black market, and when Reginald kept proof of this betrayal, Colin entered the study during the gala to swap his blackmail page. Reginald caught him, they fought, and Reginald fell, striking his head fatally. Colin then staged the scene at the grand staircase to make it look like an accident, placing a wine glass nearby. He also removed Dr. Vale''s blackmail page to create a false lead.'
WHERE slug = 'case01';
