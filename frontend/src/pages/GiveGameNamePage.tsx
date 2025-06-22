import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useMenuNavigation } from '../hooks/useMenuNavigation';
import { useGameId } from '../utils/useGameId';


export default function GiveGameNamePage(): JSX.Element {
  var gameId=useGameId()
  const { texts } = useLanguage();
  const { socket, isConnected } = useSocket();
  const { handleMenuAction } = useMenuNavigation(); // For menu navigation
  
  const [gameName, setGameName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    socket.emit('update_game_name', { gameId, gameName: gameName.trim() });

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
    
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Friends illustration */}
        <AnimatedImage
          src="/images/game-assets/give-game-name.png"
          alt="Friends sitting together"
          size="large"
        />
        
        {/* Title */}
        <div className="max-w-md mb-4 text-center">
          <h1 className="text-3xl font-bold leading-tight text-white">
            {texts.giveGameName.title}
          </h1>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-md mb-4 text-center">
            <p className="px-4 py-2 text-lg text-red-400 bg-red-100 rounded-lg bg-opacity-20">
              {error}            </p>
          </div>
        )}
        
        {/* Subtitle */}
        <div className="max-w-md mb-8 text-center">
          <p className="text-lg text-white opacity-90">
            {texts.giveGameName.subtitle}
          </p>
        </div>
        
        {/* Game name input */}
        <Input
          type="text"
          value={gameName}
          onChange={setGameName}
          onKeyPress={handleKeyPress}
          // placeholder={texts.giveGameName.placeholder}
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
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                עדכן שם משחק...
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
