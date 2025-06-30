import { Page, expect } from '@playwright/test';
import { LONG_DELAY } from './e2e-flow.spec';
import { delay } from './delay';
import { step } from './step';

export async function cameraAndGallerySteps(page: Page) {
  // Step 8: Picture upload page
  await step(page, 'Picture upload page');
  await expect(page.getByTestId('picture-upload-character-image')).toBeVisible();

  await page.getByTestId('camera-upload-button').click();
  await step(page, 'Camera page loaded, wait for face detection and capture');
  // Wait for camera and capture
  await page.getByTestId('camera-capture-button').click();
  // Step 12: Image gallery processing
  await step(page, 'After capture, wait for navigation to gallery');
  await delay(LONG_DELAY);
  await step(page, 'Image gallery page with processing modal');
  // Step 13: Click first image and choose it
  await step(page, 'Looking for gallery images');
  const firstImageContainer = page.locator('div[class*="cursor-pointer"][class*="aspect-square"]').first();
  await firstImageContainer.waitFor({ state: 'visible' });
  await firstImageContainer.click();
  await step(page, 'after click first image, pbefore click ok');
  await page.getByTestId('choose-image-button').click();
}
