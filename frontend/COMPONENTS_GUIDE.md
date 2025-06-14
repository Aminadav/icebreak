# הוראות יצירת קומפוננטות - IceBreak App

## 📋 הנחיות כלליות

כאשר יוצרים קומפוננטה חדשה באפליקציה, **חובה** לבצע את השלבים הבאים:

### 1. יצירת הקומפוננטה
- צור את הקומפוננטה בתיקיה `src/components/`
- השתמש בTypeScript עם ממשק Props מוגדר
- הוסף תיעוד JSDoc למתודות ציבוריות

### 2. הוספה לדף הדוגמאות
**⚠️ חובה!** הוסף דוגמא של הקומפוננטה לקובץ `src/pages/ComponentsShowcase.tsx`

#### מה לכלול בדוגמא:
- [ ] כל הvariants/states של הקומפוננטה
- [ ] דוגמאות אינטראקטיביות
- [ ] הסבר קצר על הפונקציונליות
- [ ] רשימת תכונות עיקריות
- [ ] בדיקת תמיכה ב-RTL (אם רלוונטי)

#### מבנה הקוד לדוגמא:
```tsx
{/* [שם הקומפוננטה] Component */}
<section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
    🎯 [שם הקומפוננטה] Component
    <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">[מספר variants]</span>
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* דוגמאות שונות */}
  </div>
  
  <div className="mt-4 text-purple-200 text-sm">
    <p>• תכונה 1</p>
    <p>• תכונה 2</p>
    <p>• תכונה 3</p>
  </div>
</section>
```

### 3. עקרונות עיצוב

#### צבעים והבדלה
- השתמש בצבעי gradient שונים לכל variant
- ודא ניגודיות מספקת לנגישות
- השתמש במטריצת הצבעים הקיימת:
  - כתום: `from-orange-400 to-orange-500`
  - סגול: `from-purple-400 to-purple-600`
  - כחול: `from-blue-400 to-blue-600`
  - ירוק: `from-green-400 to-green-600`
  - ורוד: `from-pink-400 to-pink-600`

#### רספונסיביות
```tsx
// ודא שהדוגמאות עובדות בכל הגדלים
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

#### תמיכה ב-RTL
```tsx
// אם הקומפוננטה תומכת בכיוון RTL
const { texts } = useLanguage();
const isRTL = texts.direction === 'rtl';
```

### 4. States לבדיקה

לכל קומפוננטה, ודא שקיימות דוגמאות ל:
- [ ] **Normal state** - מצב רגיל
- [ ] **Hover state** - מצב ריחוף
- [ ] **Active/Pressed state** - מצב לחיצה
- [ ] **Disabled state** - מצב לא פעיל
- [ ] **Selected state** - מצב נבחר (אם רלוונטי)
- [ ] **Loading state** - מצב טעינה (אם רלוונטי)
- [ ] **Error state** - מצב שגיאה (אם רלוונטי)

### 5. דוגמא לקומפוננטה טיפוסית

```tsx
// src/components/MyNewComponent.tsx
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export type MyComponentVariant = 'primary' | 'secondary' | 'disabled';

interface MyComponentProps {
  variant: MyComponentVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * קומפוננטה לדוגמא
 * @param variant - סוג הקומפוננטה
 * @param children - תוכן הקומפוננטה
 * @param onClick - פונקציה לטיפול בלחיצה
 * @param disabled - האם הקומפוננטה לא פעילה
 * @param className - מחלקות CSS נוספות
 */
export default function MyNewComponent({ 
  variant, 
  children, 
  onClick, 
  disabled = false, 
  className = '' 
}: MyComponentProps) {
  const { texts } = useLanguage();
  const [isPressed, setIsPressed] = useState(false);
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    disabled: 'bg-gray-300 cursor-not-allowed'
  };
  
  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
```

### 6. הוספה לComponentsShowcase.tsx

```tsx
// הוסף בתחילת הקובץ
import MyNewComponent from '../components/MyNewComponent';

// הוסף בתוך הrender
<section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
    🆕 MyNewComponent
    <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">3 variants</span>
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="space-y-3">
      <h4 className="text-white font-semibold">Primary</h4>
      <MyNewComponent variant="primary">
        תוכן דוגמא
      </MyNewComponent>
    </div>
    
    <div className="space-y-3">
      <h4 className="text-white font-semibold">Secondary</h4>
      <MyNewComponent variant="secondary">
        תוכן דוגמא
      </MyNewComponent>
    </div>
    
    <div className="space-y-3">
      <h4 className="text-white font-semibold">Disabled</h4>
      <MyNewComponent variant="disabled" disabled>
        לא פעיל
      </MyNewComponent>
    </div>
  </div>
  
  <div className="mt-4 text-purple-200 text-sm">
    <p>• תכונה ראשונה</p>
    <p>• תכונה שנייה</p>
    <p>• תמיכה ב-RTL</p>
    <p>• אנימציות חלקות</p>
  </div>
</section>
```

### 7. בדיקת איכות

לפני סיום הפיתוח:
- [ ] הקומפוננטה עובדת בכל הדפדפנים העיקריים
- [ ] אין שגיאות TypeScript
- [ ] אין אזהרות console
- [ ] הדוגמא ב-ComponentsShowcase פועלת
- [ ] הקומפוננטה רספונסיבית
- [ ] יש תמיכה ב-RTL (אם נדרש)
- [ ] הצבעים עקביים עם הapp

### 8. טיפים לפיתוח

#### ביצועים
- השתמש ב-`React.memo` לקומפוננטות כבדות
- הימנע מיצירת אובייקטים בrender
- השתמש ב-`useCallback` ו-`useMemo` במקרים מתאימים

#### נגישות
- הוסף `aria-label` לכפתורים ללא טקסט
- ודא שניתן לנווט עם המקלדת
- שמור על ניגודיות צבעים

#### תיעוד
- כתב תיעוד JSDoc לפונקציות ציבוריות
- הוסף הערות לקוד מורכב
- עדכן את README אם יש שינויים במבנה

---

## 🎯 דוגמאות קיימות

ניתן לראות דוגמאות לקומפוננטות קיימות ב:
- `src/pages/ComponentsShowcase.tsx` - הדף המרכזי
- `src/pages/ButtonShowcase.tsx` - דוגמא מפורטת לכפתורים

**זכור: כל קומפוננטה חדשה חייבת להופיע ב-ComponentsShowcase!**
