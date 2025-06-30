import { expect, Page } from '@playwright/test';
import { step } from './step';
import { get2FACode } from './test-utils';
import { delay } from './delay';
import { fillPhone2faCode } from './fillPhone2faCode';
import { fillEmail } from './fillEmail';
import { fillName } from './fillName';
import { fillGender } from './fillGender';
import { cameraAndGallerySteps } from './cameraAndGallerySteps';
const DEFAULT_DELAY = 100
const TEST_PHONE_NUMBER_2 = (new Date().valueOf() + 1).toString();
const TEST_EMAIL_2 = 'test2@user.com'
const TEST_NAME_2 = 'שרה לוי';

export async function startUser2(page: Page,{gameUrl}) {

  
        // === START USER 2 FLOW ===
        await step(page, '=== STARTING USER 2 FLOW ===');
  
        // Clear localStorage to simulate new device
        await page.evaluate(() => localStorage.clear());
        await step(page, 'Cleared localStorage for User 2');
  
        // Navigate to same game URL as new user
        await page.goto(gameUrl);
        await page.waitForLoadState('networkidle');
        await step(page, 'User 2 joined game - should see welcome screen');
  
        // Step: Join Game Welcome
        await step(page, 'User 2 - Join Game Welcome screen');
        await page.getByTestId('join_game_welcome_continue').click();
        // await delay(DEFAULT_DELAY);
  
        await fillPhone2faCode(page, TEST_PHONE_NUMBER_2);
  
        // Step: Answer 2 questions about others first (non-creator flow)
        for (let questionNumber = 1; questionNumber <= 2; questionNumber++) {
          await step(page, `User 2 - Question about others ${questionNumber}`);
  
          // Check if we have a question
          const questionExists = await page.locator('h1').first().isVisible() || await page.getByTestId('question-text').isVisible();
          if (!questionExists) {
            await step(page, `User 2 - No question found, checking current page state`);
            continue;
          }
  
          // Look for answer options using test IDs (trackingId becomes data-testid)
          const hasAnswerOptions = await page.locator('[data-testid^="answer-option-"]').count() > 0;
          const freeformInput = page.getByTestId('question-freeform-input');
  
          if (await freeformInput.isVisible()) {
            await step(page, `User 2 - Filling freeform answer for question ${questionNumber}`);
            await freeformInput.fill(`User 2 answer about others ${questionNumber}`);
          } else if (hasAnswerOptions) {
            await step(page, `User 2 - Clicking first answer option for question ${questionNumber}`);
            await page.locator('[data-testid^="answer-option-"]').first().click();
            await delay(DEFAULT_DELAY);
          } else {
            await step(page, `User 2 - No answer options found for question ${questionNumber}`);
            continue;
          }
  
          // Submit answer using proper test ID
          await step(page, `User 2 - Submitting answer for question ${questionNumber}`);
          await page.getByTestId('question-submit-button').click();
          await delay(DEFAULT_DELAY);
  
          // Handle ANSWER_FEEDBACK page (correct/incorrect feedback)
          await step(page, `User 2 - Answer feedback page for question ${questionNumber}`);
          const feedbackVisible = await page.getByTestId('answer-feedback-continue-button').isVisible({ timeout: 3000 });
          if (feedbackVisible) {
            await step(page, `User 2 - Got answer feedback, clicking continue`);
            await page.getByTestId('answer-feedback-continue-button').click();
            await delay(DEFAULT_DELAY);
          } else {
            await step(page, `User 2 - No answer feedback page, checking for points page`);
          }
  
          // Handle points page - User 2 always gets points after answering about others
          const gotPointsVisible = await page.getByTestId('got-points-title').isVisible({ timeout: 3000 });
          if (gotPointsVisible) {
            await step(page, `User 2 - Got points page after question ${questionNumber}`);
            // Don't check specific points value as it depends on correct/incorrect answers
            await page.getByTestId('got-points-continue-button').click();
            await delay(DEFAULT_DELAY);
          }
  
          // Check for badge after each question (User 2 gets badge only with 20+ points total)
          const badgePageVisible = await page.locator('text=כל הכבוד! עלית בדרגה!').isVisible({ timeout: 3000 });
          if (badgePageVisible) {
            await step(page, `User 2 - Got badge after question ${questionNumber} (correct answer, reached 20+ points)`);
            await expect(page.getByRole('heading', { name: 'שוברי קרחים' })).toBeVisible();
            await page.locator('button', { hasText: 'המשך' }).click();
            await delay(DEFAULT_DELAY);
          } else {
            await step(page, `User 2 - No badge after question ${questionNumber} (insufficient points or incorrect answer)`);
          }
        }
  
        // User 2 might need to answer more questions before profile setup
        // Keep answering questions until we reach profile setup (email page) or no more questions
        let maxQuestions = 10; // Safety limit
        let currentQuestion = 3;
  
        while (maxQuestions > 0) {
          maxQuestions--;
  
          // Check if we're on email page or question page
          const emailInputVisible = await page.getByTestId('email-input').isVisible({ timeout: 1000 });
          const questionVisible = await page.locator('h1').first().isVisible({ timeout: 1000 });
  
          if (emailInputVisible) {
            await step(page, 'User 2 - Reached email page');
            break;
          }
  
          if (!questionVisible) {
            await step(page, 'User 2 - No more questions or email page, current state unknown');
            break;
          }
  
          await step(page, `User 2 - Continuing with question ${currentQuestion}`);
          currentQuestion++;
  
          // Answer the question using test IDs
          const hasAnswerOptions = await page.locator('[data-testid^="answer-option-"]').count() > 0;
          const freeformInput = page.getByTestId('question-freeform-input');
  
          if (await freeformInput.isVisible()) {
            await step(page, `User 2 - Filling freeform answer for question ${currentQuestion - 1}`);
            await freeformInput.fill(`User 2 continuing answer ${currentQuestion - 1}`);
          } else if (hasAnswerOptions) {
            await step(page, `User 2 - Clicking first answer option for question ${currentQuestion - 1}`);
            await page.locator('[data-testid^="answer-option-"]').first().click();
            await delay(DEFAULT_DELAY);
          } else {
            await step(page, `User 2 - No answer options found for question ${currentQuestion - 1}`);
            break;
          }
  
          // Submit answer
          await page.getByTestId('question-submit-button').click();
          await delay(DEFAULT_DELAY);
  
          // Handle ANSWER_FEEDBACK page if it appears
          const feedbackVisible = await page.getByTestId('answer-feedback-continue-button').isVisible({ timeout: 2000 });
          if (feedbackVisible) {
            await step(page, `User 2 - Got answer feedback for question ${currentQuestion - 1}`);
            await page.getByTestId('answer-feedback-continue-button').click();
            await delay(DEFAULT_DELAY);
          }
  
          // Handle points page
          const gotPointsTitle = page.getByTestId('got-points-title');
          if (await gotPointsTitle.isVisible({ timeout: 3000 })) {
            await step(page, `User 2 - Got points page after question ${currentQuestion - 1}`);
            await page.getByTestId('got-points-continue-button').click();
            await delay(DEFAULT_DELAY);
          }
  
          // Check for badges (only if enough points accumulated)
          const badgePageVisible = await page.locator('text=כל הכבוד! עלית בדרגה!').isVisible({ timeout: 2000 });
          if (badgePageVisible) {
            await step(page, `User 2 - Got badge after question ${currentQuestion - 1} (reached 20+ points)`);
            await expect(page.getByRole('heading', { name: 'שוברי קרחים' })).toBeVisible();
            await page.locator('button', { hasText: 'המשך' }).click();
            await delay(DEFAULT_DELAY);
          }
        }
  
        await fillEmail(page,TEST_EMAIL_2)
  
        await fillName(page,TEST_NAME_2)
        
        await fillGender(page);
  
        await cameraAndGallerySteps(page);
  
        // Step: User 2 answers 1 question about self and 1 about others
        await step(page, 'User 2 - Answer question about self');
  
        await expect(page.getByTestId('question-text')).toBeVisible();
  
        const freeformInput3 = page.getByTestId('question-freeform-input');
        if (await freeformInput3.isVisible()) {
          await freeformInput3.fill('User 2 answer about self');
        } else {
          await page.locator('[data-testid^="answer-option-"]').first().click();
          await delay(DEFAULT_DELAY);
        }
  
        await page.getByTestId('question-submit-button').click({ force: true });
        // await delay(DEFAULT_DELAY);
  
        await expect(page.getByTestId('got-points-title')).toBeVisible();
        await page.getByTestId('got-points-continue-button').click();
        await delay(DEFAULT_DELAY);
  
        // User 2 answers question about others
        await step(page, 'User 2 - Answer question about others');
  
        await expect(page.getByTestId('question-text')).toBeVisible();
        await expect(page.getByTestId('about-user-name')).toBeVisible();
  
        const freeformInput4 = page.getByTestId('question-freeform-input');
        if (await freeformInput4.isVisible()) {
          await freeformInput4.fill('User 2 answer about others again');
        } else {
          await page.locator('[data-testid^="answer-option-"]').first().click();
          await delay(DEFAULT_DELAY);
        }
  
        await page.getByTestId('question-submit-button').click({ force: true });
        await delay(DEFAULT_DELAY);
  
        await expect(page.getByTestId('got-points-title')).toBeVisible();
        await page.getByTestId('got-points-continue-button').click();
        await delay(DEFAULT_DELAY);
  
        await step(page, 'User 2 flow completed successfully!');
  
}
