import { Page } from '@playwright/test';
import { step } from './step';

export async function fillName(page: Page, name: string) {
  await step(page, 'Filling name');
  await page.getByTestId('name-input').fill(name);
  await step(page, 'after fill name, before click CONTINUE button');

  let nameContinueButton = page.getByTestId('name-continue-button');
  await nameContinueButton.click();
  await page.getByTestId('name-confirmation-yes').click();
  await step(page, 'After clicking YES to confirm name');
}
