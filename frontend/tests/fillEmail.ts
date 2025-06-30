import { Page } from '@playwright/test';
import { step } from './step';

export async function fillEmail(page: Page, email: string) {
  await step(page, 'Fill email');
  await page.getByTestId('email-input').fill(email);
  await step(page, 'after fill email, before click CONTINUE button');
  await page.getByTestId('email-continue-button').click();
}
