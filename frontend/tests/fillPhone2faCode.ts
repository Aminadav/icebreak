import { Page } from '@playwright/test';
import { step } from './step';
import { get2FACode } from './test-utils';

export async function fillPhone2faCode(page: Page, phoneNumber: string) {
  await step(page, 'Filling phone number');
  await page.getByTestId('phone-number-input').fill(phoneNumber);
  await step(page, 'clicking CONTINUE button');
  await page.getByTestId('phone-number-continue-button').click();

  // Step 4: Enter 2FA code
  // await delay(DEFAULT_DELAY);
  await step(page, 'after click CONTINUE before fill 2fa code');

  // Get and enter the 2FA code
  const verificationCode = get2FACode(phoneNumber);
  for (let i = 0; i < 6; i++) {
    await page.getByTestId(`2fa-code-input-${i}`).fill(verificationCode[i]);
  }
}
