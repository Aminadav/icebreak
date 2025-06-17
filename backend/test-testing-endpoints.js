const axios = require('axios');

const BASE_URL = 'http://localhost:4001';

/**
 * Test the testing mode endpoints
 */
async function testTestingEndpoints() {
  console.log('🧪 Testing Backend Testing Mode Endpoints');
  console.log('==========================================');
  
  try {
    // Test 1: Get initial status
    console.log('\n1. Getting initial testing status...');
    let response = await axios.get(`${BASE_URL}/api/testing/status`);
    console.log('✅ Initial status:', response.data);
    
    // Test 2: Start testing mode
    console.log('\n2. Starting testing mode...');
    response = await axios.post(`${BASE_URL}/api/testing/start`);
    console.log('✅ Start testing response:', response.data);
    
    // Test 3: Check status after start
    console.log('\n3. Checking status after starting testing mode...');
    response = await axios.get(`${BASE_URL}/api/testing/status`);
    console.log('✅ Status after start:', response.data);
    
    // Verify environment variables are set
    if (response.data.mockSms === 'true' && response.data.mockGenerate === 'true') {
      console.log('✅ Mock variables correctly set to true');
    } else {
      console.log('❌ Mock variables not set correctly');
    }
    
    // Test 4: End testing mode
    console.log('\n4. Ending testing mode...');
    response = await axios.post(`${BASE_URL}/api/testing/end`);
    console.log('✅ End testing response:', response.data);
    
    // Test 5: Check final status
    console.log('\n5. Checking final status...');
    response = await axios.get(`${BASE_URL}/api/testing/status`);
    console.log('✅ Final status:', response.data);
    
    console.log('\n🎉 All testing endpoint tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 4001');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the test
testTestingEndpoints();
