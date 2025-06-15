import { useNavigation } from '../contexts/NavigationContext';
import type { NavigationEntry } from '../contexts/NavigationContext';
import NavigationDebugger from './NavigationDebugger';
import HomePage from '../pages/HomePage';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from '../pages/ComponentsShowcase';
import GiveGameNamePage from '../pages/GiveGameNamePage';
import EnterPhoneNumberPage from '../pages/EnterPhoneNumberPage';

// Animation control - set to false to disable animations
const ENABLE_ANIMATIONS = false;
const ANIMATION_DURATION = 300; // ms
const ANIMATION_EASING = 'ease-in-out';

export default function AppRouter(): JSX.Element {
  const { navigationStack, back, push, replace } = useNavigation();

  const renderPage = (entry: NavigationEntry, index: number) => {
    const isCurrentPage = index === navigationStack.length - 1;
    const zIndex = 10 + index;
    
    // Animation classes based on position in stack (only if enabled)
    const baseTransition = ENABLE_ANIMATIONS 
      ? `transition-transform duration-${ANIMATION_DURATION} ${ANIMATION_EASING}` 
      : '';
    const transformClass = ENABLE_ANIMATIONS 
      ? (isCurrentPage ? 'translate-x-0' : 'translate-x-full')
      : '';
    
    // Visibility control - hide non-current pages without animations
    const visibilityClass = !ENABLE_ANIMATIONS && !isCurrentPage ? 'hidden' : '';
    
    const pageContent = (() => {
      switch (entry.page) {
        case 'home':
          return (
            <HomePage 
              onNavigateToGameName={() => replace('giveGameName')}
              onMenuNavigation={(page: string) => {
                if (page === 'about') {
                  push('about');
                } else if (page === 'components') {
                  push('components');
                }
              }}
            />
          );

        case 'about':
          return (
            <AboutPage 
              onBack={back}
              onNavigateToContent={(contentType: string) => {
                push('about', { selectedContent: contentType });
              }}
            />
          );

        case 'components':
          return (
            <ComponentsShowcase 
              onBack={back}
            />
          );

        case 'giveGameName':
          return (
            <GiveGameNamePage 
              onBack={back}
              onContinue={(gameName: string) => {
                console.log('Game name submitted:', gameName);
                // Continue to next step in game creation
              }}
              onGameCreated={() => replace('enterPhoneNumber')}
              onMenuAction={(page: string) => {
                if (page === 'about') {
                  push('about');
                } else if (page === 'components') {
                  push('components');
                }
              }}
            />
          );

        case 'enterPhoneNumber':
          return (
            <EnterPhoneNumberPage 
              onBack={back}
              onContinue={(phoneNumber: string) => {
                console.log('Phone number submitted:', phoneNumber);
                // TODO: Continue to next step
                replace('home'); // For now, go back to home
              }}
              onMenuAction={(page: string) => {
                if (page === 'about') {
                  push('about');
                } else if (page === 'components') {
                  push('components');
                }
              }}
            />
          );

        default:
          return (
            <HomePage 
              onNavigateToGameName={() => replace('giveGameName')} 
              onMenuNavigation={() => {}} 
            />
          );
      }
    })();

    return (
      <div
        key={entry.timestamp}
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat overflow-y-auto ${baseTransition} ${transformClass} ${visibilityClass}`}
        style={{
          zIndex,
          backgroundImage: "url('/images/backgrounds/background.png')"
        }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-purple-900/60 pointer-events-none"></div>
        
        {/* Page content */}
        <div className="relative z-10 min-h-full">
          {pageContent}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Render all pages in the stack */}
      {navigationStack.map((entry, index) => renderPage(entry, index))}
      
      {/* Navigation debugger */}
      <NavigationDebugger />
    </div>
  );
}
