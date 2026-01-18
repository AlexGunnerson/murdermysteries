-- Evidence Presentations Tracking
-- Tracks when evidence is shown to suspects via chat attachments
-- This is used to trigger unlocks based on showing specific evidence to specific suspects

CREATE TABLE IF NOT EXISTS public.evidence_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  suspect_id TEXT NOT NULL,
  evidence_ids JSONB NOT NULL,
  presented_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.evidence_presentations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own evidence presentations
CREATE POLICY "Users can view their own evidence presentations"
  ON public.evidence_presentations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.game_sessions
    WHERE game_sessions.id = evidence_presentations.game_session_id
    AND game_sessions.user_id = auth.uid()
  ));

-- RLS Policy: Users can insert their own evidence presentations
CREATE POLICY "Users can insert their own evidence presentations"
  ON public.evidence_presentations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.game_sessions
    WHERE game_sessions.id = evidence_presentations.game_session_id
    AND game_sessions.user_id = auth.uid()
  ));

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS evidence_presentations_session_idx 
  ON public.evidence_presentations(game_session_id);

CREATE INDEX IF NOT EXISTS evidence_presentations_suspect_idx 
  ON public.evidence_presentations(suspect_id);

CREATE INDEX IF NOT EXISTS evidence_presentations_presented_at_idx 
  ON public.evidence_presentations(presented_at);

-- Add comment for documentation
COMMENT ON TABLE public.evidence_presentations IS 'Tracks evidence shown to suspects via chat attachments for unlock triggers';

