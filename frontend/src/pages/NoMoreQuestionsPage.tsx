import { useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import FullScreenModal, { useFullScreenModal } from '../components/FullScreenModal';
import ShareGamePage from './ShareGamePage';
import { useGame } from '../contexts/GameContext';
import { env } from '../env';

export default function NoMoreQuestionsPage(): JSX.Element {
  const shareModal = useFullScreenModal();
  const { emitMoveToNextPage } = useGame();

  const handleWhatsappShare = () => {
    console.log('� WhatsApp share clicked from NoMoreQuestionsPage...');
    shareModal.open();
  };

  return (
    <>
      <shareModal.element>
        <ShareGamePage onClose={() => shareModal.close()} />
      </shareModal.element>
      
      <PageLayout 
        showHeader={true} 
      >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        
        {/* Celebration Image */}
        <div className="flex justify-center w-full mb-8">
          <AnimatedImage
            src="/images/icons/game_ready.png"
            alt="No More Questions"
            size="large"
            className="drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
            כל הכבוד!
          </h1>
        </div>

        {/* Main Message */}
        <div className="max-w-md mb-8 text-center">
          <p className="mb-4 text-xl leading-relaxed text-white/90">
            סיימת לענות על כל השאלות!
          </p>
          <p className="text-lg leading-relaxed text-white/80">
            עכשיו זה הזמן לשתף את המשחק עם חברים ולראות איך הם עונים עליך
          </p>
        </div>

        {/* Fun Stats or Message */}
        <div className="max-w-md p-6 mb-12 text-center rounded-lg bg-white/10">
          <p className="text-lg text-white/90">
            💡 כל תשובה שלך תעזור לחברים להכיר אותך יותר טוב!
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center w-full max-w-md space-y-4">
          <Button
            variant="primary-large"
            onClick={handleWhatsappShare}
            clickOnEnter={true}
            trackingId="whatsapp-share-button"
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
        </div>
      </main>
    </PageLayout>
    </>
  );
}
