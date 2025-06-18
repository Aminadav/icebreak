import { useState, useEffect } from 'react';

interface GotPointsPageProps {
  gameState: GAME_STATE_GOT_POINTS;
}

export default function GotPointsPage({ gameState }: GotPointsPageProps): JSX.Element {
  const [displayPoints, setDisplayPoints] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Count-up animation effect
  useEffect(() => {
    const duration = 1000; // 1.5 seconds
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
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden bg-gradient-to-b from-purple-900 to-black">
        
        {/* Continuous floating sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Sparkles moving from left to right */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`left-move-${i}`}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-70"
              style={{
                left: '-10px',
                top: `${20 + i * 80}px`,
                animation: `moveLeftToRight ${8 + Math.random() * 4}s linear infinite`,
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
          
          {/* Sparkles moving from right to left */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`right-move-${i}`}
              className="absolute w-2 h-2 bg-purple-300 rounded-full opacity-70"
              style={{
                right: '-10px',
                top: `${50 + i * 80}px`,
                animation: `moveRightToLeft ${8 + Math.random() * 4}s linear infinite`,
                animationDelay: `${i * 2}s`
              }}
            />
          ))}
          
          {/* Floating sparkles moving up and down */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`float-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatUpDown ${4 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* CSS Animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes moveLeftToRight {
              0% { transform: translateX(-10px) scale(0.5); opacity: 0; }
              10% { opacity: 0.7; transform: scale(1); }
              90% { opacity: 0.7; transform: scale(1); }
              100% { transform: translateX(calc(100vw + 10px)) scale(0.5); opacity: 0; }
            }
            
            @keyframes moveRightToLeft {
              0% { transform: translateX(10px) scale(0.5); opacity: 0; }
              10% { opacity: 0.7; transform: scale(1); }
              90% { opacity: 0.7; transform: scale(1); }
              100% { transform: translateX(calc(-100vw - 10px)) scale(0.5); opacity: 0; }
            }
            
            @keyframes floatUpDown {
              0%, 100% { transform: translateY(0px) scale(0.8); opacity: 0.6; }
              25% { transform: translateY(-20px) scale(1.2); opacity: 1; }
              50% { transform: translateY(0px) scale(1); opacity: 0.8; }
              75% { transform: translateY(15px) scale(0.9); opacity: 0.9; }
            }
          `
        }} />

        {/* Star with particles animation */}
        <div className="relative z-10 mb-8">
          <img 
            src="/videos/star4.gif" 
            alt="Star"
            className="w-48 h-48 mx-auto border-0 outline-none"
            style={{ imageRendering: 'auto' }}
            key={Date.now()}
          />
        </div>

        {/* Hebrew text "כל הכבוד" */}
        <h1 className="z-10 mb-8 text-4xl font-bold text-center text-white md:text-5xl">
          {gameState.text}
        </h1>

        {/* Animated points display */}
        <div className="z-10 mb-12">
          <div 
          dir="ltr"
            className={`text-6xl md:text-8xl font-bold text-white transition-all duration-500 ${
              animationComplete ? 'scale-110' : 'scale-100'
            }`}
          >
            + {displayPoints}
          </div>
        </div>

        {/* Continue button - Custom festive design */}
        <div className="z-10 w-full max-w-xs">
          <button
            onClick={handleContinue}
            className="relative w-full px-8 py-4 overflow-hidden text-xl font-bold text-white transition-all duration-300 transform shadow-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl hover:scale-110 group animate-pulse hover:animate-none"
          >
            {/* Button sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle-${i} 1.5s infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    transform: `scale(${Math.random() * 0.5 + 0.5})`
                  }}
                />
              ))}
            </div>
            
            {/* Button glow effect */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 group-hover:opacity-30 rounded-2xl blur-sm"></div>
            
            {/* Button text */}
            <span className="relative z-10 flex items-center justify-center">
              המשך ✨ ←
            </span>
          </button>
        </div>
      </div>
  );
}