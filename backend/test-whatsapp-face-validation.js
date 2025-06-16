const fs = require('fs');
const path = require('path');
const { validateFaceInImage } = require('./image-recognization/face-validator');

async function testWhatsAppFaceValidation() {
  console.log('🧪 Testing WhatsApp face validation...\n');

  const whatsappDir = path.join(__dirname, 'image_per_whatsapp');
  
  // Check if directory exists
  if (!fs.existsSync(whatsappDir)) {
    console.log('❌ image_per_whatsapp directory not found');
    return;
  }

  // Get all .jpg files in the directory
  const files = fs.readdirSync(whatsappDir).filter(file => file.endsWith('.jpg'));
  
  if (files.length === 0) {
    console.log('📂 No WhatsApp images found for testing');
    console.log('💡 To test, add some .jpg files to:', whatsappDir);
    return;
  }

  console.log(`📱 Found ${files.length} WhatsApp image(s) to validate:\n`);

  for (const file of files) {
    const filePath = path.join(whatsappDir, file);
    const phoneNumber = file.replace('.jpg', '');
    
    console.log(`🔍 Validating ${phoneNumber}...`);
    
    try {
      const validation = await validateFaceInImage(filePath);
      
      console.log(`📊 Results for ${phoneNumber}:`);
      console.log(`  ✓ Valid: ${validation.isValid ? '✅ YES' : '❌ NO'}`);
      console.log(`  📝 Reason: ${validation.reason}`);
      
      if (validation.faceCount !== undefined) {
        console.log(`  👥 Face count: ${validation.faceCount}`);
      }
      
      if (validation.confidence !== undefined) {
        console.log(`  🎯 Confidence: ${validation.confidence}`);
      }
      
      console.log(`  🎬 Available for user: ${validation.isValid ? '✅ YES' : '❌ NO'}`);
      console.log(''); // Empty line for spacing
      
    } catch (error) {
      console.error(`❌ Error validating ${phoneNumber}:`, error.message);
      console.log(''); // Empty line for spacing
    }
  }

  console.log('🎯 Test Summary:');
  console.log(`📱 Total images tested: ${files.length}`);
  console.log('💡 Images with validation.isValid = true will be offered to users');
  console.log('💾 All images are kept cached regardless of validation result');
}

// Run the test
testWhatsAppFaceValidation().catch(console.error);
