import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';

interface GotPointsPageProps {
  gameState: GAME_STATE_GOT_POINTS;
}

export default function GotPointsPage({ gameState }: GotPointsPageProps): JSX.Element {
  const [displayPoints, setDisplayPoints] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Count-up animation effect
  useEffect(() => {
    const duration = 250; // 1.5 seconds
    const steps = 30;
    const increment = gameState.points / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayPoints(Math.floor(increment * currentStep));
      } else {
        setDisplayPoints(gameState.points);
        setAnimationComplete(true);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [gameState.points]);

  const handleContinue = () => {
    // Just a placeholder - no socket emit as requested
    console.log('Continue clicked');
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-900 to-black">
        
        {/* Star with particles animation */}
        <div className="relative mb-8">
          <img 
            src="/videos/star3.gif" 
            alt="Star"
            className="w-48 h-48 mx-auto border-0 outline-none"
            style={{ imageRendering: 'auto' }}
            key={Date.now()}
          />
        </div>

        {/* Hebrew text "כל הכבוד" */}
        <h1 className="mb-8 text-4xl font-bold text-center text-white md:text-5xl">
          {gameState.text}
        </h1>

        {/* Animated points display */}
        <div className="mb-12">
          <div 
          dir="ltr"
            className={`text-6xl md:text-8xl font-bold text-white transition-all duration-500 ${
              animationComplete ? 'scale-110' : 'scale-100'
            }`}
          >
            + {displayPoints}
          </div>
        </div>

        {/* Continue button */}
        <div className="w-full max-w-xs">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            trackingId="got-points-continue"
          >
            המשך &gt;&gt;
          </Button>
        </div>
      </div>
  );
}