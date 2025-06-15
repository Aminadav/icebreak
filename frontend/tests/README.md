# E2E Testing for Icebreak App

This directory contains end-to-end tests for the Icebreak application using Playwright.

## Overview

The E2E tests cover the complete user registration and game creation flow:

1. **Homepage** - Landing page with "Create New Game" button
2. **Give Game Name** - User enters a name for their game
3. **Enter Phone Number** - User enters phone number (0523737233 for testing)
4. **2FA Verification** - User enters the verification code sent via SMS
5. **Enter Email** - User enters their email address

## Test Files

- `smoke.spec.ts` - Basic smoke tests to ensure the app loads
- `e2e-flow.spec.ts` - Complete end-to-end user flow test
- `test-utils.ts` - Utility functions for testing (2FA code generation, page helpers, etc.)

## Setup and Running Tests

### Prerequisites

1. **Backend must be running** on `http://localhost:3001`
2. **Database must be running** (PostgreSQL via Docker)
3. **Frontend must be running** on `http://localhost:3000`

### Quick Start

Use the automated setup script:

```bash
# Run tests in headless mode (recommended for CI)
./run-e2e-tests.sh

# Run tests with visible browser (good for debugging)
./run-e2e-tests.sh --headed

# Run tests in interactive UI mode
./run-e2e-tests.sh --ui

# Run tests in debug mode (step through tests)
./run-e2e-tests.sh --debug
```

### Manual Setup

If you prefer to start services manually:

1. **Start the database:**
   ```bash
   cd backend && pnpm run db:start
   ```

2. **Start the backend:**
   ```bash
   cd backend && pnpm run dev
   ```

3. **Start the frontend:**
   ```bash
   cd frontend && pnpm run dev
   ```

4. **Run tests:**
   ```bash
   cd frontend && pnpm run test
   ```

### Available Test Commands

```bash
# Run all tests
pnpm run test

# Run tests with UI
pnpm run test:ui

# Run tests in debug mode
pnpm run test:debug

# Run tests with visible browser
pnpm run test:headed

# Run only the E2E flow test
pnpm run test:e2e

# Run E2E test with visible browser
pnpm run test:e2e:headed

# Show test report
pnpm run test:report
```

## How the 2FA Testing Works

The E2E tests use the same algorithm as the backend to generate valid 2FA codes:

1. **Phone Number**: `0523737233` (test number)
2. **Code Generation**: Uses SHA256 hash of phone + secret + current hour
3. **Validation**: Codes are valid for the current hour and previous hour

The `test-utils.ts` file contains the `get2FACode()` function that generates the correct code for testing.

## Test Configuration

The test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Captured on retry

## Debugging Tests

### View Test Results
```bash
pnpm run test:report
```

### Debug Specific Test
```bash
# Debug the main E2E flow
pnpm run test:debug tests/e2e-flow.spec.ts

# Debug with headed browser
pnpm run test:headed tests/e2e-flow.spec.ts
```

### Test Logs

- Browser console logs are captured and displayed
- Backend logs are saved to `backend.log`
- Frontend logs are saved to `frontend.log`

## Test Data

The tests use the following test data:

- **Phone Number**: `0523737233`
- **Game Names**: Generated with timestamps
- **Email Addresses**: Generated with timestamps (`e2e.test.{timestamp}@playwright.test`)

## Troubleshooting

### Common Issues

1. **"Connection refused" errors**
   - Ensure backend is running on port 3001
   - Ensure frontend is running on port 3000
   - Check that database is running

2. **2FA code validation fails**
   - The 2FA codes are time-based (hourly)
   - Ensure system clocks are synchronized
   - Check that SMS_SECRET environment variable matches

3. **Tests timeout**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity
   - Ensure services are fully started before running tests

### Getting Current 2FA Code

To see what 2FA code is currently valid:

```bash
cd backend && node test-2fa.js
```

### Checking Service Status

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check if frontend is running
curl http://localhost:3000

# Check database
cd backend && pnpm run db:logs
```

## CI/CD Integration

For continuous integration, use:

```bash
# Headless mode (suitable for CI)
./run-e2e-tests.sh

# Or manually
pnpm run test --reporter=github
```

The tests are configured to:
- Retry failed tests 2 times in CI
- Run with single worker in CI
- Generate HTML reports

## Contributing

When adding new tests:

1. Add test files to the `tests/` directory
2. Use the utilities in `test-utils.ts` for common operations
3. Follow the existing test structure and naming conventions
4. Add appropriate console logging for debugging
5. Update this README if adding new test categories
