# Testing Checklist for MurderMysteries.AI

## ✅ Pre-Deployment Tests (Completed)

- [x] ESLint passed with no errors
- [x] Production build successful (`npm run build`)
- [x] TypeScript compilation passed
- [x] Dev server starts without errors
- [x] Database migration syntax verified
- [x] All changes committed and pushed to main

## 🧪 Local Testing (Dev Server Running at http://localhost:3000)

### Authentication Flow
- [ ] Navigate to homepage
- [ ] Click "Sign In" button
- [ ] Authenticate with Google OAuth
- [ ] Verify redirect to homepage/dashboard after login
- [ ] Check that user profile is created in Supabase
- [ ] Sign out successfully
- [ ] Verify protected routes redirect to login when not authenticated

### Game Initialization
- [ ] Click "New Game" or "Start Case"
- [ ] Game session created in database
- [ ] Case briefing displays correctly
- [ ] Initial suspects are visible
- [ ] Initial documents are available
- [ ] Initial scenes/photos are available

### AI Chat System
- [ ] Click on a suspect to open chat
- [ ] Send a text message
- [ ] AI responds with streaming text
- [ ] Response is in character for that suspect
- [ ] Attach evidence (document/photo) to message
- [ ] Send message with attachment
- [ ] AI acknowledges the evidence
- [ ] Chat history persists

### Evidence & Unlock System
- [ ] Present correct evidence to suspect
- [ ] New content unlocks (suspects/documents/scenes)
- [ ] Unlock notification appears
- [ ] Newly unlocked content is accessible
- [ ] Progress is saved to database
- [ ] Cumulative evidence tracking works

### Documents
- [ ] View all available documents
- [ ] Open and read document content
- [ ] Documents display correctly (text, images, formatting)
- [ ] Can attach documents to chat

### Crime Scene Photos
- [ ] View crime scene photos
- [ ] Photos load correctly
- [ ] Can zoom/view full size
- [ ] Can attach photos to chat
- [ ] Gala night photos appear when unlocked

### Notes System
- [ ] Create a new note
- [ ] Edit note content
- [ ] Delete note
- [ ] Notes persist across sessions
- [ ] Notes auto-save

### Investigation Board
- [ ] Open investigation board
- [ ] Add notes to board
- [ ] Add suspect cards to board
- [ ] Create connections between items
- [ ] Drag items around board
- [ ] Board state persists
- [ ] Can export/save board state

### Theory Validation
- [ ] Click "Submit Theory"
- [ ] Form displays with required fields
- [ ] Select evidence for theory
- [ ] Submit theory
- [ ] Receive feedback (correct/incorrect)
- [ ] If correct, new content unlocks
- [ ] Theory saved to database

### Hints System
- [ ] Click "Get Hint" button
- [ ] Hint displays based on current progress
- [ ] Hint is contextually relevant
- [ ] Can dismiss hint

### Victory/Solution Flow
- [ ] Complete all requirements to solve case
- [ ] Victory screen appears
- [ ] Confession displays correctly
- [ ] Key evidence summary shown
- [ ] Statistics displayed
- [ ] Can share/export results

### Performance
- [ ] Pages load within 3 seconds
- [ ] AI responses start streaming within 2 seconds
- [ ] No console errors in browser
- [ ] No network request failures
- [ ] Images load progressively
- [ ] Navigation is smooth

## 🗄️ Database Migration Testing

### Before Migration
- [ ] Backup production database in Supabase dashboard
- [ ] Review migration SQL file
- [ ] Test migration on staging database (if available)

### Apply Migration
```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual via Supabase Dashboard
# Copy contents of supabase/migrations/010_security_performance_fixes.sql
# Paste and execute in SQL Editor
```

### After Migration
- [ ] All RLS policies still work
- [ ] Users can access their own data
- [ ] Users cannot access other users' data
- [ ] Functions work correctly (handle_new_user, handle_updated_at)
- [ ] New index improves query performance
- [ ] No errors in Supabase logs

## 🚀 Vercel Preview Deployment

### Deploy Preview
```bash
vercel
```

### Test on Preview URL
- [ ] Run through all authentication tests
- [ ] Test game flow end-to-end
- [ ] Check AI chat functionality
- [ ] Verify environment variables are set
- [ ] Check for any console errors
- [ ] Test on mobile device
- [ ] Test on different browsers

## 🌐 Production Deployment

### Before Production Deploy
- [ ] All preview tests passed
- [ ] Database migration applied successfully
- [ ] Environment variables verified in Vercel

### Deploy to Production
```bash
vercel --prod
```

### Post-Deployment Verification
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Start new game
- [ ] Chat with suspect
- [ ] Present evidence
- [ ] Submit theory
- [ ] Check Vercel function logs for errors
- [ ] Monitor error rates in Sentry (if configured)
- [ ] Check PostHog analytics (if configured)

### Production Smoke Tests (Critical Path)
1. **Sign In Flow** (2 min)
   - [ ] Sign in with Google
   - [ ] Redirects to dashboard
   
2. **Game Start** (1 min)
   - [ ] Create new game session
   - [ ] Briefing displays
   
3. **Core Gameplay** (5 min)
   - [ ] Chat with Veronica
   - [ ] View a document
   - [ ] View a scene photo
   - [ ] Present evidence to suspect
   - [ ] Receive unlock notification
   
4. **Data Persistence** (2 min)
   - [ ] Refresh page
   - [ ] Chat history still there
   - [ ] Progress maintained

## 🔍 Monitoring After Deployment

### First 24 Hours
- [ ] Check Vercel deployment logs
- [ ] Monitor function execution times
- [ ] Check for any error spikes in Sentry
- [ ] Verify API rate limits not exceeded (Gemini AI)
- [ ] Monitor database query performance in Supabase
- [ ] Check user signup/authentication success rate

### First Week
- [ ] Review user feedback
- [ ] Check completion rates
- [ ] Monitor performance metrics
- [ ] Review any error patterns
- [ ] Verify all unlock conditions working

## 🐛 Rollback Plan

If critical issues found:
```bash
# Revert to previous deployment
vercel rollback

# Or deploy specific version
vercel --prod [deployment-url]
```

## 📊 Success Metrics

- [ ] Build time < 2 minutes
- [ ] Page load time < 3 seconds
- [ ] AI response time < 2 seconds
- [ ] 0 critical errors in first hour
- [ ] Authentication success rate > 95%
- [ ] Game completion rate tracked
- [ ] User satisfaction feedback collected

---

## Current Status

**Dev Server:** ✅ Running at http://localhost:3000
**Build Status:** ✅ Passed
**Migration Ready:** ✅ Yes
**Deployment Ready:** ✅ Yes

**Last Updated:** 2026-02-15
