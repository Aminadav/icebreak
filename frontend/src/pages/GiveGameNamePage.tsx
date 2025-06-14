import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';

interface GiveGameNamePageProps {
  onBack: () => void;
  onContinue: (gameName: string) => void;
}

export default function GiveGameNamePage({ onBack, onContinue }: GiveGameNamePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { socket, isConnected } = useSocket();
  
  const [gameName, setGameName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silence unused warnings - keeping for future use
  void onBack;
  void onContinue;

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
      // Set up listener for game_created response
      const gameCreatedHandler = (data: any) => {
        setIsLoading(false);
        if (data.success) {
          alert(`✅ המשחק "${data.gameName}" נוצר בהצלחה!`);
          console.log('🎮 Game created successfully:', data);
        } else {
          setError('שגיאה ביצירת המשחק');
        }
        // Remove the listener after use
        socket.off('game_created', gameCreatedHandler);
      };

      // Set up error handler
      const errorHandler = (data: any) => {
        setIsLoading(false);
        setError(data.message || 'שגיאה ביצירת המשחק');
        console.error('❌ Game creation error:', data);
        // Remove the listener after use
        socket.off('error', errorHandler);
      };

      // Add event listeners
      socket.on('game_created', gameCreatedHandler);
      socket.on('error', errorHandler);
      
      // Emit the create_game event
      console.log('📤 Emitting create_game event with name:', gameName.trim());
      socket.emit('create_game', { gameName: gameName.trim() });
      
    } catch (error) {
      console.error('Failed to create game:', error);
      setError('שגיאה ביצירת המשחק');
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
      <PageLayout showHeader={true} onMenuAction={() => {}}>
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
      onMenuAction={() => {}}
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Friends illustration */}
        <div className="mb-8 drop-shadow-2xl">
          <img 
            src="/images/game-assets/give-game-name.png" 
            alt="Friends sitting together" 
            className="w-80 h-auto max-w-full animate-float-in hover:scale-105 hover:drop-shadow-[0_20px_30px_rgba(255,165,0,0.3)] transition-all duration-300 ease-out cursor-pointer filter brightness-105"
            style={{
              animationDelay: '0.3s',
              animationFillMode: 'both'
            }}
            onAnimationEnd={(e) => {
              if (e.animationName === 'float-in') {
                e.currentTarget.style.animation = 'gentle-float 3s ease-in-out infinite';
              }
            }}
          />
        </div>
        
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
              {error}
            </p>
          </div>
        )}
        
        {/* Subtitle */}
        <div className="max-w-md mb-8 text-center">
          <p className="text-lg text-white opacity-90">
            {texts.giveGameName.subtitle}
          </p>
        </div>
        
        {/* Game name input */}
        <div className="w-full max-w-md mb-8">
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={texts.giveGameName.placeholder}
            className="w-full px-6 py-4 text-xl text-center transition-all duration-200 bg-white border-4 border-white shadow-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400"
            autoFocus
          />
        </div>
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!gameName.trim() || isLoading}
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              gameName.trim() && !isLoading
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                יוצר משחק...
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