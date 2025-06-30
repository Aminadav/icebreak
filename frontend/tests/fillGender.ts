import { Page } from '@playwright/test';
import { step } from './step';

export async function fillGender(page: Page) {
  await step(page, "Looking for female character..");
  await page.locator('img[alt="Female character"]').locator('..').click();
  await step(page, 'After click female, show picture upload');
}
