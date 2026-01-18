-- Add stage tracking to game sessions
-- This allows us to track player progression through the mystery (Start -> Act I -> Act II)

ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'start' NOT NULL;

-- Add index for efficient stage queries
CREATE INDEX IF NOT EXISTS game_sessions_stage_idx ON public.game_sessions(current_stage);

-- Add comment for documentation
COMMENT ON COLUMN public.game_sessions.current_stage IS 'Current game stage: start, act_i, or act_ii';

