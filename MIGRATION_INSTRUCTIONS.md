# Database Migration Instructions

## New Migrations to Apply

Two new database migrations have been created to support the unlock mapping system:

1. **006_add_stage_tracking.sql** - Adds stage progression tracking to game sessions
2. **007_evidence_presentations.sql** - Adds evidence presentation tracking for unlock triggers

## How to Apply These Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Log into your [Supabase project dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Open and copy the contents of `supabase/migrations/006_add_stage_tracking.sql`
4. Paste into the SQL Editor and click **Run**
5. Open and copy the contents of `supabase/migrations/007_evidence_presentations.sql`
6. Paste into the SQL Editor and click **Run**

### Option 2: Supabase CLI

If you have the Supabase CLI set up and linked:

```bash
cd murdermysteries
supabase db push
```

### Option 3: Manual via psql

Get your database connection string from Supabase dashboard (Settings → Database → Connection string):

```bash
psql "your-connection-string" < supabase/migrations/006_add_stage_tracking.sql
psql "your-connection-string" < supabase/migrations/007_evidence_presentations.sql
```

## Verification

After applying the migrations, verify the changes:

```sql
-- Check that current_stage column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'game_sessions' AND column_name = 'current_stage';

-- Check that evidence_presentations table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'evidence_presentations';
```

Expected results:
- `game_sessions` should now have a `current_stage` column (type: TEXT, default: 'start')
- `evidence_presentations` table should exist

## What These Migrations Do

### Stage Tracking (006)
- Adds `current_stage` column to track player progression (start → act_i → act_ii)
- Enables conditional unlocks based on game stage
- Allows different unlock rules for different acts

### Evidence Presentations (007)
- Tracks when evidence is shown to suspects via chat attachments
- Records suspect ID, evidence IDs, and presentation timestamp
- Used to trigger specific unlocks when correct evidence combinations are shown
- Includes Row Level Security (RLS) policies to protect user data

## Next Steps

After applying these migrations, the unlock mapping system will be fully functional. The game will:
1. Track player stage progression automatically
2. Unlock content when correct evidence is presented to suspects
3. Unlock content when correct theories are validated
4. Provide notifications when new content becomes available

No further manual steps are required - the system will work automatically once the migrations are applied.

