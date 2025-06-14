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
1. השרת אמור לרוץ על http://localhost:3001
2. בדיקת בריאות: http://localhost:3001/health
3. בלוג השרת אמור להציג:
   ```
   🚀 Server running on port 3001
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

## Socket.io Events

### Client → Server:
- `register_device` - רישום מכשיר
- `create_game` - יצירת משחק חדש
- `ping` - עדכון זמן ביקור

### Server → Client:
- `device_registered` - אישור רישום מכשיר
- `game_created` - פרטי משחק חדש
- `error` - הודעות שגיאה

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
- בדוק שהfrontend רץ על port 5173
- בדוק את הגדרות CORS בserver.js
