export function getIsTesting() {
  return true
  return navigator.userAgent.includes('HeadlessChrome') || 
                    navigator.userAgent.includes('Playwright');
}