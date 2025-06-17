import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import PageTracking from '../components/PageTracking';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useTracking } from '../contexts/TrackingContext';

export default function HomePage(): JSX.Element {
  const { texts } = useLanguage();
  const { isConnected, error, socket } = useSocket();
  const navigate = useNavigate();
  const { trackEvent } = useTracking();

  // Silence unused warnings - keeping for future use
  void error;

  const handleCreateGame = () => {
    console.log('Creating new game...');
    trackEvent('create_game_flow_started', {
      source_page: 'homepage'
    });
    
    // Emit socket event to set journey state to GAME_NAME_ENTRY
    if (socket) {
      // Set up one-time listeners for the response
      const successHandler = (data: any) => {
        console.log('🎯 Game creation flow started successfully:', data);
        socket.off('game_creation_started', successHandler);
        socket.off('error', errorHandler);
        
        // Navigate to game creation with React Router
        if (data.gameId) {
          navigate(`/game/${data.gameId}/name`);
        }
      };

      const errorHandler = (data: any) => {
        console.error('❌ Failed to start game creation flow:', data);
        socket.off('game_creation_started', successHandler);
        socket.off('error', errorHandler);
        // Continue with navigation anyway - create a local gameId if needed
        navigate('/game/new/name');
      };

      socket.once('game_creation_started', successHandler);
      socket.once('error', errorHandler);
      
      console.log('📤 Emitting start_game_creation');
      socket.emit('start_game_creation');
    } else {
      console.log('⚠️ Socket not available, navigating anyway');
      navigate('/game/new/name');
    }
  };

  const handleMenuNavigation = (page: string) => {
    if (page === 'about') {
      navigate('/about');
    } else if (page === 'components') {
      navigate('/components');
    }
  };

  return (
    <PageLayout 
      showHeader={true}
      onMenuAction={handleMenuNavigation}
    >
      <PageTracking 
        pageName="homepage"
        pageData={{ 
          has_connection: isConnected
        }}
      />
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
            disabled={!isConnected}
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              isConnected
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
            trackingId="homepage_create_game_clicked"
            data-testid="create-game-button"
          >
            {!isConnected ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                מתחבר...
              </div>
            ) : (
              texts.homepage.createGameButton
            )}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
