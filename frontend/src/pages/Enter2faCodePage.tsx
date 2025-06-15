import { useState, useRef, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';

interface Enter2faCodePageProps {
  phoneNumber?: string;
}

export default function Enter2faCodePage({ phoneNumber }: Enter2faCodePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleContinue();
    }
  };

  const handleContinue = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('יש להכניס קוד בן 6 ספרות');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, just simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`✅ קוד האימות ${fullCode} אומת בהצלחה!`);
      console.log('🔐 2FA code entered:', fullCode);
      setIsLoading(false);
      // TODO: Navigate to next step or complete flow
    } catch (error) {
      console.error('Failed to verify 2FA code:', error);
      setError('שגיאה באימות הקוד');
      setIsLoading(false);
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
      onBack={back}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Phone Icon */}
        <AnimatedImage
          src="/images/game-assets/phone.png"
          alt="Phone Icon"
          size="medium"
        />
        
        {/* Title */}
        <div className="max-w-md mb-12 text-center">
          <h1 className="text-3xl font-bold leading-tight text-white">
            {texts.enter2faCode.title}
          </h1>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-md mb-4 text-center">
            <p className="px-4 py-2 text-lg text-red-400 bg-red-100 rounded-lg bg-opacity-20">
              {error}
            </p>
          </div>
        )}
        
        {/* Code Input Fields */}
        <div className="flex gap-2 mb-12" dir="ltr" >
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-16 text-2xl font-bold text-center text-black bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
              maxLength={1}
            />
          ))}
        </div>
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!isCodeComplete || isLoading}
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              isCodeComplete && !isLoading
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                מאמת...
              </div>
            ) : (
              texts.enter2faCode.continueButton
            )}
          </Button>
        </div>

        {/* Debug info - only show in development */}
        {phoneNumber && (
          <div className="mt-4 text-sm text-white opacity-70">
            SMS נשלח ל: {phoneNumber}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
