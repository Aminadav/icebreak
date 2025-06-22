const Device = require('../../models/Device');
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { getUserIdFromDevice } = require('./utils');
const moveUserToGameState = require('./moveUserToGameState');

async function handleDownloadWhatsappImage(socket, data) {
  try {
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);
    
    if (!targetUserId) {
      throw new Error('User not authenticated. Please complete phone verification first.');
    }
    
    // Get user data from database
    const userResult = await pool.query(
      'SELECT phone_number, email, name, gender FROM users WHERE user_id = $1',
      [targetUserId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found in database');
    }
    
    const { phone_number: phoneNumber, email, name, gender } = userResult.rows[0];
    
    if (!phoneNumber) {
      throw new Error('Phone number not found in user profile');
    }
    
    console.log(`📱 Starting WhatsApp image download for user ${targetUserId} with phone: ${phoneNumber}`);
    
    // Format phone number for WhatsApp API (remove + and any formatting)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Call WhatsApp API to get profile picture URL
    console.log(`📞 Calling WhatsApp API for phone: ${cleanPhone}`);
    
    const whatsappResponse = await axios.get('https://whatsapp-data.p.rapidapi.com/wspicture', {
      params: {
        phone: cleanPhone
      },
      headers: {
        'x-rapidapi-host': 'whatsapp-data.p.rapidapi.com',
        'x-rapidapi-key': '8c92a65832msh8a1a51fce8ef6dfp1c45f9jsn94bae0b487c7'
      },
      timeout: 30000 // 30 second timeout
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
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Create unique filename with timestamp and user ID
    const timestamp = Date.now();
    const imageHash = crypto
      .createHash('md5')
      .update(`${targetUserId}-whatsapp-${timestamp}`)
      .digest('hex');
    
    const filename = `${imageHash}.jpg`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Write image file
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
    
    console.log(`💾 WhatsApp image saved to: ${filePath}`);
    
    // Update user's pending_image field in database
    const result = await pool.query(
      'UPDATE users SET pending_image = $1 WHERE user_id = $2 RETURNING *',
      [imageHash, targetUserId]
    );
    
    if (result.rows.length === 0) {
      // Clean up the file if user update failed
      fs.unlinkSync(filePath);
      throw new Error('User not found');
    }
    
    moveUserToGameState(socket, data.gameId, targetUserId, {
      screenName: 'GALLERY',
    });
    console.log(`✅ WhatsApp image downloaded successfully for user ${targetUserId}: ${imageHash}`);
    
  } catch (error) {
    console.error('Error downloading WhatsApp image:', error);
    
    let errorMessage = 'Failed to download WhatsApp image';
    
    // Provide more specific error messages
    if (error.response?.status === 404) {
      errorMessage = 'No WhatsApp profile picture found for this phone number';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please check your internet connection.';
    } else if (error.message.includes('WhatsApp profile picture')) {
      errorMessage = error.message;
    }
    
    socket.emit('whatsapp_image_download_error', {
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
}

function registerDownloadWhatsappImageHandler(socket) {
  socket.on('download_whatsapp_image', (data) => handleDownloadWhatsappImage(socket, data));
}

module.exports = {
  registerDownloadWhatsappImageHandler,
  handleDownloadWhatsappImage // Keep for backward compatibility if needed
};
