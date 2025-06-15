import { test, expect } from '@playwright/test';
import { get2FACode } from './test-utils';

/**
 * End-to-End Test for Icebreak App User Registration Flow
 * 
 * This test covers the complete user journey:
 * 1. HomePage - Click "Start a new game"
 * 2. GiveGameNamePage - Enter game name
 * 3. EnterPhoneNumberPage - Enter phone number (972523737233)
 * 4. Enter2faCodePage - Enter 2FA code (123456)
 * 5. EnterEmailPage - Enter email address
 * 6. EnterNamePage - Enter user name and test modal
 */

const TEST_PHONE_NUMBER = '972523737233';

test.describe('Icebreak App E2E Flow', () => {
  test('Complete user registration flow from homepage to name entry', async ({ page }) => {
    console.log('🚀 Starting E2E test - Complete user registration flow');
    
    // Step 1: Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the homepage by checking for the logo and create game button
    await expect(page.locator('img[alt="IceBreak Logo"]')).toBeVisible();
    
    // Wait for the "Create Game" button to be visible and enabled
    const createGameButton = page.getByTestId('create-game-button');
    await expect(createGameButton).toBeVisible();
    await expect(createGameButton).toBeEnabled();
    
    // Click the create game button
    console.log('✅ Step 1 complete: Clicking create game button');
    await createGameButton.click();
    
    // Step 2: Enter game name
    console.log('📍 Step 2: Enter game name');
    await page.waitForLoadState('networkidle');
    
    // Wait for the game name input to be visible
    const gameNameInput = page.getByTestId('game-name-input');
    await expect(gameNameInput).toBeVisible();
    
    // Enter game name
    await gameNameInput.fill('E2E Test Game');
    
    // Click continue button
    const gameNameContinueButton = page.getByTestId('game-name-continue-button');
    await expect(gameNameContinueButton).toBeEnabled();
    console.log('✅ Step 2 complete: Entered game name');
    await gameNameContinueButton.click();
    
    // Step 3: Enter phone number
    console.log('📍 Step 3: Enter phone number');
    await page.waitForLoadState('networkidle');
    
    // Wait for phone number input to be visible
    const phoneNumberInput = page.getByTestId('phone-number-input');
    await expect(phoneNumberInput).toBeVisible();
    
    // Enter phone number
    await phoneNumberInput.fill(TEST_PHONE_NUMBER);
    
    // Click continue button
    const phoneNumberContinueButton = page.getByTestId('phone-number-continue-button');
    await expect(phoneNumberContinueButton).toBeEnabled();
    console.log('✅ Step 3 complete: Entered phone number');
    await phoneNumberContinueButton.click();
    
    // Step 4: Enter 2FA code
    console.log('📍 Step 4: Enter 2FA verification code');
    await page.waitForLoadState('networkidle');
    
    // Wait for 2FA code inputs to be visible
    const codeInputsContainer = page.getByTestId('2fa-code-inputs');
    await expect(codeInputsContainer).toBeVisible();
    
    // Generate the correct 2FA code for our test phone number
    const validCode = get2FACode(TEST_PHONE_NUMBER);
    console.log(`📱 Using 2FA code: ${validCode} (should be 123456 for test number)`);
    
    // Enter each digit of the 2FA code
    const codeDigits = validCode.split('');
    for (let i = 0; i < codeDigits.length; i++) {
      const digitInput = page.getByTestId(`2fa-code-input-${i}`);
      await expect(digitInput).toBeVisible();
      await digitInput.fill(codeDigits[i]);
    }
    
    // Click verify button with force option to handle overlay issues
    const verifyButton = page.getByTestId('2fa-code-verify-button');
    await expect(verifyButton).toBeEnabled();
    console.log('✅ Step 4 complete: Entered 2FA code');
    
    // Use force click to bypass overlay issues on mobile and wait for navigation
    await verifyButton.click({ force: true });
    
    // Wait for navigation to email page
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 5: Enter email address
    console.log('📍 Step 5: Navigate to email entry page');
    await page.waitForLoadState('networkidle');
    
    // Add extra wait to ensure page is fully loaded
    await page.waitForTimeout(2000);
    
    // Wait for email page to load by checking for the heading first
    await expect(page.getByRole('heading', { name: /הכנס כתובת אימייל|Enter Email/i })).toBeVisible();
    
    // Wait for email input to be visible using a more specific selector
    const emailInput = page.getByTestId('email-input').first();
    await expect(emailInput).toBeVisible();
    
    // Enter email address
    await emailInput.fill('test@example.com');
    
    // Click continue button and wait for navigation
    const emailContinueButton = page.getByTestId('email-continue-button');
    await expect(emailContinueButton).toBeEnabled();
    console.log('✅ Step 5 complete: Entered email address');
    await emailContinueButton.click();
    
    // Wait for navigation to name page
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 6: Enter user name
    console.log('📍 Step 6: Navigate to enter name page');
    await page.waitForLoadState('networkidle');
    
    // Add extra wait to ensure page is fully loaded
    await page.waitForTimeout(2000);
    
    // Debug: Check what's on the page
    console.log('🔍 Current page URL:', page.url());
    console.log('🔍 Page title:', await page.title());
    
    // Wait for name input to be visible
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toBeVisible();
    
    // Enter user name
    await nameInput.fill('Test User');
    
    // Click continue button
    const nameContinueButton = page.getByTestId('name-continue-button');
    await expect(nameContinueButton).toBeEnabled();
    console.log('✅ Step 6 complete: Entered user name');
    await nameContinueButton.click();
    
    // Wait for name confirmation modal to appear
    const modalOverlay = page.getByTestId('modal-overlay');
    await expect(modalOverlay).toBeVisible();
    console.log('✅ Name confirmation modal appeared');
    
    // Verify modal content
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.getByTestId('name-confirmation-yes')).toBeVisible();
    await expect(page.getByTestId('name-confirmation-no')).toBeVisible();
    
    // Test clicking "No" first
    await page.getByTestId('name-confirmation-no').click();
    
    // Modal should close and we should be back on name page
    await expect(modalOverlay).not.toBeVisible();
    await expect(nameInput).toBeVisible();
    console.log('✅ Modal closed after clicking "No"');
    
    // Click continue again to show modal
    await nameContinueButton.click();
    await expect(modalOverlay).toBeVisible();
    
    // Now click "Yes" to confirm with force to bypass overlay issues
    await page.getByTestId('name-confirmation-yes').click({ force: true });
    
    // Wait a moment for the modal to close
    await page.waitForTimeout(500);
    
    // Modal should close
    await expect(modalOverlay).not.toBeVisible();
    console.log('✅ Modal closed after clicking "Yes"');
    
    console.log('🎉 E2E test completed successfully!');
  });

  test('Name confirmation modal edge cases', async ({ page }) => {
    console.log('🚀 Starting modal edge cases test');
    
    // Navigate to name entry page quickly (reuse flow)
    await page.goto('http://localhost:3000');
    
    // Quick navigation through the flow with improved waits
    await page.getByText('יצירת משחק לקבוצה שלי >>').click();
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('game-name-input').fill('Test Game');
    await page.getByTestId('game-name-continue-button').click();
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('phone-number-input').fill(TEST_PHONE_NUMBER);
    await page.getByTestId('phone-number-continue-button').click();
    await page.waitForLoadState('networkidle');
    
    // Get 2FA code and fill it (should be 123456 for test number)
    const code2FA = get2FACode(TEST_PHONE_NUMBER);
    console.log(`📱 Using 2FA code for edge case test: ${code2FA}`);
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`2fa-code-input-${i}`).fill(code2FA[i]);
    }
    await page.getByTestId('2fa-code-verify-button').click({ force: true });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.getByTestId('email-input').first().fill('test@example.com');
    await page.getByTestId('email-continue-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Now test modal edge cases
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Modal Test User');
    await page.getByTestId('name-continue-button').click();
    
    // Test 1: Click outside modal to close
    const modalOverlay = page.getByTestId('modal-overlay');
    await expect(modalOverlay).toBeVisible();
    
    // Click on the overlay background (not the modal content)
    await modalOverlay.click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(500);
    await expect(modalOverlay).not.toBeVisible();
    console.log('✅ Modal closed by clicking outside');
    
    // Test 2: Escape key to close modal
    await page.getByTestId('name-continue-button').click();
    await expect(modalOverlay).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(modalOverlay).not.toBeVisible();
    console.log('✅ Modal closed by Escape key');
    
    console.log('🎉 Modal edge cases test completed successfully!');
  });

  test('Complete user registration flow including gender selection', async ({ page }) => {
    console.log('🚀 Starting E2E test - Complete user registration flow including gender selection');
    
    // Step 1: Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the homepage by checking for the logo and create game button
    await expect(page.locator('img[alt="IceBreak Logo"]')).toBeVisible();
    
    // Wait for the "Create Game" button to be visible and enabled
    const createGameButton = page.getByTestId('create-game-button');
    await expect(createGameButton).toBeVisible();
    await expect(createGameButton).toBeEnabled();
    
    // Click the create game button
    console.log('✅ Step 1 complete: Clicking create game button');
    await createGameButton.click();
    
    // Step 2: Enter game name
    console.log('📍 Step 2: Enter game name');
    await page.waitForLoadState('networkidle');
    
    // Wait for the game name input to be visible
    const gameNameInput = page.getByTestId('game-name-input');
    await expect(gameNameInput).toBeVisible();
    
    // Enter game name
    await gameNameInput.fill('E2E Test Game with Gender');
    
    // Click continue button
    const gameNameContinueButton = page.getByTestId('game-name-continue-button');
    await expect(gameNameContinueButton).toBeEnabled();
    console.log('✅ Step 2 complete: Entered game name');
    await gameNameContinueButton.click();
    
    // Step 3: Enter phone number
    console.log('📍 Step 3: Enter phone number');
    await page.waitForLoadState('networkidle');
    
    // Wait for phone number input
    const phoneInput = page.getByTestId('phone-number-input');
    await expect(phoneInput).toBeVisible();
    
    // Enter phone number
    await phoneInput.fill(TEST_PHONE_NUMBER);
    
    // Click continue button
    const phoneContinueButton = page.getByTestId('phone-number-continue-button');
    await expect(phoneContinueButton).toBeEnabled();
    console.log('✅ Step 3 complete: Entered phone number');
    await phoneContinueButton.click();
    
    // Step 4: Enter 2FA code
    console.log('📍 Step 4: Enter 2FA code');
    await page.waitForLoadState('networkidle');
    
    // Wait for 2FA inputs
    const firstCodeInput = page.getByTestId('2fa-code-input-0');
    await expect(firstCodeInput).toBeVisible();
    
    // Get and enter the 2FA code
    const verificationCode = get2FACode(TEST_PHONE_NUMBER);
    console.log(`🔐 Using verification code: ${verificationCode}`);
    
    // Fill the code inputs
    for (let i = 0; i < 6; i++) {
      const input = page.getByTestId(`2fa-code-input-${i}`);
      await input.fill(verificationCode[i]);
    }
    
    // Click verify button
    const verifyButton = page.getByTestId('2fa-code-verify-button');
    await expect(verifyButton).toBeEnabled();
    console.log('✅ Step 4 complete: Entered 2FA code');
    await verifyButton.click();
    
    // Step 5: Enter email
    console.log('📍 Step 5: Enter email');
    await page.waitForLoadState('networkidle');
    
    // Wait for email input
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toBeVisible();
    
    // Enter email address
    await emailInput.fill('gender-test@example.com');
    
    // Click continue button
    const emailContinueButton = page.getByTestId('email-continue-button');
    await expect(emailContinueButton).toBeEnabled();
    console.log('✅ Step 5 complete: Entered email address');
    await emailContinueButton.click();
    
    // Step 6: Enter name
    console.log('📍 Step 6: Enter user name');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Wait for name input
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toBeVisible();
    
    // Enter user name
    await nameInput.fill('Gender Test User');
    
    // Click continue button
    const nameContinueButton = page.getByTestId('name-continue-button');
    await expect(nameContinueButton).toBeEnabled();
    console.log('✅ Step 6 complete: Entered user name');
    await nameContinueButton.click();
    
    // Handle name confirmation modal
    const modalOverlay = page.getByTestId('modal-overlay');
    await expect(modalOverlay).toBeVisible();
    console.log('✅ Name confirmation modal appeared');
    
    // Click "Yes" to confirm name
    await page.getByTestId('name-confirmation-yes').click();
    await page.waitForTimeout(500);
    await expect(modalOverlay).not.toBeVisible();
    console.log('✅ Name confirmed');
    
    // Step 7: Select gender
    console.log('📍 Step 7: Gender selection page');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Wait for gender selection cards to be visible
    await expect(page.locator('img[alt="Female character"]')).toBeVisible();
    await expect(page.locator('img[alt="Male character"]')).toBeVisible();
    
    // Verify the title and instructions are visible
    await expect(page.locator('text*=כמו בכל משחק טוב')).toBeVisible();
    await expect(page.locator('text*=אני (האפליקציה) מעדיפה')).toBeVisible();
    
    // Test selecting female gender
    console.log('🚺 Testing female gender selection');
    const femaleOption = page.locator('img[alt="Female character"]').locator('..');
    await femaleOption.click();
    
    // Wait for gender to be saved and navigation to complete
    await page.waitForTimeout(2000);
    
    // Step 8: Picture upload page
    console.log('📍 Step 8: Picture upload page');
    await page.waitForLoadState('networkidle');
    
    // Wait for picture upload page elements to be visible
    await expect(page.getByTestId('picture-upload-character-image')).toBeVisible();
    
    // Verify the title and subtitle are visible
    await expect(page.getByTestId('picture-upload-title')).toBeVisible();
    
    // Verify instruction text is visible
    await expect(page.getByTestId('picture-upload-instructions')).toBeVisible();
    
    // Verify camera and gallery buttons are visible
    await expect(page.getByTestId('camera-upload-button')).toBeVisible();
    await expect(page.getByTestId('gallery-upload-button')).toBeVisible();
    
    // Verify skip option is visible
    await expect(page.getByTestId('skip-picture-button')).toBeVisible();
    
    // Test camera button click (should show loading state)
    console.log('📸 Testing camera button');
    const cameraButton = page.getByTestId('camera-upload-button');
    await cameraButton.click();
    
    // Wait for loading state and then completion
    await page.waitForTimeout(1500);
    
    console.log('🎉 Picture upload page test completed successfully!');
  });
});