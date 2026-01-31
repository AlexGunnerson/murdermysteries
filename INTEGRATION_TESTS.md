# Integration Test Suite Documentation

## Overview

The integration test suite simulates real gameplay to validate the complete investigation experience for Case 01: The Final Gala at Ashcombe Estate.

## Architecture

```
__tests__/
├── helpers/
│   ├── testSession.ts       # Session management & auth
│   ├── apiClient.ts          # API route wrappers
│   └── assertions.ts         # Custom test assertions
├── fixtures/
│   ├── questions.ts          # Investigation questions & evidence combos
│   └── expectedResponses.ts  # Character traits & validation data
└── integration/
    ├── investigation-happy-path.test.ts  # Full successful investigation
    ├── ai-conversation.test.ts           # AI behavior validation
    └── README.md                          # Test documentation
```

## Configuration Files

- `jest.integration.config.js` - Integration test configuration (5 min timeout, sequential execution)
- `jest.setup.integration.js` - Test environment setup, custom matchers, API tracking
- `.github/workflows/integration-tests.yml` - CI/CD workflow for automated testing
- `.github/workflows/unit-tests.yml` - Fast unit test workflow for all PRs

## Test Scenarios

### Scenario 1: Investigation Happy Path
**File**: `__tests__/integration/investigation-happy-path.test.ts`
**Duration**: ~10-15 minutes
**Purpose**: Validate complete investigation workflow

**Test Flow**:
1. Create test session with authenticated user
2. Question Veronica about the incident
3. Examine crime scene (Grand Staircase)
4. Review Coroner's Report
5. Submit Act I theory → Unlock inner circle
6. Question suspects: Dr. Vale, Colin, Martin, Lydia
7. Present evidence to trigger confessions
8. Examine Study for final evidence
9. Submit correct solution
10. Verify game completion

**Key Assertions**:
- Content unlocks trigger correctly
- AI stays in character (no stage directions)
- Secrets revealed at appropriate times
- Final solution accepted as correct

### Scenario 2: AI Conversation Quality
**File**: `__tests__/integration/ai-conversation.test.ts`
**Duration**: ~5-10 minutes
**Purpose**: Validate AI suspect behavior and consistency

**Test Coverage**:
- **Character Consistency**: Each suspect maintains unique personality
- **Stage Directions**: No narrative text like "(I slump back)"
- **Secret Revelation**: Evasiveness → deflection → admission progression
- **Context Awareness**: Suspects reference conversation history

**Validated Characters**:
- Veronica: Elegant, composed, protective
- Martin: Hungover, casual, irresponsible
- Colin: Stoic, professional, formal
- Lydia: Warm, maternal, fixer mentality
- Dr. Vale: Clinical, professional, grandiose

## Running Tests

### Prerequisites
```bash
# 1. Set up environment variables
cp .env.local.example .env.local
# Add: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GEMINI_API_KEY

# 2. Start Next.js server
npm run dev  # or npm run build && npm run start
```

### Execute Tests
```bash
# All integration tests
npm run test:integration

# Individual suites
npm run test:integration:happy     # Happy path only
npm run test:integration:ai        # AI quality only

# All tests (unit + integration)
npm run test:all
```

### Manual CI Trigger
1. Navigate to GitHub Actions
2. Select "Integration Tests" workflow
3. Click "Run workflow"
4. Choose test suite from dropdown

## Test Infrastructure

### Helper Modules

#### `testSession.ts`
- `createTestSession()` - Create authenticated test user and game session
- `cleanupTestSession()` - Remove test data after completion
- `getSessionState()` - Fetch current game state
- `signInTestUser()` - Get auth token for API calls

#### `apiClient.ts`
- `chatWithSuspect()` - Stream AI chat responses
- `validateTheory()` - Submit theory with artifacts
- `submitSolution()` - Submit final solution
- `examineScene()` - Examine crime scene
- `reviewRecord()` - Review document/record

#### `assertions.ts`
- `assertFactDiscovered()` - Verify fact exists in state
- `assertContentUnlocked()` - Check unlock occurred
- `assertStage()` - Validate current game stage
- `assertNoStageDirections()` - Ensure no narrative text
- `assertInCharacter()` - Validate character consistency
- `assertTheoryResult()` - Check theory validation
- `assertSolutionCorrect()` - Verify solution result

### Test Fixtures

#### `questions.ts`
Curated investigation questions for each suspect:
- `INVESTIGATION_QUESTIONS` - Questions that discover key facts
- `EVIDENCE_COMBINATIONS` - Artifact sets that trigger unlocks
- `CORRECT_SOLUTION` - Final solution for Case 01
- `CONVERSATION_FLOWS` - Expected progression patterns

#### `expectedResponses.ts`
Validation data for AI responses:
- `EXPECTED_CHARACTER_TRAITS` - Personality traits per suspect
- `DISCOVERABLE_FACTS` - Facts available from each source
- `SOLUTION_EVIDENCE` - Required evidence for solution
- `STAGE_UNLOCKS` - Content unlocked at each stage
- `FORBIDDEN_PATTERNS` - Patterns that shouldn't appear
- `UNLOCK_MESSAGES` - Expected unlock notifications

## CI/CD Integration

### GitHub Actions Workflows

#### `unit-tests.yml`
- **Trigger**: Every push/PR to main/develop
- **Duration**: <5 minutes
- **Cost**: Free (no API calls)
- **Purpose**: Fast feedback on code changes

#### `integration-tests.yml`
- **Trigger**: Nightly (2 AM UTC), release branches, manual
- **Duration**: ~20-30 minutes
- **Cost**: ~10-20 API calls per run
- **Purpose**: Validate full gameplay experience

### Required GitHub Secrets
```
SUPABASE_URL                  # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY     # Service role key for admin operations
GOOGLE_GEMINI_API_KEY         # Gemini API key for AI calls
```

## Cost Management

### API Usage Tracking
- Each AI call increments `global.apiCallCount`
- Duration tracked per call
- Summary logged after test completion

### Estimated Costs (Per Test Run)
- **Happy Path**: ~9-12 AI API calls
- **AI Conversation**: ~8-10 AI API calls
- **Total per suite**: ~17-22 calls
- **Gemini Free Tier**: 60 requests/minute, 1,500 requests/day

### Cost Reduction Strategies
1. Run integration tests nightly, not on every commit
2. Use manual trigger during development
3. Set up separate test API key with budget limits
4. Cache successful test runs when possible
5. Run individual suites instead of full suite

## Troubleshooting

### Common Issues

#### Environment Setup
```bash
# Error: Missing required environment variable
# Fix: Check .env.local has all required vars
cat .env.local | grep -E "SUPABASE_URL|SERVICE_ROLE_KEY|GEMINI_API_KEY"
```

#### Server Not Running
```bash
# Error: fetch failed (ECONNREFUSED)
# Fix: Start Next.js server first
npm run dev  # Terminal 1
npm run test:integration  # Terminal 2
```

#### API Rate Limits
```bash
# Error: 429 Too Many Requests
# Fix: Wait or use different API key
# Gemini: 60 requests/minute limit
```

#### Test Timeout
```bash
# Error: Timeout: 300000ms exceeded
# Fix: Increase timeout in test file
test('...', async () => { ... }, 900000) // 15 minutes
```

### Debugging Tests

#### Enable Verbose Logging
```bash
DEBUG=* npm run test:integration -- --verbose
```

#### Inspect Test Data
After test failure, check Supabase:
```sql
-- View test sessions
SELECT * FROM game_sessions WHERE user_id LIKE '%test%' ORDER BY created_at DESC;

-- View discovered facts
SELECT * FROM discovered_facts WHERE game_session_id = 'session-id';

-- View unlocked content
SELECT * FROM unlocked_content WHERE game_session_id = 'session-id';
```

#### Manual Cleanup
```bash
# If test cleanup fails, manually delete test data
# In Supabase SQL Editor:
DELETE FROM game_sessions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@murdermysteries.test'
);
```

## Best Practices

### Writing New Integration Tests
1. **Use fixtures** - Don't hardcode questions/responses
2. **Clean up** - Always use `afterAll` with `cleanupTestSession`
3. **Track API calls** - Increment `global.apiCallCount++`
4. **Test in isolation** - Each test should be independent
5. **Use assertions** - Prefer custom assertions from helpers
6. **Pattern matching** - Use regex for AI responses, not exact matches

### Updating Tests After Story Changes
1. Read story config changes in `public/cases/case01/story-config.json`
2. Update fixtures: `questions.ts`, `expectedResponses.ts`
3. Update test assertions if fact IDs changed
4. Run tests to verify: `npm run test:integration`
5. Update documentation if flow changed

### Performance Optimization
1. Run only relevant tests during development
2. Use `test.skip()` to temporarily disable long tests
3. Group related API calls in single test
4. Cache responses when testing parsing/validation

## Maintenance

### Regular Tasks
- **Weekly**: Review test results, update fixtures if needed
- **Monthly**: Check API costs, optimize if necessary
- **After story changes**: Update fixtures and assertions
- **Before releases**: Run full integration suite

### Monitoring
- CI/CD dashboard for test success rate
- API usage tracking in test summaries
- Duration trends to catch performance regressions
- Alert on test failures via GitHub notifications

## Future Enhancements

### Potential Additions
1. **More scenarios**: Edge cases, incorrect paths, thorough investigation
2. **Visual regression**: Screenshot comparison for UI consistency
3. **Performance tests**: API response time validation
4. **Load tests**: Concurrent player simulation
5. **A/B testing**: Different prompt variations
6. **Analytics**: Player behavior pattern validation

### Infrastructure Improvements
1. Test result dashboard
2. Cost tracking dashboard
3. Automated fixture generation
4. AI response quality scoring
5. Flaky test detection and reporting

## Resources

- [Integration Test README](__tests__/integration/README.md) - Detailed test documentation
- [Jest Integration Config](jest.integration.config.js) - Test configuration
- [Story Service](lib/services/storyService.ts) - Game logic service
- [Unlock Service](lib/services/unlockService.ts) - Content unlock system
- [Story Config](public/cases/case01/story-config.json) - Case 01 data

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review test output logs
3. Inspect Supabase database state
4. Check GitHub Actions logs for CI failures
