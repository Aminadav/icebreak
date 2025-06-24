export function getIsTesting() {
  return navigator.userAgent.includes('Headless') || 
                    navigator.userAgent.includes('Playwright');
}