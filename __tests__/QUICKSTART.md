# Integration Tests - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Server
```bash
# Terminal 1
npm run dev
```

### 4. Run Tests
```bash
# Terminal 2
npm run test:integration
```

## What Gets Tested

### Happy Path Test (~10-15 min)
Complete investigation simulation:
- ✅ Question suspects
- ✅ Examine crime scenes
- ✅ Submit theories
- ✅ Unlock content
- ✅ Solve the case

### AI Quality Test (~5-10 min)
AI behavior validation:
- ✅ Character consistency
- ✅ No stage directions
- ✅ Secret revelation
- ✅ Context awareness

## Quick Commands

```bash
# Run all integration tests
npm run test:integration

# Run only happy path (faster)
npm run test:integration:happy

# Run only AI quality tests
npm run test:integration:ai

# Run with verbose output
npm run test:integration -- --verbose
```

## Expected Output

```
🔧 Setting up test session...
✅ Test session created: abc-123

🎬 Starting complete investigation...

📝 Step 1: Questioning Veronica...
✓ Veronica response received
✓ Red wine question answered

📝 Step 2: Examining Grand Staircase scene...
✓ Wine spill pattern evidence collected

...

🎉 Investigation completed successfully!
📊 Total AI API calls: 9
📊 Total duration: 142.35s
```

## Troubleshooting

### Server not running?
```bash
# Make sure dev server is running first
npm run dev
```

### Environment variables missing?
```bash
# Check your .env.local file
cat .env.local | grep -E "SUPABASE|GEMINI"
```

### Tests timing out?
```bash
# AI API may be slow - this is normal
# Tests have 5-15 minute timeouts
```

## Next Steps

- Read [Integration Test README](__tests__/integration/README.md) for details
- Read [INTEGRATION_TESTS.md](../INTEGRATION_TESTS.md) for full documentation
- Check `.github/workflows/integration-tests.yml` for CI/CD setup

## Cost Notes

- Each test run uses ~17-22 AI API calls
- Gemini free tier: 60 requests/minute, 1,500/day
- Tests run sequentially to avoid rate limits
- Consider running individually during development
