import { useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import ShareGameModal from '../components/ShareGameModal';
import { useSocket } from '../contexts/SocketContext';
import { useModal } from '../contexts/ModalContext';
import { useNavigation } from '../contexts/NavigationContext';
import BeforeStartAskAboutYou from './BeforeStartAskAboutYou';

interface CreatorGameReadyPageProps {
  phoneNumber: string;
  userId: string;
  email: string;
  name: string;
  gender: string;
  selectedImageHash: string;
}

export default function CreatorGameReadyPage({ 
  phoneNumber, 
  userId, 
  email, 
  name, 
  gender, 
  selectedImageHash 
}: CreatorGameReadyPageProps): JSX.Element {
  const { socket } = useSocket();
  const { openModal } = useModal();
  const { push } = useNavigation();

  // Update journey state when component mounts
  useEffect(() => {
    const updateJourneyState = async () => {
      if (socket) {
        try {
          socket.emit('update_journey_state', { 
            journeyState: 'CREATOR_GAME_READY',
            additionalData: {
              phoneNumber,
              userId,
              email,
              name,
              gender,
              selectedImageHash
            }
          });
          console.log('🎯 Journey state updated to CREATOR_GAME_READY');
        } catch (error) {
          console.error('Failed to update journey state:', error);
        }
      }
    };

    updateJourneyState();
  }, [socket, phoneNumber, userId, email, name, gender, selectedImageHash]);

  const handleStartGame = () => {
    console.log('🎮 Starting game...');
    // Navigate to BeforeStartAskAboutYou page
    push(
      <BeforeStartAskAboutYou
        phoneNumber={phoneNumber}
        userId={userId}
        email={email}
        name={name}
        gender={gender}
        selectedImageHash={selectedImageHash}
      />
    );
  };

  const handleShareGame = () => {
    console.log('📤 Opening share game modal...');
    openModal(
      <ShareGameModal
        onStartPlay={() => {
          console.log('🎮 Starting game from modal...');
          // Navigate to BeforeStartAskAboutYou page
          push(
            <BeforeStartAskAboutYou
              phoneNumber={phoneNumber}
              userId={userId}
              email={email}
              name={name}
              gender={gender}
              selectedImageHash={selectedImageHash}
            />
          );
        }}
        onShareGame={() => {
          console.log('📤 Sharing game from modal...');
          // TODO: Implement actual sharing functionality
        }}
      />
    );
  };

  const handleMenuAction = (action: string) => {
    // Handle menu actions if needed
    console.log('Menu action:', action);
  };

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        
        {/* Celebration Image */}
        <div className="flex justify-center w-full mb-8">
          <AnimatedImage
            src="/images/icons/game_ready.png"
            alt="Game Ready Celebration"
            size="large"
            className="drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
            המשחק מוכן!
          </h1>
        </div>

        {/* Intro Text */}
        <div className="max-w-md mb-12 text-center">
          <p className="text-lg leading-relaxed text-white/90">
            מומלץ מאוד להתחיל לשחק, לפני השיתוף בקבוצה
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center w-full max-w-md space-y-4">
          {/* Start Game - Main Button */}
          <Button
            variant="primary"
            onClick={handleStartGame}
            className="w-full px-8 py-4 text-xl"
          >
            התחל לשחק
          </Button>

          {/* Share Game - Ghost Button */}
          <Button
            variant="ghost"
            onClick={handleShareGame}
            className="px-6 py-3"
          >
            שיתוף המשחק
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
