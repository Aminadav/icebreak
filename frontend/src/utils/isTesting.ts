export function getIsTesting() {
  return navigator.userAgent.includes('HeadlessChrome') || 
                    navigator.userAgent.includes('Playwright');
}