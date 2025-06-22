# Socket Handler Refactoring

## Overview
The large `socket.js` file has been refactored into smaller, modular files for better maintainability and security. Each socket event now has its own dedicated handler file.

## Security Improvements
- **Never trust client-sent `userId`**: All handlers now derive the `userId` from the `deviceId` for security
- **Centralized validation**: Common validation functions are in `utils.js`
- **Consistent authentication checks**: All handlers verify device registration and user authentication where needed

## File Structure

```
backend/routes/socket-handlers/
├── utils.js                        # Common utilities and validation functions
├── index.js                       # Exports all handlers
├── registerDevice.js              # Device registration
├── setGameName.js                 # Game name setting
├── startGameCreation.js           # Game creation flow start
├── createGameNow.js               # Actual game creation
├── submitPhoneNumber.js           # Phone number submission
├── verify2FACode.js               # 2FA verification
├── ping.js                        # Keep-alive ping
├── trackEvent.js                  # Analytics tracking
├── saveEmail.js                   # Email saving
├── saveUserName.js                # User name saving
├── saveUserGender.js              # User gender saving
├── uploadPendingImage.js          # Image upload
├── loadExistingGalleryImages.js   # Load existing gallery images
├── generateImageGallery.js        # Image gallery generation
└── confirmImageSelection.js       # Image selection confirmation
```

## Main Changes

### 1. Security Enhancements
- **`getUserIdFromDevice(deviceId)`**: Safely derives userId from deviceId
- **`validateDeviceRegistration(socket)`**: Ensures device is registered
- **`validateUserVerification(socket)`**: Ensures user is verified
- All handlers now use `getUserIdFromDevice()` instead of trusting client data

### 2. Modularization
- Each socket event has its own file
- Common logic extracted to `utils.js`
- Clean imports in main `socket.js`

### 3. Consistent Error Handling
- Standardized error responses
- Proper logging
- Clean try-catch blocks

## Usage

The main `socket.js` file now simply imports all handlers and registers them:

```javascript
const {
  handleRegisterDevice,
  handleSetGameName,
  // ... other handlers
} = require('./socket-handlers');

// Register event handlers
socket.on('register_device', (data) => handleRegisterDevice(socket, data));
socket.on('set_game_name', (data) => handleSetGameName(socket, data));
// ... other events
```

## Security Note

**Important**: The client should NEVER send `userId` in any request. All handlers now:
1. Ignore any `userId` sent from the client
2. Use `getUserIdFromDevice(socket.deviceId)` to derive the actual userId
3. Validate device registration before processing requests
4. Verify user authentication for protected operations

This ensures that users can only perform operations on their own data and prevents privilege escalation attacks.

## Benefits

1. **Better Security**: UserId always derived from deviceId, never trusted from client
2. **Easier Maintenance**: Each handler is in its own file
3. **Better Testing**: Individual handlers can be unit tested
4. **Cleaner Code**: Reduced duplication and better organization
5. **Type Safety**: Each handler has clear input/output contracts
6. **Debugging**: Easier to locate and fix issues in specific handlers
