import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/IceBreak/);
});
