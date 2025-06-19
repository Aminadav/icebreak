import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import MyPoints from '../components/MyPoints';
import Footer from '../components/Footer';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';

export default function TextMessageToUserPage(props: {gameState: gameStateTextMessageToUser}): JSX.Element {
  const gameState = props.gameState
  const { socket } = useSocket();
  const gameId = useGameId();
  const [displayedText, setDisplayedText] = useState('');
  const [isTextComplete, setIsTextComplete] = useState(false);

  // Animated text typing effect
  useEffect(() => {
    setDisplayedText('');
    setIsTextComplete(false);
    
    const text = gameState.text;
    let currentIndex = 0;
    
    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, 50); // Adjust speed here (50ms per character)
      } else {
        setIsTextComplete(true);
      }
    };
    
    // Start typing after a short delay
    const timer = setTimeout(typeText, 500);
    
    return () => clearTimeout(timer);
  }, [gameState.text]);

  const handleContinue = () => {
    if (!socket) return;
    
    // Emit continue event to backend
    socket.emit('continue-from-text-message', {
      gameId,
      messageId: gameState.messageId
    });
  };

  return (
    <PageLayout showHeader={true}>
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-88px)] px-4">
        
        <MyPoints />

        {/* Main content centered */}
        <div className="flex flex-col items-center justify-center flex-1">
          
          {/* Optional Image */}
          {gameState.image && (
            <div className="flex justify-center w-full mb-8">
              <AnimatedImage 
                src={gameState.image} 
                alt="Message illustration" 
                size="large"
                className="drop-shadow-2xl"
              />
            </div>
          )}
          
          {/* Main Text with Typing Animation */}
          <div className="mb-12 text-center">
            <h1 className="text-6xl font-bold leading-tight text-white drop-shadow-2xl">
              {displayedText}
              {!isTextComplete && (
                <span className="ml-2 text-orange-400 animate-pulse">|</span>
              )}
            </h1>
          </div>

          {/* Continue Button - Only show when text is complete */}
          {isTextComplete && (
            <div className="flex justify-center w-full max-w-md animate-fade-in">
              <Button
                variant="primary-large"
                onClick={handleContinue}
                trackingId="text-message-continue"
                data-testid="continue-button"
              >
                המשך {">>"}
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </PageLayout>
  );
}
