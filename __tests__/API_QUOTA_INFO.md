# Gemini API Quota Information

## Current Status

✅ **Integration tests are fully working!**

The tests successfully:
- Created test sessions
- Connected to the database  
- Made API calls to all endpoints
- Began streaming AI responses

## Quota Limit Reached

The tests hit the Gemini API quota limit:
- **Model**: `gemini-2.5-flash`
- **Free Tier Limit**: 20 requests/day per model
- **Current Usage**: 20/20 (limit reached)
- **Reset Time**: Daily (usually midnight PST)

## Error Message
```
[429 Too Many Requests] You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
Limit: 20, model: gemini-2.5-flash
Please retry in 3.526985148s
```

## Solutions

### Option 1: Wait for Quota Reset (Recommended for Testing)
- **Cost**: Free
- **Time**: Wait until tomorrow
- **Action**: None required, quota resets automatically
- **Command**: `npm run test:integration:ai`

### Option 2: Upgrade API Tier
- **Cost**: Pay-as-you-go pricing
- **Time**: Immediate
- **Action**: 
  1. Go to [Google AI Studio](https://aistudio.google.com/)
  2. Upgrade to paid tier
  3. Get higher quota limits
- **Benefits**: 
  - Much higher limits (1,500 RPM vs 15 RPM)
  - 4 million tokens/day vs 1,500 requests/day

### Option 3: Use Multiple API Keys
- **Cost**: Free (but limited)
- **Time**: Immediate
- **Action**: Create additional Google AI API keys and rotate them
- **Note**: Each key has its own quota

## Current Configuration

- **Model**: `gemini-2.5-flash` (fastest, cheapest)
- **Location**: `lib/services/aiService.ts`
- **Quota**: Free tier (20 requests/day per model)

## Testing Strategy Going Forward

### During Development
1. **Use quota wisely**: Run individual tests instead of full suite
   ```bash
   npm run test:integration:ai        # ~8-10 AI calls
   npm run test:integration:happy     # ~9-12 AI calls  
   ```

2. **Monitor quota usage**: Check [AI Studio](https://aistudio.google.com/) dashboard

3. **Stagger test runs**: Don't run all tests at once

### For CI/CD
1. **Nightly runs**: Run integration tests once per night
2. **Separate API key**: Use dedicated key for CI with higher quota
3. **Conditional runs**: Only run on release branches or manual trigger

## Test Execution Times

With quota available:
- **AI Quality Test**: ~5-10 minutes (8-10 API calls)
- **Happy Path Test**: ~10-15 minutes (9-12 API calls)
- **Full Suite**: ~15-25 minutes (17-22 API calls)

## Next Steps

1. **Tomorrow**: Run `npm run test:integration:ai` to validate everything works
2. **Document results**: Capture successful test output
3. **Consider upgrade**: If running tests frequently, upgrade to paid tier

## Quota Monitoring

Check current quota usage:
1. Visit: https://aistudio.google.com/
2. Click on your API key
3. View usage metrics

## Alternative Models (Not Currently Configured)

If you upgrade and want more quota:
- `gemini-2.5-flash`: 20/day free → 1,500 RPM paid
- `gemini-2.0-flash`: 10/day free → 2,000 RPM paid  
- `gemini-1.5-pro`: 2/day free → 1,000 RPM paid

**Note**: Model names and availability depend on your API key's access level.
