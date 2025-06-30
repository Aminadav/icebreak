import { Page, expect } from '@playwright/test';
import { step } from './step';

export async function verifyPointsLabel(page: Page, expectedPoints: number) {
  await step(page, `Verifying points label, expected: ${expectedPoints}`);
  await expect(page.getByTestId('my-points-value')).toHaveText(expectedPoints.toString());
}
