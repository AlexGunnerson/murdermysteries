/**
 * Jest configuration for integration tests
 * These tests use real API calls and longer timeouts
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'integration',
  testEnvironment: 'node', // Use node environment for API tests
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.integration.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Long timeout for real API calls
  testTimeout: 300000, // 5 minutes
  // Run tests sequentially to avoid rate limits
  maxWorkers: 1,
  // Verbose logging for debugging
  verbose: true,
  // Collect coverage from integration tests separately
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'lib/services/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
