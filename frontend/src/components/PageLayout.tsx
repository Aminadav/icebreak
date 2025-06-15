import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import MainHeader from './MainHeader';

interface PageLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
  showHeader?: boolean;
  onMenuAction?: (action: string) => void;
}

export default function PageLayout({ children, onBack, title, showHeader, onMenuAction }: PageLayoutProps): JSX.Element {
  const { texts } = useLanguage();
  const isRTL = texts.direction === 'rtl';

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      {showHeader && (
        <div className="relative z-50">
          <MainHeader onMenuAction={onMenuAction} />
        </div>
      )}
      
      {/* Back button - only show if onBack is provided and header is not shown */}
      {onBack && !showHeader && (
        <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-50`}>
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/30 
                       hover:bg-white/30 hover:scale-105 transform transition-all duration-300 ease-out
                       font-medium shadow-lg hover:shadow-xl"
          >
            <span className={`text-3xl transform transition-transform duration-200 ${isRTL ? 'rotate-180' : ''}`}>
              →
            </span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${showHeader ? 'pt-0' : 'pt-4'}`}>
        {title && (
          <div className="text-center mb-8 pt-8">
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
