import { useNavigation } from '../contexts/NavigationContext';
import type { NavigationEntry } from '../contexts/NavigationContext';
import NavigationDebugger from './NavigationDebugger';

// Animation control - set to false to disable animations
const ENABLE_ANIMATIONS = false;
const ANIMATION_DURATION = 300; // ms
const ANIMATION_EASING = 'ease-in-out';

export default function AppRouter(): JSX.Element {
  const { navigationStack } = useNavigation();

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

    return (
      <div
        key={entry.key}
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat overflow-y-auto ${baseTransition} ${transformClass} ${visibilityClass}`}
        style={{
          zIndex,
          backgroundImage: "url('/images/backgrounds/background.png')"
        }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br"></div>
        
        {/* Page content */}
        <div className="relative z-10 min-h-full">
          {entry.component}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Render all pages in the stack */}
      {navigationStack.map((entry, index) => renderPage(entry, index))}
      
      {/* Navigation debugger */}
      <NavigationDebugger show={false} />
    </div>
  );
}
