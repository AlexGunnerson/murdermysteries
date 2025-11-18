-- Case Content Tables
-- Stores the mystery content, suspects, locations, evidence, and solution logic

-- Suspects/Key people in each case
CREATE TABLE IF NOT EXISTS public.case_suspects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    suspect_id TEXT NOT NULL, -- unique identifier like 'john_smith'
    name TEXT NOT NULL,
    role TEXT, -- 'victim', 'suspect', 'witness', etc.
    bio TEXT,
    portrait_url TEXT,
    initial_availability BOOLEAN DEFAULT TRUE, -- Available from the start?
    unlock_conditions JSONB, -- Conditions to unlock this suspect
    ai_prompt_base TEXT, -- Base prompt for AI interactions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, suspect_id)
);

-- Locations/Scenes in each case
CREATE TABLE IF NOT EXISTS public.case_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    scene_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    initial_availability BOOLEAN DEFAULT TRUE,
    unlock_conditions JSONB,
    evidence_items JSONB, -- Array of evidence found at this scene
    dp_cost INTEGER DEFAULT 3, -- Cost to investigate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, scene_id)
);

-- Records/Documents in each case
CREATE TABLE IF NOT EXISTS public.case_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    record_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT,
    document_url TEXT,
    initial_availability BOOLEAN DEFAULT TRUE,
    unlock_conditions JSONB,
    dp_cost INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, record_id)
);

-- Facts tree (defines all discoverable facts and their relationships)
CREATE TABLE IF NOT EXISTS public.case_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    fact_key TEXT NOT NULL,
    fact_content TEXT NOT NULL,
    fact_category TEXT, -- 'timeline', 'relationship', 'evidence', 'motive', etc.
    source_type TEXT, -- 'suspect', 'scene', 'record'
    source_id TEXT, -- ID of the source (suspect_id, scene_id, record_id)
    prerequisite_facts JSONB, -- Array of fact_keys that must be discovered first
    importance_level INTEGER DEFAULT 1, -- 1=critical, 2=important, 3=optional
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, fact_key)
);

-- Theory validation rules
CREATE TABLE IF NOT EXISTS public.case_theory_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    theory_key TEXT NOT NULL, -- Unique identifier for this theory
    required_facts JSONB NOT NULL, -- Array of fact_keys required
    result TEXT NOT NULL, -- 'correct', 'partial', 'incorrect'
    feedback TEXT,
    unlocks JSONB, -- What gets unlocked: {suspects: [], scenes: [], records: []}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, theory_key)
);

-- Solution definition
CREATE TABLE IF NOT EXISTS public.case_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    killer TEXT NOT NULL,
    motive TEXT NOT NULL,
    required_evidence JSONB NOT NULL, -- Array of fact_keys or evidence IDs
    narrative_correct TEXT, -- Story shown when correct
    narrative_incorrect TEXT, -- Story shown when incorrect
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id)
);

-- Clue hints configuration
CREATE TABLE IF NOT EXISTS public.case_clues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    clue_context JSONB NOT NULL, -- Conditions when this clue is relevant
    clue_text TEXT NOT NULL,
    priority INTEGER DEFAULT 1, -- Higher priority clues shown first
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all case content tables
ALTER TABLE public.case_suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_theory_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_clues ENABLE ROW LEVEL SECURITY;

-- RLS Policies (case content is publicly readable)
CREATE POLICY "Case suspects are viewable by everyone"
    ON public.case_suspects FOR SELECT
    USING (true);

CREATE POLICY "Case scenes are viewable by everyone"
    ON public.case_scenes FOR SELECT
    USING (true);

CREATE POLICY "Case records are viewable by everyone"
    ON public.case_records FOR SELECT
    USING (true);

CREATE POLICY "Case facts are viewable by everyone"
    ON public.case_facts FOR SELECT
    USING (true);

CREATE POLICY "Case theory rules are viewable by service role only"
    ON public.case_theory_rules FOR SELECT
    USING (false); -- Only service role can access

CREATE POLICY "Case solutions are viewable by service role only"
    ON public.case_solutions FOR SELECT
    USING (false); -- Only service role can access

CREATE POLICY "Case clues are viewable by service role only"
    ON public.case_clues FOR SELECT
    USING (false); -- Only service role can access

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS case_suspects_case_id_idx ON public.case_suspects(case_id);
CREATE INDEX IF NOT EXISTS case_scenes_case_id_idx ON public.case_scenes(case_id);
CREATE INDEX IF NOT EXISTS case_records_case_id_idx ON public.case_records(case_id);
CREATE INDEX IF NOT EXISTS case_facts_case_id_idx ON public.case_facts(case_id);
CREATE INDEX IF NOT EXISTS case_facts_source_idx ON public.case_facts(case_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS case_theory_rules_case_id_idx ON public.case_theory_rules(case_id);
CREATE INDEX IF NOT EXISTS case_solutions_case_id_idx ON public.case_solutions(case_id);
CREATE INDEX IF NOT EXISTS case_clues_case_id_idx ON public.case_clues(case_id);

