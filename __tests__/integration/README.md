# Integration Tests

Real gameplay simulation tests using actual AI API calls to validate the complete investigation experience.

## Overview

These integration tests simulate real player investigations through Case 01, using:
- **Real AI API calls** (Gemini API)
- **Actual game data** from `public/cases/case01/story-config.json`
- **Full state management** through Supabase
- **Complete unlock system** validation

## Test Suites

### 1. Investigation Happy Path (`investigation-happy-path.test.ts`)
**Duration**: ~10-15 minutes

Simulates a successful investigation from start to solution:
1. Question Veronica (initially available)
2. Examine Grand Staircase scene
3. Review Coroner's Report
4. Submit Act I theory (unlocks inner circle)
5. Question Dr. Vale, Colin, Martin, Lydia
6. Discover blackmail papers
7. Confront Vale with evidence
8. Examine Study
9. Submit correct final solution

**Validates**:
- Content unlocks at correct stages
- Facts discovered from appropriate sources
- AI responses stay in character
- Final solution accepted

### 2. AI Conversation Quality (`ai-conversation.test.ts`)
**Duration**: ~5-10 minutes

Tests AI suspect behavior and consistency:
- Character personality consistency
- No narrative stage directions
- Secret revelation progression
- Context awareness across conversations
- Appropriate evasiveness and deflection

**Validates**:
- Each suspect maintains their unique personality
- No text like "(I slump back)" appears
- Secrets revealed appropriately when pressed
- Conversation history is maintained

## Prerequisites

### Environment Variables

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# API Base (for testing)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development Server

Integration tests require the Next.js server to be running:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:integration
```

Or for production-like testing:

```bash
# Terminal 1: Build and start production server
npm run build
npm run start

# Terminal 2: Run tests
npm run test:integration
```

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Individual Test Suites
```bash
# Happy path only (~10-15 min)
npm run test:integration:happy

# AI conversation quality only (~5-10 min)
npm run test:integration:ai
```

### Run Both Unit and Integration Tests
```bash
npm run test:all
```

## Test Configuration

### Timeouts
- Individual test timeout: **15 minutes**
- Overall suite timeout: **30 minutes**

### Execution
- Tests run **sequentially** (maxWorkers: 1) to avoid API rate limits
- Verbose logging enabled for debugging

### Cost Management
- API call counter tracks usage
- Duration metrics logged after tests
- Consider test API key with budget limits

## Understanding Test Output

### Successful Test Output
```
🔧 Setting up test session...
✅ Test session created: abc-123-def

🎬 Starting complete investigation...

📝 Step 1: Questioning Veronica...
✓ Veronica response received: I found him at the bottom of the stairs...
✓ Red wine question answered

📝 Step 2: Examining Grand Staircase scene...
✓ Wine spill pattern evidence collected

...

🎉 Investigation completed successfully!
📊 Total theories submitted: 1
📊 Total facts discovered: 15
📊 Total AI API calls: 9

📊 Integration Test Summary:
- Total AI API calls: 9
- Total duration: 142.35s
- Average per call: 15.82s
```

### Test Failures

If tests fail, check:

1. **Environment variables** - Ensure all required vars are set
2. **Server running** - Next.js dev/prod server must be active
3. **API quotas** - Check Gemini API limits
4. **Database** - Verify Supabase connection
5. **Story config** - Ensure Case 01 data is valid

## Debugging

### Enable Detailed Logging
```bash
DEBUG=* npm run test:integration
```

### Inspect Test Session
Tests create temporary users/sessions. If a test fails, check Supabase:
- `game_sessions` table for session state
- `discovered_facts` table for collected facts
- `unlocked_content` table for progression

### Common Issues

**Issue**: `Failed to create test user`
- **Fix**: Check SUPABASE_SERVICE_ROLE_KEY

**Issue**: `Chat API error: 401`
- **Fix**: Ensure auth token is valid, or check API route auth middleware

**Issue**: `Timeout: 300000ms exceeded`
- **Fix**: AI API may be slow. Increase timeout or check API status

**Issue**: `Expected fact to be discovered`
- **Fix**: Story config may have changed. Update test fixtures

## CI/CD Integration

### GitHub Actions

#### Unit Tests
- Runs on every push/PR
- Fast (<5 minutes)
- No API costs

#### Integration Tests
- Runs nightly (2 AM UTC)
- Runs on release branches
- Manual trigger available

### Manual Trigger
1. Go to Actions tab
2. Select "Integration Tests"
3. Click "Run workflow"
4. Choose test suite: `all`, `happy-path`, or `ai-conversation`

### Required Secrets
Set in GitHub repository settings:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GEMINI_API_KEY`

## Best Practices

### Writing New Tests
1. Use test fixtures from `__tests__/fixtures/`
2. Always clean up with `cleanupTestSession()`
3. Track API calls: `global.apiCallCount++`
4. Use custom assertions from `helpers/assertions.ts`

### Updating Test Data
When story config changes:
1. Update `__tests__/fixtures/questions.ts`
2. Update `__tests__/fixtures/expectedResponses.ts`
3. Run tests to verify changes

### Cost Management
- Run full suite only when necessary
- Use individual test suites during development
- Monitor API usage in test output
- Set up API budget alerts

## Troubleshooting

### Tests Pass Locally But Fail in CI
- Check GitHub Actions secrets are set
- Verify CI server has access to Supabase
- Check API rate limits (CI may trigger more calls)

### Inconsistent AI Responses
- AI responses may vary slightly each run
- Use pattern matching (`toMatch`) instead of exact matches
- Focus on key phrases and character traits

### Database State Issues
- Ensure `cleanupTestSession()` runs in `afterAll()`
- Check for orphaned test data in Supabase
- Run database cleanup script if needed

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Integration Testing Best Practices](https://kentcdodds.com/blog/write-tests)
- [Gemini API Documentation](https://ai.google.dev/docs)
