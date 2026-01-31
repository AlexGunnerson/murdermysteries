/**
 * Integration test setup
 * Runs before each integration test
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Ensure required environment variables are set
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_GEMINI_API_KEY',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Log test configuration
console.log('\n🧪 Integration Test Configuration:')
console.log('- Test timeout: 5 minutes')
console.log('- API Base:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('- AI Provider: Google Gemini')
console.log('- Max workers: 1 (sequential execution)\n')

// Track API usage for cost monitoring
global.apiCallCount = 0
global.apiCallStart = Date.now()

// Add custom matchers for integration tests
expect.extend({
  toBeValidResponse(received) {
    const pass = typeof received === 'string' && received.length > 0
    return {
      pass,
      message: () =>
        pass
          ? `Expected response to be invalid but got: ${received}`
          : `Expected valid response but got: ${received}`,
    }
  },
  
  toContainNoStageDirections(received) {
    const patterns = [
      /\([^)]*\)/g,
      /\*[^*]*\*/g,
      /\[[^\]]*\]/g,
    ]
    
    for (const pattern of patterns) {
      const matches = received.match(pattern)
      if (matches) {
        return {
          pass: false,
          message: () => `Response contains stage directions: ${matches[0]}`,
        }
      }
    }
    
    return {
      pass: true,
      message: () => `Expected response to contain stage directions but it didn't`,
    }
  },
})

// Clean up after all tests
afterAll(() => {
  const duration = (Date.now() - global.apiCallStart) / 1000
  console.log(`\n📊 Integration Test Summary:`)
  console.log(`- Total AI API calls: ${global.apiCallCount}`)
  console.log(`- Total duration: ${duration.toFixed(2)}s`)
  console.log(`- Average per call: ${(duration / (global.apiCallCount || 1)).toFixed(2)}s\n`)
})
