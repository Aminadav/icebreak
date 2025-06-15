import { test, expect } from '@playwright/test';

/**
 * End-to-End Test for Icebreak App User Registration Flow
 * 
 * This test covers the complete user journey:
 * 1. HomePage - Click "Start a new game"
 * 2. GiveGameNamePage - Enter game name
 * 3. EnterPhoneNumberPage - Enter phone number (0523737233)
 * 4. Enter2faCodePage - Enter 2FA code
 * 5. EnterEmailPage - Enter email addresses
 */

const TEST_PHONE_NUMBER = '0523737233';

// Temporary hardcoded function for 2FA code generation
function get2FACode(phoneNumber: string): string {
  // For testing, return a predictable code based on phone number
  return '792889';
}

test.describe('Icebreak App E2E Flow', () => {
  test('Complete user registration flow from homepage to email entry', async ({ page }) => {
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
    console.log(`📱 Using 2FA code: ${validCode}`);
    
    // Enter each digit of the 2FA code
    const codeDigits = validCode.split('');
    for (let i = 0; i < codeDigits.length; i++) {
      const digitInput = page.getByTestId(`2fa-code-input-${i}`);
      await expect(digitInput).toBeVisible();
      await digitInput.fill(codeDigits[i]);
    }
    
    // Click verify button
    const verifyButton = page.getByTestId('2fa-code-verify-button');
    await expect(verifyButton).toBeEnabled();
    console.log('✅ Step 4 complete: Entered 2FA code');
    await verifyButton.click();
    
    // Step 5: Enter email addresses
    console.log('📍 Step 5: Navigate to email entry page');
    await page.waitForLoadState('networkidle');
    
    // Wait for email inputs to be visible with increased timeout
    // Handle all email inputs with the same test ID
    const emailInputs = page.getByTestId('email-input');
    await expect(emailInputs.first()).toBeVisible({ timeout: 10000 });
    
    // Get count of email inputs and fill all of them
    const emailCount = await emailInputs.count();
    console.log(`Found ${emailCount} email input(s)`);
    
    for (let i = 0; i < emailCount; i++) {
      const emailInput = emailInputs.nth(i);
      await expect(emailInput).toBeVisible();
      await emailInput.fill(`test${i + 1}@example.com`);
      console.log(`✅ Filled email input ${i + 1}: test${i + 1}@example.com`);
    }
    
    // Click continue button - handle all continue buttons
    const emailContinueButtons = page.getByTestId('email-continue-button');
    const continueButtonCount = await emailContinueButtons.count();
    console.log(`Found ${continueButtonCount} continue button(s)`);
    
    // Click the first enabled continue button
    for (let i = 0; i < continueButtonCount; i++) {
      const continueButton = emailContinueButtons.nth(i);
      const isVisible = await continueButton.isVisible();
      const isEnabled = await continueButton.isEnabled();
      
      if (isVisible && isEnabled) {
        console.log(`✅ Step 5 complete: Clicked continue button ${i + 1}`);
        await continueButton.click();
        break;
      }
    }
    
    console.log('🎉 E2E test completed successfully!');
  });
});