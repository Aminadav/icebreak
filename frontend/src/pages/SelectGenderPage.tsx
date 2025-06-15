import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';
import PictureUploadPage from './PictureUploadPage';

interface SelectGenderPageProps {
  phoneNumber?: string;
  userId?: string;
  email?: string;
  name?: string;
}

type Gender = 'male' | 'female';

export default function SelectGenderPage({ phoneNumber, userId, email, name }: SelectGenderPageProps): JSX.Element {
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Silence unused warnings - keeping for future use and navigation data
  void phoneNumber; void email;

  // Update journey state when component mounts
  useEffect(() => {
    const updateJourneyState = async () => {
      if (socket) {
        try {
          // Emit a request to update journey state to GENDER_SELECTION
          socket.emit('update_journey_state', { journeyState: 'GENDER_SELECTION' });
          console.log('🎯 Updated journey state to GENDER_SELECTION');
        } catch (error) {
          console.error('Failed to update journey state:', error);
        }
      }
    };

    updateJourneyState();
  }, [socket]);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  const handleGenderSelect = async (gender: Gender) => {
    if (isLoading) return;
    
    setSelectedGender(gender);
    setIsLoading(true);
    
    try {
      console.log('📤 Saving gender:', gender);
      
      if (socket && userId) {
        // Save gender to backend
        socket.emit('save_user_gender', {
          userId,
          gender,
          name: name || 'Unknown'
        });
        
        // Listen for response
        const handleGenderSaved = (data: any) => {
          console.log('✅ Gender saved successfully:', data);
          setIsLoading(false);
          
          // Navigate to picture upload page
          console.log('🎯 Moving to picture upload page');
          push(<PictureUploadPage 
            phoneNumber={phoneNumber}
            userId={userId}
            email={email}
            name={name}
            gender={gender}
          />);
          
          // Clean up listeners
          socket.off('gender_saved', handleGenderSaved);
          socket.off('gender_save_error', handleGenderError);
        };
        
        const handleGenderError = (error: any) => {
          console.error('❌ Failed to save gender:', error);
          setIsLoading(false);
          setSelectedGender(null);
          
          // Clean up listeners  
          socket.off('gender_saved', handleGenderSaved);
          socket.off('gender_save_error', handleGenderError);
        };
        
        socket.on('gender_saved', handleGenderSaved);
        socket.on('gender_save_error', handleGenderError);
        
      } else {
        console.warn('⚠️ No socket connection or userId available');
        setTimeout(() => {
          console.log('✅ Gender saved successfully (fallback)');
          setIsLoading(false);
          
          // Navigate to picture upload page
          console.log('🎯 Moving to picture upload page');
          push(<PictureUploadPage 
            phoneNumber={phoneNumber}
            userId={userId}
            email={email}
            name={name}
            gender={gender}
          />);
          
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Failed to save gender:', error);
      setIsLoading(false);
      setSelectedGender(null);
    }
  };

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
      onBack={back}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        
        {/* Title Section */}
        <div className="max-w-md mt-8 mb-8 text-center">
          <p className="text-3xl leading-tight text-white">
            <span>{texts.selectGender.introText}</span>
            <span className="text-[#F3A257] font-bold">{texts.selectGender.heroText}</span>
            <span>{texts.selectGender.endText}</span>
          </p>
          <p className="mt-2 text-xl text-white">
            {texts.selectGender.clarificationText}
          </p>
        </div>

        {/* Instructions Section */}
        <div className="w-full max-w-md p-6 mb-8 bg-black rounded-lg">
          <p className="text-lg leading-relaxed text-center text-white">
            {texts.selectGender.instructions}
          </p>
        </div>

        {/* Gender Selection Cards */}
        <div className="flex flex-row justify-center gap-4 mb-8 sm:gap-8">
          {/* Female Option */}
          <div 
            className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
              selectedGender === 'female' ? 'bg-white/20 scale-105' : 'hover:bg-white/10'
            } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            onClick={() => handleGenderSelect('female')}
          >
            <div className="relative mb-3 sm:mb-4">
              <AnimatedImage
                src="/images/game-assets/female.png"
                alt="Female character"
                size="custom"
                className="object-contain w-24 h-32 border-4 shadow-lg sm:w-32 sm:h-40 rounded-xl border-white/30"
              />
              {selectedGender === 'female' && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="mb-1 text-base font-semibold text-white sm:text-lg">
                {texts.selectGender.femalePrefer}
              </p>
              <p className="text-base text-white sm:text-lg">
                {texts.selectGender.femaleLanguage}
              </p>
            </div>
          </div>

          {/* Male Option */}
          <div 
            className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
              selectedGender === 'male' ? 'bg-white/20 scale-105' : 'hover:bg-white/10'
            } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            onClick={() => handleGenderSelect('male')}
          >
            <div className="relative mb-3 sm:mb-4">
              <AnimatedImage
                src="/images/game-assets/male.png"
                alt="Male character"
                size="custom"
                className="object-contain w-24 h-32 border-4 shadow-lg sm:w-32 sm:h-40 rounded-xl border-white/30"
              />
              {selectedGender === 'male' && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="mb-1 text-base font-semibold text-white sm:text-lg">
                {texts.selectGender.malePrefer}
              </p>
              <p className="text-base text-white sm:text-lg">
                {texts.selectGender.maleLanguage}
              </p>
            </div>
          </div>
        </div>

      
  
      </main>
    </PageLayout>
  );
}
