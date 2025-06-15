import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import PageTracking from '../components/PageTracking';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useTracking } from '../contexts/TrackingContext';
import GiveGameNamePage from './GiveGameNamePage';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';

export default function HomePage(): JSX.Element {
  const { texts } = useLanguage();
  const { isConnected, deviceId, userId, error, socket } = useSocket();
  const { push } = useNavigation();
  const { trackEvent } = useTracking();

  // Silence unused warnings - keeping for future use
  void isConnected; void deviceId; void userId; void error;

  const handleCreateGame = () => {
    console.log('Creating new game...');
    trackEvent('create_game_flow_started', {
      source_page: 'homepage',
      user_authenticated: !!userId
    });
    
    // Emit socket event to set journey state to GAME_NAME_ENTRY
    if (socket) {
      // Set up one-time listeners for the response
      const successHandler = (data: any) => {
        console.log('🎯 Game creation flow started successfully:', data);
        socket.off('game_creation_started', successHandler);
        socket.off('error', errorHandler);
      };

      const errorHandler = (data: any) => {
        console.error('❌ Failed to start game creation flow:', data);
        socket.off('game_creation_started', successHandler);
        socket.off('error', errorHandler);
        // Continue with navigation anyway
      };

      socket.once('game_creation_started', successHandler);
      socket.once('error', errorHandler);
      
      socket.emit('start_game_creation');
    }
    
    push(<GiveGameNamePage />);
  };

  const handleMenuNavigation = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
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
          user_authenticated: !!userId,
          device_id: deviceId 
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
            className="text-xl px-12 py-5 min-w-[300px] border-6 border-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-3xl shadow-xl"
            trackingId="homepage_create_game_clicked"
            data-testid="create-game-button"
          >
            {texts.homepage.createGameButton}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
