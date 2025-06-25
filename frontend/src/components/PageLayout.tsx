import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import MainHeader from './MainHeader';
import { useGame } from '../contexts/GameContext';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  hidePoints?: boolean;
}
export default function PageLayout({ children, title, showHeader,hidePoints=false }: PageLayoutProps): JSX.Element {
  const { texts } = useLanguage();
  const isRTL = texts.direction === 'rtl';  
  return (
    <div 
      className="relative min-h-screen bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/images/backgrounds/background.png')"
      }}
    >
      {/* Header */}
      {showHeader && (
        <MainHeader  hidePoints={hidePoints} />
      )}
      
      {/* Content */}
      <div className={`relative z-10 ${showHeader ? 'pt-0' : 'pt-4'}`}>
        {title && (
          <div className="mb-8 text-center pt-14">
            <h1 className="text-3xl font-bold text-white drop-shadow-2xl">
              {title}
            </h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
