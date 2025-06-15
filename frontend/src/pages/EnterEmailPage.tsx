import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';

interface EnterEmailPageProps {
  phoneNumber?: string;
  userId?: string;
}

export default function EnterEmailPage({ phoneNumber, userId }: EnterEmailPageProps): JSX.Element {
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      setError('יש להכניס כתובת אימייל');
      return;
    }

    if (!validateEmail(email)) {
      setError('כתובת האימייל אינה תקינה');
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
      console.log('📤 Saving email address:', email);
      
      // Emit email save request
      socket.emit('save_email', { 
        email: email.toLowerCase().trim(),
        userId 
      });
      
      // Listen for response
      const handleEmailSaved = (data: any) => {
        setIsLoading(false);
        console.log('✅ Email saved successfully:', data);
        
        // Show success message
        alert('✅ כתובת האימייל נשמרה בהצלחה!');
        
        // TODO: Navigate to next step or complete the flow
        // This might be the dashboard, game lobby, or completion page
        
        // Cleanup listener
        socket.off('email_saved', handleEmailSaved);
        socket.off('email_save_error', handleEmailError);
      };
      
      const handleEmailError = (data: any) => {
        setIsLoading(false);
        setError(data.message || 'שגיאה בשמירת כתובת האימייל');
        console.error('❌ Email save error:', data);
        
        // Cleanup listener
        socket.off('email_saved', handleEmailSaved);
        socket.off('email_save_error', handleEmailError);
      };
      
      // Set up one-time listeners
      socket.once('email_saved', handleEmailSaved);
      socket.once('email_save_error', handleEmailError);
      
    } catch (error) {
      console.error('Failed to save email:', error);
      setError('שגיאה בשמירת כתובת האימייל');
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError(null);
    }
  };

  const isEmailValid = email.trim() && validateEmail(email);

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
      onBack={back}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Email Icon */}
        <AnimatedImage
          src="/images/game-assets/email.png"
          alt="Email Icon"
          size="medium"
        />
        
        {/* Title and Subtitle */}
        <div className="max-w-md mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white">
            {texts.enterEmail.title}
          </h1>
          <p className="text-lg text-white opacity-80">
            {texts.enterEmail.subtitle}
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-md mb-4 text-center">
            <p className="px-4 py-2 text-lg text-red-400 bg-red-100 rounded-lg bg-opacity-20">
              {error}
            </p>
          </div>
        )}
        
        {/* Email Input */}
        <div className="w-full max-w-md mb-8">
          <Input
            value={email}
            onChange={handleInputChange}
            placeholder={texts.enterEmail.placeholder}
            type="email"
            disabled={isLoading}
            className="w-full"
            data-testid="email-input"
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' && isEmailValid) {
                handleContinue();
              }
            }}
          />
        </div>
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!isEmailValid || isLoading}
            trackingId="enter_email_continue_clicked"
            data-testid="email-continue-button"
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              isEmailValid && !isLoading
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                שומר...
              </div>
            ) : (
              texts.enterEmail.continueButton
            )}
          </Button>
        </div>

        {/* Debug info - only show in development */}
        {phoneNumber && (
          <div className="mt-4 text-sm text-white opacity-70">
            טלפון: {phoneNumber} | משתמש: {userId}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
