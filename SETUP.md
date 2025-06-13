# תשתית משחק Icebreaker

## מבנה הפרויקט

```
icebreak-app/
├── client/          # React + TypeScript Frontend
├── server/          # Node.js + Socket.io Backend  
├── shared/          # קבצים משותפים
└── package.json     # הגדרות פרויקט ראשיות
```

## התקנה

1. התקינו את התלויות:
```bash
npm install
```

2. הגדירו משתני סביבה:
```bash
# בתיקיית server
cp .env.example .env
# ערכו את הקובץ עם הנתונים שלכם

# בתיקיית client  
cp .env.example .env
```

3. הגדירו את מסד הנתונים:
```bash
cd server
npm run db:push
npm run db:generate
```

## הרצה

### Development Mode
```bash
# הרצת הפרויקט כולו
npm run dev

# או בנפרד:
npm run server:dev  # שרת על פורט 3001
npm run client:dev  # לקוח על פורט 3000
```

### Production
```bash
npm run build
npm start
```

## תכונות מובנות

### 🔄 Real-time Communication
- Socket.io לחיבור realtime בין לקוח לשרת
- עדכונים מיידיים למצב המשחק

### 📄 Pagination
- רשימות עם pagination אוטומטית
- אנימציות טעינה וטיפול בשגיאות
- "טען עוד" בגלילה

### 🌐 ריבוי שפות
- תמיכה בעברית ואנגלית
- החלפה מיידית ללא רענון דף
- RTL/LTR אוטומטי

### 📊 Analytics
- אינטגרציה עם Mixpanel
- מעקב אחר כל הקליקים
- שמירה מקומית במסד נתונים

### 🎮 ניהול State
- Zustand לניהול state קל ויעיל
- חנויות נפרדות: Auth, Game, UI
- Type-safe עם TypeScript

### 🔐 אימות
- JWT tokens
- הרשמה והתחברות
- הגנה על routes

### 💌 מערכת אימיילים
- Nodemailer למשלוח אימיילים
- הגבלת קצב שליחה
- ביטול הרשמה

## מבנה הקוד

### Server (`/server`)
- `src/index.ts` - נקודת כניסה ראשית
- `src/sockets/` - טיפול ב-Socket.io events  
- `src/controllers/` - API endpoints
- `src/services/` - לוגיקה עסקית
- `src/types/` - הגדרות TypeScript
- `prisma/schema.prisma` - מבנה מסד הנתונים

### Client (`/client`)
- `src/App.tsx` - קומפוננט ראשי
- `src/stores/` - Zustand stores
- `src/services/` - שירותים (Socket, HTTP)
- `src/components/` - קומפוננטים React
- `src/i18n/` - תרגומים
- `src/types/` - הגדרות TypeScript

## Scripts זמינים

```bash
# Root level
npm run dev          # הרצת פיתוח
npm run build        # בנייה לפרודקשן
npm start           # הרצת פרודקשן

# Server
npm run server:dev   # פיתוח שרת
npm run db:push      # עדכון מסד נתונים
npm run db:studio    # פתיחת Prisma Studio

# Client  
npm run client:dev   # פיתוח לקוח
```

## טכנולוגיות

**Backend:**
- Node.js + Express
- Socket.io לרeattime
- TypeScript
- PostgreSQL + Prisma
- JWT + bcrypt
- Mixpanel Analytics

**Frontend:**
- React 18 + TypeScript
- Socket.io-client  
- Zustand לState Management
- TailwindCSS לעיצוב
- React Router לניווט
- i18next לריבוי שפות

## הגדרות סביבה

### Server `.env`
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"  
EMAIL_PASS="your-app-password"
MIXPANEL_TOKEN="your-token"
PORT=3001
CLIENT_URL="http://localhost:3000"
```

### Client `.env`
```env
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_MIXPANEL_TOKEN=your-token
```

## פיתוח נוסף

התשתית מוכנה להוספת:
- עוד דפים ומסכים
- שאלות מותאמות אישית
- מערכת ניקוד
- היסטוריית משחקים
- חדרים פרטיים/ציבוריים

התשתית תומכת בכל הדרישות מה-README המקורי והיא מוכנה לפיתוח המשך של המשחק.
