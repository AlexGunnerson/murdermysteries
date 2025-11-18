# Database Migrations

This directory contains SQL migration files for the MurderMysteries.AI database schema.

## Migrations Overview

### 001_initial_schema.sql
- Creates the `profiles` table to extend Supabase auth.users
- Sets up Row Level Security (RLS) policies for user data
- Implements triggers for automatic profile creation on user signup
- Adds updated_at timestamp automation

### 002_game_state_tables.sql
- Creates tables for tracking game progress:
  - `cases`: Available mystery cases
  - `game_sessions`: Player game instances
  - `discovered_facts`: Facts found during investigation
  - `chat_messages`: AI suspect conversation history
  - `theory_submissions`: Theory validation attempts
  - `solution_attempts`: Final solution submissions
  - `unlocked_content`: Dynamic content unlocking
  - `feedback`: Player feedback submissions
- Implements RLS policies to ensure data privacy
- Adds indexes for query optimization

### 003_case_content_tables.sql
- Creates tables for case content:
  - `case_suspects`: Suspect/character definitions
  - `case_scenes`: Investigation locations
  - `case_records`: Documents and official records
  - `case_facts`: Fact tree and relationships
  - `case_theory_rules`: Theory validation logic
  - `case_solutions`: Correct solution definitions
  - `case_clues`: Hint system configuration
- Restricts sensitive data (solutions, theory rules) to service role only
- Supports modular case design

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for Development)

1. Log into your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste each migration file in order (001, 002, 003)
4. Click **Run** for each migration

### Option 2: Supabase CLI (Recommended for Production)

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Apply all migrations:
   ```bash
   supabase db push
   ```

### Option 3: Manual Application via psql

1. Get your database connection string from Supabase dashboard:
   - Settings → Database → Connection string (URI)

2. Apply each migration:
   ```bash
   psql "your-connection-string" < supabase/migrations/001_initial_schema.sql
   psql "your-connection-string" < supabase/migrations/002_game_state_tables.sql
   psql "your-connection-string" < supabase/migrations/003_case_content_tables.sql
   ```

## Verification

After applying migrations, verify the tables exist:

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- profiles
- cases
- game_sessions
- discovered_facts
- chat_messages
- theory_submissions
- solution_attempts
- unlocked_content
- feedback
- case_suspects
- case_scenes
- case_records
- case_facts
- case_theory_rules
- case_solutions
- case_clues

## Important Notes

- **Do not modify** these migration files after they've been applied
- Create new migration files for schema changes (004_*.sql, 005_*.sql, etc.)
- Always test migrations in a development database first
- The migrations are idempotent (can be run multiple times safely)
- RLS policies are crucial for data security - don't disable them

## Rollback

If you need to undo a migration:

```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS public.case_clues CASCADE;
DROP TABLE IF EXISTS public.case_solutions CASCADE;
DROP TABLE IF EXISTS public.case_theory_rules CASCADE;
DROP TABLE IF EXISTS public.case_facts CASCADE;
DROP TABLE IF EXISTS public.case_records CASCADE;
DROP TABLE IF EXISTS public.case_scenes CASCADE;
DROP TABLE IF EXISTS public.case_suspects CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.unlocked_content CASCADE;
DROP TABLE IF EXISTS public.solution_attempts CASCADE;
DROP TABLE IF EXISTS public.theory_submissions CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.discovered_facts CASCADE;
DROP TABLE IF EXISTS public.game_sessions CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

## Next Steps

After applying migrations:
1. Verify RLS policies are working correctly
2. Test CRUD operations via the Supabase client
3. Populate the `cases` table with your first mystery case data
4. Begin implementing the API routes that interact with these tables

