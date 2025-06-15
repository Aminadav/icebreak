/**
 * Test utilities for E2E tests
 * This file contains helper functions to interact with the Icebreak backend for testing
 */

import crypto from 'crypto';

const SMS_SECRET = process.env.SMS_SECRET || 'icebreak-secret-key-2025';

/**
 * Format phone number to international format (matching backend logic)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('972')) {
    cleaned = '972' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generate verification code for a phone number (matching backend logic)
 */
export function generateVerificationCode(phoneNumber: string): string {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const dataToHash = `${formattedPhone}${SMS_SECRET}${currentHour}`;
  
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  
  const code = hash.substring(0, 6).replace(/[a-f]/g, (match) => {
    return String(match.charCodeAt(0) % 10);
  });
  
  return code.padStart(6, '0').substring(0, 6);
}

/**
 * Get the current valid 2FA code for a phone number
 */
export function get2FACode(phoneNumber: string): string {
  return generateVerificationCode(phoneNumber);
}

/**
 * Wait for a specific time with console logging
 */
export async function waitWithLog(milliseconds: number, message: string): Promise<void> {
  console.log(`⏳ ${message} (waiting ${milliseconds}ms)`);
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Test data generators
 */
export const TestData = {
  gameNames: [
    'E2E Test Game',
    'Playwright Test',
    'Automated Test Game',
    'Integration Test',
    'Test Game Session'
  ],
  
  generateGameName(): string {
    const base = this.gameNames[Math.floor(Math.random() * this.gameNames.length)];
    const timestamp = new Date().toISOString().slice(11, 19).replace(/:/g, '');
    return `${base} ${timestamp}`;
  },
  
  generateEmail(): string {
    const timestamp = Date.now();
    return `e2e.test.${timestamp}@playwright.test`;
  },
  
  testPhoneNumber: '0523737233',
  
  get formattedTestPhone(): string {
    return formatPhoneNumber(this.testPhoneNumber);
  }
};

/**
 * Page interaction helpers
 */
export const PageHelpers = {
  /**
   * Wait for page to be fully loaded including socket connections
   */
  async waitForPageReady(page: any): Promise<void> {
    await page.waitForLoadState('networkidle');
    // Additional wait for socket connection
    await page.waitForTimeout(1000);
  },
  
  /**
   * Find button by text content (supports Hebrew and English)
   */
  async findButtonByText(page: any, texts: string[]): Promise<any> {
    for (const text of texts) {
      const button = page.getByRole('button').filter({ hasText: new RegExp(text, 'i') });
      if (await button.count() > 0) {
        return button.first();
      }
    }
    throw new Error(`Button not found with any of these texts: ${texts.join(', ')}`);
  },
  
  /**
   * Find heading by text content (supports Hebrew and English)
   */
  async findHeadingByText(page: any, texts: string[]): Promise<any> {
    for (const text of texts) {
      const heading = page.locator('h1, h2, h3').filter({ hasText: new RegExp(text, 'i') });
      if (await heading.count() > 0) {
        return heading.first();
      }
    }
    throw new Error(`Heading not found with any of these texts: ${texts.join(', ')}`);
  }
};

/**
 * Backend interaction helpers for E2E testing
 */
export const BackendHelpers = {
  /**
   * Call the backend test-2fa script to get the current valid code
   */
  async getCurrentValidCode(phoneNumber: string): Promise<string> {
    // For now, use the local generation function
    // In a more sophisticated setup, you might make an HTTP call to a test endpoint
    return generateVerificationCode(phoneNumber);
  }
};
