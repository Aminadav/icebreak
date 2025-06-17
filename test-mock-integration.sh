#!/bin/bash

echo "🧪 Testing Mock Environment Variables Integration"
echo "================================================"

# Test 1: Start testing mode via API
echo ""
echo "1. Starting testing mode via API..."
curl -s -X POST http://localhost:4001/api/testing/start | jq '.'

# Test 2: Check that environment variables are set
echo ""
echo "2. Testing SMS functionality..."
cd backend
node -e "
const { sendVerificationCode } = require('./utils/smsService');
sendVerificationCode('972523737233').then(result => {
  console.log('SMS Test Result:');
  console.log('  Success:', result.success);
  console.log('  Test Number:', result.smsResponse?.isTestNumber || false);
  console.log('  Phone:', result.phoneNumber);
}).catch(console.error);
"

# Test 3: End testing mode via API
echo ""
echo "3. Ending testing mode via API..."
curl -s -X POST http://localhost:4001/api/testing/end | jq '.'

echo ""
echo "4. Final status check..."
curl -s http://localhost:4001/api/testing/status | jq '.'

echo ""
echo "✅ Integration test completed!"
echo ""
echo "💡 To run E2E tests with mock mode:"
echo "   cd frontend && npm run test:e2e"
