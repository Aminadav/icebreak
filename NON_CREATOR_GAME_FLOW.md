# Non-Creator (Player) Game Flow Documentation

## Overview
This document outlines the complete user journey for a non-creator player from joining a game to gameplay.

## Key Differences from Creator Flow
- Players join existing games (don't create them)
- Answer 2 questions about others BEFORE profile setup
- No creator-specific screens (CREATOR_GAME_READY, BEFORE_START_ABOUT_YOU, etc.)
- Mixed question algorithm alternates between self and others questions
- No introductory question count or special onboarding

## User Journey Steps

### 1. **Game Join & Welcome**
- **User Action**: Visits game URL `/game/{gameId}` 
- **Frontend**: Automatically loads game page
- **Socket Event**: `register_device` (automatic)
- **Handler**: `backend/routes/socket-handlers/registerDevice.js`
- **Database**: Creates/updates record in `devices` table

### 2. **Join Game Welcome Screen**
- **Trigger**: Non-creator first visit to game
- **Frontend Screen**: `JOIN_GAME_WELCOME`
- **Component**: `frontend/src/pages/JoinGameWelcomePage.tsx` (assumed)
- **Logic**: `backend/routes/socket-handlers/get-next-screen-logic.js` (rule: `!isCreator && userNotClickedButton('join_game_welcome_continue')`)
- **User Action**: Click continue button
- **Socket Event**: Button click tracking
- **Database**: Updates button click metadata

### 3. **Phone Number Entry**
- **User Action**: Enters phone number
- **Frontend Screen**: `ASK_USER_PHONE`
- **Component**: `frontend/src/pages/AskUserPhonePage.tsx` (assumed)
- **Socket Event**: `send_sms`
- **Handler**: `backend/routes/socket-handlers/sendSms.js`
- **Database**: Creates user record in `users` table with `phone_number`

### 4. **2FA Verification**
- **User Action**: Enters SMS code
- **Frontend Screen**: `ASK_USER_VERIFICATION_CODE`
- **Component**: `frontend/src/pages/AskUserVerificationCodePage.tsx` (assumed)
- **Socket Event**: `verify_2fa`
- **Handler**: `backend/routes/socket-handlers/verify2fa.js`
- **Database**: Updates `users.phone_verified = true`, links `devices.user_id`

### 5. **Initial Questions About Others (Unique to Non-Creators)**
- **Trigger**: After 2FA verification, non-creators must answer 2 questions about others
- **Frontend Screen**: `QUESTION_ABOUT_OTHER`
- **Component**: `frontend/src/pages/QuestionAboutOtherPage.tsx`
- **Logic**: `answersAboutOthersCount < 2` for non-creators
- **Socket Event**: `submit-answer-other`
- **Handler**: `backend/routes/socket-handlers/submit-answer-other.js`
- **Database**: 
  - Inserts into `user_answers` table with `is_about_me = false`
  - Awards points to `user_points` table
  - Increments `answersAboutOthersCount`
- **Questions**: Uses `getNextQuestionAboutOthers()` utility
- **Data Structure**:
  ```javascript
  {
    screenName: 'QUESTION_ABOUT_OTHER',
    question: nextQuestionAboutOthers,
    about_user: {
      user_id: nextQuestionAboutOthers.about_user_id,
      name: nextQuestionAboutOthers.about_user_name,
      image: nextQuestionAboutOthers.about_user_image || '',
    },
  }
  ```

### 6. **Profile Setup Flow (After Initial Questions)**

#### 6.1. Email Collection
- **Frontend Screen**: `ASK_FOR_EMAIL`
- **Component**: `frontend/src/pages/AskForEmailPage.tsx` (assumed)
- **Socket Event**: `save_email`
- **Handler**: `backend/routes/socket-handlers/saveEmail.js`
- **Database**: Updates `users.email`

#### 6.2. Name Collection
- **Frontend Screen**: `ASK_PLAYER_NAME`
- **Component**: `frontend/src/pages/AskPlayerNamePage.tsx`
- **Socket Event**: `save_name`
- **Handler**: `backend/routes/socket-handlers/saveName.js`
- **Database**: Updates `users.name`

#### 6.3. Gender Selection
- **Frontend Screen**: `ASK_PLAYER_GENDER`
- **Component**: `frontend/src/pages/AskPlayerGenderPage.tsx`
- **Socket Event**: `save_gender`
- **Handler**: `backend/routes/socket-handlers/saveGender.js`
- **Database**: Updates `users.gender`

#### 6.4. Image Upload/Generation
- **Frontend Screen**: `ASK_FOR_PICTURE`
- **Component**: `frontend/src/pages/AskForPicturePage.tsx`
- **Socket Events**: `upload_image`, `generate_ai_image`
- **Handlers**: `backend/routes/socket-handlers/uploadImage.js`, `backend/routes/socket-handlers/generateAiImage.js`
- **Database**: Updates `users.pending_image` or `users.has_image`

#### 6.5. Gallery Selection (If AI Image Generated)
- **Trigger**: If user has `pending_image` but not `has_image`
- **Frontend Screen**: `GALLERY`
- **Component**: `frontend/src/pages/GalleryPage.tsx`
- **Socket Event**: `select_image`
- **Handler**: `backend/routes/socket-handlers/selectImage.js`
- **Database**: Updates `users.has_image = true`, clears `pending_image`

### 7. **Badge System**
- **Trigger**: Checked before every screen transition
- **Logic**: `checkForMissingBadge(userId, gameId)`
- **Frontend Screen**: `GOT_BADGE`
- **Component**: `frontend/src/pages/GotBadgePage.tsx`
- **Database**: 
  - Awards badge via `awardBadge()`
  - Updates badge tracking tables

### 8. **Mixed Question Flow**

#### 8.1. Question Algorithm
- **Logic**: Alternates between questions about self and others
- **Algorithm**:
  ```javascript
  // Check last question type answered
  const lastAnswerResult = await pool.query(`
    SELECT is_about_me 
    FROM user_answers 
    WHERE gameid = $1 AND answering_user_id = $2 
    ORDER BY created_at DESC 
    LIMIT 1
  `, [gameId, userId]);
  
  // Alternate: if last was about me, ask about others
  shouldAskAboutOthers = lastWasAboutMe;
  ```

#### 8.2. Questions About Others
- **Frontend Screen**: `QUESTION_ABOUT_OTHER`
- **Component**: `frontend/src/pages/QuestionAboutOtherPage.tsx`
- **Socket Event**: `submit-answer-other`
- **Handler**: `backend/routes/socket-handlers/submit-answer-other.js`
- **Utility**: `getNextQuestionAboutOthers(gameId, userId)`

#### 8.3. Questions About Self
- **Frontend Screen**: `QUESTION_ABOUT_MYSELF`
- **Component**: `frontend/src/pages/QuestionAboutMyselfPage.tsx`
- **Socket Event**: `submit-answer-myself`
- **Handler**: `backend/routes/socket-handlers/submit-answer-myself.js`
- **Utility**: `getNextQuestionAboutYou(gameId, userId)`
- **Note**: No intro counter for non-creators (`isIntro: false`)

#### 8.4. Answer Feedback
- **Frontend Screen**: `ANSWER_FEEDBACK`
- **Component**: `frontend/src/pages/AnswerFeedbackPage.tsx`
- **Shows**: Correct/incorrect status, points earned, answer distribution

#### 8.5. Points Notification
- **Frontend Screen**: `GOT_POINTS`
- **Component**: `frontend/src/pages/GotPointsPage.tsx`
- **Socket Event**: `points_updated` (server to client)

### 9. **Game End**
- **Trigger**: No more questions available (`!nextQuestionAboutMySelf && !nextQuestionAboutOthers`)
- **Frontend Screen**: `NO_MORE_QUESTIONS`
- **Component**: `frontend/src/pages/NoMoreQuestionsPage.tsx`

## Key Technical Components

### Screen Flow Logic
- **File**: `backend/routes/socket-handlers/get-next-screen-logic.js`
- **Function**: `get_next_screen()` - Rule-based screen determination
- **Creator Check**: `isCreator = gameResult.rows[0].creator_user_id === userId`
- **Non-Creator Rules**: All rules with `!isCreator` condition

### Question Utilities
- **Questions About Others**: `backend/utils/getNextQuestionAboutOthers.js`
  - `getNextQuestionAboutOthers(gameId, userId)`
  - `getAnswersAboutOthersCount(gameId, userId)`
- **Questions About Self**: `backend/utils/getNextQuestionAboutYou.js`
  - `getNextQuestionAboutYou(gameId, userId)`

### User Activity Tracking
- **File**: `backend/utils/userActivityUtils.js`
- **Functions**: 
  - `userVisited(gameId, userId, screenName)`
  - `userClicked(gameId, userId, buttonName)`

## Database Tables Involved

1. **`games`** - Game instances (player links via `game_user_state`)
2. **`users`** - Player profiles 
3. **`devices`** - Device-player mapping
4. **`game_user_state`** - Current screen and progress metadata
5. **`user_points`** - Point transactions
6. **`user_answers`** - Submitted answers (`is_about_me` flag differentiates types)
7. **`questions`** - Question pool
8. **`user_generated_images`** - AI-generated profile images
9. **`badges`** - Badge system tables

## Socket Events Reference

| Event | Direction | Handler File | Purpose |
|-------|-----------|--------------|---------|
| `register_device` | Client → Server | `registerDevice.js` | Register device |
| `send_sms` | Client → Server | `sendSms.js` | Send 2FA code |
| `verify_2fa` | Client → Server | `verify2fa.js` | Verify SMS code |
| `save_email` | Client → Server | `saveEmail.js` | Save email |
| `save_name` | Client → Server | `saveName.js` | Save player name |
| `save_gender` | Client → Server | `saveGender.js` | Save player gender |
| `upload_image` | Client → Server | `uploadImage.js` | Upload profile image |
| `generate_ai_image` | Client → Server | `generateAiImage.js` | Generate AI image |
| `select_image` | Client → Server | `selectImage.js` | Select from gallery |
| `submit-answer-other` | Client → Server | `submit-answer-other.js` | Submit answer about others |
| `submit-answer-myself` | Client → Server | `submit-answer-myself.js` | Submit answer about self |
| `get_next_screen` | Client → Server | `getNextScreen.js` | Get next screen |
| `my_points` | Client → Server | `getMyPoints.js` | Get current points |
| `points_updated` | Server → Client | N/A | Notify points change |

## Flow Control Differences

### Non-Creator Specific Rules:
1. **Welcome Screen**: Must click continue from `JOIN_GAME_WELCOME`
2. **Early Questions**: 2 questions about others before profile setup
3. **No Creator Screens**: Skips all creator-specific screens
4. **Mixed Algorithm**: Alternates between self/others questions throughout
5. **No Intro Mode**: Questions about self don't have intro counter

### Verification Flow:
- **Same**: Phone number → 2FA verification
- **Different**: Questions about others immediately after 2FA

### Profile Setup:
- **Order**: Email → Name → Gender → Image → Gallery (if needed)
- **Same**: Same components and handlers as creator

### Question Flow:
- **Algorithm**: Alternating based on last question answered
- **Types**: Both `QUESTION_ABOUT_OTHER` and `QUESTION_ABOUT_MYSELF`
- **Points**: Same point system as creator
- **Badges**: Same badge system as creator

## Player Identification

- **Field**: `games.creator_user_id !== userId`
- **Logic**: Set automatically in `get-next-screen-logic.js`
- **No Special Metadata**: Unlike creators, no special metadata flags needed
