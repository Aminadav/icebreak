# Testing Mode Endpoints

This document explains how to use the testing mode endpoints to enable mock functionality during E2E testing.

## Overview

The testing endpoints allow you to toggle `MOCK_SMS` and `MOCK_GENERATE` environment variables on and off during runtime, which is essential for E2E testing to avoid using real APIs.

## Endpoints

### 1. Start Testing Mode
**POST** `/api/testing/start`

Enables testing mode by setting both `MOCK_SMS` and `MOCK_GENERATE` to `true`.

**Response:**
```json
{
  "success": true,
  "message": "Testing mode activated",
  "mockSms": "true",
  "mockGenerate": "true",
  "testingMode": true,
  "originalValues": {
    "MOCK_SMS": "original_value",
    "MOCK_GENERATE": "original_value"
  }
}
```

### 2. End Testing Mode
**POST** `/api/testing/end`

Disables testing mode by restoring the original environment variable values.

**Response:**
```json
{
  "success": true,
  "message": "Testing mode deactivated",
  "mockSms": "original_value",
  "mockGenerate": "original_value",
  "testingMode": false
}
```

### 3. Get Testing Status
**GET** `/api/testing/status`

Returns the current testing mode status.

**Response:**
```json
{
  "success": true,
  "testingMode": false,
  "mockSms": "true",
  "mockGenerate": null,
  "originalValues": null
}
```

## Mock Functionality

### MOCK_SMS
When `MOCK_SMS=true`:
- SMS sending is bypassed for phone number `972523737233`
- `sendVerificationCode()` returns success without calling the SMS API
- 2FA verification accepts any code for the test phone number

### MOCK_GENERATE  
When `MOCK_GENERATE=true`:
- Image generation uses mock files instead of calling Deep Image AI API
- `generateSquareImage()` copies a mock output file instead of processing
- `improveFace()` copies a mock output file instead of processing
- Processing time is simulated (3-10 seconds) to mimic real API calls

## Usage in E2E Tests

### Frontend/Playwright Tests
```typescript
// At the beginning of your test
async function enableTestingMode() {
  const response = await fetch('http://localhost:4001/api/testing/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

// At the end of your test (in finally block)
async function disableTestingMode() {
  const response = await fetch('http://localhost:4001/api/testing/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

test('My E2E test', async ({ page }) => {
  await enableTestingMode();
  
  try {
    // Your test code here
  } finally {
    await disableTestingMode();
  }
});
```

### Backend Tests
```javascript
const axios = require('axios');

// Enable testing mode
await axios.post('http://localhost:4001/api/testing/start');

// Your backend test code here

// Disable testing mode
await axios.post('http://localhost:4001/api/testing/end');
```

## Files Modified

1. **`/backend/routes/testing.js`** - New testing endpoints
2. **`/backend/server.js`** - Added testing route to server
3. **`/frontend/tests/e2e-flow.spec.ts`** - Updated to use testing endpoints
4. **`/backend/test-testing-endpoints.js`** - Test script for endpoints

## How It Works

1. **State Management**: The testing module keeps track of original environment variable values in memory
2. **Environment Variable Manipulation**: Direct manipulation of `process.env` variables
3. **Restoration**: Original values are restored when testing mode is disabled
4. **Safety**: Always use try/finally blocks to ensure testing mode is disabled

## Mock Files Required

Make sure these mock files exist:
- `/backend/deep-image/mock-output.png` - Used by MOCK_GENERATE
- Test phone number `972523737233` configured in SMS service

## Testing the Endpoints

Run the test script to verify endpoints work:
```bash
cd backend
node test-testing-endpoints.js
```

## Important Notes

- **Always disable testing mode** after tests to avoid affecting other tests
- **Use try/finally blocks** to ensure cleanup even if tests fail
- **Test phone number** `972523737233` is hardcoded for SMS mocking
- **Original values are preserved** and restored when testing mode ends
- **Multiple calls to start** won't overwrite original values

## Example Implementation

The E2E test in `/frontend/tests/e2e-flow.spec.ts` shows a complete implementation:

```typescript
test('Complete user registration flow', async ({ page }) => {
  // Enable testing mode
  const testingEnabled = await enableTestingMode();
  if (!testingEnabled) {
    throw new Error('Failed to enable testing mode');
  }
  
  try {
    // Your test steps here...
    await page.goto('/');
    // ... rest of test
    
  } finally {
    // Always disable testing mode
    await disableTestingMode();
  }
});
```

This ensures that all SMS and image generation calls are mocked during E2E testing, making tests faster, more reliable, and independent of external APIs.
