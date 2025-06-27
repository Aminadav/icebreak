/**
 * Enable testing mode on backend (sets MOCK_SMS and MOCK_GENERATE to true)
 */
export async function enableTestingMode() {
  try {
    const response = await fetch('http://localhost:4001/api/testing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    console.log('🧪 Testing mode enabled:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to enable testing mode:', error);
    return false;
  }
}
