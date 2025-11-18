-- Game State Tables
-- Tracks player progress through mystery cases

-- Cases table (stores metadata about available cases)
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 499,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player game sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    detective_points INTEGER DEFAULT 25 NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_solved_correctly BOOLEAN DEFAULT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, case_id)
);

-- Discovered facts tracking
CREATE TABLE IF NOT EXISTS public.discovered_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    fact_key TEXT NOT NULL,
    fact_content TEXT NOT NULL,
    source TEXT NOT NULL, -- 'chat', 'record', 'scene', 'clue'
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_session_id, fact_key)
);

-- Chat history with suspects
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    suspect_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theory submissions
CREATE TABLE IF NOT EXISTS public.theory_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    theory_description TEXT NOT NULL,
    artifact_ids JSONB NOT NULL, -- Array of fact/record/scene IDs
    result TEXT NOT NULL, -- 'correct', 'partial', 'incorrect'
    feedback TEXT,
    unlocked_content JSONB, -- New suspects, locations, or evidence unlocked
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Final solution attempts
CREATE TABLE IF NOT EXISTS public.solution_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    killer TEXT NOT NULL,
    motive TEXT NOT NULL,
    key_evidence JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    narrative_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unlocked content tracking (suspects, scenes, records)
CREATE TABLE IF NOT EXISTS public.unlocked_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL, -- 'suspect', 'scene', 'record'
    content_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_session_id, content_type, content_id)
);

-- Feedback submissions
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    feedback_type TEXT, -- 'bug', 'suggestion', 'compliment', 'other'
    content TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all game state tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases (public read)
CREATE POLICY "Cases are viewable by everyone"
    ON public.cases FOR SELECT
    USING (is_active = true);

-- RLS Policies for game_sessions
CREATE POLICY "Users can view their own game sessions"
    ON public.game_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions"
    ON public.game_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for discovered_facts
CREATE POLICY "Users can view their own discovered facts"
    ON public.discovered_facts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own discovered facts"
    ON public.discovered_facts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
    ON public.chat_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

-- RLS Policies for theory_submissions
CREATE POLICY "Users can view their own theory submissions"
    ON public.theory_submissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own theory submissions"
    ON public.theory_submissions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

-- RLS Policies for solution_attempts
CREATE POLICY "Users can view their own solution attempts"
    ON public.solution_attempts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own solution attempts"
    ON public.solution_attempts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

-- RLS Policies for unlocked_content
CREATE POLICY "Users can view their own unlocked content"
    ON public.unlocked_content FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own unlocked content"
    ON public.unlocked_content FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = auth.uid()
    ));

-- RLS Policies for feedback
CREATE POLICY "Users can view their own feedback"
    ON public.feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers for all tables
CREATE TRIGGER game_sessions_updated_at
    BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS game_sessions_user_id_idx ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS game_sessions_case_id_idx ON public.game_sessions(case_id);
CREATE INDEX IF NOT EXISTS discovered_facts_session_idx ON public.discovered_facts(game_session_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON public.chat_messages(game_session_id);
CREATE INDEX IF NOT EXISTS theory_submissions_session_idx ON public.theory_submissions(game_session_id);
CREATE INDEX IF NOT EXISTS solution_attempts_session_idx ON public.solution_attempts(game_session_id);
CREATE INDEX IF NOT EXISTS unlocked_content_session_idx ON public.unlocked_content(game_session_id);
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);

