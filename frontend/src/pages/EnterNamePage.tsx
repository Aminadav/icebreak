import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';

interface EnterNamePageProps {
  phoneNumber?: string;
  userId?: string;
  email?: string;
}

export default function EnterNamePage({ phoneNumber, userId, email }: EnterNamePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📤 Saving name:', name);
      
      // TODO: Save name and navigate to next step
      // This might be the dashboard, game lobby, or completion page
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Failed to save name:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setName(value);
  };

  const isNameValid = name.trim().length > 0;

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
      onBack={back}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Name Entry Icon */}
        <AnimatedImage
          src="/images/game-assets/enter-name.png"
          alt="Enter Name Icon"
          size="medium"
        />
        
        {/* Title */}
        <div className="max-w-md mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white">
            {texts.enterName.title}
          </h1>
        </div>
        
        {/* Name Input */}
        <div className="w-full max-w-md mb-8">
          <Input
            value={name}
            onChange={handleInputChange}
            placeholder={texts.enterName.placeholder}
            type="text"
            disabled={isLoading}
            className="w-full"
            data-testid="name-input"
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' && isNameValid) {
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
            disabled={!isNameValid || isLoading}
            trackingId="enter_name_continue_clicked"
            data-testid="name-continue-button"
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              isNameValid && !isLoading
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
              texts.enterName.continueButton
            )}
          </Button>
        </div>

        {/* Debug info - only show in development */}
        {(phoneNumber || email) && (
          <div className="mt-4 text-sm text-white opacity-70">
            {phoneNumber && `טלפון: ${phoneNumber}`} 
            {phoneNumber && email && ' | '}
            {email && `אימייל: ${email}`}
            {userId && ` | משתמש: ${userId}`}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
