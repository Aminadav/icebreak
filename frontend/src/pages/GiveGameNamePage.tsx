import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

interface GiveGameNamePageProps {
  onBack: () => void;
  onContinue: (gameName: string) => void;
}

export default function GiveGameNamePage({ onBack, onContinue }: GiveGameNamePageProps): JSX.Element {
  const { texts } = useLanguage();
  const [gameName, setGameName] = useState('');

  // Silence unused warning for onBack - keeping it for future use
  void onBack;

  const handleContinue = () => {
    if (gameName.trim()) {
      onContinue(gameName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameName.trim()) {
      handleContinue();
    }
  };

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
        <div className="text-center mb-4 max-w-md">
          <h1 className="text-white text-3xl font-bold leading-tight">
            {texts.giveGameName.title}
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-8 max-w-md">
          <p className="text-white text-lg opacity-90">
            {texts.giveGameName.subtitle}
          </p>
        </div>
        
        {/* Game name input */}
        <div className="mb-8 w-full max-w-md">
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={texts.giveGameName.placeholder}
            className="w-full px-6 py-4 text-xl text-center bg-white rounded-2xl border-4 border-white shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-200"
            autoFocus
          />
        </div>
        
        {/* Continue Button */}
        <div className="mb-20">
          <Button
            variant="primary-large"
            onClick={handleContinue}
            disabled={!gameName.trim()}
            className={`text-xl px-12 py-5 min-w-[300px] border-6 border-white rounded-3xl shadow-xl transition-all duration-200 ${
              gameName.trim() 
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {texts.giveGameName.continueButton}
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}
