# Icebreak Backend Server

Backend server for the Icebreak game application using Node.js, Express, Socket.io, and PostgreSQL.

## הגדרת המסד נתונים עם Docker

### דרישות מוקדמות
- Docker ו-Docker Compose מותקנים במחשב
- Node.js גרסה 16 ומעלה

### שלב 1: הפעלת מסד הנתונים
```bash
# מעבר לתיקיית הbackend
cd backend

# התקנת חבילות Node.js (צריך לעשות פעם אחת)
npm install

# הפעלת מסד הנתונים + יצירת טבלאות (הכל באחד!)
npm run db:start
```

**או בצורה ידנית:**
```bash
# הפעלת מסד הנתונים עם Docker
docker-compose up -d

# המתנה שהמסד יהיה מוכן
sleep 10

# יצירת הטבלאות
npm run db:setup
```

### שלב 2: הרצת השרת
```bash
# הרצה עם nodemon לפיתוח (מומלץ)
npm run dev

# או הרצה רגילה
npm start
```

## פקודות שימושיות

```bash
# הפעלת מסד נתונים + יצירת טבלאות
npm run db:start

# עצירת מסד הנתונים
npm run db:stop

# הפעלה מחדש של מסד הנתונים
npm run db:restart

# צפייה ב-logs של מסד הנתונים
npm run db:logs

# יצירת טבלאות בלבד (אם המסד כבר רץ)
npm run db:setup
```

## בדיקת התקנה
1. השרת אמור לרוץ על http://localhost:4001
2. בדיקת בריאות: http://localhost:4001/health
3. בלוג השרת אמור להציג:
   ```
   🚀 Server running on port 4001
   📡 Socket.io ready for connections
   ✅ Connected to PostgreSQL database
   ```

## פקודות Docker ברמה נמוכה (לפתרון בעיות)

```bash
# צפייה ב-containers שרצים
docker-compose ps

# עצירה ומחיקת volumes (מחיקת כל הנתונים!)
docker-compose down -v

# כניסה למסד הנתונים בcli
docker-compose exec postgres psql -U icebreak_user -d icebreak_db

# הפעלת container מחדש
docker-compose restart postgres
```

## מבנה הפרויקט

```
backend/
├── config/
│   └── database.js       # חיבור PostgreSQL
├── models/
│   ├── Device.js         # מודל מכשירים
│   └── Game.js          # מודל משחקים
├── routes/
│   └── socket.js        # Socket.io handlers
├── scripts/
│   └── setupDatabase.js # סקריפט הגדרת DB
├── utils/
│   └── idGenerator.js   # יצירת UUIDs
├── docker-compose.yml   # הגדרת Docker
├── init.sql            # סכימת מסד הנתונים
├── server.js           # שרת ראשי
└── .env               # משתני סביבה
```

## Socket.io Events & User Flow

### New 2FA User Management Flow

The application now implements a secure 2FA (Two-Factor Authentication) flow for user registration and game creation:

#### 1. Device Registration
```javascript
// Client sends
socket.emit('register_device', { deviceId: 'optional-existing-id' });

// Server responds
socket.on('device_registered', (data) => {
  // data: { deviceId, userId: null, success: true, isVerified: false }
});
```

#### 2. Game Name Setting (Memory Only)
```javascript
// Client sends
socket.emit('set_game_name', { gameName: 'My Awesome Game' });

// Server responds  
socket.on('game_name_saved', (data) => {
  // data: { gameName, success: true, message: 'Game name saved...' }
});
```

#### 3. Phone Number Submission
```javascript
// Client sends
socket.emit('submit_phone_number', { phoneNumber: '0523737233' });

// Server responds
socket.on('sms_sent', (data) => {
  // data: { phoneNumber: '972523737233', success: true }
});
```

#### 4. 2FA Code Verification & User Creation
```javascript
// Client sends
socket.emit('verify_2fa_code', { code: '123456' });

// Server responds (Success)
socket.on('2fa_verified', (data) => {
  // data: {
  //   success: true,
  //   phoneNumber: '972523737233',
  //   user: {
  //     userId: 'uuid',
  //     phoneNumber: '972523737233', 
  //     createdAt: 'timestamp',
  //     deviceCount: 1,
  //     gamesCreated: 1
  //   },
  //   gameCreated: {  // Auto-created if game name was set
  //     gameId: 'uuid',
  //     gameName: 'My Awesome Game',
  //     status: 'waiting',
  //     createdAt: 'timestamp'
  //   }
  // }
});

// Server responds (Failure)
socket.on('2fa_verification_failed', (data) => {
  // data: { success: false, message: 'Invalid verification code' }
});
```

### Complete User Flow
1. **Device Registration** → Creates device without user
2. **Set Game Name** → Stores name in memory (no DB write)
3. **Phone Submission** → Sends SMS with verification code
4. **2FA Verification** → Creates user + auto-creates game + links device

### Key Features
- **Users created only after phone verification** 
- **Multiple devices per user supported**
- **Existing users can login from new devices**
- **Games auto-created after successful verification**
- **Phone numbers stored in normalized format (972XXXXXXXXX)**

### Database Schema
```sql
-- Users table (created only after verification)
users (
  user_id UUID PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Devices linked to users after verification
devices (
  device_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  created_at TIMESTAMP,
  last_seen TIMESTAMP
)

-- Games linked to verified users
games (
  game_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  creator_user_id UUID REFERENCES users(user_id),
  status VARCHAR(50),
  created_at TIMESTAMP
)
```

### Legacy Socket Events (Still Supported)

#### Client → Server:
- `register_device` - Device registration
- `set_game_name` - Save game name in memory
- `submit_phone_number` - Submit phone for SMS verification
- `verify_2fa_code` - Verify SMS code and create user
- `ping` - Update last seen timestamp

#### Server → Client:
- `device_registered` - Device registration confirmation
- `game_name_saved` - Game name saved confirmation
- `sms_sent` - SMS sent confirmation
- `2fa_verified` - Successful verification + user/game creation
- `2fa_verification_failed` - Failed verification
- `error` - Error messages

## פתרון בעיות

### מסד הנתונים לא עולה
```bash
# בדיקת Docker
docker ps

# הפעלה מחדש
docker-compose restart
```

### שגיאת חיבור למסד נתונים
- בדוק שה-Docker container רץ
- בדוק את ה-.env file
- בדוק שהפורט 5432 פנוי

### Socket.io לא מתחבר
- בדוק שהfrontend רץ על port 4001
- בדוק את הגדרות CORS בserver.js
