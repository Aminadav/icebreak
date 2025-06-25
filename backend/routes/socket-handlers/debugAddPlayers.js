const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateUserId } = require('../../utils/idGenerator');
const { awardBadge } = require('./badgeHelpers');
const BADGES = require('../../../shared/badges.json');

/**
 * Debug handler to add fake players to a game for testing
 * @param {Object} socket - The socket instance
 */
module.exports.registerDebugAddPlayersHandler = async function(socket) {
  socket.on('debug-add-players', async (data) => {
    try {
      const { gameId, count } = data;
      const currentUserId = await getUserIdFromDevice(socket.deviceId);
      
      if (!currentUserId) {
        socket.emit('debug-add-players-response', { 
          success: false, 
          error: 'User not authenticated' 
        });
        return;
      }
      
      if (!gameId || !count || count < 1 || count > 50) {
        socket.emit('debug-add-players-response', { 
          success: false, 
          error: 'Invalid parameters' 
        });
        return;
      }

      console.log(`🤖 Adding ${count} debug players to game ${gameId}`);
      
      // Hebrew names for fake users
      const hebrewNames = [
        'דוד', 'שרה', 'משה', 'רחל', 'יוסי', 'מירי', 'אבי', 'נועה',
        'אורי', 'תמר', 'רון', 'ליה', 'גיל', 'מאיה', 'עמית', 'שני',
        'דנה', 'עומר', 'רותי', 'יונתן', 'חן', 'איתמר', 'ליאל', 'גל',
        'טל', 'בר', 'רעות', 'אלון', 'הדר', 'נתן'
      ];
      
      const genders = ['male', 'female'];
      const devFacesDir = path.join(__dirname, '../../dev-faces');
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      // Get available face images
      const faceImages = fs.readdirSync(devFacesDir).filter(file => file.endsWith('.jpg'));
      
      // Get all questions for random selection
      const questionsResult = await pool.query('SELECT question_id, question_text, question_type, answers, allow_other FROM questions');
      const questions = questionsResult.rows;
      
      // Get all existing users in the game (including real users)
      const existingUsersResult = await pool.query(`
        SELECT DISTINCT u.user_id, u.name 
        FROM users u 
        JOIN game_user_state gus ON u.user_id = gus.user_id 
        WHERE gus.game_id = $1
      `, [gameId]);
      const existingUsers = existingUsersResult.rows;
      
      const createdUsers = [];
      
      for (let i = 0; i < count; i++) {
        const userId = generateUserId();
        const name = hebrewNames[Math.floor(Math.random() * hebrewNames.length)] + ' ' + (Math.floor(Math.random() * 999) + 1);
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const phoneNumber = `050-${Math.floor(Math.random() * 9000000) + 1000000}`;
        const email = `test${userId.substring(0, 8)}@example.com`;
        
        // Copy random face image
        let imageHash = null;
        if (faceImages.length > 0) {
          const randomImage = faceImages[Math.floor(Math.random() * faceImages.length)];
          imageHash = crypto.createHash('md5').update(userId + randomImage).digest('hex');
          const sourcePath = path.join(devFacesDir, randomImage);
          const destPath = path.join(uploadsDir, imageHash);
          
          try {
            fs.copyFileSync(sourcePath, destPath);
          } catch (err) {
            console.error('Error copying image:', err);
          }
        }
        
        // Create user
        await pool.query(`
          INSERT INTO users (
            user_id, name, gender, phone_number, phone_verified, 
            email, email_verified, image, has_image, is_temp_user
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          userId, name, gender, phoneNumber, true, 
          email, true, imageHash, !!imageHash, false
        ]);
        
        // Create device for user
        const deviceId = generateUserId();
        await pool.query(`
          INSERT INTO devices (device_id, user_id) VALUES ($1, $2)
        `, [deviceId, userId]);
        
        // Add user to game state with random screen
        const screens = [
          'ENTER_PHONE', 'VERIFY_2FA', 'ENTER_NAME', 'SELECT_GENDER',
          'UPLOAD_IMAGE', 'QUESTION_ABOUT_MYSELF', 'GOT_POINTS'
        ];
        const randomScreen = screens[Math.floor(Math.random() * screens.length)];
        const randomMetadata = {
          IS_CREATOR: false,
          SEEN_GAME_READY: Math.random() > 0.5,
          SEEN_BEFORE_ASK_ABOUT_YOU: Math.random() > 0.5,
          ANSWER_ABOUT_MYSELF: Math.floor(Math.random() * 10)
        };
        
        await pool.query(`
          INSERT INTO game_user_state (game_id, user_id, state, metadata)
          VALUES ($1, $2, $3, $4)
        `, [gameId, userId, { screen: randomScreen }, randomMetadata]);
        
        // Add 2 random point events with random timestamps from last 2 weeks
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        let totalUserPoints = 0;
        for (let pointEvent = 0; pointEvent < 2; pointEvent++) {
          const randomPoints = Math.floor(Math.random() * 500) + 10; // 10-510 points per event
          totalUserPoints += randomPoints;
          const randomTime = new Date(twoWeeksAgo.getTime() + Math.random() * (Date.now() - twoWeeksAgo.getTime()));
          
          await pool.query(`
            INSERT INTO user_points (user_id, game_id, points, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
          `, [userId, gameId, randomPoints, randomTime, randomTime]);
        }
        
        // Award 0-5 random badges based on total points
        const numBadges = Math.floor(Math.random() * 6); // 0-5 badges
        const eligibleBadges = BADGES.filter(badge => totalUserPoints >= badge.pointsRequired);
        
        if (eligibleBadges.length > 0 && numBadges > 0) {
          // Randomly select badges to award (can include lower level badges even if user has higher points)
          const badgesToAward = [];
          
          for (let i = 0; i < numBadges && i < BADGES.length; i++) {
            const randomBadge = BADGES[Math.floor(Math.random() * BADGES.length)];
            // Avoid duplicates
            if (!badgesToAward.find(b => b.id === randomBadge.id)) {
              badgesToAward.push(randomBadge);
            }
          }
          
          for (const badge of badgesToAward) {
            try {
              await awardBadge(userId, gameId, badge.id);
            } catch (err) {
              console.log('Badge already exists or error:', err.message);
            }
          }
        }
        
        createdUsers.push({ userId, name });
      }
      
      // Now add random answers for each created user
      const allUsers = [...existingUsers, ...createdUsers];
      
      for (const user of createdUsers) {
        // Each user answers about ALL users (real and fake) INCLUDING THEMSELVES - 1-10 questions per user
        const allPossibleTargets = [...allUsers, { user_id: user.userId, name: user.name }];
        
        for (const aboutUser of allPossibleTargets) {
          const numQuestionsAboutThisUser = Math.floor(Math.random() * 10) + 1; // 1-10 questions
          
          for (let j = 0; j < numQuestionsAboutThisUser; j++) {
            if (questions.length === 0) break;
            
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            
            let answer;
            const useExistingAnswer = Math.random() > 0.5; // 50% chance to use existing answer
            
            if (useExistingAnswer && randomQuestion.answers && randomQuestion.question_type !== 'free_form') {
              // Use existing answer from question options
              const answers = Array.isArray(randomQuestion.answers) ? randomQuestion.answers : JSON.parse(randomQuestion.answers);
              if (answers.length > 0) {
                answer = answers[Math.floor(Math.random() * answers.length)];
              } else {
                answer = `Free text ${Math.floor(Math.random() * 10000)}`;
              }
            } else {
              // Use free text answer
              answer = `Free text ${Math.floor(Math.random() * 10000)}`;
            }
            
            // Random is_correct value
            const isCorrect = Math.random() > 0.5; // 50% chance to be correct
            
            try {
              await pool.query(`
                INSERT INTO user_answers (
                  gameid, questionid, answer, answering_user_id, about_user_id, is_correct
                ) VALUES ($1, $2, $3, $4, $5, $6)
              `, [gameId, randomQuestion.question_id, answer, user.userId, aboutUser.user_id, isCorrect]);
            } catch (err) {
              // Skip duplicate answers or constraint violations
              console.log('Skipping duplicate/invalid answer');
            }
          }
        }
      }
      
      console.log(`✅ Successfully added ${count} debug players to game ${gameId}`);
      
      socket.emit('debug-add-players-response', { 
        success: true, 
        message: `Successfully added ${count} debug players`,
        count: count
      });
      
    } catch (error) {
      console.error('❌ Error adding debug players:', error);
      socket.emit('debug-add-players-response', { 
        success: false, 
        error: error.message 
      });
    }
  });
};
