/**
 * Disable testing mode on backend (restores original environment variables)
 */
export async function disableTestingMode() {
  try {
    const response = await fetch('http://localhost:4001/api/testing/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    console.log('🔄 Testing mode disabled:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to disable testing mode:', error);
    return false;
  }
}
