import { useState } from 'react';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';
import GiveGameNamePage from './GiveGameNamePage';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';

interface HomePageProps {}

export default function HomePage({}: HomePageProps): JSX.Element {
  const { texts } = useLanguage();
  const { isConnected, deviceId, userId, error } = useSocket();
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'components' | 'giveGameName'>('home');

  const handleCreateGame = () => {
    console.log('Creating new game...');
    setCurrentPage('giveGameName');
  };

  const handleGameNameSubmit = (gameName: string) => {
    console.log('Game name submitted:', gameName);
    // TODO: Continue to next step in game creation
  };

  // Function to handle navigation from menu
  const handleMenuNavigation = (page: string) => {
    if (page === 'about') {
      setCurrentPage('about');
    } else if (page === 'components') {
      setCurrentPage('components');
    }
  };

  // Show about page if selected
  if (currentPage === 'about') {
    return <AboutPage onBack={() => setCurrentPage('home')} />;
  }

  // Show components showcase page if selected
  if (currentPage === 'components') {
    return <ComponentsShowcase onBack={() => setCurrentPage('home')} />;
  }

  // Show give game name page if selected
  if (currentPage === 'giveGameName') {
    return <GiveGameNamePage onBack={() => setCurrentPage('home')} onContinue={handleGameNameSubmit} />;
  }  return (
    <PageLayout 
      showHeader={true}
      onMenuAction={handleMenuNavigation}
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
