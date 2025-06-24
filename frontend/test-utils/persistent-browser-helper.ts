import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { checkPersistentBrowser, clearAppStorage } from '../persistent-browser.js';

/**
 * Gets a browser instance - either connects to persistent browser or creates a new one
 */
export async function getBrowserAndContext(): Promise<{ browser: Browser; context: BrowserContext; page: Page; isPersistent: boolean }> {
  // First try to connect to persistent browser
  const persistentResult = await checkPersistentBrowser();
  
  if (persistentResult) {
    console.log('🔄 Using persistent browser');
    
    // Close extra tabs from previous test runs (keep first tab to maintain window position)
    const existingPages = persistentResult.context.pages();
    console.log(`🧹 Found ${existingPages.length} existing tabs - keeping first tab, closing ${existingPages.length - 1} extra tabs`);
    
    let page;
    if (existingPages.length > 1) {
      // Close all tabs except the first one
      for (let i = 1; i < existingPages.length; i++) {
        try {
          await existingPages[i].close();
        } catch (error) {
          console.log('⚠️ Failed to close tab:', error.message);
        }
      }
      // Use the first existing page
      page = existingPages[0];
    } else if (existingPages.length === 1) {
      // Use the existing page
      page = existingPages[0];
    } else {
      // Create a new page if none exist
      page = await persistentResult.context.newPage();
    }
    
    // Clear app storage on the persistent browser
    await clearAppStorage(page);
    
    return {
      browser: persistentResult.browser,
      context: persistentResult.context,
      page,
      isPersistent: true
    };
  }
  
  console.log('🆕 Creating new browser instance');
  // Fallback to creating a new browser
  const browser = await chromium.launch({
    headless: false, // Use headed mode for better debugging
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    permissions: ['camera'],
    viewport: { width: 390, height: 844 }, // Mobile viewport like Pixel 5
    userAgent: 'Mozilla/5.0 (Linux; Android 9; Pixel 5 Build/QD1A.190821.014.C2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36',
    recordVideo: {
      dir: './test-results/videos/',
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  
  return {
    browser,
    context,
    page,
    isPersistent: false
  };
}

/**
 * Cleanup function that closes tabs/browser appropriately
 */
export async function cleanupBrowser(browser: Browser, isPersistent: boolean, page?: Page) {
  if (!isPersistent) {
    console.log('🧹 Closing non-persistent browser');
    await browser.close();
  } else {
    console.log('♻️ Keeping persistent browser and tab open for next test');
    // Don't close the tab in persistent mode - keep it for window positioning
  }
}
