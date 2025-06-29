import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';

import { useGameId } from '../utils/useGameId';

interface EnterPhoneNumberPageProps {
  gameId?: string;
}

export default function EnterPhoneNumberPage(): JSX.Element {
  const { texts } = useLanguage();
  var gameId = useGameId(); // Get gameId from context or utility
  const { socket } = useSocket();
  
  const navigate = useNavigate(); // For game flow navigation
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      setError('מספר טלפון נדרש');
      return;
    }

    if (!socket) {
      setError('אין חיבור לשרת');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Emit phone number (listeners are already set up in useEffect)
      // console.log('📤 Emitting submit_phone_number:', phoneNumber);
      socket.emit('submit_phone_number', { phoneNumber,gameId });
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
          inputMode="tel"
          autoComplete="tel"
          /*trackingId="phone_number"*/
          trackingId="phone-number-input"
        />
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!phoneNumber.trim() || isLoading}
            /*trackingId="enter_phone_number_continue_clicked"*/
            trackingId="phone-number-continue-button"
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
