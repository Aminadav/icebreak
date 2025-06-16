const Device = require('../../models/Device');
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getUserIdFromDevice } = require('./utils');
const { improveFace } = require('../../deep-image/deep-image-improve-face');

// Load environment variables
require('dotenv').config();

// Get number of images to generate from environment variable, default to 6 if not set
const GENERATED_IMAGES = parseInt(process.env.GENERATED_IMAGES) || 6;

async function handleGenerateImageGallery(socket, data) {
  try {
    const { originalImageHash, phoneNumber, email, name } = data;
    
    if (!originalImageHash) {
      throw new Error('Original image hash is required');
    }
    
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);
    
    if (!targetUserId) {
      throw new Error('User not authenticated. Please complete phone verification first.');
    }

    // Fetch user's gender from database
    const userResult = await pool.query('SELECT gender FROM users WHERE user_id = $1', [targetUserId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found in database');
    }
    
    const userGender = userResult.rows[0].gender;
    
    if (!userGender || !['male', 'female'].includes(userGender)) {
      throw new Error('User gender not set or invalid. Please complete profile setup first.');
    }
    
    console.log(`🎨 Starting image gallery generation for user ${targetUserId} with original image: ${originalImageHash}`);
    
    // First check if user already has completed images
    try {
      const existingImages = await pool.query(`
        SELECT image_hash, prompt_used, prompt_index, generation_status, file_path, created_at, completed_at
        FROM user_generated_images 
        WHERE user_id = $1 AND generation_status = 'completed'
        ORDER BY prompt_index ASC
      `, [targetUserId]);
      
      if (existingImages.rows.length > 0) {
        console.log(`✅ Found ${existingImages.rows.length} existing completed images for user ${targetUserId}, using existing images`);
        
        // Inform frontend about the number of existing images
        socket.emit('gallery_generation_started', {
          imageCount: existingImages.rows.length,
          userId: targetUserId
        });
        
        // Emit existing images to client
        existingImages.rows.forEach((row) => {
          socket.emit('gallery_image_ready', {
            imageIndex: row.prompt_index,
            imageHash: row.image_hash
          });
          console.log(`📤 Sent existing image ${row.prompt_index}: ${row.image_hash}`);
        });
        
        return; // Exit early, no need to generate new images
      } else {
        console.log(`🎨 No existing completed images found for user ${targetUserId}, starting generation`);
        
        // Clean up any incomplete generations for this user
        try {
          const cleanupResult = await pool.query(`
            DELETE FROM user_generated_images 
            WHERE user_id = $1 AND generation_status != 'completed'
          `, [targetUserId]);
          
          if (cleanupResult.rowCount > 0) {
            console.log(`🧹 Cleaned up ${cleanupResult.rowCount} incomplete generations for user ${targetUserId}`);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up incomplete generations:', cleanupError.message);
        }
      }
    } catch (dbError) {
      console.error('Error checking existing images:', dbError.message);
      // Continue with generation if database check fails
    }
    
    // Load prompts from prompts.js
    const allPrompts = require('../../deep-image/prompts');
    
    console.log(`🎯 Filtering prompts for gender: ${userGender}`);
    
    // Filter prompts based on user's gender from database
    const availablePrompts = allPrompts.filter(prompt => 
      prompt.gender === 'both' || prompt.gender === userGender
    );
    
    if (availablePrompts.length < GENERATED_IMAGES - 1) {
      throw new Error(`Not enough prompts available for gender "${userGender}". Found ${availablePrompts.length}, need at least ${GENERATED_IMAGES - 1} (one slot reserved for face improvement).`);
    }
    
    // Prepare generations: face improvement + random prompts
    // First image will always be face improvement, rest will be random prompts
    const selectedPrompts = availablePrompts.sort(() => Math.random() - 0.5).slice(0, GENERATED_IMAGES - 1);
    
    console.log(`🎯 Selected ${selectedPrompts.length} prompts for ${userGender} (plus 1 face improvement):`, selectedPrompts.map((p, i) => `[${i+1}] ${p.description.substring(0, 50)}...`));
    
    // Inform frontend about the number of images to be generated
    socket.emit('gallery_generation_started', {
      imageCount: GENERATED_IMAGES,
      userId: targetUserId
    });
    
    // Original image path
    const originalImagePath = path.join(__dirname, '..', '..', 'uploads', `${originalImageHash}.jpg`);
    
    if (!fs.existsSync(originalImagePath)) {
      throw new Error(`Original image not found: ${originalImagePath}`);
    }
    
    // Update journey state to IMAGE_GALLERY
    await Device.updateJourneyState(socket.deviceId, 'IMAGE_GALLERY');
    
    // Prepare output configurations
    const outputs = [];
    
    // First output: Face improvement (index 0)
    const faceImproveHash = crypto
      .createHash('md5')
      .update(`${targetUserId}-${originalImageHash}-face-improve-${Date.now()}`)
      .digest('hex');
    
    outputs.push({
      dstPath: path.join(__dirname, '..', '..', 'uploads', `${faceImproveHash}.jpg`),
      prompt: 'Face Enhancement (AI-improved original)',
      imageIndex: 0,
      imageHash: faceImproveHash,
      isFaceImprovement: true
    });
    
    // Rest of outputs: Regular prompt-based generations
    selectedPrompts.forEach((prompt, index) => {
      const generatedHash = crypto
        .createHash('md5')
        .update(`${targetUserId}-${originalImageHash}-${index + 1}-${Date.now()}`)
        .digest('hex');
      
      outputs.push({
        dstPath: path.join(__dirname, '..', '..', 'uploads', `${generatedHash}.jpg`),
        prompt: prompt.description,
        imageIndex: index + 1,
        imageHash: generatedHash,
        isFaceImprovement: false
      });
    });
    
    console.log(`🚀 Starting parallel generation of ${outputs.length} images...`);
    
    // Function to process images with real-time updates
    const processImageWithUpdates = async (output, index) => {
      try {
        console.log(`📸 [${index + 1}/${GENERATED_IMAGES}] Starting generation: ${output.prompt.substring(0, 60)}...`);
        
        let result;
        
        if (output.isFaceImprovement) {
          // Use face improvement for the first image
          console.log(`🎭 [${index + 1}/${GENERATED_IMAGES}] Running face improvement...`);
          result = await improveFace({
            srcPath: originalImagePath,
            dstPath: output.dstPath,
            size: 1024
          });
        } else {
          // Use regular prompt-based generation for other images
          const { generateSquareImage } = require('../../deep-image/deep-image-ai');
          result = await generateSquareImage({
            srcPath: originalImagePath,
            dstPath: output.dstPath,
            prompt: output.prompt,
            size: 1024
          });
        }
        
        console.log(`✅ [${index + 1}/${GENERATED_IMAGES}] Generation completed: ${output.imageHash}`);
        
        // Save to database
        try {
          await pool.query(`
            INSERT INTO user_generated_images (
              user_id, image_hash, prompt_used, prompt_index, 
              generation_status, file_path, completed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `, [
            targetUserId,
            output.imageHash,
            output.prompt,
            index,
            'completed',
            output.dstPath
          ]);
          console.log(`💾 [${index + 1}/${GENERATED_IMAGES}] Saved to database: ${output.imageHash}`);
        } catch (dbError) {
          console.error(`❌ [${index + 1}/${GENERATED_IMAGES}] Database save failed:`, dbError.message);
        }
        
        // Emit immediate update to client
        socket.emit('gallery_image_ready', {
          imageIndex: index,
          imageHash: output.imageHash
        });
        
        return { success: true, imageIndex: index, imageHash: output.imageHash };
        
      } catch (error) {
        console.error(`❌ [${index + 1}/${GENERATED_IMAGES}] Generation failed:`, error.message);
        
        // Emit error to client
        socket.emit('gallery_image_error', {
          imageIndex: index,
          error: error.message
        });
        
        return { success: false, imageIndex: index, error: error.message };
      }
    };
    
    // Start all generations in parallel
    outputs.forEach((output, index) => {
      // Don't await - let them run in parallel
      processImageWithUpdates(output, index);
    });
    
    console.log('🎨 All image generations started in parallel');
    
  } catch (error) {
    console.error('Error starting image gallery generation:', error);
    
    socket.emit('gallery_generation_error', {
      success: false,
      message: error.message || 'Failed to start image generation',
      error: error.message
    });
  }
}

module.exports = handleGenerateImageGallery;
