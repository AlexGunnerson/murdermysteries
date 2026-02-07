-- Add game_status column to track completion states like "Case Solved"
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS game_status TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.game_sessions.game_status IS 'Tracks game completion status (e.g., "Case Solved", "Case Failed")';
