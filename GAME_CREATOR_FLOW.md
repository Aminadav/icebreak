# Game Creator Flow Documentation

## Overview
This document outlines the complete user journey for a game creator from first visit to game start.

## User Journey Steps

### 1. **Landing & Game Creation**
- **User Action**: Visits website, clicks "Create Game"
- **Frontend**: `frontend/src/pages/HomePage.tsx` → `frontend/src/pages/CreateGamePage.tsx`
- **Socket Event**: `create_game` 
- **Handler**: `backend/routes/socket-handlers/createGame.js`
- **Database**: Creates record in `games` table with `status='waiting'`
- **Response**: User redirected to `/game/{gameId}`

### 2. **Device Registration**
- **User Action**: Automatically triggered on game page load
- **Frontend**: `frontend/src/contexts/SocketContext.tsx`
- **Socket Event**: `register_device`
- **Handler**: `backend/routes/socket-handlers/registerDevice.js`
- **Database**: Creates/updates record in `devices` table

### 3. **Phone Number Entry**
- **User Action**: Enters phone number
- **Frontend Screen**: `ENTER_PHONE` 
- **Component**: `frontend/src/pages/EnterPhonePage.tsx`
- **Socket Event**: `send_sms`
- **Handler**: `backend/routes/socket-handlers/sendSms.js`
- **Database**: Creates user record in `users` table with `phone_number`

### 4. **2FA Verification**
- **User Action**: Enters SMS code
- **Frontend Screen**: `VERIFY_2FA`
- **Component**: `frontend/src/pages/Verify2FAPage.tsx`
- **Socket Event**: `verify_2fa`
- **Handler**: `backend/routes/socket-handlers/verify2fa.js`
- **Database**: Updates `users.phone_verified = true`, links `devices.user_id`

### 5. **Name Collection**
- **User Action**: Enters their name
- **Frontend Screen**: `ENTER_NAME`
- **Component**: `frontend/src/pages/EnterNamePage.tsx`
- **Socket Event**: `save_name`
- **Handler**: `backend/routes/socket-handlers/saveName.js`
- **Database**: Updates `users.name`

### 6. **Gender Selection**
- **User Action**: Selects gender
- **Frontend Screen**: `SELECT_GENDER`
- **Component**: `frontend/src/pages/SelectGenderPage.tsx`
- **Socket Event**: `save_gender`
- **Handler**: `backend/routes/socket-handlers/saveGender.js`
- **Database**: Updates `users.gender`

### 7. **Image Upload/Generation**
- **User Action**: Uploads photo or generates AI image
- **Frontend Screen**: `UPLOAD_IMAGE` or `AI_IMAGE_GENERATION`
- **Components**: `frontend/src/pages/UploadImagePage.tsx`, `frontend/src/pages/GenerateImagePage.tsx`
- **Socket Events**: `upload_image`, `generate_ai_image`
- **Handlers**: `backend/routes/socket-handlers/uploadImage.js`, `backend/routes/socket-handlers/generateAiImage.js`
- **Database**: Updates `users.image` or creates `user_generated_images` record

### 8. **Creator-Specific Screens**

#### 8.1. Game Ready Screen
- **Trigger**: Creator completes profile setup
- **Frontend Screen**: `CREATOR_GAME_READY`
- **Component**: `frontend/src/pages/CreatorGameReadyPage.tsx`
- **Logic**: `backend/routes/socket-handlers/get-next-screen-logic.js` (rule with `IS_CREATOR: true, SEEN_GAME_READY: false`)
- **Database**: Updates `game_user_state.metadata.SEEN_GAME_READY = true`

#### 8.2. Before Start Screen
- **Trigger**: Creator clicks continue from Game Ready
- **Frontend Screen**: `BEFORE_START_ABOUT_YOU`
- **Component**: `frontend/src/pages/BeforeStartPage.tsx`
- **Logic**: `backend/routes/socket-handlers/get-next-screen-logic.js` (rule with `IS_CREATOR: true, SEEN_BEFORE_ASK_ABOUT_YOU: false`)
- **Database**: Updates `game_user_state.metadata.SEEN_BEFORE_ASK_ABOUT_YOU = true`

### 9. **Question Flow Begins**
- **User Action**: Creator starts answering questions about themselves
- **Frontend Screen**: `QUESTION_ABOUT_MYSELF`
- **Component**: `frontend/src/pages/QuestionPage.tsx`
- **Socket Event**: `submit-answer-myself`
- **Handler**: `backend/routes/socket-handlers/submit-answer-myself.js`
- **Database**: 
  - Inserts into `user_answers` table
  - Adds 10 points to `user_points` table
  - Updates `game_user_state.metadata.ANSWER_ABOUT_MYSELF` counter
- **Next Screen**: `GOT_POINTS` → continues question flow

## Key Technical Components

### Screen Flow Logic
- **File**: `backend/routes/socket-handlers/get-next-screen-logic.js`
- **Function**: `get_next_screen()` - Rule-based screen determination
- **Function**: `moveUserToScreen()` - Direct screen navigation
- **Function**: `push_user_to_next_screen()` - Next screen in flow

### Game State Management
- **File**: `backend/routes/socket-handlers/moveUserToGameState.js`
- **Purpose**: Updates user's current screen state in database
- **Database**: `game_user_state` table stores current screen and metadata

### Context Management
- **File**: `frontend/src/contexts/GameContext.tsx`
- **Purpose**: Manages game data, user data, and points across frontend
- **Functions**: `gameEmitter()`, `emitMoveToNextPage()`, `refreshPoints()`

## Database Tables Involved

1. **`games`** - Game instances
2. **`users`** - User profiles 
3. **`devices`** - Device-user mapping
4. **`game_user_state`** - Current screen and progress metadata
5. **`user_points`** - Point transactions
6. **`user_answers`** - Submitted answers
7. **`questions`** - Question pool
8. **`user_generated_images`** - AI-generated profile images

## Socket Events Reference

| Event | Direction | Handler File | Purpose |
|-------|-----------|--------------|---------|
| `create_game` | Client → Server | `createGame.js` | Create new game |
| `register_device` | Client → Server | `registerDevice.js` | Register device |
| `send_sms` | Client → Server | `sendSms.js` | Send 2FA code |
| `verify_2fa` | Client → Server | `verify2fa.js` | Verify SMS code |
| `save_name` | Client → Server | `saveName.js` | Save user name |
| `save_gender` | Client → Server | `saveGender.js` | Save user gender |
| `upload_image` | Client → Server | `uploadImage.js` | Upload profile image |
| `generate_ai_image` | Client → Server | `generateAiImage.js` | Generate AI image |
| `get_next_screen` | Client → Server | `getNextScreen.js` | Get next screen |
| `submit-answer-myself` | Client → Server | `submit-answer-myself.js` | Submit answer + award points |
| `my_points` | Client → Server | `getMyPoints.js` | Get current points |
| `points_updated` | Server → Client | N/A | Notify points change |

## Creator Identification

- **Field**: `games.creator_user_id` matches current user
- **Metadata**: `game_user_state.metadata.IS_CREATOR = true`
- **Logic**: Set when user creates the game in `createGame.js`

## Flow Control

The creator flow is controlled by:
1. **Rule-based logic** in `get-next-screen-logic.js`
2. **Metadata tracking** in `game_user_state.metadata`
3. **Creator-specific rules** that check `IS_CREATOR: true`
4. **Sequential progression** through setup screens before questions begin
