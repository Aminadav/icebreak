import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useTracking } from '../contexts/TrackingContext';
import { useMenuNavigation } from '../hooks/useMenuNavigation';

export default function StartPage(): JSX.Element {
  const { texts } = useLanguage();
  const { error, socket } = useSocket();
  const navigate = useNavigate(); // Use for game flow navigation
  const { trackEvent } = useTracking();
  const { handleMenuAction } = useMenuNavigation(); // Use for menu navigation
  const [isCreating, setIsCreating] = useState(false);

  // Silence unused warnings - keeping for future use
  void error;

  const handleCreateGame = () => {
    console.log('Creating new game immediately...');
    trackEvent('create_game_flow_started', {
      source_page: 'start_page',
      creation_type: 'immediate'
    });
    
    if (!socket) {
      console.error('Socket not available');
      return;
    }

    setIsCreating(true);

    // Set up one-time listeners for the response
    const successHandler = (data: any) => {
      // console.log('🎮 Game created immediately:', data);
      setIsCreating(false);
      
      // // Navigate to the game name step with the gameId
      navigate(`/game/${data.gameId}/play`);
      
      // Clean up listeners
      socket.off('game_created_immediately', successHandler);
      socket.off('error', errorHandler);
    };

    const errorHandler = (data: any) => {
      console.error('❌ Failed to create game immediately:', data);
      setIsCreating(false);
      
      // Clean up listeners
      socket.off('game_created_immediately', successHandler);
      socket.off('error', errorHandler);
    };

    // Add event listeners
    socket.once('game_created_immediately', successHandler);
    socket.once('error', errorHandler);
    
    // Create game immediately with a default name (user will customize it)
    const defaultGameName =''
    //  `משחק ${new Date().toLocaleString('he-IL', { 
    //   day: '2-digit', 
    //   month: '2-digit', 
    //   hour: '2-digit', 
    //   minute: '2-digit' 
    // })}`;
    
    socket.emit('create_game_immediately', { gameName: defaultGameName });
  };

  return (
    <PageLayout 
      showHeader={true}
      onMenuAction={handleMenuAction}
    >
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/videos/animated-logo-white.gif" 
            alt="IceBreak Logo" 
            className="h-auto max-w-full w-80"
          />
        </div>
        
        {/* Subtitle */}
        <div className="max-w-md mb-16 text-center">
          <h2 className="text-2xl font-bold leading-tight text-white">
            {texts.homepage.subtitle}
          </h2>
        </div>
        
        {/* Create Game Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleCreateGame}
            loading={isCreating}
            disabled={isCreating}

            trackingId="start_page_create_game_clicked"
            data-testid="create-game-button"
          >
            {isCreating ? 'יוצר משחק...' : texts.homepage.createGameButton}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
