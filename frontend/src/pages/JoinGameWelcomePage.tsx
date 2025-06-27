import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';

interface GameInfo {
  gameName: string;
  creatorName: string;
}

export default function JoinGameWelcomePage(): JSX.Element {
  const { texts } = useLanguage();
  const { socket, isConnected } = useSocket();
  const gameId = useGameId();
  
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;
    
    // Request game info
    socket.emit('get_game_info', { gameId });
    
    const handleGameInfo = (data: GameInfo) => {
      setGameInfo(data);
    };
    
    socket.on('game_info', handleGameInfo);
    
    return () => {
      socket.off('game_info', handleGameInfo);
    };
  }, [socket, isConnected, gameId]);

  const handleJoinGame = () => {
    if (!socket || !isConnected) return;
    
    setIsLoading(true);
    // Move to next screen in the flow
    socket.emit('get_next_screen', { gameId });
  };

  // Show connection status
  if (!isConnected) {
    return (
      <PageLayout showHeader={true}>
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
    <PageLayout showHeader={true}>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/videos/animated-logo-white.gif" 
            alt="IceBreak Logo" 
            className="h-auto max-w-full w-80"
          />
        </div>
        
        {/* Game Name */}
        {gameInfo?.gameName && (
          <div className="max-w-md mb-4 text-center">
            <h1 className="text-3xl font-bold leading-tight text-white">
              {gameInfo.gameName}
            </h1>
          </div>
        )}
        
        {/* Creator Name */}
        {gameInfo?.creatorName && (
          <div className="max-w-md mb-8 text-center">
            <h2 className="text-xl text-white opacity-90">
              נוצר על ידי {gameInfo.creatorName}
            </h2>
          </div>
        )}
        
        {/* Subtitle */}
        <div className="max-w-md mb-16 text-center">
          <h3 className="text-2xl font-bold leading-tight text-white">
            הצטרף למשחק הכרות מהנה!
          </h3>
        </div>
        
        {/* Join Game Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleJoinGame}
            disabled={isLoading || !gameInfo}
            trackingId="join_game_welcome_clicked"
            data-testid="join-game-button"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                מצטרף למשחק...
              </div>
            ) : (
              'הצטרף למשחק'
            )}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
