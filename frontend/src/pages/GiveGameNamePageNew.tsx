import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import PageTracking from '../components/PageTracking';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigation } from '../contexts/NavigationContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';

interface GiveGameNamePageProps {
  gameId: string;
  initialGameName?: string;
}

export default function GiveGameNamePage({ gameId, initialGameName = '' }: GiveGameNamePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { socket, isConnected } = useSocket();
  const { push } = useNavigation(); // For menu navigation
  const navigate = useNavigate(); // For game flow navigation
  
  const [gameName, setGameName] = useState(initialGameName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set initial game name when component mounts
  useEffect(() => {
    if (initialGameName && !gameName) {
      setGameName(initialGameName);
    }
  }, [initialGameName, gameName]);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  const handleContinue = async () => {
    if (!gameName.trim()) {
      setError('שם המשחק נדרש');
      return;
    }
    
    if (!socket || !isConnected) {
      setError('לא מחובר לשרת');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Set up listener for game_name_updated response
      const gameNameUpdatedHandler = (data: any) => {
        setIsLoading(false);
        if (data.success && data.gameId === gameId) {
          console.log('📝 Game name updated successfully:', data);
          // Navigate to phone number page
          navigate(`/game/${gameId}/phone`);
        } else {
          setError('שגיאה בעדכון שם המשחק');
        }
        // Remove the listener after use
        socket.off('game_name_updated', gameNameUpdatedHandler);
      };

      // Set up error handler
      const errorHandler = (data: any) => {
        setIsLoading(false);
        setError(data.message || 'שגיאה בעדכון שם המשחק');
        console.error('❌ Game name update error:', data);
        // Remove the listener after use
        socket.off('error', errorHandler);
      };

      // Add event listeners
      socket.on('game_name_updated', gameNameUpdatedHandler);
      socket.on('error', errorHandler);
      
      // Emit the update_game_name event
      console.log('📤 Emitting update_game_name event with name:', gameName.trim());
      socket.emit('update_game_name', { gameId, gameName: gameName.trim() });
      
    } catch (error) {
      console.error('Failed to update game name:', error);
      setError('שגיאה בעדכון שם המשחק');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameName.trim() && !isLoading) {
      handleContinue();
    }
  };

  // Show connection status
  if (!isConnected) {
    return (
      <PageLayout showHeader={true} onMenuAction={handleMenuAction}>
        <PageTracking 
          pageName="give_game_name"
          pageData={{ 
            has_connection: isConnected,
            game_id: gameId
          }}
        />
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-white">מתחבר לשרת...</h1>
            <div className="w-16 h-16 mx-auto border-b-2 border-white rounded-full animate-spin"></div>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
    >
      <PageTracking 
        pageName="give_game_name"
        pageData={{ 
          has_connection: isConnected,
          game_id: gameId
        }}
      />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Friends illustration */}
        <AnimatedImage
          src="/images/game-assets/give-game-name.png"
          alt="Give Game Name"
          size="large"
          className="drop-shadow-2xl"
        />
        
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold leading-tight text-white">
            {texts.giveGameName.title}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-md mb-4 p-4 text-center bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}
        
        {/* Game Name Input */}
        <Input
          value={gameName}
          onChange={setGameName}
          onKeyPress={handleKeyPress}
          placeholder={texts.giveGameName.placeholder}
          className="mb-8"
          autoFocus
          trackingId="game_name"
          data-testid="game-name-input"
        />
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!gameName.trim() || isLoading}
            trackingId="give_game_name_continue_clicked"
            data-testid="game-name-continue-button"
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              gameName.trim() && !isLoading
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                שומר...
              </div>
            ) : (
              texts.giveGameName.continueButton
            )}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
