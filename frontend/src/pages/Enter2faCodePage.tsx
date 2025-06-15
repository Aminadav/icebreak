import { useState, useRef, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';

interface Enter2faCodePageProps {
  phoneNumber?: string;
}

export default function Enter2faCodePage({ phoneNumber }: Enter2faCodePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  // Set up socket event listeners once when component mounts
  useEffect(() => {
    if (!socket) return;

    const verificationSuccessHandler = (data: any) => {
      setIsLoading(false);
      console.log('✅ 2FA verification successful:', data);
      
      // Show success message with user info and game creation
      const userInfo = data.user;
      const gameCreated = data.gameCreated;
      
      let successMessage = userInfo 
        ? `✅ ברוך הבא! ${userInfo.deviceCount > 1 ? `מצאנו ${userInfo.deviceCount} מכשירים שלך` : 'זהו המכשיר הראשון שלך'}`
        : '✅ קוד האימות אומת בהצלחה!';
      
      // Add game creation message if applicable
      if (gameCreated) {
        successMessage += `\n🎮 המשחק "${gameCreated.gameName}" נוצר בהצלחה!`;
        console.log('🎮 Game auto-created after verification:', gameCreated);
      }
      
      alert(successMessage);
      
      // Store user information if available
      if (userInfo) {
        console.log(`👤 User logged in: ${userInfo.userId}, Games: ${userInfo.gamesCreated}, Devices: ${userInfo.deviceCount}`);
      }
      
      // TODO: Navigate to next step or complete flow
    };

    const verificationFailureHandler = (data: any) => {
      setIsLoading(false);
      setError('קוד האימות שגוי');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      console.log('❌ 2FA verification failed:', data);
    };

    const errorHandler = (data: any) => {
      // Only handle errors that don't have a specific handler
      if (data.context === '2fa') {
        setIsLoading(false);
        setError(data.message || 'שגיאה באימות הקוד');
        console.error('❌ 2FA verification error:', data);
      }
    };

    // Remove any existing listeners first to prevent duplicates
    socket.off('2fa_verified');
    socket.off('2fa_verification_failed');
    
    // Add event listeners
    socket.on('2fa_verified', verificationSuccessHandler);
    socket.on('2fa_verification_failed', verificationFailureHandler);
    socket.on('error', errorHandler);

    // Cleanup function to remove listeners when component unmounts
    return () => {
      socket.off('2fa_verified', verificationSuccessHandler);
      socket.off('2fa_verification_failed', verificationFailureHandler);
      socket.off('error', errorHandler);
    };
  }, [socket]);

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Handle pasted content (especially for mobile SMS auto-fill)
    if (value.length > 1) {
      // Extract only digits
      const digits = value.replace(/\D/g, '');
      if (digits.length >= 6) {
        // If we have 6 or more digits, fill all inputs
        const newCode = [...code];
        for (let i = 0; i < 6; i++) {
          newCode[i] = digits[i] || '';
        }
        setCode(newCode);
        // Focus on last input or blur if complete
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
        // Auto-submit if code is complete with the new code
        setTimeout(() => {
          handleContinueWithCode(newCode);
        }, 100);
        return;
      }
    }

    // Handle single character input
    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, '');
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when code is complete
    if (newCode.every(digit => digit !== '') && newCode.length === 6) {
      setTimeout(() => {
        handleContinueWithCode(newCode);
      }, 100);
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

  const handlePaste = (_index: number, e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '');
    
    if (digits.length >= 6) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || '';
      }
      setCode(newCode);
      // Focus on last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleContinueWithCode = async (codeArray?: string[]) => {
    const fullCode = codeArray ? codeArray.join('') : code.join('');
    if (fullCode.length !== 6) {
      setError('יש להכניס קוד בן 6 ספרות');
      return;
    }

    if (!socket) {
      setError('אין חיבור לשרת');
      return;
    }

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Emit verification request (listeners are already set up in useEffect)
      console.log('📤 Emitting verify_2fa_code:', fullCode);
      socket.emit('verify_2fa_code', { code: fullCode });
    } catch (error) {
      console.error('Failed to verify 2FA code:', error);
      setError('שגיאה באימות הקוד');
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    await handleContinueWithCode();
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
        
        {/* Hidden input for SMS auto-fill support on mobile */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            opacity: 0, 
            pointerEvents: 'none',
            height: '1px',
            width: '1px'
          }}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
              const newCode = [...code];
              for (let i = 0; i < 6; i++) {
                newCode[i] = value[i] || '';
              }
              setCode(newCode);
            }
          }}
        />
        
        {/* Code Input Fields */}
        <div className={`flex gap-2 mb-8 sm:mb-12 transition-transform duration-300 ${shake ? 'animate-pulse' : ''}`} dir="ltr">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={(e) => e.target.select()}
              className={`w-10 h-12 sm:w-12 sm:h-16 text-xl sm:text-2xl font-bold text-center text-black bg-white border-2 rounded-lg focus:outline-none focus:border-orange-400 transition-colors touch-manipulation ${
                error ? 'border-red-400' : 'border-gray-300'
              }`}
              maxLength={6}
              placeholder="●"
              aria-label={`Verification code digit ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Tap to paste hint for mobile */}
        <div className="mb-4 text-center sm:hidden">
          <p className="text-sm text-white opacity-70">
            💡 קיבלת SMS? לחץ על שדה הקוד כדי להדביק
          </p>
        </div>
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!isCodeComplete || isLoading}
            trackingId="enter_2fa_code_verify_clicked"
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
