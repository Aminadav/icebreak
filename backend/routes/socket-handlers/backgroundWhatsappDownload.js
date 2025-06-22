const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getUserIdFromDevice } = require('./utils');
const { validateFaceInImage } = require('../../image-recognization/face-validator');

async function handleBackgroundWhatsappDownload(socket, data) {
  try {
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);

    if (!targetUserId) {
      console.log('❌ Background WhatsApp download: User not authenticated');
      socket.emit('background_whatsapp_status', {
        success: false,
        available: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Get user data from database
    const userResult = await pool.query(
      'SELECT phone_number FROM users WHERE user_id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Background WhatsApp download: User not found');
      socket.emit('background_whatsapp_status', {
        success: false,
        available: false,
        message: 'User not found'
      });
      return;
    }

    const { phone_number: phoneNumber } = userResult.rows[0];

    if (!phoneNumber) {
      console.log('❌ Background WhatsApp download: Phone number not found');
      socket.emit('background_whatsapp_status', {
        success: false,
        available: false,
        message: 'Phone number not found'
      });
      return;
    }

    console.log(`🔄 Starting background WhatsApp download for user ${targetUserId} with phone: ${phoneNumber}`);

    // Create image_per_whatsapp directory if it doesn't exist
    const whatsappDir = path.join(__dirname, '..', '..', 'image_per_whatsapp');
    if (!fs.existsSync(whatsappDir)) {
      fs.mkdirSync(whatsappDir, { recursive: true });
      console.log(`📁 Created directory: ${whatsappDir}`);
    }

    // Check if we already have a cached image for this phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const filename = `${cleanPhone}.jpg`;
    const filePath = path.join(whatsappDir, filename);

    // If file already exists and is recent (less than 1 hour old), use it
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const ageInMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
      
      if (ageInMinutes < 60) { // Use cached image if less than 1 hour old
        console.log(`🔍 Validating cached WhatsApp image for ${cleanPhone}...`);
        
        // Validate the cached image
        const faceValidation = await validateFaceInImage(filePath);
        
        if (faceValidation.isValid) {
          console.log(`✅ Using cached WhatsApp image for ${cleanPhone} (${Math.round(ageInMinutes)} minutes old) - validation passed`);
          socket.emit('background_whatsapp_status', {
            success: true,
            available: true,
            message: 'WhatsApp image available (cached and validated)',
            phoneNumber: cleanPhone,
            validationDetails: faceValidation
          });
          return;
        } else {
          console.log(`❌ Cached image failed validation: ${faceValidation.reason} - keeping cached but not offering to user`);
          socket.emit('background_whatsapp_status', {
            success: true, // Image exists and was downloaded successfully
            available: false, // But not available for user due to validation
            message: `WhatsApp image cached but not suitable: ${faceValidation.reason}`,
            validationDetails: faceValidation
          });
          return;
        }
      } else {
        console.log(`🗑️ Cached image for ${cleanPhone} is too old (${Math.round(ageInMinutes)} minutes), re-downloading`);
        // Delete old cached file
        fs.unlinkSync(filePath);
      }
    }

    // Format phone number for WhatsApp API (remove + and any formatting)
    console.log(`📞 Calling WhatsApp API for phone: ${cleanPhone}`);

    const whatsappResponse = await axios.get('https://whatsapp-data.p.rapidapi.com/wspicture', {
      params: {
        phone: cleanPhone
      },
      headers: {
        'x-rapidapi-host': 'whatsapp-data.p.rapidapi.com',
        'x-rapidapi-key': '8c92a65832msh8a1a51fce8ef6dfp1c45f9jsn94bae0b487c7'
      },
      timeout: 15000 // 15 second timeout for background operation
    });

    const imageUrl = whatsappResponse.data;

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error('No valid WhatsApp profile picture found for this phone number');
    }

    console.log(`🖼️ Found WhatsApp image URL: ${imageUrl}`);

    // Download the image from WhatsApp
    console.log(`⬇️ Downloading image from WhatsApp...`);

    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Write image file with phone number as filename
    fs.writeFileSync(filePath, Buffer.from(imageResponse.data));

    console.log(`💾 WhatsApp image cached to: ${filePath}`);

    // Validate the face in the downloaded image
    console.log(`👁️ Validating face in WhatsApp image...`);
    const faceValidation = await validateFaceInImage(filePath);
    
    console.log(`🔍 Face validation result:`, faceValidation);

    if (!faceValidation.isValid) {
      console.log(`❌ WhatsApp image failed face validation: ${faceValidation.reason} - keeping cached but not offering to user`);
      
      // Keep the image cached but don't make it available to user
      socket.emit('background_whatsapp_status', {
        success: true, // Download was successful
        available: false, // But not available for user due to validation
        message: `WhatsApp image cached but not suitable for use: ${faceValidation.reason}`,
        validationDetails: faceValidation
      });
      return;
    }

    console.log(`✅ WhatsApp image passed face validation - suitable for use`);

    socket.emit('background_whatsapp_status', {
      success: true,
      available: true,
      message: 'WhatsApp image downloaded, validated, and ready to use',
      phoneNumber: cleanPhone,
      validationDetails: faceValidation
    });

    console.log(`✅ Background WhatsApp download completed for user ${targetUserId}: ${cleanPhone}`);

  } catch (error) {
    console.error('Error in background WhatsApp download:', error);

    let errorMessage = 'Failed to download WhatsApp image in background';

    // Provide more specific error messages but don't show to user
    if (error.response?.status === 404) {
      errorMessage = 'No WhatsApp profile picture found';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many requests';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
    }

    socket.emit('background_whatsapp_status', {
      success: false,
      available: false,
      message: errorMessage
    });
  }
}

function registerBackgroundWhatsappDownloadHandler(socket) {
  socket.on('background_whatsapp_download', (data) => handleBackgroundWhatsappDownload(socket, data));
}

module.exports = {
  registerBackgroundWhatsappDownloadHandler,
  handleBackgroundWhatsappDownload // Keep for backward compatibility if needed
};
