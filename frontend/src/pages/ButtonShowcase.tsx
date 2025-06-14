import Button from '../components/Button';

// WhatsApp icon component
const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
  </svg>
);

export default function ButtonShowcase() {
  const handleButtonClick = (variant: string) => {
    console.log(`Clicked ${variant} button`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            דוגמאות כפתורים
          </h1>
          <p className="text-purple-200 text-lg">
            8 סגנונות שונים של כפתורים רספונסיביים ואינטראקטיביים
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Primary Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Primary</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור ראשי עם גרדיאנט כתום</p>
            <Button 
              variant="primary" 
              onClick={() => handleButtonClick('primary')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Secondary Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Secondary</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור שקוף עם מסגרת לבנה</p>
            <Button 
              variant="secondary" 
              onClick={() => handleButtonClick('secondary')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Ghost Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Ghost</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור טקסט עם קו תחתון</p>
            <Button 
              variant="ghost" 
              onClick={() => handleButtonClick('ghost')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Disabled Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Disabled</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור לא פעיל</p>
            <Button 
              variant="disabled" 
              onClick={() => handleButtonClick('disabled')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Primary Large Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Primary Large</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור גדול עם אייקון</p>
            <Button 
              variant="primary-large" 
              icon={<WhatsAppIcon />}
              onClick={() => handleButtonClick('primary-large')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Secondary Small Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Secondary Small</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור קטן עם אייקון</p>
            <Button 
              variant="seoncdary-small" 
              icon={<WhatsAppIcon />}
              onClick={() => handleButtonClick('secondary-small')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Outline Purple Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Outline Purple</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור עם מסגרת סגולה</p>
            <Button 
              variant="outline-purple" 
              onClick={() => handleButtonClick('outline-purple')}
            >
              משחק בלי תמונות
            </Button>
          </div>

          {/* Outline Purple with Icon Button */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Outline Purple Icon</h3>
            <p className="text-purple-200 mb-4 text-sm">כפתור עם מסגרת סגולה ואייקון</p>
            <Button 
              variant="outline-purple-icon" 
              icon={<WhatsAppIcon />}
              onClick={() => handleButtonClick('outline-purple-icon')}
            >
              משחק בלי תמונות
            </Button>
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="mt-16 bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            דוגמה אינטראקטיבית
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" onClick={() => alert('Primary clicked!')}>
              Primary
            </Button>
            <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
              Secondary
            </Button>
            <Button variant="seoncdary-small" icon={<WhatsAppIcon />}>
              WhatsApp
            </Button>
            <Button variant="outline-purple" onClick={() => alert('Outline clicked!')}>
              Outline
            </Button>
          </div>
        </div>

        {/* Wide Demo Section */}
        <div className="mt-16 bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            דוגמה עם כפתור רחב
          </h2>
          <div className="max-w-2xl mx-auto">
            <Button 
              variant="primary" 
              className="w-full text-lg py-4"
              onClick={() => alert('Wide button clicked!')}
            >
              כפתור רחב עם טקסט ארוך שמתגלה מימין לשמאל בצורה הדרגתית ויפה
            </Button>
            
            <div className="mt-6">
              <Button 
                variant="primary-large" 
                className="w-full text-xl py-5"
                icon={<WhatsAppIcon />}
                onClick={() => alert('Wide button with icon clicked!')}
              >
                כפתור רחב עם אייקון וטקסט ארוך מאוד שמראה איך האפקט נראה עם תוכן נרחב יותר
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <p className="text-purple-200 text-lg">
            💡 העבר עכבר על הכפתורים כדי לראות אפקטים ולחץ כדי לבדוק אינטראקטיביות
          </p>
        </div>
      </div>
    </div>
  );
}
