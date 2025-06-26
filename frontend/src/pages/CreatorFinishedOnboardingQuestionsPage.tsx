import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import FullScreenModal, { useFullScreenModal } from '../components/FullScreenModal';
import ShareGamePage from './ShareGamePage';
import { useGame } from '../contexts/GameContext';

export default function CreatorFinishedOnboardingQuestionsPage(): JSX.Element {
  const { emitMoveToNextPage } = useGame();
  var shareModal=useFullScreenModal()

  const handleWhatsappShare = () => {
    console.log('📱 WhatsApp share clicked');
    shareModal.open()
  };

  const handleContinue = () => {
    // TODO: Implement continue to more questions functionality
    console.log('➡️ Continue to more questions clicked');
    emitMoveToNextPage()
  };

  return (
    <>
    <shareModal.element>
        <ShareGamePage onClose={() => shareModal.close()} />
      </shareModal.element>
      
      <PageLayout showHeader={true}>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-6">
        
        {/* Celebration Image */}
        <div className="flex justify-center w-full mb-8">
          <AnimatedImage
            src="/images/game-assets/woman_clapping.png"
            alt="Woman clapping celebration"
            size="large"
            className="drop-shadow-2xl"
          />
        </div>

        {/* Main Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white drop-shadow-lg">
            כל הכבוד שענית{' '}
            <span className="text-yellow-300">על השאלות!</span>
          </h1>
        </div>

        {/* Description Text */}
        <div className="max-w-md mb-12 space-y-4 text-center">
          <p className="text-lg leading-relaxed text-white/90">
            הגיע הזמן לצרף חברים למשחק
          </p>
          <p className="text-lg leading-relaxed text-white/90">
            ואז החידון יפתח ותוכלו לשחק.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center w-full max-w-md space-y-6">
          {/* WhatsApp Share Button */}
          <Button
            variant="primary-large"
            onClick={handleWhatsappShare}
            clickOnEnter={true}
            data-testid="whatsapp-share-button"
            icon={
              <img 
                src="/images/icons/whatsapp.svg" 
                alt="WhatsApp" 
                className="w-6 h-6"
              />
            }
          >
            שתפו ב-WhatsApp
          </Button>

          {/* Continue to More Questions Button */}
          <Button
            variant="outline-purple"
            onClick={handleContinue}
            className="w-full px-6 py-3 text-lg text-white transition-all duration-200 border-2 border-white/30 hover:bg-white/10"
            data-testid="continue-questions-button"
          >
            או שתמשיכו לענות על עוד שאלות &gt;&gt;
          </Button>
        </div>
      </main>
    </PageLayout>
    </>
  );
}
