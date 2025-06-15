import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';

interface EnterPhoneNumberPageProps {
  onBack: () => void;
  onContinue: (phoneNumber: string) => void;
  onMenuAction?: (page: string) => void;
}

export default function EnterPhoneNumberPage({ onBack, onContinue, onMenuAction }: EnterPhoneNumberPageProps): JSX.Element {
  const { texts } = useLanguage();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silence unused warnings - keeping for future use
  void onContinue;

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      setError('מספר טלפון נדרש');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, just simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`✅ מספר הטלפון ${phoneNumber} נשמר בהצלחה!`);
      console.log('📱 Phone number entered:', phoneNumber);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to process phone number:', error);
      setError('שגיאה בשמירת מספר הטלפון');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && phoneNumber.trim() && !isLoading) {
      handleContinue();
    }
  };

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={onMenuAction}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* No Entry Icon */}
        <AnimatedImage
          src="/images/game-assets/no-entry.png"
          alt="No Entry Icon"
          size="medium"
        />
        
        {/* Title */}
        <div className="max-w-md mb-8 text-center">
          <h1 className="text-3xl font-bold leading-tight text-white">
            {texts.enterPhoneNumber.title}
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
        
        {/* Subtitle */}
        <div className="max-w-md mb-8 text-center">
          <p className="text-lg text-white opacity-90">
            {texts.enterPhoneNumber.subtitle}
          </p>
        </div>
        
        {/* Phone number input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={setPhoneNumber}
          onKeyPress={handleKeyPress}
          placeholder={texts.enterPhoneNumber.placeholder}
          className="mb-8"
          autoFocus
        />
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!phoneNumber.trim() || isLoading}
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              phoneNumber.trim() && !isLoading
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                שולח...
              </div>
            ) : (
              texts.enterPhoneNumber.continueButton
            )}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
