import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';

interface HomePageProps {
  onNavigateToGameName: () => void;
  onMenuNavigation: (page: string) => void;
}

export default function HomePage({ onNavigateToGameName, onMenuNavigation }: HomePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { isConnected, deviceId, userId, error } = useSocket();

  // Silence unused warnings - keeping for future use
  void isConnected; void deviceId; void userId; void error;

  const handleCreateGame = () => {
    console.log('Creating new game...');
    onNavigateToGameName();
  };

  return (
    <PageLayout 
      showHeader={true}
      onMenuAction={onMenuNavigation}
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
            className="text-xl px-12 py-5 min-w-[300px] border-6 border-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-3xl shadow-xl"
          >
            {texts.homepage.createGameButton}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
