import { Page, expect } from '@playwright/test';
import { cameraAndGallerySteps } from './cameraAndGallerySteps';
import { step } from './step';
import { fillPhone2faCode } from './fillPhone2faCode';
import { fillEmail } from './fillEmail';
import { fillGender } from './fillGender';
import { fillName } from './fillName';
import { verifyPointsLabel } from './verifyPointsLabel';
import { delay } from './delay';

const TEST_PHONE_NUMBER1 = new Date().valueOf().toString()
const TEST_EMAIL_1 = 'test2@example.com'
const TEST_NAME_1 = 'אברהם לוי'
const DEFAULT_DELAY = 100
const DELAY_ON_MODAL = 300

var user1DeviceId: any


export async function startUser1(page: Page) {
  // Step 1: Navigate to homepage
  step(page, 'before main navigation');
  await page.goto('http://localhost:4000/');
  await page.waitForLoadState('networkidle');

  // Verify homepage and click create game
  await expect(page.locator('img[alt="IceBreak Logo"]')).toBeVisible();
  await step(page, 'homepage - before click create game button');
  await page.getByTestId('create-game-button').click();

  // Step 2: Enter game name
  await step(page, 'after click create game button');
  await page.getByTestId('game-name-input').fill('E2E Test Game ');
  await step(page, 'after fill game name, before click CONTINUE button');
  await page.getByTestId('game-name-continue-button').click();

  await fillPhone2faCode(page, TEST_PHONE_NUMBER1);

  await fillEmail(page, TEST_EMAIL_1);

  await fillName(page, TEST_NAME_1);

  await fillGender(page);

  await cameraAndGallerySteps(page);

  // Step 17: Creator Game Ready page
  await step(page, 'Creator Game Ready page - Clicking start the game');
  await expect(page.locator('h1').filter({ hasText: 'המשחק מוכן!' })).toBeVisible();

  // Step 18: Start the game
  await page.getByTestId('creator-start-game-button').click();
  // await delay(DEFAULT_DELAY);
  // Step 19: Before Start Ask About You page
  await step(page, 'See before we start - Click continue');
  await expect(page.locator('h1').filter({ hasText: 'לפני שנתחיל עם החידון נשאל אותך 5 שאלות להיכרות' })).toBeVisible();
  await page.getByTestId('before-start-questions-button').click();

  verifyPointsLabel(page, 0);

  for (let questionNumber = 1; questionNumber <= 5; questionNumber++) {
    await step(page, `Question ${questionNumber} - Waiting for question page`);

    await expect(page.getByTestId('question-text')).toBeVisible();

    const freeformInput = page.getByTestId('question-freeform-input');

    if (await freeformInput.isVisible()) {
      await step(page, `Question ${questionNumber} - Filling freeform answer`);
      await freeformInput.fill(`Test answer for question ${questionNumber}`);
    } else {
      await step(page, `Question ${questionNumber} - Looking for answer options`);
      await page.locator('[data-testid^="answer-option-"]').first().click();
      await delay(DEFAULT_DELAY);
    }

    // Submit answer
    await step(page, `Question ${questionNumber} - Submitting answer`);
    await page.getByTestId('question-submit-button').click({ force: true });
    await delay(DEFAULT_DELAY);

    // Handle points and potential badges after submitting answer
    await step(page, `Question ${questionNumber} - Checking for points or badge page`);

    // Check if we got a badge page directly (if user accumulated enough points)
    // Use a longer timeout to make sure we detect the badge page properly
    const badgePageVisible = await page.locator('text=כל הכבוד! עלית בדרגה!').isVisible({ timeout: 5000 });
    if (badgePageVisible) {
      await step(page, `Question ${questionNumber} - Got badge page directly`);
      await expect(page.getByRole('heading', { name: 'שוברי קרחים' })).toBeVisible();
      await page.locator('button', { hasText: 'המשך' }).click();
      await delay(DEFAULT_DELAY);
    } else {
      // Got points page with conditional point checking
      await step(page, `Question ${questionNumber} - Got points page`);
      await expect(page.getByTestId('got-points-title')).toBeVisible();

      // Check points earned - question 5 gives +50 bonus instead of +10
      if (questionNumber === 5) {
        await expect(page.getByTestId('got-points-display')).toHaveText('+ 50');
      } else {
        await expect(page.getByTestId('got-points-display')).toHaveText('+ 10');
      }

      await page.getByTestId('got-points-continue-button').click();
      await delay(DEFAULT_DELAY);

      // Check for badge after question 2
      if (questionNumber === 2) {
        await step(page, 'After question 2 - Looking for ice_breaker badge');

        // Should get badge page with congratulations text
        await expect(page.locator('text=כל הכבוד! עלית בדרגה!')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'שוברי קרחים' })).toBeVisible();

        await step(page, 'Got ice_breaker badge - clicking continue');
        await page.locator('button', { hasText: 'המשך' }).click();
        await delay(DEFAULT_DELAY);
      }
    }

    // Verify total points
    const expectedPoints = questionNumber === 5 ? 90 : questionNumber * 10; // 40 + 50 bonus = 90
    await step(page, `Question ${questionNumber} - Verifying total points: ${expectedPoints}`);
    await expect(page.getByTestId('my-points-value')).toHaveText(expectedPoints.toString());
  }

  await step(page, 'Creator completed 5 questions successfully! Final points should be 90 (40 + 50 bonus).');
  await expect(page.getByTestId('my-points-value')).toHaveText('90');

  // Store current device ID for user 1
  user1DeviceId = await page.evaluate(() => localStorage.getItem('icebreak_device_id'));
  const gameUrl = page.url();

  await step(page, `Storing User 1 device ID: ${user1DeviceId} and game URL: ${gameUrl}`);
  return { gameUrl }
}

export async function continueUser1(page: Page) {
  await step(page, '=== RESTORING USER 1 DEVICE ===');

  // Restore user 1 device ID
  if (user1DeviceId) {
    await page.evaluate((deviceId) => {
      localStorage.setItem('icebreak_device_id', deviceId);
    }, user1DeviceId);

    await step(page, `Restored User 1 device ID: ${user1DeviceId}`);
  } else {
    await step(page, 'Warning: User 1 device ID was null, cannot restore');
  }

  await step(page, 'Test completed successfully!');
}