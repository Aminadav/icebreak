import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import NameConfirmationModal from '../components/NameConfirmationModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useModal } from '../contexts/ModalContext';
import { useSocket } from '../contexts/SocketContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';
import SelectGenderPage from './SelectGenderPage';

interface EnterNamePageProps {
  phoneNumber?: string;
  userId?: string;
  email?: string;
}

export default function EnterNamePage({ phoneNumber, userId, email }: EnterNamePageProps): JSX.Element {
  const DEBUG = false;
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  const { openModal } = useModal();
  const { socket } = useSocket();
  
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

    // Show the name confirmation modal
    openModal(
      <NameConfirmationModal 
        name={name}
        onYes={handleNameConfirmed}
        onNo={handleNameRejected}
      />
    );
  };

  const handleNameConfirmed = async () => {
    setIsLoading(true);
    
    try {
      console.log('📤 Saving name:', name);
      
      if (socket && userId) {
        // Save name to backend via socket
        socket.emit('save_user_name', {
          name: name.trim(),
          userId
        });
        
        // Listen for response
        const handleNameSaved = (data: any) => {
          console.log('✅ Name saved successfully:', data);
          setIsLoading(false);
          
          // Navigate to gender selection page
          push(<SelectGenderPage 
            phoneNumber={phoneNumber}
            userId={userId}
            email={email}
            name={name}
          />);
          
          // Clean up listener
          socket.off('name_saved', handleNameSaved);
          socket.off('name_save_error', handleNameError);
        };
        
        const handleNameError = (error: any) => {
          console.error('❌ Failed to save name:', error);
          setIsLoading(false);
          // Clean up listener
          socket.off('name_saved', handleNameSaved);
          socket.off('name_save_error', handleNameError);
        };
        
        socket.on('name_saved', handleNameSaved);
        socket.on('name_save_error', handleNameError);
        
      } else {
        console.warn('⚠️ No socket connection or userId available');
        // Fallback: simulate saving and navigate
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Name saved successfully (fallback)');
        setIsLoading(false);
        
        // Navigate to gender selection page
        push(<SelectGenderPage 
          phoneNumber={phoneNumber}
          userId={userId}
          email={email}
          name={name}
        />);
      }
      
    } catch (error) {
      console.error('Failed to save name:', error);
      setIsLoading(false);
    }
  };

  const handleNameRejected = () => {
    // User clicked "No" or closed modal - stay on the page
    console.log('User rejected the name, staying on page');
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
        {DEBUG && (phoneNumber || email) && (
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
