# Quick Start Guide - Database Setup

## Problems Fixed
1. ❌ Session initialization failing (UUID vs slug mismatch)
2. ❌ RLS policy violations (NextAuth vs Supabase Auth)
3. ❌ "Scene not found" errors (missing database content)

## Solution
The app needs:
- Case record in the database
- Scene, suspect, and record data seeded
- API routes updated to use service role client

## Steps to Fix

### Using Supabase Dashboard (Required)

You need to run **TWO** SQL migrations in your Supabase dashboard:

#### Step 1: Create the Case

1. Open your Supabase project dashboard at https://supabase.com/dashboard
2. Go to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Migration 004: Create Case01
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
```

5. Click **Run** (or press Cmd+Enter)
6. You should see "Success. No rows returned"

#### Step 2: Seed Case Content (Scenes, Suspects, Records)

1. In the SQL Editor, click **New Query** again
2. Copy and paste the entire contents of `/supabase/migrations/005_seed_case01_content.sql`
3. Click **Run**
4. You should see "Success. No rows returned"

**Important**: You must run migration 004 (create case) BEFORE migration 005 (seed content)

### Step 3: Hard Refresh Your Browser

After running both migrations:
- **Mac**: Cmd + Shift + R
- **Windows/Linux**: Ctrl + Shift + R

This forces the browser to reload and fetch the updated API routes.

## What Was Fixed

### 1. API Authentication (RLS Issues)
- **Problem**: Using NextAuth but API was using Supabase client with RLS
- **Fix**: All API routes now use `createServiceRoleClient()` which bypasses RLS since we verify auth through NextAuth

### 2. Case Lookup (UUID vs Slug)
- **Problem**: App passes "case01" but database expects UUID
- **Fix**: API now looks up cases by slug and converts to UUID

### 3. Database Schema (Wrong Table Names)
- **Problem**: Code queried `scenes` table, but actual table is `case_scenes`
- **Fix**: Updated API to use correct table names and query by `scene_id` not `id`

### 4. Missing Content
- **Problem**: No scenes, suspects, or records in database
- **Fix**: Migration 005 seeds all content from metadata.json

## Files Updated

- ✅ `/app/api/game/state/route.ts` - Case lookup + service role client
- ✅ `/app/api/game/actions/scenes/route.ts` - Fixed table name + query
- ✅ All other `/app/api/game/actions/*` routes - Service role client
- ✅ `/lib/store/gameStore.ts` - Session validation
- ✅ `/components/game/SceneList.tsx` - Error handling + reset button

## Verifying It Works

After running the migrations and refreshing:

1. **Check server logs** - Should see successful API calls:
```
✓ POST /api/game/state 200
✓ GET /api/game/state?caseId=case01 200
✓ POST /api/game/actions/scenes 200
```

2. **Test the app**:
   - Click "Investigate Scenes" - should show 4 available scenes
   - Click on a scene and confirm - should unlock successfully
   - Your DP should decrease by 3 points

3. **If still seeing errors**, check that:
   - Both SQL migrations ran successfully
   - You did a hard refresh (not just F5)
   - Your `.env.local` has the correct `SUPABASE_SERVICE_ROLE_KEY`

