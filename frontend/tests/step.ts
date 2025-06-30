//@ts-ignore
import fs from 'fs'
fs.rmSync('screenshots', { recursive: true, force: true });

var index=0
/**
 * Takes a screenshot and logs the step name with an index.
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} name - The name of the step to log
 */
export async function step(page, name) {
  index++;
  console.log(index + '. ' + name);
  if (index > 15) {
    await page.screenshot({ path: `screenshots/${index}-${name}.png` });
  }
}
