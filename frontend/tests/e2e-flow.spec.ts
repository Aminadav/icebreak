import { test, expect } from '@playwright/test';
import { get2FACode } from './test-utils';
//@ts-ignore
import fs from 'fs'

var DEFAULT_DELAY=250
var LONG_DELAY=1000

/**
 * Enable testing mode on backend (sets MOCK_SMS and MOCK_GENERATE to true)
 */
async function enableTestingMode() {
  try {
    const response = await fetch('http://localhost:4001/api/testing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    console.log('🧪 Testing mode enabled:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to enable testing mode:', error);
    return false;
  }
}

/**
 * Disable testing mode on backend (restores original environment variables)
 */
async function disableTestingMode() {
  try {
    const response = await fetch('http://localhost:4001/api/testing/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    console.log('🔄 Testing mode disabled:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to disable testing mode:', error);
    return false;
  }
}

const TEST_PHONE_NUMBER = '972523737233';

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
      // Step 1: Navigate to homepage and clear localStorage
      step(page,'before main navigation');
      await page.goto('http://localhost:4000/');
      await page.waitForLoadState('networkidle');
      
      // // Clear localStorage to ensure clean state
      // await page.evaluate(() => {
      //   localStorage.removeItem('icebreak_device_id');
      //   localStorage.clear();
      //   sessionStorage.clear();
      // });
      // console.log('🧹 Cleared localStorage and sessionStorage');
    
    // Verify we're on the homepage by checking for the logo and create game button
    await expect(page.locator('img[alt="IceBreak Logo"]')).toBeVisible();
    
    // Wait for the "Create Game" button to be visible and enabled
    const createGameButton = page.getByTestId('create-game-button');
    await expect(createGameButton).toBeVisible();
    await expect(createGameButton).toBeEnabled();
    
    // Click the create game button
    await step(page,'homepage - before click create game button');
    await createGameButton.click();
    
    // Step 2: Enter game name
    await delay(DEFAULT_DELAY);
    await step(page,'after click create game button');
    
    // Wait for the game name input to be visible
    const gameNameInput = page.getByTestId('game-name-input');
    await expect(gameNameInput).toBeVisible();
    
    // Enter game name
    await gameNameInput.fill('E2E Test Game with Gender');
    
    // Click continue button
    const gameNameContinueButton = page.getByTestId('game-name-continue-button');
    await expect(gameNameContinueButton).toBeEnabled();
    
    await step(page,'after fill game name, before click CONTINUE button');
    await gameNameContinueButton.click();
    await delay(DEFAULT_DELAY)
    // Step 3: Enter phone number
    await step(page,'after click CONTINUE before fill phone number');
    
    // Wait for phone number input
    const phoneInput = page.getByTestId('phone-number-input');
    await expect(phoneInput).toBeVisible();
    
    // Enter phone number
    await phoneInput.fill(TEST_PHONE_NUMBER);
    
    // Click continue button
    await step(page,'after fill phone number, before click CONTINUE button');
    const phoneContinueButton = page.getByTestId('phone-number-continue-button');
    await expect(phoneContinueButton).toBeEnabled();
    await phoneContinueButton.click();
    
    // Step 4: Enter 2FA code
    await delay(DEFAULT_DELAY);
    await step(page,'after click CONTINUE before fill 2fa code');
    
    // Wait for 2FA inputs
    const firstCodeInput = page.getByTestId('2fa-code-input-0');
    await expect(firstCodeInput).toBeVisible();
    
    // Get and enter the 2FA code
    const verificationCode = get2FACode(TEST_PHONE_NUMBER);
    
    // Fill the code inputs
    for (let i = 0; i < 6; i++) {
      const input = page.getByTestId(`2fa-code-input-${i}`);
      await input.fill(verificationCode[i]);
    }
    
    // Click verify button
    const verifyButton = page.getByTestId('2fa-code-verify-button');
    // await expect(verifyButton).toBeVisible();
    // await expect(verifyButton).toBeEnabled();
    await delay(DEFAULT_DELAY)
    await step(page,'after fill 2fa code, auto navigate next page');
    
    // Step 5: Enter email
    await step(page,'after click verify button, before fill email');
    
    // Wait for email input
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toBeVisible();
    
    // Enter email address
    await emailInput.fill('gender-test@example.com');
    
    // Click continue button
    const emailContinueButton = page.getByTestId('email-continue-button');
    await expect(emailContinueButton).toBeEnabled();
    await step(page,'after fill email, before click CONTINUE button');
    await emailContinueButton.click();
    
    await delay(DEFAULT_DELAY);
    // Step 6: Enter name
    
    // Wait for name input
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toBeVisible();
    
    // Enter user name
    await nameInput.fill('משה כהן');
    
    // Click continue button
    await step(page,'after fill name, before click CONTINUE button');
    let nameContinueButton = page.getByTestId('name-continue-button');
    await expect(nameContinueButton).toBeEnabled();
    await nameContinueButton.click();
    await delay(DEFAULT_DELAY)
    // await step(page,'after click CONTINUE button on name screen 1st time');
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
    await delay(DEFAULT_DELAY);
    await step(page,'after click CONTINUE button on name screen 4th time');
    await expect(modalOverlay).toBeVisible();
    
    // Test clicking "No" first
    await page.getByTestId('name-confirmation-no').click();
    await delay(DEFAULT_DELAY);
    await expect(modalOverlay).not.toBeVisible();
    await expect(nameInput).toBeVisible();
    
    await step(page,'after clicking NO to reject name');
    
    await nameContinueButton.click();
    await delay(DEFAULT_DELAY);
    
    await step(page,'after click CONTINUE button on name screen 5th time');

    
    await page.getByTestId('name-confirmation-yes').click();
    await delay(DEFAULT_DELAY)

    await step(page,'After clicking YES to confirm name');
    await expect(modalOverlay).not.toBeVisible();
    
    await step(page,'Waiting for automatic navigation to gender selection page...');
    
    await step(page,"Looking for female character..")
    
    await expect(page.locator('img[alt="Female character"]')).toBeVisible();
    await expect(page.locator('img[alt="Male character"]')).toBeVisible();
    
    const femaleOption = page.locator('img[alt="Female character"]').locator('..');
    await femaleOption.click();
    
    // Wait for gender to be saved and navigation to complete
    await delay(DEFAULT_DELAY);
    await step(page,'After click female, show picture upload')
    
    // Step 8: Picture upload page
    await step(page,'Picture upload page');
    await expect(page.getByTestId('picture-upload-character-image')).toBeVisible();
    
    // Step 9: Click skip button
    await step(page,'Before click skip button');
    const skipButton = page.getByTestId('skip-picture-button');
    await expect(skipButton).toBeVisible();
    await expect(skipButton).toBeEnabled();
    await skipButton.click();
    await delay(DEFAULT_DELAY);
    
    // Step 10: Skip confirmation modal appears - click "Take Photo" to regret
    await step(page,'Skip modal appeared, click take photo to regret');
    const takePhotoButton = page.getByTestId('skip-confirmation-take-photo');
    await expect(takePhotoButton).toBeVisible();
    await expect(takePhotoButton).toBeEnabled();
    
    // Set up camera mock before navigation
    await page.evaluate(() => {
      // Create a mock video stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      // Draw a simple face-like shape on the canvas
      if (ctx) {
        ctx.fillStyle = '#f4c2a1'; // Skin color
        ctx.fillRect(0, 0, 640, 480);
        
        // Draw a simple face
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(200, 200, 20, 0, 2 * Math.PI); // Left eye
        ctx.arc(440, 200, 20, 0, 2 * Math.PI); // Right eye
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(320, 300, 50, 0, Math.PI); // Mouth
        ctx.stroke();
      }
      
      // Get video stream from canvas
      const stream = canvas.captureStream(30);
      
      // Mock getUserMedia
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: () => Promise.resolve(stream)
        }
      });
    });
    
    await takePhotoButton.click();
    await delay(DEFAULT_DELAY);
    
    // Step 11: Camera page - wait for face detection and capture
    await step(page,'Camera page loaded, wait for face detection and capture');
    
    // Wait for camera to initialize and face detection to be ready
    const captureButton = page.getByTestId('camera-capture-button');
    await expect(captureButton).toBeVisible();
    
    // Wait 5 seconds for camera to fully initialize and face detection
    await delay(DEFAULT_DELAY);
    
    
    // Click capture button to take photo
    await captureButton.click();
    await delay(DEFAULT_DELAY); // Wait for capture processing
    
    // Step 12: Should navigate to Image Gallery page automatically
    await step(page,'After capture, wait for navigation to gallery');
    
    // Wait for navigation to image gallery and processing modal
    await delay(LONG_DELAY);
    await step(page,'Image gallery page with processing modal');
    
    // Step 13: Click on first image to preview it
    await step(page,'Looking for gallery images');
    
    // Find the first gallery image container (the clickable div that contains the img)
    const firstImageContainer = page.locator('div[class*="cursor-pointer"][class*="aspect-square"]').first();
    await firstImageContainer.waitFor({ state: 'visible' });
    await firstImageContainer.click();
    await delay(DEFAULT_DELAY);
    
    
    
    await step(page,'after click first image, pbefore click ok');
    // Step 16: Choose this image to go to Creator Game Ready page
    const chooseButton = page.getByTestId('choose-image-button')
    await expect(chooseButton).toBeVisible();
    await expect(chooseButton).toBeEnabled();
    await chooseButton.click();
    await delay(DEFAULT_DELAY);
    
    await step(page,'after click choose, before navigate to Creator Game Ready page');
    
    // Step 17: Verify we're on Creator Game Ready page
    await step(page,'Creator Game Ready page');
    await expect(page.locator('h1').filter({ hasText: 'המשחק מוכן!' })).toBeVisible();
    
    // Step 18: Click "התחל לשחק" to start the question flow
    await step(page,'before click start game button');
    const startGameButton = page.getByTestId('creator-start-game-button');
    await expect(startGameButton).toBeVisible();
    await expect(startGameButton).toBeEnabled();
    await startGameButton.click();
    await delay(DEFAULT_DELAY);
    
    // Step 19: Should be on "Before Start Ask About You" page
    await step(page,'See Before Start Ask About You page');
    await expect(page.locator('h1').filter({ hasText: 'לפני שנתחיל עם החידון נשאל אותך 5 שאלות להיכרות' })).toBeVisible();
    
    // Verify initial points are displayed (should be 0)
    await expect(page.getByTestId('my-points-value')).toHaveText('0');
    
    // Click "יאללה, לשאלות" button
    const startQuestionsButton = page.getByTestId('before-start-questions-button');
    await expect(startQuestionsButton).toBeVisible();
    await expect(startQuestionsButton).toBeEnabled();
    await startQuestionsButton.click();
    await delay(DEFAULT_DELAY);
    
    // Steps 20-29: Answer 5 questions and verify points
    for (let questionNumber = 1; questionNumber <= 5; questionNumber++) {
      await step(page, `Question ${questionNumber} - Waiting for question page`);
      
      // Verify we're on a question page
      await expect(page.getByTestId('question-text')).toBeVisible();
      
      // Try to interact with the question - could be freeform or multiple choice
      const freeformInput = page.getByTestId('question-freeform-input');
      const submitButton = page.getByTestId('question-submit-button');
      
      if (await freeformInput.isVisible()) {
        // It's a freeform question
        await step(page, `Question ${questionNumber} - Filling freeform answer`);
        await freeformInput.fill(`Test answer for question ${questionNumber}`);
      } else {
        // It's a multiple choice question - click first available answer
        await step(page, `Question ${questionNumber} - Looking for answer options`);
        
        // Find any answer option (they have dynamic test IDs based on text)
        const answerOptions = page.locator('[data-testid^="answer-option-"]');
        await expect(answerOptions.first()).toBeVisible();
        await answerOptions.first().click();
        await delay(DEFAULT_DELAY);
      }
      
      // Submit the answer
      await step(page, `Question ${questionNumber} - Submitting answer`);
      await expect(submitButton).toBeEnabled();
      await submitButton.click({ force: true });
      await delay(DEFAULT_DELAY);
      
      // Should navigate to GOT_POINTS page
      await step(page, `Question ${questionNumber} - Got points page`);
      await expect(page.getByTestId('got-points-title')).toBeVisible();
      await expect(page.getByTestId('got-points-display')).toBeVisible();
      
      // Check points display shows +10
      await expect(page.getByTestId('got-points-display')).toHaveText('+ 10');
      
      // Click continue to next question
      const continueButton = page.getByTestId('got-points-continue-button');
      await expect(continueButton).toBeVisible();
      await expect(continueButton).toBeEnabled();
      await continueButton.click();
      await delay(DEFAULT_DELAY);
      
      // Verify points in top corner have increased
      const expectedPoints = questionNumber * 10;
      await step(page, `Question ${questionNumber} - Verifying total points: ${expectedPoints}`);
      await expect(page.getByTestId('my-points-value')).toHaveText(expectedPoints.toString());
    }
    
    await step(page,'All 5 questions completed successfully! Final points should be 50.');
    
    // Final verification: total points should be 50
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