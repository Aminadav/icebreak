const Device = require('../models/Device');
const Game = require('../models/Game');
const User = require('../models/User');
const pool = require('../config/database');
const { sendVerificationCode, verifyCode } = require('../utils/smsService');
const { sendToMixpanel, setUserProfile, trackLogin, trackRegistration } = require('../utils/mixpanelService');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function setupSocketHandlers(io) {
  console.log('🔧 Setting up Socket.io handlers...');
  console.log('🎯 IO instance received:', !!io);
  console.log('🎯 IO engine:', !!io.engine);
  console.log('🎯 IO supported transports:', io.engine.opts.transports);
  console.log('🎯 IO CORS settings:', JSON.stringify(io.engine.opts.cors, null, 2));
  
  // Add middleware to log all connections
  io.use((socket, next) => {
    console.log('🔌 Socket middleware: New connection attempt from:', socket.handshake.address);
    console.log('🔌 Socket middleware: Headers:', socket.handshake.headers.origin);
    console.log('🔌 Socket middleware: Query params:', JSON.stringify(socket.handshake.query));
    next();
  });
  
  io.on('connection', (socket) => {
    console.log('✅ Socket.io client connected:', socket.id);
    console.log('🤝 Transport type:', socket.conn.transport.name);
    console.log(`📱 NEW HIGH-LEVEL CONNECTION: ${socket.id}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);
    
    // רישום מכשיר
    socket.on('register_device', async (data) => {
      try {
        const { deviceId } = data || {};
        
        const result = await Device.registerDevice(deviceId);
        
        // שמירת המידע בsocket לשימוש עתידי
        socket.deviceId = result.deviceId;
        socket.userId = result.userId; // May be null if device not yet verified
        
        // Get current journey state
        const journeyData = await Device.getJourneyState(result.deviceId);
        
        // Get user details if userId exists
        let userDetails = {};
        if (result.userId) {
          try {
            const User = require('../models/User');
            const user = await User.getUserById(result.userId);
            if (user) {
              userDetails = {
                phoneNumber: user.phone_number,
                email: user.email,
                name: user.name,
                gender: user.gender
              };
            }
          } catch (error) {
            console.error('Error getting user details:', error);
          }
        }
        
        socket.emit('device_registered', {
          deviceId: result.deviceId,
          userId: result.userId,
          success: true,
          isVerified: !!result.userId,
          journeyState: journeyData.journeyState,
          pendingGameName: journeyData.pendingGameName,
          phoneNumber: journeyData.pendingPhoneNumber,
          ...userDetails
        });
        
        if (result.userId) {
          console.log(`✅ Device registered: ${result.deviceId} → Existing User: ${result.userId}, Journey: ${journeyData.journeyState}`);
        } else {
          console.log(`✅ Device registered: ${result.deviceId} → No user yet (needs verification), Journey: ${journeyData.journeyState}`);
        }
      } catch (error) {
        console.error('Error registering device:', error);
        socket.emit('error', {
          message: 'Failed to register device',
          error: error.message
        });
      }
    });
    
    // שמירת שם המשחק בזיכרון (לא ביצירה מיידית)
    socket.on('set_game_name', async (data) => {
      try {
        const { gameName } = data;
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!gameName || gameName.trim().length === 0) {
          throw new Error('Game name is required');
        }
        
        // שמירת שם המשחק ב-socket ובמסד הנתונים
        socket.pendingGameName = gameName.trim();
        
        // Update journey state to GAME_NAME_SET
        await Device.updateJourneyState(socket.deviceId, 'GAME_NAME_SET', {
          pendingGameName: gameName.trim()
        });
        
        socket.emit('game_name_saved', {
          gameName: socket.pendingGameName,
          success: true,
          message: 'Game name saved. Please verify your phone number to create the game.'
        });
        
        console.log(`🎮 Game name saved: "${socket.pendingGameName}" for device: ${socket.deviceId}`);
      } catch (error) {
        console.error('Error saving game name:', error);
        socket.emit('error', {
          message: 'Failed to save game name',
          error: error.message
        });
      }
    });

    // התחלת תהליך יצירת משחק - מעבר לעמוד הזנת שם המשחק
    socket.on('start_game_creation', async () => {
      try {
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        // Update journey state to GAME_NAME_ENTRY
        await Device.updateJourneyState(socket.deviceId, 'GAME_NAME_ENTRY');
        
        socket.emit('game_creation_started', {
          success: true,
          message: 'Game creation flow started'
        });
        
        console.log(`🎮 Game creation flow started for device: ${socket.deviceId}`);
      } catch (error) {
        console.error('Error starting game creation:', error);
        socket.emit('error', {
          message: 'Failed to start game creation',
          error: error.message
        });
      }
    });
    
    // יצירת משחק בפועל (רק לאחר אימות)
    socket.on('create_game_now', async () => {
      try {
        if (!socket.userId || !socket.isPhoneVerified) {
          throw new Error('User must be verified with phone number to create games');
        }
        
        if (!socket.pendingGameName) {
          throw new Error('No game name found. Please set a game name first.');
        }
        
        const game = await Game.createGame(socket.pendingGameName, socket.userId);
        
        // Track game creation
        await sendToMixpanel({
          trackingId: 'game_created',
          userId: socket.userId,
          deviceId: socket.deviceId,
          timestamp: new Date().toISOString(),
          game_id: game.game_id,
          game_name: game.name,
          socketId: socket.id
        });
        
        // הצטרפות לחדר המשחק
        socket.join(game.game_id);
        
        socket.emit('game_created', {
          gameId: game.game_id,
          gameName: game.name,
          status: game.status,
          createdAt: game.created_at,
          success: true
        });
        
        // מחיקת שם המשחק הממתין
        delete socket.pendingGameName;
        
        console.log(`🎮 Game created: ${game.name} (${game.game_id}) by user: ${socket.userId}`);
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('error', {
          message: 'Failed to create game',
          error: error.message
        });
      }
    });
    
    // טיפול בהגשת מספר טלפון
    socket.on('submit_phone_number', async (data) => {
      try {
        const { phoneNumber } = data;
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!phoneNumber || phoneNumber.trim().length === 0) {
          throw new Error('Phone number is required');
        }
        
        console.log(`📱 Phone number submitted: ${phoneNumber} by device: ${socket.deviceId}`);
        
        // שליחת SMS אמיתי עם קוד אימות
        const smsResult = await sendVerificationCode(phoneNumber);
        
        if (smsResult.success) {
          // שמירת מספר הטלפון ב-socket לשימוש באימות
          socket.phoneNumber = smsResult.phoneNumber;
          
          // Update journey state to PHONE_SUBMITTED and store phone number in database
          await Device.updateJourneyState(socket.deviceId, 'PHONE_SUBMITTED', {
            pendingPhoneNumber: smsResult.phoneNumber
          });
          
          socket.emit('sms_sent', {
            phoneNumber: smsResult.phoneNumber,
            success: true,
            message: 'SMS sent successfully'
          });
          
          console.log(`✅ SMS sent successfully to: ${smsResult.phoneNumber}`);
        } else {
          throw new Error(smsResult.error || 'Failed to send SMS');
        }
        
      } catch (error) {
        console.error('Error processing phone number:', error);
        socket.emit('error', {
          message: 'Failed to process phone number',
          error: error.message,
          context: 'sms'
        });
      }
    });
    
    // טיפול באימות קוד 2FA
    socket.on('verify_2fa_code', async (data) => {
      try {
        const { code } = data;
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!socket.phoneNumber) {
          // Try to get phone number from database if not in socket memory
          const journeyData = await Device.getJourneyState(socket.deviceId);
          if (journeyData.pendingPhoneNumber) {
            socket.phoneNumber = journeyData.pendingPhoneNumber;
          } else {
            throw new Error('Phone number not found. Please submit phone number first.');
          }
        }
        
        if (!code || code.trim().length === 0) {
          throw new Error('Verification code is required');
        }
        
        console.log(`🔐 Verifying 2FA code: ${code} for phone: ${socket.phoneNumber}`);
        
        // אימות הקוד
        const isValid = verifyCode(socket.phoneNumber, code.trim());
        
        if (isValid) {
          // הקוד נכון - יצירת או איתור משתמש
          console.log(`✅ 2FA verification successful for: ${socket.phoneNumber}`);
          
          // Find or create user with verified phone
          const user = await User.findOrCreateUser(socket.phoneNumber);
          
          // Associate the current device with this user
          await User.associateDeviceWithUser(socket.deviceId, user.user_id);
          
          // Update socket with user information
          socket.userId = user.user_id;
          socket.isPhoneVerified = true;
          
          // Get user stats for response
          const userStats = await User.getUserStats(user.user_id);
          
          // Track user authentication (registration or login)
          const isNewUser = user.created_at && (Date.now() - new Date(user.created_at).getTime()) < 5000; // Created in last 5 seconds
          if (isNewUser) {
            await trackRegistration(user.user_id, socket.deviceId, socket.phoneNumber, {
              device_count: userStats.deviceCount,
              games_created: userStats.gamesCreated
            });
            await setUserProfile(user.user_id, {
              phoneNumber: socket.phoneNumber,
              createdAt: user.created_at,
              deviceCount: userStats.deviceCount,
              gamesCreated: userStats.gamesCreated
            });
          } else {
            await trackLogin(user.user_id, socket.deviceId, {
              device_count: userStats.deviceCount,
              games_created: userStats.gamesCreated,
              phone_number: socket.phoneNumber
            });
          }
          
          // אם יש שם משחק ממתין, ניצור את המשחק עכשיו
          let gameCreated = null;
          if (socket.pendingGameName) {
            try {
              const game = await Game.createGame(socket.pendingGameName, user.user_id);
              socket.join(game.game_id);
              gameCreated = {
                gameId: game.game_id,
                gameName: game.name,
                status: game.status,
                createdAt: game.created_at
              };
              delete socket.pendingGameName;
              
              // Track auto game creation after verification
              await sendToMixpanel({
                trackingId: 'game_created_after_verification',
                userId: user.user_id,
                deviceId: socket.deviceId,
                timestamp: new Date().toISOString(),
                game_id: game.game_id,
                game_name: game.name,
                socketId: socket.id
              });
              
              console.log(`🎮 Auto-created game: ${game.name} (${game.game_id}) after verification`);
            } catch (gameError) {
              console.error('Error auto-creating game after verification:', gameError);
              // Don't fail the verification if game creation fails
            }
          }
          
          // Update journey state to PHONE_VERIFIED and clear pending phone number
          await Device.updateJourneyState(socket.deviceId, 'PHONE_VERIFIED', {
            pendingPhoneNumber: null
          });
          
          socket.emit('2fa_verified', {
            success: true,
            message: 'Phone number verified successfully',
            phoneNumber: socket.phoneNumber,
            user: {
              userId: user.user_id,
              phoneNumber: user.phone_number,
              createdAt: user.created_at,
              deviceCount: userStats.deviceCount,
              gamesCreated: userStats.gamesCreated
            },
            gameCreated: gameCreated // Will be null if no pending game
          });
          
          console.log(`🎉 User logged in successfully: ${user.user_id} with ${userStats.deviceCount} devices`);
        } else {
          socket.emit('2fa_verification_failed', {
            success: false,
            message: 'Invalid verification code'
          });
          
          console.log(`❌ 2FA verification failed for: ${socket.phoneNumber}, code: ${code}`);
        }
        
      } catch (error) {
        console.error('Error verifying 2FA code:', error);
        socket.emit('error', {
          message: 'Failed to verify code',
          error: error.message,
          context: '2fa'
        });
      }
    });
    
    // עדכון זמן הביקור האחרון
    socket.on('ping', async () => {
      if (socket.deviceId) {
        try {
          await Device.updateLastSeen(socket.deviceId);
        } catch (error) {
          console.error('Error updating last seen:', error);
        }
      }
    });

    // טיפול באירועי tracking
    socket.on('trackEvent', async (data) => {
      try {
        const { trackingId, deviceId, userId, timestamp, ...eventData } = data;
        
        if (!trackingId) {
          console.warn('⚠️ Tracking event missing trackingId');
          return;
        }

        // Get actual user_id from device if not provided or validate
        let actualUserId = userId;
        if (deviceId && !actualUserId) {
          const device = await Device.getDevice(deviceId);
          actualUserId = device?.user_id || null;
        }

        const trackingEventData = {
          trackingId,
          deviceId: deviceId || socket.deviceId,
          userId: actualUserId,
          timestamp: timestamp || new Date().toISOString(),
          socketId: socket.id,
          ...eventData
        };

        console.log('📊 Tracking Event:', JSON.stringify(trackingEventData, null, 2));
        
        // שליחה ל-Mixpanel
        const mixpanelResult = await sendToMixpanel(trackingEventData);
        if (mixpanelResult.success) {
          console.log('✅ Event sent to Mixpanel successfully');
        } else {
          console.error('❌ Failed to send event to Mixpanel:', mixpanelResult.error);
        }
        
        // אפשר להוסיף שמירה במסד נתונים למעקב מקומי
        // await saveTrackingEvent(trackingEventData);
        
      } catch (error) {
        console.error('Error processing tracking event:', error);
      }
    });
    
    // שמירת כתובת אימייל
    socket.on('save_email', async (data) => {
      try {
        const { email, userId } = data;
        
        if (!email || !email.trim()) {
          throw new Error('Email address is required');
        }
        
        // Use userId from data if provided, otherwise use socket's userId
        const targetUserId = userId || socket.userId;
        
        if (!targetUserId) {
          throw new Error('User not authenticated. Please complete phone verification first.');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          throw new Error('Invalid email format');
        }
        
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        
        console.log(`📧 Saving email for user ${targetUserId}: ${normalizedEmail}`);
        
        // Update user email in database
        const result = await User.updateUserEmail(targetUserId, normalizedEmail);
        
        if (result.success) {
          // Update journey state to EMAIL_SAVED
          await Device.updateJourneyState(socket.deviceId, 'EMAIL_SAVED');
          
          socket.emit('email_saved', {
            success: true,
            message: 'Email address saved successfully',
            email: normalizedEmail,
            userId: targetUserId
          });
          
          console.log(`✅ Email saved successfully for user ${targetUserId}: ${normalizedEmail}`);
        } else {
          throw new Error(result.error || 'Failed to save email address');
        }
        
      } catch (error) {
        console.error('Error saving email:', error);
        
        if (error.message.includes('unique_email_lower')) {
          socket.emit('email_save_error', {
            success: false,
            message: 'כתובת האימייל כבר קיימת במערכת',
            context: 'email_save'
          });
        } else {
          socket.emit('email_save_error', {
            success: false,
            message: error.message || 'שגיאה בשמירת כתובת האימייל',
            context: 'email_save'
          });
        }
      }
    });
    
    // Reset journey state to INITIAL (used when clicking logo)
    socket.on('reset_journey_state', async () => {
      try {
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        // Reset journey state to INITIAL and clear pending data
        await Device.updateJourneyState(socket.deviceId, 'INITIAL', {
          pendingGameName: null
        });
        
        console.log(`🔄 Journey state reset to INITIAL for device: ${socket.deviceId}`);
        
        socket.emit('journey_state_reset', {
          success: true,
          message: 'Journey state reset successfully'
        });
        
      } catch (error) {
        console.error('Error resetting journey state:', error);
        socket.emit('error', {
          message: 'Failed to reset journey state',
          error: error.message
        });
      }
    });

    // Update journey state (generic handler)
    socket.on('update_journey_state', async (data) => {
      try {
        const { journeyState } = data;
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!journeyState) {
          throw new Error('Journey state is required');
        }
        
        // Update journey state
        await Device.updateJourneyState(socket.deviceId, journeyState);
        
        console.log(`🎯 Journey state updated to ${journeyState} for device: ${socket.deviceId}`);
        
        socket.emit('journey_state_updated', {
          success: true,
          journeyState: journeyState,
          message: `Journey state updated to ${journeyState}`
        });
        
      } catch (error) {
        console.error('Error updating journey state:', error);
        socket.emit('error', {
          message: 'Failed to update journey state',
          error: error.message
        });
      }
    });
    
    // שמירת שם המשתמש
    socket.on('save_user_name', async (data) => {
      try {
        const { name, userId } = data;
        
        if (!name || !name.trim()) {
          throw new Error('Name is required');
        }
        
        // Use userId from data if provided, otherwise use socket's userId
        const targetUserId = userId || socket.userId;
        
        if (!targetUserId) {
          throw new Error('User not authenticated. Please complete phone verification first.');
        }
        
        // Validate name length
        if (name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }
        
        if (name.trim().length > 50) {
          throw new Error('Name must be less than 50 characters');
        }
        
        const trimmedName = name.trim();
        
        console.log(`👤 Saving name for user ${targetUserId}: ${trimmedName}`);
        
        // Update user name in database
        const result = await User.updateUserName(targetUserId, trimmedName);
        
        if (result.success) {
          // Update journey state to NAME_SAVED
          await Device.updateJourneyState(socket.deviceId, 'NAME_SAVED');
          
          socket.emit('name_saved', {
            success: true,
            message: 'Name saved successfully',
            name: trimmedName,
            userId: targetUserId
          });
          
          console.log(`✅ Name saved successfully for user ${targetUserId}: ${trimmedName}`);
        } else {
          throw new Error(result.error || 'Failed to save name');
        }
        
      } catch (error) {
        console.error('Error saving name:', error);
        
        socket.emit('name_save_error', {
          success: false,
          message: error.message || 'Failed to save name',
          context: 'name_save'
        });
      }
    });

    // שמירת מגדר המשתמש
    socket.on('save_user_gender', async (data) => {
      try {
        const { gender, userId, name } = data;
        
        if (!gender || !['male', 'female'].includes(gender)) {
          throw new Error('Invalid gender. Must be "male" or "female"');
        }
        
        // Use userId from data if provided, otherwise use socket's userId
        const targetUserId = userId || socket.userId;
        
        if (!targetUserId) {
          throw new Error('User not authenticated. Please complete phone verification first.');
        }
        
        console.log(`⚤ Saving gender for user ${targetUserId}: ${gender}`);
        
        // If name is provided, update both name and gender, otherwise just gender
        let result;
        if (name && name.trim()) {
          result = await User.updateUserNameAndGender(targetUserId, name.trim(), gender);
        } else {
          result = await pool.query(
            'UPDATE users SET gender = $1 WHERE user_id = $2 RETURNING *',
            [gender, targetUserId]
          );
          
          if (result.rows.length === 0) {
            throw new Error('User not found');
          }
          
          result = {
            success: true,
            user: result.rows[0],
            message: 'Gender updated successfully'
          };
        }
        
        if (result.success) {
          // Update journey state to PICTURE_UPLOAD instead of COMPLETED
          await Device.updateJourneyState(socket.deviceId, 'PICTURE_UPLOAD');
          
          socket.emit('gender_saved', {
            success: true,
            message: 'Gender saved successfully',
            gender: gender,
            name: name,
            userId: targetUserId
          });
          
          console.log(`✅ Gender saved successfully for user ${targetUserId}: ${gender}`);
        } else {
          throw new Error(result.error || 'Failed to save gender');
        }
        
      } catch (error) {
        console.error('Error saving gender:', error);
        
        socket.emit('gender_save_error', {
          success: false,
          message: error.message || 'Failed to save gender',
          context: 'gender_save'
        });
      }
    });

    // העלאת תמונה ממתינה
    socket.on('upload_pending_image', async (data) => {
      try {
        const { imageData, phoneNumber, userId, email, name, gender } = data;
        
        if (!imageData) {
          throw new Error('Image data is required');
        }
        
        // Use userId from data if provided, otherwise use socket's userId
        const targetUserId = userId || socket.userId;
        
        if (!targetUserId) {
          throw new Error('User not authenticated. Please complete phone verification first.');
        }
        
        console.log(`📸 Processing image upload for user ${targetUserId}`);
        
        // Create unique filename with timestamp and user ID
        const timestamp = Date.now();
        const imageHash = crypto
          .createHash('md5')
          .update(`${targetUserId}-${timestamp}`)
          .digest('hex');
        
        const filename = `${imageHash}.jpg`;
        
        // Ensure upload directory exists - save directly to uploads root
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Write image file
        const filePath = path.join(uploadDir, filename);
        const imageBuffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(filePath, imageBuffer);
        
        console.log(`📸 Image saved to: ${filePath}`);
        
        // Update user's image_original field in database
        const result = await pool.query(
          'UPDATE users SET pending_image = $1 WHERE user_id = $2 RETURNING *',
          [imageHash, targetUserId]
        );
        
        if (result.rows.length === 0) {
          // Clean up the file if user update failed
          fs.unlinkSync(filePath);
          throw new Error('User not found');
        }
        
        // Update journey state to IMAGE_GALLERY (instead of PICTURE_ENHANCEMENT)
        await Device.updateJourneyState(socket.deviceId, 'IMAGE_GALLERY');
        
        socket.emit('upload_pending_image_response', {
          success: true,
          message: 'Image uploaded successfully',
          imageHash: imageHash,
          userId: targetUserId
        });
        
        console.log(`✅ Image uploaded successfully for user ${targetUserId}: ${imageHash}`);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        
        socket.emit('upload_pending_image_response', {
          success: false,
          message: error.message || 'Failed to upload image',
          error: error.message
        });
      }
    });

    // Image gallery generation
    socket.on('generate_image_gallery', async (data) => {
      try {
        const { originalImageHash, phoneNumber, userId, email, name, gender } = data;
        
        if (!originalImageHash) {
          throw new Error('Original image hash is required');
        }
        
        // Use userId from data if provided, otherwise use socket's userId
        const targetUserId = userId || socket.userId;
        
        if (!targetUserId) {
          throw new Error('User not authenticated. Please complete phone verification first.');
        }
        
        console.log(`🎨 Starting image gallery generation for user ${targetUserId} with original image: ${originalImageHash}`);
        
        // Load prompts from prompts.json
        const promptsPath = path.join(__dirname, '..', 'deep-image', 'prompts.json');
        const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
        
        if (prompts.length < 6) {
          throw new Error('Not enough prompts available for image generation');
        }
        
        // Prepare 6 generations: first prompt + 5 random others
        const firstPrompt = prompts[0]; // "Make it Accurate."
        const otherPrompts = prompts.slice(1); // All others
        
        // Select 5 random prompts from the remaining ones
        const selectedPrompts = [firstPrompt];
        const shuffledOthers = [...otherPrompts].sort(() => Math.random() - 0.5);
        selectedPrompts.push(...shuffledOthers.slice(0, 5));
        
        console.log('🎯 Selected prompts for generation:', selectedPrompts.map((p, i) => `[${i}] ${p.substring(0, 50)}...`));
        
        // Original image path
        const originalImagePath = path.join(__dirname, '..', 'uploads', `${originalImageHash}.jpg`);
        
        if (!fs.existsSync(originalImagePath)) {
          throw new Error(`Original image not found: ${originalImagePath}`);
        }
        
        // Update journey state to IMAGE_GALLERY
        await Device.updateJourneyState(socket.deviceId, 'IMAGE_GALLERY');
        
        // Start generating images in parallel
        const { deepImageGenerateBatch } = require('../deep-image/deep-image-batch');
        
        // Prepare output configurations
        const outputs = selectedPrompts.map((prompt, index) => {
          const generatedHash = crypto
            .createHash('md5')
            .update(`${targetUserId}-${originalImageHash}-${index}-${Date.now()}`)
            .digest('hex');
          
          return {
            dstPath: path.join(__dirname, '..', 'uploads', `${generatedHash}.jpg`),
            prompt: prompt,
            imageIndex: index,
            imageHash: generatedHash
          };
        });
        
        console.log(`🚀 Starting parallel generation of ${outputs.length} images...`);
        
        // Function to process images with real-time updates
        const processImageWithUpdates = async (output, index) => {
          try {
            console.log(`📸 [${index + 1}/6] Starting generation: ${output.prompt.substring(0, 60)}...`);
            
            // Use the generateSquareImage function directly for real-time updates
            const { generateSquareImage } = require('../deep-image/deep-image-ai');
            
            const result = await generateSquareImage({
              srcPath: originalImagePath,
              dstPath: output.dstPath,
              prompt: output.prompt,
              size: 1024
            });
            
            console.log(`✅ [${index + 1}/6] Generation completed: ${output.imageHash}`);
            
            // Emit immediate update to client
            socket.emit('gallery_image_ready', {
              imageIndex: index,
              imageHash: output.imageHash
            });
            
            return { success: true, imageIndex: index, imageHash: output.imageHash };
            
          } catch (error) {
            console.error(`❌ [${index + 1}/6] Generation failed:`, error.message);
            
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
    });

    // Image selection confirmation
    socket.on('confirm_image_selection', async (data) => {
      try {
        const { selectedImageHash, originalImageHash, userId, phoneNumber, email, name, gender } = data;
        
        if (!selectedImageHash) {
          throw new Error('Selected image hash is required');
        }
        
        // Use userId from data if provided, otherwise use socket's userId
        const targetUserId = userId || socket.userId;
        
        if (!targetUserId) {
          throw new Error('User not authenticated. Please complete phone verification first.');
        }
        
        console.log(`✅ User ${targetUserId} confirmed image selection: ${selectedImageHash}`);
        
        // Update user's profile with the selected image
        // For now, we'll update the pending_image field with the selected image
        const result = await pool.query(
          'UPDATE users SET pending_image = $1 WHERE user_id = $2 RETURNING *',
          [selectedImageHash, targetUserId]
        );
        
        if (result.rows.length === 0) {
          throw new Error('User not found');
        }
        
        // Update journey state to COMPLETED
        await Device.updateJourneyState(socket.deviceId, 'COMPLETED');
        
        socket.emit('image_selection_confirmed', {
          success: true,
          message: 'Image selection confirmed successfully',
          selectedImageHash: selectedImageHash,
          userId: targetUserId
        });
        
        console.log(`🎉 Image selection confirmed for user ${targetUserId}: ${selectedImageHash}`);
        
      } catch (error) {
        console.error('Error confirming image selection:', error);
        
        socket.emit('image_selection_error', {
          success: false,
          message: error.message || 'Failed to confirm image selection',
          error: error.message
        });
      }
    });

    // התנתקות
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
