import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import MainHeader from '../components/MainHeader';
import TopMenu from '../components/TopMenu';
import Answer from '../components/Answer';
import AnswerContainer from '../components/AnswerContainer';
import AnimatedImage from '../components/AnimatedImage';
import { useNavigation } from '../contexts/NavigationContext';

// WhatsApp icon component for examples
const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
  </svg>
);

export default function ComponentsShowcase() {
  const { back } = useNavigation();
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Input component states
  const [textInput, setTextInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleMenuAction = (action: string) => {
    console.log('Menu action:', action);
  };

  const sampleAnswers = [
    { id: '1', text: "התשובה הראשונה שלי" },
    { id: '2', text: "תשובה ארוכה יותר שמראה איך הקומפוננטה מתמודדת עם טקסט ארוך" },
    { id: '3', text: "תשובה קצרה" },
    { id: '4', text: "תשובה עם תוכן מעניין שמדגים את הפונקציונליות המלאה של הקומפוננטה" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20 p-6">
        <button
          onClick={back}
          className="mb-4 flex items-center gap-2 text-white hover:text-purple-200 transition-colors duration-200"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            חזור לדף הבית
          </button>
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          🎨 דוגמאות קומפוננטות
        </h1>
        <p className="text-purple-200 text-lg text-center">
          כל הקומפוננטות של האפליקציה במקום אחד - כמו Storybook
        </p>
      </div>

      <div className="p-8 space-y-12">
        
        {/* Button Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🔘 Button Component
            <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">8 variants</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Primary</h4>
              <Button variant="primary" onClick={() => console.log('Primary clicked')}>
                לחץ כאן
              </Button>
            </div>

            {/* Secondary */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Secondary</h4>
              <Button variant="secondary" onClick={() => console.log('Secondary clicked')}>
                לחץ כאן
              </Button>
            </div>

            {/* Ghost */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Ghost</h4>
              <Button variant="ghost" onClick={() => console.log('Ghost clicked')}>
                לחץ כאן
              </Button>
            </div>

            {/* Disabled */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Disabled</h4>
              <Button variant="disabled">
                לא פעיל
              </Button>
            </div>

            {/* Primary Large */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Primary Large</h4>
              <Button variant="primary-large" icon={<WhatsAppIcon />}>
                כפתור גדול
              </Button>
            </div>

            {/* Secondary Small */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Secondary Small</h4>
              <Button variant="secondary-small" icon={<WhatsAppIcon />}>
                כפתור קטן
              </Button>
            </div>

            {/* Outline Purple */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Outline Purple</h4>
              <Button variant="outline-purple">
                מסגרת סגולה
              </Button>
            </div>

            {/* Outline Purple Icon */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Outline Purple Icon</h4>
              <Button variant="outline-purple-icon" icon={<WhatsAppIcon />}>
                עם אייקון
              </Button>
            </div>
          </div>
        </section>

        {/* Input Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            ⌨️ Input Component
            <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full">5 types</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Text Input */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Text Input</h4>
              <Input
                type="text"
                value={textInput}
                onChange={setTextInput}
                placeholder="הכנס טקסט כאן"
                data-testid="demo-text-input"
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Phone Input</h4>
              <Input
                type="tel"
                value={phoneInput}
                onChange={setPhoneInput}
                placeholder="מספר טלפון"
                data-testid="demo-phone-input"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Email Input</h4>
              <Input
                type="email"
                value={emailInput}
                onChange={setEmailInput}
                placeholder="כתובת אימייל"
                data-testid="demo-email-input"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Password Input</h4>
              <Input
                type="password"
                value={passwordInput}
                onChange={setPasswordInput}
                placeholder="סיסמא"
                data-testid="demo-password-input"
              />
            </div>

            {/* Disabled Input */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Disabled Input</h4>
              <Input
                type="text"
                value="לא ניתן לעריכה"
                onChange={() => {}}
                disabled={true}
                data-testid="demo-disabled-input"
              />
            </div>

            {/* AutoFocus Input */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">AutoFocus (refresh to see)</h4>
              <Input
                type="text"
                value=""
                onChange={() => {}}
                placeholder="רכיב זה יקבל פוקוס אוטומטי"
                autoFocus={true}
                data-testid="demo-autofocus-input"
              />
            </div>
          </div>

          <div className="mt-6 text-purple-200 text-sm">
            <p>• תמיכה בסוגי קלט שונים: text, tel, email, password, number</p>
            <p>• עיצוב אחיד עם מעברי צבע חלקים</p>
            <p>• תמיכה ב-focus, disabled, autoFocus</p>
            <p>• placeholder מותאם לשפה העברית</p>
            <p>• עיצוב רספונסיבי</p>
            <p>• אירועי מקלדת (onKeyPress)</p>
          </div>
        </section>

        {/* MainHeader Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            📱 MainHeader Component
          </h2>
          
          <div className="bg-black rounded-2xl overflow-hidden">
            <MainHeader onMenuAction={handleMenuAction} />
          </div>
          
          <div className="mt-4 text-purple-200 text-sm">
            <p>• כולל תפריט המבורגר</p>
            <p>• לוגו מרכזי</p>
            <p>• תמיכה ב-RTL</p>
            <p>• כפתור ניווט</p>
          </div>
        </section>

        {/* TopMenu Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🍔 TopMenu Component
          </h2>
          
          <div className="space-y-4">
            <Button 
              variant="primary" 
              onClick={() => setIsTopMenuOpen(!isTopMenuOpen)}
            >
              {isTopMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
            </Button>
            
            <div className="relative h-96 bg-gray-900 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[60px] bg-black"></div>
              <TopMenu 
                isOpen={isTopMenuOpen} 
                onClose={() => setIsTopMenuOpen(false)} 
                onMenuAction={handleMenuAction}
              />
            </div>
          </div>
          
          <div className="mt-4 text-purple-200 text-sm">
            <p>• תפריט צדדי מונפש</p>
            <p>• 11 פריטי תפריט שונים</p>
            <p>• אפקטים ויזואליים</p>
            <p>• תמיכה ב-RTL</p>
            <p>• החלפת שפה</p>
          </div>
        </section>

        {/* Answer Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            💬 Answer Component
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleAnswers.map((answer, index) => (
                <Answer
                  key={index}
                  text={answer.text}
                  selected={selectedAnswer === answer.id}
                  onClick={() => setSelectedAnswer(selectedAnswer === answer.id ? null : answer.id)}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-purple-200 text-sm">
            <p>• רכיב לתשובות אינטראקטיביות</p>
            <p>• מצב נבחר/לא נבחר</p>
            <p>• אנימציות חלקות</p>
            <p>• עיצוב רספונסיבי</p>
          </div>
        </section>

        {/* AnswerContainer Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            📦 AnswerContainer Component
          </h2>
          
          <div className="space-y-4">
            <AnswerContainer
              answers={sampleAnswers}
              onAnswerClick={(answerId: string) => setSelectedAnswer(answerId)}
            />
          </div>
          
          <div className="mt-4 text-purple-200 text-sm">
            <p>• מיכל לקבוצת תשובות</p>
            <p>• ניהול מצב משותף</p>
            <p>• פריסה אוטומטית</p>
            <p>• אנימציות מתואמות</p>
          </div>
        </section>

        {/* AnimatedImage Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🖼️ AnimatedImage Component
            <span className="text-sm bg-purple-500 text-white px-3 py-1 rounded-full">4 sizes</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Small */}
            <div className="space-y-3 text-center">
              <h4 className="text-white font-semibold">Small</h4>
              <AnimatedImage
                src="/images/game-assets/no-entry.png"
                alt="Small animated image"
                size="small"
              />
            </div>

            {/* Medium */}
            <div className="space-y-3 text-center">
              <h4 className="text-white font-semibold">Medium</h4>
              <AnimatedImage
                src="/images/game-assets/no-entry.png"
                alt="Medium animated image"
                size="medium"
              />
            </div>

            {/* Large */}
            <div className="space-y-3 text-center col-span-full">
              <h4 className="text-white font-semibold">Large</h4>
              <AnimatedImage
                src="/images/game-assets/give-game-name.png"
                alt="Large animated image"
                size="large"
                className="mx-auto"
              />
            </div>

            {/* Custom */}
            <div className="space-y-3 text-center col-span-full">
              <h4 className="text-white font-semibold">Custom Size</h4>
              <AnimatedImage
                src="/images/game-assets/no-entry.png"
                alt="Custom sized image"
                size="custom"
                className="w-40 h-40 mx-auto"
              />
            </div>
          </div>
          
          <div className="mt-6 text-purple-200 text-sm">
            <p>• אנימצית כניסה חלקה (float-in)</p>
            <p>• מעבר לאנימצית ריחוף עדינה לאחר הטעינה</p>
            <p>• אפקט hover עם scale וצל מאחור</p>
            <p>• 4 גדלים מוכנים: small, medium, large, custom</p>
            <p>• משמש בעמודי EnterPhoneNumber ו-GiveGameName</p>
            <p>• תמיכה ב-className מותאם אישית</p>
          </div>
        </section>

        {/* PageLayout Component */}
        <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🏗️ PageLayout Component
            <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full">Layout</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            
            <div className="space-y-4">
              <h4 className="text-white font-semibold">תכונות עיקריות:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-100">
                <div className="bg-black bg-opacity-20 rounded-lg p-4">
                  <strong className="text-blue-300">showHeader:</strong> מציג את המהדר הראשי
                </div>
                <div className="bg-black bg-opacity-20 rounded-lg p-4">
                  <strong className="text-blue-300">onBack:</strong> כפתור חזרה (רק בלי header)
                </div>
                <div className="bg-black bg-opacity-20 rounded-lg p-4">
                  <strong className="text-blue-300">title:</strong> כותרת אופציונלית לעמוד
                </div>
                <div className="bg-black bg-opacity-20 rounded-lg p-4">
                  <strong className="text-blue-300">onMenuAction:</strong> פעולות תפריט
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">דוגמאות שימוש:</h4>
              <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-2">
                <p className="text-purple-200">
                  <strong className="text-yellow-300">עמוד בית:</strong>
                  {' '}{'<PageLayout showHeader={true} onMenuAction={handleMenuNavigation}>'}
                </p>
                <p className="text-purple-200">
                  <strong className="text-yellow-300">עמוד רגיל:</strong>
                  {' '}{'<PageLayout onBack={() => goBack()} title="כותרת העמוד">'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">רקע ועיצוב:</h4>
              <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-2">
                <p className="text-purple-200">
                  ✅ <strong>רקע:</strong> background.png מתיקיית public/images/backgrounds/
                </p>
                <p className="text-purple-200">
                  ✅ <strong>שכבת כיסוי:</strong> gradient חצי שקוף לקריאות טובה יותר
                </p>
                <p className="text-purple-200">
                  ✅ <strong>תמיכה ב-RTL:</strong> כפתור חזרה מותאם לכיוון הטקסט
                </p>
                <p className="text-purple-200">
                  ✅ <strong>רספונסיבי:</strong> מותאם לכל גדלי מסך
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">שימוש בפרויקט:</h4>
              <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-2">
                <p className="text-purple-200">
                  🏠 <strong>דף הבית:</strong> משתמש ב-PageLayout עם showHeader=true
                </p>
                <p className="text-purple-200">
                  📄 <strong>דפים אחרים:</strong> AboutPage ו-ComponentsShowcase משתמשים ב-PageLayout
                </p>
                <p className="text-purple-200">
                  🎨 <strong>עיצוב אחיד:</strong> כל הדפים חולקים את אותו רקע ומבנה
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions for Developers */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 border-2 border-white border-opacity-30">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            📋 הוראות למפתחים
          </h2>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">🔧 יצירת קומפוננטה חדשה</h3>
            <div className="text-white space-y-2">
              <p className="font-semibold">כאשר יוצרים קומפוננטה חדשה, יש לבצע את השלבים הבאים:</p>
              <ol className="list-decimal list-inside space-y-2 text-purple-100">
                <li>ליצור את הקומפוננטה בתיקיה <code className="bg-black bg-opacity-30 px-2 py-1 rounded">src/components/</code></li>
                <li>להוסיף דוגמא של הקומפוננטה לדף הזה (<code className="bg-black bg-opacity-30 px-2 py-1 rounded">ComponentsShowcase.tsx</code>)</li>
                <li>לכלול הסבר קצר על הפונקציונליות</li>
                <li>להציג את כל הvariantsים והstatesים האפשריים</li>
                <li>לוודא שהדוגמא אינטראקטיבית</li>
              </ol>
            </div>
            
            <div className="bg-black bg-opacity-30 rounded-xl p-4 mt-4">
              <h4 className="text-lg font-bold text-yellow-300 mb-2">💡 טיפים חשובים:</h4>
              <ul className="text-purple-100 space-y-1 text-sm">
                <li>• השתמש בצבעים שונים להבדלה בין variants</li>
                <li>• הוסף הסברים טכניים לכל קומפוננטה</li>
                <li>• ודא שהדוגמאות רספונסיביות</li>
                <li>• בדוק תמיכה ב-RTL אם רלוונטי</li>
                <li>• כלול states שונים (hover, active, disabled)</li>
                <li>• 📖 <strong>קרא את המדריך המלא ב-COMPONENTS_GUIDE.md</strong></li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
