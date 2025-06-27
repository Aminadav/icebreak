import { test, expect } from '@playwright/test';
import { get2FACode } from './test-utils';
//@ts-ignore
import fs from 'fs'
import { disableTestingMode } from './disableTestingMode';
import { enableTestingMode } from './enableTestingMode';

const DEFAULT_DELAY=100
const DELAY_ON_MODAL=300
const LONG_DELAY=1000

const TEST_PHONE_NUMBER =  new Date().valueOf().toString()
console.log({TEST_PHONE_NUMBER})

test.describe('Icebreak App E2E Flow', () => {
  test('Complete user registration flow from homepage to creator game ready', async ({page}) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(1000*60); // 1 minute
    
    console.log('🚀 Starting comprehensive E2E test - Complete user registration flow');
    
    await page.setViewportSize({ width: 500, height: 800 });
    
      // Enable testing mode before starting the test
      const testingEnabled = await enableTestingMode();
      if (!testingEnabled) {
        throw new Error('Failed to enable testing mode. Make sure backend is running.');
      }
      
      try {
      // Step 1: Navigate to homepage
      step(page,'before main navigation');
      await page.goto('http://localhost:4000/');
      await page.waitForLoadState('networkidle');
      
      // Verify homepage and click create game
      await expect(page.locator('img[alt="IceBreak Logo"]')).toBeVisible();
      await step(page,'homepage - before click create game button');
      await page.getByTestId('create-game-button').click();
      
      // Step 2: Enter game name
      await delay(DEFAULT_DELAY);
      await step(page,'after click create game button');
      
      await page.getByTestId('game-name-input').fill('E2E Test Game with Gender');
      await step(page,'after fill game name, before click CONTINUE button');
      await page.getByTestId('game-name-continue-button').click();
      
      // Step 3: Enter phone number
      await delay(DEFAULT_DELAY)
      await step(page,'after click CONTINUE before fill phone number');
      
      await page.getByTestId('phone-number-input').fill(TEST_PHONE_NUMBER);
      await step(page,'after fill phone number, before click CONTINUE button');
      await page.getByTestId('phone-number-continue-button').click();
      
      // Step 4: Enter 2FA code
      await delay(DEFAULT_DELAY);
      await step(page,'after click CONTINUE before fill 2fa code');
      
      // Get and enter the 2FA code
      const verificationCode = get2FACode(TEST_PHONE_NUMBER);
      for (let i = 0; i < 6; i++) {
        await page.getByTestId(`2fa-code-input-${i}`).fill(verificationCode[i]);
      }
      
      await delay(DEFAULT_DELAY)
      await step(page,'after fill 2fa code, auto navigate next page');
      
      // Step 5: Enter email
      await step(page,'after click verify button, before fill email');
      
      await page.getByTestId('email-input').fill('gender-test@example.com');
      await step(page,'after fill email, before click CONTINUE button');
      await page.getByTestId('email-continue-button').click();
      
      // Step 6: Enter name
      await delay(DEFAULT_DELAY);
      
      await page.getByTestId('name-input').fill('משה כהן');
      await step(page,'after fill name, before click CONTINUE button');
      
      let nameContinueButton = page.getByTestId('name-continue-button');
      await nameContinueButton.click();
      await delay(DEFAULT_DELAY)
      await delay(DEFAULT_DELAY)
      await step(page,'after click button on name screen 1st time');
      await delay(DEFAULT_DELAY)
      
      // Handle name confirmation modal - Test modal edge cases first
      const modalOverlay = page.getByTestId('modal-overlay');
      await expect(modalOverlay).toBeVisible();
      
      // Test modal edge case 1: Click outside modal to close
      await modalOverlay.click({ position: { x: 10, y: 10 }, force: true });
      await delay(DEFAULT_DELAY);
      await expect(modalOverlay).not.toBeVisible();
      await step(page,'after closing modal by clicking outside');
      
      // Show modal again
      nameContinueButton = page.getByTestId('name-continue-button');
      await nameContinueButton.click();
      await expect(modalOverlay).toBeVisible();
      await step(page,'after click CONTINUE button on name screen 2nd time');
      
      // Test modal edge case 2: Escape key to close modal
      await page.keyboard.press('Escape');
      await delay(DEFAULT_DELAY);
      await expect(modalOverlay).not.toBeVisible();
      await step(page,'after closing modal by pressing ESC key');
      
      // Show modal again and test No/Yes flow
      await nameContinueButton.click();
      await delay(DELAY_ON_MODAL);
      await step(page,'after click CONTINUE button on name screen 3th time');
      await expect(modalOverlay).toBeVisible();
      
      // Test clicking "No" first
      await page.getByTestId('name-confirmation-no').click();
      await delay(DELAY_ON_MODAL);
      await expect(modalOverlay).not.toBeVisible();
      await expect(page.getByTestId('name-input')).toBeVisible();
      
      await step(page,'after clicking NO to reject name');
      
      await nameContinueButton.click();
      await delay(DELAY_ON_MODAL);
      await step(page,'after click CONTINUE button on name screen 4th time');
      
      await page.getByTestId('name-confirmation-yes').click();
      await delay(DELAY_ON_MODAL)
      await step(page,'After clicking YES to confirm name');
      await expect(modalOverlay).not.toBeVisible();
      
      await step(page,'Waiting for automatic navigation to gender selection page...');
      await step(page,"Looking for female character..")
      
      // Step 7: Select gender - simplified to one line
      await page.locator('img[alt="Female character"]').locator('..').click();
      
      // Wait for gender to be saved and navigation to complete
      await delay(DEFAULT_DELAY);
      await step(page,'After click female, show picture upload')
      
      // Step 8: Picture upload page
      await step(page,'Picture upload page');
      await expect(page.getByTestId('picture-upload-character-image')).toBeVisible();
      
      // Step 9: Click skip button
      await step(page,'Before click skip button');
      await page.getByTestId('skip-picture-button').click();
      await delay(DEFAULT_DELAY);
      
      // Step 10: Skip confirmation modal appears - click "Take Photo" to regret
      await step(page,'Skip modal appeared, click take photo to regret');
      
      await page.getByTestId('skip-confirmation-take-photo').click();
      await delay(DEFAULT_DELAY);
      
      // Step 11: Camera page - wait for face detection and capture
      await step(page,'Camera page loaded, wait for face detection and capture');
      
      // Wait for camera and capture
      await delay(DEFAULT_DELAY);
      await page.getByTestId('camera-capture-button').click();
      await delay(DEFAULT_DELAY);
      
      // Step 12: Image gallery processing
      await step(page,'After capture, wait for navigation to gallery');
      await delay(LONG_DELAY);
      await step(page,'Image gallery page with processing modal');
      
      // Step 13: Click first image and choose it
      await step(page,'Looking for gallery images');
      
      const firstImageContainer = page.locator('div[class*="cursor-pointer"][class*="aspect-square"]').first();
      await firstImageContainer.waitFor({ state: 'visible' });
      await firstImageContainer.click();
      await delay(DEFAULT_DELAY);
      
      await step(page,'after click first image, pbefore click ok');
      await page.getByTestId('choose-image-button').click();
      await delay(DEFAULT_DELAY);
      
      await step(page,'after click choose, before navigate to Creator Game Ready page');
      
      // Step 17: Creator Game Ready page
      await step(page,'Creator Game Ready page - before click start game button');
      await expect(page.locator('h1').filter({ hasText: 'המשחק מוכן!' })).toBeVisible();
      
      // Step 18: Start the game
      await page.getByTestId('creator-start-game-button').click();
      await delay(DEFAULT_DELAY);
      
      // Step 19: Before Start Ask About You page
      await step(page,'See Before Start Ask About You page');
      await expect(page.locator('h1').filter({ hasText: 'לפני שנתחיל עם החידון נשאל אותך 5 שאלות להיכרות' })).toBeVisible();
      
      // Verify initial points
      await expect(page.getByTestId('my-points-value')).toHaveText('0');
      
      await page.getByTestId('before-start-questions-button').click();
      await delay(DEFAULT_DELAY);
      
      // Steps 20-29: Answer 5 questions
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
        
        // Got points page
        await step(page, `Question ${questionNumber} - Got points page`);
        await expect(page.getByTestId('got-points-title')).toBeVisible();
        await expect(page.getByTestId('got-points-display')).toHaveText('+ 10');
        
        await page.getByTestId('got-points-continue-button').click();
        await delay(DEFAULT_DELAY);
        
        // Verify points
        const expectedPoints = questionNumber * 10;
        await step(page, `Question ${questionNumber} - Verifying total points: ${expectedPoints}`);
        await expect(page.getByTestId('my-points-value')).toHaveText(expectedPoints.toString());
      }
      
      await step(page,'All 5 questions completed successfully! Final points should be 50.');
      await expect(page.getByTestId('my-points-value')).toHaveText('50');
      await step(page,'Test completed successfully!');
      
    } finally {
      // Always disable testing mode after the test, regardless of success or failure
      console.log('🔄 Disabling testing mode...');
      await disableTestingMode();
    }
  });
});


fs.rmSync('screenshots', { recursive: true, force: true });
let index=0
/**
 * Takes a screenshot and logs the step name with an index.
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} name - The name of the step to log
 */
async function step(page,name) {
  index++
  console.log(index + '. ' + name)
  await page.screenshot({ path: `screenshots/${index}-${name}.png` });
}

function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms))}