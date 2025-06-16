const { validateFaceInImage } = require('./image-recognization/face-validator');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadWhatsAppImage(phoneNumber) {
  try {
    // Format phone number (remove + and any formatting)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Ensure image_per_whatsapp directory exists
    const whatsappDir = path.join(__dirname, 'image_per_whatsapp');
    if (!fs.existsSync(whatsappDir)) {
      fs.mkdirSync(whatsappDir, { recursive: true });
    }

    // Check if we already have a cached image for this phone number
    const filename = `${cleanPhone}.jpg`;
    const filePath = path.join(whatsappDir, filename);

    // If file already exists and is recent (less than 1 hour old), use it
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const ageInMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
      
      if (ageInMinutes < 60) { // Use cached image if less than 1 hour old
        console.log(`💾 Using cached WhatsApp image for ${cleanPhone} (${Math.round(ageInMinutes)} minutes old)`);
        return filePath;
      } else {
        console.log(`🗑️ Cached image for ${cleanPhone} is too old (${Math.round(ageInMinutes)} minutes), downloading fresh copy`);
        // Delete old cached file
        fs.unlinkSync(filePath);
      }
    }

    console.log(`📞 Downloading WhatsApp image for phone: ${phoneNumber}`);
    
    // Call WhatsApp API to get profile picture URL
    const whatsappResponse = await axios.get('https://whatsapp-data.p.rapidapi.com/wspicture', {
      params: {
        phone: cleanPhone
      },
      headers: {
        'x-rapidapi-host': 'whatsapp-data.p.rapidapi.com',
        'x-rapidapi-key': '8c92a65832msh8a1a51fce8ef6dfp1c45f9jsn94bae0b487c7'
      },
      timeout: 30000
    });

    const imageUrl = whatsappResponse.data;

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error('No valid WhatsApp profile picture found for this phone number');
    }

    console.log(`🖼️ Found WhatsApp image URL: ${imageUrl}`);

    // Download the image from WhatsApp
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Save image with phone number as filename
    fs.writeFileSync(filePath, Buffer.from(imageResponse.data));

    console.log(`💾 WhatsApp image downloaded and saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error downloading WhatsApp image:', error.message);
    throw error;
  }
}

async function test() {
  console.log('🧪 Starting WhatsApp Image Download & Face Validation Test\n');
  
  // Test with a phone number (you can change this)
  const phoneNumber = '+972523737233';
  
  try {
    // First, try to download the WhatsApp image
    console.log('📱 Step 1: Downloading/Loading WhatsApp image...');
    const imagePath = await downloadWhatsAppImage(phoneNumber);
    
    // Show file info
    const stats = fs.statSync(imagePath);
    const ageInMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
    console.log(`📄 File info: ${path.basename(imagePath)} (${Math.round(ageInMinutes)} minutes old, ${Math.round(stats.size / 1024)} KB)`);
    
    console.log('\n👁️ Step 2: Validating face in image...');
    const result = await validateFaceInImage(imagePath);
    
    console.log('\n📊 Face Validation Results:');
    console.log('==============================');
    console.log(`✓ Valid for use: ${result.isValid ? '✅ YES' : '❌ NO'}`);
    console.log(`📝 Reason: ${result.reason}`);
    
    if (result.faceCount !== undefined) {
      console.log(`👥 Face count: ${result.faceCount}`);
    }
    
    if (result.confidence !== undefined) {
      console.log(`🎯 Confidence: ${result.confidence}`);
    }
    
    if (result.quality !== undefined) {
      console.log(`🌟 Quality: ${result.quality}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

async function testMultipleNumbers() {
  console.log('🧪 Testing Multiple WhatsApp Numbers for Face Validation\n');
  
  // Test with multiple phone numbers
  const phoneNumbers = [
    '+972523737233', // Aminadav
    '+972526306091',   // Ilan
    '+972 54-652-2670',  // Yoni Bazak,
    '+972 58-611-2000', // umala haaretz dea
  ];
  
  for (const phoneNumber of phoneNumbers) {
    console.log(`\n📱 Testing ${phoneNumber}:`);
    console.log('='.repeat(50));
    
    try {
      const imagePath = await downloadWhatsAppImage(phoneNumber);
      const result = await validateFaceInImage(imagePath);
      
      console.log(`✓ Download: ✅ SUCCESS`);
      console.log(`✓ Valid face: ${result.isValid ? '✅ YES' : '❌ NO'}`);
      console.log(`📝 Reason: ${result.reason}`);
      console.log(`🎬 Button shown: ${result.isValid ? '✅ YES' : '❌ NO'}`);
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

// Uncomment the line below to test multiple numbers instead
// testMultipleNumbers();

testMultipleNumbers();
