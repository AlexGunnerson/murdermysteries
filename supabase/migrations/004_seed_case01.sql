-- Seed Case 01: The Ashcombe Manor Murder
-- Insert the case01 record into the cases table

INSERT INTO public.cases (
    title,
    description,
    slug,
    price_cents,
    is_active
) VALUES (
    'The Ashcombe Manor Murder',
    'A wealthy patriarch lies dead in his study. Was it murder, or an unfortunate accident? Six suspects, countless secrets, and only you can uncover the truth.',
    'case01',
    499,
    true
) ON CONFLICT (slug) DO NOTHING;










