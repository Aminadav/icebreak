import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import MainHeader from './MainHeader';
import { useGame } from '../contexts/GameContext';

interface PageLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
  showHeader?: boolean;
  onMenuAction?: (action: string) => void;
  hidePoints?: boolean;
}

export default function PageLayout({ children, onBack, title, showHeader, onMenuAction,hidePoints=false }: PageLayoutProps): JSX.Element {
  const { texts } = useLanguage();
  const isRTL = texts.direction === 'rtl';  
  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/backgrounds/background.png')"
      }}
    >
      {/* Header */}
      {showHeader && (
        <MainHeader onMenuAction={onMenuAction} hidePoints={hidePoints} />
      )}
      
      {/* Content */}
      <div className={`relative z-10 ${showHeader ? 'pt-0' : 'pt-4'}`}>
        {/* Back button and title container - only show if onBack is provided and header is not shown */}
        {onBack && !showHeader && (
          <div className="relative px-6 pt-6 mb-8">
            <div className={`absolute  top-0 ${isRTL ? 'left-6' : 'right-6'}`}>
              <button
                onClick={onBack}
                className="flex items-center gap-3 px-6 py-3 font-medium text-white transition-all duration-300 ease-out transform border shadow-lg bg-white/20 backdrop-blur-md rounded-2xl border-white/30 hover:bg-white/30 hover:scale-105 hover:shadow-xl"
              >
                <span className={`text-3xl transform transition-transform duration-200 ${isRTL ? 'rotate-180' : ''}`}>
                  →
                </span>
              </button>
            </div>
            {title && (
              <div className="pt-8 text-center">
                <h1 className="text-5xl font-bold text-white drop-shadow-2xl">
                  {title}
                </h1>
              </div>
            )}
          </div>
        )}
        
        {/* Title only - when no back button or header is shown */}
        {title && (!onBack || showHeader) && (
          <div className="pt-8 mb-8 text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-2xl">
              {title}
            </h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
