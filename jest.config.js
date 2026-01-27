export default {
  testEnvironment: "node",

  // Only run backend/API tests
  testMatch: [
    '**/tests/**/*.test.js'
  ],

  // Explicitly ignore Playwright E2E tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/'
  ],  
};