-- Security and Performance Fixes
-- Addresses Supabase linter warnings and suggestions

-- ============================================================================
-- SECURITY FIXES
-- ============================================================================

-- Fix 1: Add search_path to handle_new_user function to prevent search path attacks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 2: Add search_path to handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE FIXES - RLS POLICY OPTIMIZATION
-- ============================================================================
-- Replace auth.uid() with (SELECT auth.uid()) to prevent re-evaluation per row

-- Profiles table policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING ((SELECT auth.uid()) = id);

-- Game sessions policies
DROP POLICY IF EXISTS "Users can view their own game sessions" ON public.game_sessions;
CREATE POLICY "Users can view their own game sessions"
    ON public.game_sessions FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own game sessions" ON public.game_sessions;
CREATE POLICY "Users can create their own game sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own game sessions" ON public.game_sessions;
CREATE POLICY "Users can update their own game sessions"
    ON public.game_sessions FOR UPDATE
    USING ((SELECT auth.uid()) = user_id);

-- Discovered facts policies
DROP POLICY IF EXISTS "Users can view their own discovered facts" ON public.discovered_facts;
CREATE POLICY "Users can view their own discovered facts"
    ON public.discovered_facts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Users can insert their own discovered facts" ON public.discovered_facts;
CREATE POLICY "Users can insert their own discovered facts"
    ON public.discovered_facts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages"
    ON public.chat_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert their own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

-- Theory submissions policies
DROP POLICY IF EXISTS "Users can view their own theory submissions" ON public.theory_submissions;
CREATE POLICY "Users can view their own theory submissions"
    ON public.theory_submissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Users can insert their own theory submissions" ON public.theory_submissions;
CREATE POLICY "Users can insert their own theory submissions"
    ON public.theory_submissions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

-- Solution attempts policies
DROP POLICY IF EXISTS "Users can view their own solution attempts" ON public.solution_attempts;
CREATE POLICY "Users can view their own solution attempts"
    ON public.solution_attempts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Users can insert their own solution attempts" ON public.solution_attempts;
CREATE POLICY "Users can insert their own solution attempts"
    ON public.solution_attempts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

-- Unlocked content policies
DROP POLICY IF EXISTS "Users can view their own unlocked content" ON public.unlocked_content;
CREATE POLICY "Users can view their own unlocked content"
    ON public.unlocked_content FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Users can insert their own unlocked content" ON public.unlocked_content;
CREATE POLICY "Users can insert their own unlocked content"
    ON public.unlocked_content FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

-- Feedback policies
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback"
    ON public.feedback FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback"
    ON public.feedback FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Evidence presentations policies
DROP POLICY IF EXISTS "Users can view their own evidence presentations" ON public.evidence_presentations;
CREATE POLICY "Users can view their own evidence presentations"
    ON public.evidence_presentations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Users can insert their own evidence presentations" ON public.evidence_presentations;
CREATE POLICY "Users can insert their own evidence presentations"
    ON public.evidence_presentations FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = game_session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    ));

-- ============================================================================
-- PERFORMANCE FIXES - MISSING INDEX
-- ============================================================================

-- Add missing index on feedback.case_id foreign key
CREATE INDEX IF NOT EXISTS feedback_case_id_idx ON public.feedback(case_id);
