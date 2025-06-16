import { test, expect } from '@playwright/test';
import { get2FACode } from './test-utils';
var DEFAULT_DELAY=200
/**
 * End-to-End Test for Icebreak App User Registration Flow
 * 
 * This comprehensive test covers the complete user journey:
 * 1. HomePage - Click "Start a new game"
 * 2. GiveGameNamePage - Enter game name
 * 3. EnterPhoneNumberPage - Enter phone number (972523737233)
 * 4. Enter2faCodePage - Enter 2FA code (123456)
 * 5. EnterEmailPage - Enter email address
 * 6. EnterNamePage - Enter user name and test modal edge cases
 * 7. GenderSelectionPage - Select gender
 * 8. PictureUploadPage - Test picture upload interface
 */

const TEST_PHONE_NUMBER = '972523737233';

test.describe('Icebreak App E2E Flow', () => {
  test('Complete user registration flow with modal testing and gender selection', async ({ page }) => {
    console.log('🚀 Starting comprehensive E2E test - Complete user registration flow');
    
    // Step 1: Navigate to homepage
    step(page,'before main navigation');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
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
    await expect(verifyButton).toBeVisible();
    await expect(verifyButton).toBeEnabled();
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
    await nameInput.fill('Gender Test User');
    
    // Click continue button
    await step(page,'after fill name, before click CONTINUE button');
    let nameContinueButton = page.getByTestId('name-continue-button');
    await expect(nameContinueButton).toBeEnabled();
    await nameContinueButton.click();
    await delay(DEFAULT_DELAY)
    await step(page,'after click CONTINUE button on name screen 1st time');
    
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
    
    await step(page,'Done!');
  });
});


import fs from 'fs';
fs.rmSync('screenshots', { recursive: true, force: true });
let index=0
async function step(page,name) {
  index++
  console.log(index + '. ' + name)
  await page.screenshot({ path: `screenshots/${index}-${name}.png` });
}

function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms))}