import { test, expect } from '@playwright/test';
import { get2FACode } from './test-utils';
import { disableTestingMode } from './disableTestingMode';
import { enableTestingMode } from './enableTestingMode';
import { continueUser1, startUser1 } from './startUser1';
import { startUser2 } from './startUser2';
import { step } from './step';
import { delay } from './delay';

export const LONG_DELAY = 1000

const TEST_PHONE_NUMBER2 = new Date().valueOf().toString()
const TEST_EMAIL_2 = 'test3@example.com'
const TEST_NAME_2 = 'שרה לוי'

test.describe('Icebreak App E2E Flow', () => {
  test('Complete user registration flow', async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(1000 * 60); // 1 minute

    await page.setViewportSize({ width: 500, height: 800 });


    // Enable testing mode before starting the test
    const testingEnabled = await enableTestingMode();
    if (!testingEnabled) {
      throw new Error('Failed to enable testing mode. Make sure backend is running.');
    }

    try {
      var {gameUrl}=await startUser1(page)
      await startUser2(page,{gameUrl})

      await continueUser1(page)
      

    } finally {
      // Always disable testing mode after the test, regardless of success or failure
      console.log('🔄 Disabling testing mode...');
      await disableTestingMode();
    }
  });
});

